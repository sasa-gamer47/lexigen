import * as z from "zod";

export const createMindMapSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  mindMap: z.string().min(3, {
    message: "Mindmap must be at least 3 characters.",
  }),
  textQuantity: z.string(),
  theme: z.string(),
});
