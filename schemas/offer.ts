import { z } from "zod";

const MoneySchema = z.number().finite().nonnegative();

export const OfferSchema = z.object({
  id: z.string(),

  customer: z.object({
    name: z.string(),
  }),

  project: z.object({
    title: z.string(),
    description: z.string(),
  }),

  workItems: z.array(
    z.object({
      id: z.string(),
      trade: z.string(),
      description: z.string(),
      estimatedHours: z.number().finite().nonnegative(),
      hourlyRate: MoneySchema,
      totalPrice: MoneySchema,
    }),
  ),

  materials: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      quantity: z.number().finite().nonnegative(),
      unit: z.string(),
      unitPrice: MoneySchema,
      totalPrice: MoneySchema,
    }),
  ),

  pricing: z.object({
    labor: MoneySchema,
    materials: MoneySchema,
    subtotal: MoneySchema,
    vatRate: z.number().finite().nonnegative(),
    vatAmount: MoneySchema,
    total: MoneySchema,
  }),
});

export type Offer = z.infer<typeof OfferSchema>;
