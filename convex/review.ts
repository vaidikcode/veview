import { v } from "convex/values";
import { query } from "./_generated/server";
import { getProjectByShareToken } from "./lib/projects";
import {
  authorTypeValidator,
  mediaStatusValidator,
  mediaTypeValidator,
  projectStatusValidator,
} from "./schema";

const publicProjectValidator = v.object({
  _id: v.id("projects"),
  title: v.string(),
  description: v.optional(v.string()),
  status: projectStatusValidator,
  mediaType: v.optional(mediaTypeValidator),
  mediaStatus: v.optional(mediaStatusValidator),
  mediaUrl: v.union(v.string(), v.null()),
});

const publicCommentValidator = v.object({
  _id: v.id("comments"),
  text: v.string(),
  timestampSeconds: v.optional(v.number()),
  pinX: v.optional(v.number()),
  pinY: v.optional(v.number()),
  authorType: authorTypeValidator,
  authorDisplayName: v.string(),
  createdAt: v.number(),
});

export const getByShareToken = query({
  args: { shareToken: v.string() },
  returns: v.union(
    v.object({
      project: publicProjectValidator,
      comments: v.array(publicCommentValidator),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const project = await getProjectByShareToken(ctx, args.shareToken);
    if (!project) return null;

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .order("asc")
      .collect();

    return {
      project: {
        _id: project._id,
        title: project.title,
        description: project.description,
        status: project.status,
        mediaType: project.mediaType,
        mediaStatus: project.mediaStatus,
        mediaUrl: project.mediaStorageId
          ? await ctx.storage.getUrl(project.mediaStorageId)
          : null,
      },
      comments: comments.map((c) => ({
        _id: c._id,
        text: c.text,
        timestampSeconds: c.timestampSeconds,
        pinX: c.pinX,
        pinY: c.pinY,
        authorType: c.authorType,
        authorDisplayName: c.authorDisplayName,
        createdAt: c.createdAt,
      })),
    };
  },
});

export const getCreatorReview = query({
  args: { projectId: v.id("projects") },
  returns: v.union(
    v.object({
      project: publicProjectValidator,
      comments: v.array(publicCommentValidator),
      shareToken: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    const project = await ctx.db.get("projects", args.projectId);
    if (!project || project.ownerId !== user._id) return null;

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .order("asc")
      .collect();

    return {
      project: {
        _id: project._id,
        title: project.title,
        description: project.description,
        status: project.status,
        mediaType: project.mediaType,
        mediaStatus: project.mediaStatus,
        mediaUrl: project.mediaStorageId
          ? await ctx.storage.getUrl(project.mediaStorageId)
          : null,
      },
      comments: comments.map((c) => ({
        _id: c._id,
        text: c.text,
        timestampSeconds: c.timestampSeconds,
        pinX: c.pinX,
        pinY: c.pinY,
        authorType: c.authorType,
        authorDisplayName: c.authorDisplayName,
        createdAt: c.createdAt,
      })),
      shareToken: project.shareToken,
    };
  },
});
