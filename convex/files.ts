import { v } from "convex/values";
import { authedMutation } from "./lib/customFunctions";
import { assertProjectOwner } from "./lib/projects";
import { mediaTypeValidator } from "./schema";

function mediaTypeFromContentType(
  contentType: string,
): "video" | "image" | "audio" | "file" {
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("audio/")) return "audio";
  return "file";
}

export const generateUploadUrl = authedMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/** Create a media slot in a folder, then upload and call finalizeMediaItem. */
export const createMediaItem = authedMutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("mediaItems"),
  handler: async (ctx, args) => {
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) throw new Error("Project not found");

    await assertProjectOwner(project, ctx.user._id);

    const title = args.title.trim();
    if (title.length === 0) throw new Error("Media title is required");

    const now = Date.now();
    const mediaItemId = await ctx.db.insert("mediaItems", {
      projectId: args.projectId,
      title,
      description: args.description?.trim() || undefined,
      mediaStatus: "uploading",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch("projects", args.projectId, { updatedAt: now });
    return mediaItemId;
  },
});

export const finalizeMediaItem = authedMutation({
  args: {
    mediaItemId: v.id("mediaItems"),
    storageId: v.id("_storage"),
    contentType: v.string(),
    fileName: v.string(),
    fileSizeBytes: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const item = await ctx.db.get("mediaItems", args.mediaItemId);
    if (!item) throw new Error("Media not found");

    const project = await ctx.db.get("projects", item.projectId);
    if (!project) throw new Error("Project not found");

    await assertProjectOwner(project, ctx.user._id);

    if (item.storageId) {
      await ctx.storage.delete(item.storageId);
    }

    const mediaType = mediaTypeFromContentType(args.contentType);
    const now = Date.now();

    await ctx.db.patch("mediaItems", args.mediaItemId, {
      storageId: args.storageId,
      mediaType,
      mediaStatus: "ready",
      contentType: args.contentType,
      fileName: args.fileName,
      fileSizeBytes: args.fileSizeBytes,
      updatedAt: now,
    });

    await ctx.db.patch("projects", item.projectId, {
      status: project.status === "draft" ? "awaiting_review" : project.status,
      updatedAt: now,
    });

    return null;
  },
});

export const markMediaItemFailed = authedMutation({
  args: { mediaItemId: v.id("mediaItems") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const item = await ctx.db.get("mediaItems", args.mediaItemId);
    if (!item) throw new Error("Media not found");

    const project = await ctx.db.get("projects", item.projectId);
    if (!project) throw new Error("Project not found");

    await assertProjectOwner(project, ctx.user._id);

    await ctx.db.patch("mediaItems", args.mediaItemId, {
      mediaStatus: "failed",
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const updateMediaItem = authedMutation({
  args: {
    mediaItemId: v.id("mediaItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const item = await ctx.db.get("mediaItems", args.mediaItemId);
    if (!item) throw new Error("Media not found");

    const project = await ctx.db.get("projects", item.projectId);
    if (!project) throw new Error("Project not found");

    await assertProjectOwner(project, ctx.user._id);

    const updates: {
      title?: string;
      description?: string;
      updatedAt: number;
    } = { updatedAt: Date.now() };

    if (args.title !== undefined) {
      if (args.title.trim().length === 0) throw new Error("Title is required");
      updates.title = args.title.trim();
    }
    if (args.description !== undefined) {
      updates.description = args.description.trim() || undefined;
    }

    await ctx.db.patch("mediaItems", args.mediaItemId, updates);
    await ctx.db.patch("projects", item.projectId, { updatedAt: Date.now() });
    return null;
  },
});

export const removeMediaItem = authedMutation({
  args: { mediaItemId: v.id("mediaItems") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const item = await ctx.db.get("mediaItems", args.mediaItemId);
    if (!item) throw new Error("Media not found");

    const project = await ctx.db.get("projects", item.projectId);
    if (!project) throw new Error("Project not found");

    await assertProjectOwner(project, ctx.user._id);

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_media_item", (q) => q.eq("mediaItemId", args.mediaItemId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete("comments", comment._id);
    }

    if (item.storageId) {
      await ctx.storage.delete(item.storageId);
    }

    await ctx.db.delete("mediaItems", args.mediaItemId);
    await ctx.db.patch("projects", item.projectId, { updatedAt: Date.now() });
    return null;
  },
});

export { mediaTypeValidator };
