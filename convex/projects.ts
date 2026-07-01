import { v } from "convex/values";
import { nanoid } from "nanoid";
import { authedMutation, authedQuery } from "./lib/customFunctions";
import { assertProjectOwner } from "./lib/projects";
import {
  mediaStatusValidator,
  mediaTypeValidator,
  projectStatusValidator,
} from "./schema";

const projectSummaryValidator = v.object({
  _id: v.id("projects"),
  title: v.string(),
  description: v.optional(v.string()),
  shareToken: v.string(),
  status: projectStatusValidator,
  mediaType: v.optional(mediaTypeValidator),
  mediaStatus: v.optional(mediaStatusValidator),
  mediaUrl: v.union(v.string(), v.null()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const list = authedQuery({
  args: {},
  returns: v.array(projectSummaryValidator),
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", ctx.user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      projects.map(async (project) => ({
        _id: project._id,
        title: project.title,
        description: project.description,
        shareToken: project.shareToken,
        status: project.status,
        mediaType: project.mediaType,
        mediaStatus: project.mediaStatus,
        mediaUrl: project.mediaStorageId
          ? await ctx.storage.getUrl(project.mediaStorageId)
          : null,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })),
    );
  },
});

export const get = authedQuery({
  args: { projectId: v.id("projects") },
  returns: v.union(projectSummaryValidator, v.null()),
  handler: async (ctx, args) => {
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) return null;

    await assertProjectOwner(project, ctx.user._id);

    return {
      _id: project._id,
      title: project.title,
      description: project.description,
      shareToken: project.shareToken,
      status: project.status,
      mediaType: project.mediaType,
      mediaStatus: project.mediaStatus,
      mediaUrl: project.mediaStorageId
        ? await ctx.storage.getUrl(project.mediaStorageId)
        : null,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  },
});

export const create = authedMutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    if (args.title.trim().length === 0) {
      throw new Error("Title is required");
    }

    const now = Date.now();
    return await ctx.db.insert("projects", {
      ownerId: ctx.user._id,
      title: args.title.trim(),
      description: args.description?.trim() || undefined,
      shareToken: nanoid(24),
      linkRevoked: false,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = authedMutation({
  args: {
    projectId: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(projectStatusValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) throw new Error("Project not found");

    await assertProjectOwner(project, ctx.user._id);

    const updates: {
      title?: string;
      description?: string;
      status?: "draft" | "awaiting_review" | "approved";
      updatedAt: number;
    } = { updatedAt: Date.now() };

    if (args.title !== undefined) {
      if (args.title.trim().length === 0) throw new Error("Title is required");
      updates.title = args.title.trim();
    }
    if (args.description !== undefined) {
      updates.description = args.description.trim() || undefined;
    }
    if (args.status !== undefined) {
      updates.status = args.status;
    }

    await ctx.db.patch("projects", args.projectId, updates);
    return null;
  },
});

export const remove = authedMutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) throw new Error("Project not found");

    await assertProjectOwner(project, ctx.user._id);

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete("comments", comment._id);
    }

    if (project.mediaStorageId) {
      await ctx.storage.delete(project.mediaStorageId);
    }

    await ctx.db.delete("projects", args.projectId);
    return null;
  },
});

export const regenerateShareToken = authedMutation({
  args: { projectId: v.id("projects") },
  returns: v.string(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) throw new Error("Project not found");

    await assertProjectOwner(project, ctx.user._id);

    const shareToken = nanoid(24);
    await ctx.db.patch("projects", args.projectId, {
      shareToken,
      linkRevoked: false,
      updatedAt: Date.now(),
    });

    return shareToken;
  },
});

export const setLinkRevoked = authedMutation({
  args: { projectId: v.id("projects"), revoked: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) throw new Error("Project not found");

    await assertProjectOwner(project, ctx.user._id);

    await ctx.db.patch("projects", args.projectId, {
      linkRevoked: args.revoked,
      updatedAt: Date.now(),
    });

    return null;
  },
});
