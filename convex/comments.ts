import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { authedMutation } from "./lib/customFunctions";
import { assertProjectOwner, getProjectByShareToken } from "./lib/projects";

export const addCreatorComment = authedMutation({
  args: {
    projectId: v.id("projects"),
    text: v.string(),
    timestampSeconds: v.optional(v.number()),
    pinX: v.optional(v.number()),
    pinY: v.optional(v.number()),
  },
  returns: v.id("comments"),
  handler: async (ctx, args) => {
    const project = await ctx.db.get("projects", args.projectId);
    if (!project) throw new Error("Project not found");

    await assertProjectOwner(project, ctx.user._id);

    const text = args.text.trim();
    if (text.length === 0) throw new Error("Comment cannot be empty");

    return await ctx.db.insert("comments", {
      projectId: args.projectId,
      text,
      timestampSeconds: args.timestampSeconds,
      pinX: args.pinX,
      pinY: args.pinY,
      authorType: "creator",
      authorUserId: ctx.user._id,
      authorDisplayName: ctx.user.name,
      createdAt: Date.now(),
    });
  },
});

export const addGuestComment = mutation({
  args: {
    shareToken: v.string(),
    text: v.string(),
    displayName: v.string(),
    timestampSeconds: v.optional(v.number()),
    pinX: v.optional(v.number()),
    pinY: v.optional(v.number()),
  },
  returns: v.id("comments"),
  handler: async (ctx, args) => {
    const project = await getProjectByShareToken(ctx, args.shareToken);
    if (!project) throw new Error("Invalid or expired review link");

    const text = args.text.trim();
    const displayName = args.displayName.trim();

    if (text.length === 0) throw new Error("Comment cannot be empty");
    if (displayName.length === 0) throw new Error("Name is required");

    return await ctx.db.insert("comments", {
      projectId: project._id,
      text,
      timestampSeconds: args.timestampSeconds,
      pinX: args.pinX,
      pinY: args.pinY,
      authorType: "guest",
      authorDisplayName: displayName,
      createdAt: Date.now(),
    });
  },
});
