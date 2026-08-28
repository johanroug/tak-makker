import { z } from "zod";

export const ProjectMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const ProjectMessagesSchema = z.array(ProjectMessageSchema);

export type Message = z.infer<typeof ProjectMessageSchema>;
