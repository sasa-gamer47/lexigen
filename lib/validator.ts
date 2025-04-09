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

export const deepResearchSchema = z.object({
  topic: z.string().min(3, {
    message: "Topic must be at least 3 characters.",
  }),

});

export const createQuizSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  quiz: z.string().min(3, {
    message: "Mindmap must be at least 3 characters.",
  }),
});

export const createLessonSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  prompt: z.string().min(1, { message: "Prompt is required" }),
});
