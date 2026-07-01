import { z } from "zod";

export const projectCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().max(500).optional(),
});

export const commentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty").max(2000),
  displayName: z.string().min(1, "Name is required").max(80),
});

export const guestNameSchema = z.object({
  displayName: z.string().min(1, "Name is required").max(80),
});
