import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getOrCreateUser } from "./lib/auth";

export const ensureUser = mutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    const user = await getOrCreateUser(ctx);
    return user._id;
  },
});
