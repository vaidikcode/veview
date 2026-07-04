import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const projectStatusValidator = v.union(
  v.literal("draft"),
  v.literal("awaiting_review"),
  v.literal("approved"),
);

export const mediaTypeValidator = v.union(
  v.literal("video"),
  v.literal("image"),
  v.literal("audio"),
  v.literal("file"),
);

export const mediaStatusValidator = v.union(
  v.literal("uploading"),
  v.literal("ready"),
  v.literal("failed"),
);

export const authorTypeValidator = v.union(v.literal("creator"), v.literal("guest"));

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    pictureUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  /** Folder / review room owned by a creator. */
  projects: defineTable({
    ownerId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    shareToken: v.string(),
    linkRevoked: v.boolean(),
    status: projectStatusValidator,
    // Legacy single-file fields — migrated into mediaItems, then cleared.
    mediaStorageId: v.optional(v.id("_storage")),
    mediaType: v.optional(v.union(v.literal("video"), v.literal("image"))),
    mediaStatus: v.optional(mediaStatusValidator),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_share_token", ["shareToken"]),

  /** Individual media files inside a project folder. */
  mediaItems: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    mediaType: v.optional(mediaTypeValidator),
    mediaStatus: mediaStatusValidator,
    contentType: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSizeBytes: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),

  comments: defineTable({
    projectId: v.id("projects"),
    mediaItemId: v.optional(v.id("mediaItems")),
    text: v.string(),
    timestampSeconds: v.optional(v.number()),
    pinX: v.optional(v.number()),
    pinY: v.optional(v.number()),
    authorType: authorTypeValidator,
    authorUserId: v.optional(v.id("users")),
    authorDisplayName: v.string(),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_media_item", ["mediaItemId"]),
});
