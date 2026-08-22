import { z } from "zod";

export const WorkItemSchema = z.object({
  trade: z.string(),
  description: z.string(),
  status: z.enum(["suggested", "accepted", "rejected"]),
});
export type WorkItem = z.infer<typeof WorkItemSchema>;

export const MaterialSchema = z.object({
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

export const QuoteResponseSchema = z.object({
  complete: z.boolean(),

  questions: z.array(z.string()).max(3),

  workItems: z.array(WorkItemSchema),

  materials: z.array(MaterialSchema),

  quote: QuoteSchema.nullable(),
});
export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;