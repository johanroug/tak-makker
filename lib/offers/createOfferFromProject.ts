import type { Offer } from "@/schemas/offer";
import type { ProjectDraft } from "@/schemas/project";
import { isValidMaterialPricingNumber } from "@/lib/material-pricing";
import { createOfferSnapshot } from "./createOffer";

type CreateOfferFromProjectParams = {
  projectDraft: ProjectDraft;
  calculations: {
    totalLaborPrice: number | null;
    totalMaterialPrice: number;
    subtotal: number | null;
    vatAmount: number | null;
    finalTotal: number | null;
  };
};

type CreateOfferFromProjectResult =
  | { success: true; offer: Offer }
  | { success: false; message: string };

export function createOfferFromProject({
  projectDraft,
  calculations,
}: CreateOfferFromProjectParams): CreateOfferFromProjectResult {
  const missing: string[] = [];
  const customerName = projectDraft.customer.name?.trim() ?? "";
  const projectTitle = projectDraft.project.title?.trim() ?? "";
  const projectDescription = projectDraft.project.description?.trim() ?? "";
  const acceptedWorkItems = projectDraft.workItems.filter((item) => item.status === "accepted");
  const acceptedMaterials = projectDraft.materials.filter(
    (material) => material.status === "accepted",
  );

  if (!customerName) missing.push("kundenavn");
  if (!projectTitle) missing.push("projekttitel");
  if (!projectDescription) missing.push("projektbeskrivelse");

  if (
    projectDraft.hourlyRate === null ||
    !Number.isFinite(projectDraft.hourlyRate) ||
    projectDraft.hourlyRate < 0
  ) {
    missing.push("gyldig timepris");
  }

  if (acceptedWorkItems.length === 0) {
    missing.push("mindst én valgt arbejdsopgave");
  } else if (
    acceptedWorkItems.some(
      (item) =>
        item.estimatedHours === null ||
        !Number.isFinite(item.estimatedHours) ||
        item.estimatedHours < 0,
    )
  ) {
    missing.push("gyldigt timeestimat på alle valgte arbejdsopgaver");
  }

  if (
    acceptedMaterials.some(
      (material) =>
        !isValidMaterialPricingNumber(material.quantity) ||
        material.quantity < 0 ||
        !isValidMaterialPricingNumber(material.unitPrice) ||
        material.unitPrice < 0,
    )
  ) {
    missing.push("antal og pris på alle valgte materialer");
  }

  if (acceptedMaterials.some((material) => !material.unit?.trim())) {
    missing.push("enhed på alle valgte materialer");
  }

  if (missing.length > 0) {
    return {
      success: false,
      message: `Tilbuddet kan ikke oprettes. Udfyld: ${missing.join(", ")}.`,
    };
  }

  try {
    return {
      success: true,
      offer: createOfferSnapshot({
        id: crypto.randomUUID(),
        customer: { name: customerName },
        project: {
          title: projectTitle,
          description: projectDescription,
        },
        projectDraft,
        calculations,
      }),
    };
  } catch {
    return {
      success: false,
      message: "Tilbuddet kan ikke oprettes, fordi projektets beregninger er ufuldstændige.",
    };
  }
}
