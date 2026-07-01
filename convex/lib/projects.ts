import type { QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

export async function getProjectByShareToken(
  ctx: QueryCtx,
  shareToken: string,
): Promise<Doc<"projects"> | null> {
  const project = await ctx.db
    .query("projects")
    .withIndex("by_share_token", (q) => q.eq("shareToken", shareToken))
    .unique();

  if (!project || project.linkRevoked) {
    return null;
  }

  return project;
}

export async function assertProjectOwner(
  project: Doc<"projects">,
  userId: Doc<"users">["_id"],
): Promise<void> {
  if (project.ownerId !== userId) {
    throw new Error("Unauthorized: You don't own this project");
  }
}
