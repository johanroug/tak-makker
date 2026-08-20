import { z } from "zod";

export const QuoteSchema = z.object({
  customer: z.object({
    name: z.string(),
  }),

  project: z.object({
    title: z.string(),
    description: z.string(),
  }),

  price: z.object({
    amount: z.number(),
    vatIncluded: z.boolean(),
  }),
});

export type Quote = z.infer<typeof QuoteSchema>;

export const QuoteResponseSchema = z.object({
  complete: z.boolean(),

  questions: z.array(z.string()),

  quote: QuoteSchema.nullable(),
});

export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;