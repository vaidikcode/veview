import { v } from "convex/values";
import { nanoid } from "nanoid";
import { authedMutation, authedQuery } from "./lib/customFunctions";
import { assertProjectOwner } from "./lib/projects";
import { projectStatusValidator } from "./schema";

const projectSummaryValidator = v.object({
  _id: v.id("projects"),
  title: v.string(),
  description: v.optional(v.string()),
  shareToken: v.string(),
  status: projectStatusValidator,
  mediaCount: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const mediaItemValidator = v.object({
  _id: v.id("mediaItems"),
  title: v.string(),
  description: v.optional(v.string()),
  mediaType: v.optional(
    v.union(
      v.literal("video"),
      v.literal("image"),
      v.literal("audio"),
      v.literal("file"),
    ),
  ),
  mediaStatus: v.union(v.literal("uploading"), v.literal("ready"), v.literal("failed")),
  contentType: v.optional(v.string()),
  fileName: v.optional(v.string()),
  fileSizeBytes: v.optional(v.number()),
  mediaUrl: v.union(v.string(), v.null()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const projectDetailValidator = v.object({
  _id: v.id("projects"),
  title: v.string(),
  description: v.optional(v.string()),
  shareToken: v.string(),
  status: projectStatusValidator,
  mediaItems: v.array(mediaItemValidator),
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
      projects.map(async (project) => {
        const items = await ctx.db
          .query("mediaItems")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        return {
          _id: project._id,
          title: project.title,
          description: project.description,
          shareToken: project.shareToken,
          status: project.status,
          mediaCount: items.length,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        };
      }),
    );
  },
});

export const get = authedQuery({
  args: { projectId: v.id("projects") },
  returns: v.union(projectDetailValidator, v.null()),
  handler: async (ctx, args) => {
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) return null;

    await assertProjectOwner(project, ctx.user._id);

    const items = await ctx.db
      .query("mediaItems")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    const mediaItems = await Promise.all(
      items.map(async (item) => ({
        _id: item._id,
        title: item.title,
        description: item.description,
        mediaType: item.mediaType,
        mediaStatus: item.mediaStatus,
        contentType: item.contentType,
        fileName: item.fileName,
        fileSizeBytes: item.fileSizeBytes,
        mediaUrl: item.storageId ? await ctx.storage.getUrl(item.storageId) : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    );

    return {
      _id: project._id,
      title: project.title,
      description: project.description,
      shareToken: project.shareToken,
      status: project.status,
      mediaItems,
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

    const items = await ctx.db
      .query("mediaItems")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const item of items) {
      if (item.storageId) {
        await ctx.storage.delete(item.storageId);
      }
      await ctx.db.delete("mediaItems", item._id);
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
