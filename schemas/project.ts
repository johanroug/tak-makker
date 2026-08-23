import { z } from "zod";

export const WorkItemSchema = z.object({
  id: z.string(),
  trade: z.string(),
  description: z.string(),
  status: z.enum(["suggested", "accepted", "rejected"]),
  estimatedHours: z.number().nullable(),
  estimatedHoursSource: z.enum(["ai", "user"]),
});
export type WorkItem = z.infer<typeof WorkItemSchema>;

export const MaterialSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(["suggested", "accepted", "rejected"]),
});
export type Material = z.infer<typeof MaterialSchema>;

export const QuoteSchema = z.object({
  customer: z.object({
    name: z.string(),
  }),

  project: z.object({
    title: z.string(),
    description: z.string(),
  }),

  workItems: z.array(WorkItemSchema),

  materials: z.array(MaterialSchema),

  price: z.object({
    amount: z.number(),
    vatIncluded: z.boolean(),
  }),
});
export type Quote = z.infer<typeof QuoteSchema>;

export const ProjectResponseSchema = z.object({
  complete: z.boolean(),

  questions: z.array(z.string()).max(3),

  workItems: z.array(WorkItemSchema),

  materials: z.array(MaterialSchema),

  quote: QuoteSchema.nullable(),
});
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;

export const ProjectDraftSchema = z.object({
  workItems: z.array(WorkItemSchema),
  materials: z.array(MaterialSchema),
});
export type ProjectDraft = z.infer<typeof ProjectDraftSchema>;