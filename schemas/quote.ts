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