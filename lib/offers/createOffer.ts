import { OfferSchema, type Offer } from "@/schemas/offer";
import type { ProjectDraft } from "@/schemas/project";

type BuildOfferParams = {
  id: string;
  customer: Offer["customer"];
  project: Offer["project"];
  projectDraft: ProjectDraft;
  calculations: {
    totalLaborPrice: number | null;
    totalMaterialPrice: number;
    subtotal: number | null;
    vatAmount: number | null;
    finalTotal: number | null;
  };
};

export function createOfferSnapshot({
  id,
  customer,
  project,
  projectDraft,
  calculations,
}: BuildOfferParams): Offer {
  const hourlyRate = projectDraft.hourlyRate;

  const offer = {
    id,
    customer,
    project,
    workItems: projectDraft.workItems
      .filter((item) => item.status === "accepted")
      .map((item) => ({
        id: item.id,
        trade: item.trade,
        description: item.description,
        estimatedHours: item.estimatedHours,
        hourlyRate,
        totalPrice:
          item.estimatedHours === null || hourlyRate === null
            ? null
            : item.estimatedHours * hourlyRate,
      })),
    materials: projectDraft.materials
      .filter((material) => material.status === "accepted")
      .map((material) => ({
        id: material.id,
        name: material.name,
        description: material.description,
        quantity: material.quantity,
        unit: material.unit,
        unitPrice: material.unitPrice,
        totalPrice:
          material.quantity === null || material.unitPrice === null
            ? null
            : material.quantity * material.unitPrice,
      })),
    pricing: {
      labor: calculations.totalLaborPrice,
      materials: calculations.totalMaterialPrice,
      subtotal: calculations.subtotal,
      vatRate: 0.25,
      vatAmount: calculations.vatAmount,
      total: calculations.finalTotal,
    },
  };

  return OfferSchema.parse(offer);
}
