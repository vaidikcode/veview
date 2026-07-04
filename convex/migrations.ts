import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Move legacy project.media* fields into mediaItems rows and clear them.
 * Run once: `npx convex run migrations:migrateLegacyProjectMedia`
 */
export const migrateLegacyProjectMedia = mutation({
  args: {},
  returns: v.object({
    migratedProjects: v.number(),
    createdMediaItems: v.number(),
    updatedComments: v.number(),
  }),
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    let migratedProjects = 0;
    let createdMediaItems = 0;
    let updatedComments = 0;

    for (const project of projects) {
      if (!project.mediaStorageId) continue;

      const existing = await ctx.db
        .query("mediaItems")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();

      let mediaItemId = existing[0]?._id;

      if (!mediaItemId) {
        const now = Date.now();
        mediaItemId = await ctx.db.insert("mediaItems", {
          projectId: project._id,
          title: project.title,
          description: project.description,
          storageId: project.mediaStorageId,
          mediaType: project.mediaType,
          mediaStatus: project.mediaStatus ?? "ready",
          createdAt: project.createdAt,
          updatedAt: now,
        });
        createdMediaItems += 1;
      }

      const comments = await ctx.db
        .query("comments")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();

      for (const comment of comments) {
        if (!comment.mediaItemId) {
          await ctx.db.patch("comments", comment._id, { mediaItemId });
          updatedComments += 1;
        }
      }

      await ctx.db.replace("projects", project._id, {
        ownerId: project.ownerId,
        title: project.title,
        description: project.description,
        shareToken: project.shareToken,
        linkRevoked: project.linkRevoked,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });

      migratedProjects += 1;
    }

    return { migratedProjects, createdMediaItems, updatedComments };
  },
});
