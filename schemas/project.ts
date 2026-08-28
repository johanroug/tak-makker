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
  quantity: z.number().nullable(),
  quantitySource: z.enum(["ai", "user"]).nullable(),
  unit: z.string().nullable(),
  unitPrice: z.number().nullable(),
});
export type Material = z.infer<typeof MaterialSchema>;

const AiMaterialSchema = MaterialSchema.extend({
  quantitySource: z.literal("ai").nullable(),
  unitPrice: z.null(),
});

export const QuoteSchema = z.object({
  customer: z.object({
    name: z.string(),
  }),

  project: z.object({
    title: z.string(),
    description: z.string(),
  }),

  workItems: z.array(WorkItemSchema),

  materials: z.array(AiMaterialSchema),

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

  materials: z.array(AiMaterialSchema),

  quote: QuoteSchema.nullable(),
});
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;

export const ProjectDraftSchema = z.object({
  hourlyRate: z.number().nullable(),
  workItems: z.array(WorkItemSchema),
  materials: z.array(MaterialSchema),
});
export type ProjectDraft = z.infer<typeof ProjectDraftSchema>;
