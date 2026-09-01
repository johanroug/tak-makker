import { OfferSchema, type Offer } from "@/schemas/offer";
import type { CompanyProfile } from "@/schemas/company-profile";
import type { ProjectDraft } from "@/schemas/project";
import { isWorkItemIncluded } from "@/lib/work-item-selection";

export type OfferCalculationValues = {
  totalLaborPrice: number | null;
  totalMaterialPrice: number;
  subtotal: number | null;
  vatAmount: number | null;
  finalTotal: number | null;
};

type BuildOfferSnapshotParams = {
  id: string;
  companyProfile: CompanyProfile;
  projectDraft: ProjectDraft;
  calculations: OfferCalculationValues;
};

export function buildOfferContent({
  companyProfile,
  projectDraft,
  calculations,
}: Omit<BuildOfferSnapshotParams, "id">) {
  const customerName = projectDraft.customer.name?.trim() ?? "";
  const projectTitle = projectDraft.project.title?.trim() ?? "";
  const hourlyRate = projectDraft.hourlyRate;
  const offerDescription =
    projectDraft.project.offerDescription?.trim() ??
    projectDraft.project.description?.trim() ??
    "";

  return {
    company: { ...companyProfile },
    customer: { name: customerName },
    project: {
      title: projectTitle,
      description: offerDescription,
    },
    workItems: projectDraft.workItems
      .filter(isWorkItemIncluded)
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
}

export function buildOfferSnapshot({
  id,
  companyProfile,
  projectDraft,
  calculations,
}: BuildOfferSnapshotParams): Offer {
  const offer = {
    id,
    createdAt: new Date().toISOString(),
    ...buildOfferContent({ companyProfile, projectDraft, calculations }),
  };

  return OfferSchema.parse(offer);
}
