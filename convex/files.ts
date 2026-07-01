import { v } from "convex/values";
import { authedMutation } from "./lib/customFunctions";
import { assertProjectOwner } from "./lib/projects";
import { mediaTypeValidator } from "./schema";

const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const generateUploadUrl = authedMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const setProjectMedia = authedMutation({
  args: {
    projectId: v.id("projects"),
    storageId: v.id("_storage"),
    contentType: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) throw new Error("Project not found");

    await assertProjectOwner(project, ctx.user._id);

    let mediaType: "video" | "image";
    if (VIDEO_TYPES.has(args.contentType)) {
      mediaType = "video";
    } else if (IMAGE_TYPES.has(args.contentType)) {
      mediaType = "image";
    } else {
      throw new Error("Unsupported file type. Use MP4, WebM, MOV, PNG, JPG, or WebP.");
    }

    if (project.mediaStorageId) {
      await ctx.storage.delete(project.mediaStorageId);
    }

    await ctx.db.patch("projects", args.projectId, {
      mediaStorageId: args.storageId,
      mediaType,
      mediaStatus: "ready",
      status: project.status === "draft" ? "awaiting_review" : project.status,
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const markMediaUploading = authedMutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) throw new Error("Project not found");

    await assertProjectOwner(project, ctx.user._id);

    await ctx.db.patch("projects", args.projectId, {
      mediaStatus: "uploading",
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const markMediaFailed = authedMutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) throw new Error("Project not found");

    await assertProjectOwner(project, ctx.user._id);

    await ctx.db.patch("projects", args.projectId, {
      mediaStatus: "failed",
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Re-export for type usage in client
export { mediaTypeValidator };
