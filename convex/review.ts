import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
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
});

const publicMediaItemValidator = v.object({
  _id: v.id("mediaItems"),
  title: v.string(),
  description: v.optional(v.string()),
  mediaType: v.optional(mediaTypeValidator),
  mediaStatus: mediaStatusValidator,
  mediaUrl: v.union(v.string(), v.null()),
  fileName: v.optional(v.string()),
});

const publicCommentValidator = v.object({
  _id: v.id("comments"),
  mediaItemId: v.optional(v.id("mediaItems")),
  text: v.string(),
  timestampSeconds: v.optional(v.number()),
  pinX: v.optional(v.number()),
  pinY: v.optional(v.number()),
  authorType: authorTypeValidator,
  authorDisplayName: v.string(),
  createdAt: v.number(),
});

const reviewPayloadValidator = v.object({
  project: publicProjectValidator,
  mediaItems: v.array(publicMediaItemValidator),
  comments: v.array(publicCommentValidator),
});

async function loadReviewPayload(ctx: QueryCtx, project: Doc<"projects">) {
  const items = await ctx.db
    .query("mediaItems")
    .withIndex("by_project", (q) => q.eq("projectId", project._id))
    .order("asc")
    .collect();

  const mediaItems = await Promise.all(
    items.map(async (item) => ({
      _id: item._id,
      title: item.title,
      description: item.description,
      mediaType: item.mediaType,
      mediaStatus: item.mediaStatus,
      mediaUrl: item.storageId ? await ctx.storage.getUrl(item.storageId) : null,
      fileName: item.fileName,
    })),
  );

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
    },
    mediaItems,
    comments: comments.map((c) => ({
      _id: c._id,
      mediaItemId: c.mediaItemId,
      text: c.text,
      timestampSeconds: c.timestampSeconds,
      pinX: c.pinX,
      pinY: c.pinY,
      authorType: c.authorType,
      authorDisplayName: c.authorDisplayName,
      createdAt: c.createdAt,
    })),
  };
}

export const getByShareToken = query({
  args: { shareToken: v.string() },
  returns: v.union(reviewPayloadValidator, v.null()),
  handler: async (ctx, args) => {
    const project = await getProjectByShareToken(ctx, args.shareToken);
    if (!project) return null;
    return await loadReviewPayload(ctx, project);
  },
});

export const getCreatorReview = query({
  args: { projectId: v.id("projects") },
  returns: v.union(
    v.object({
      project: publicProjectValidator,
      mediaItems: v.array(publicMediaItemValidator),
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

    const payload = await loadReviewPayload(ctx, project);
    return {
      ...payload,
      shareToken: project.shareToken,
    };
  },
});
