import type { Offer } from "@/schemas/offer";
import type { CompanyProfile } from "@/schemas/company-profile";
import type { ProjectDraft } from "@/schemas/project";
import { isValidMaterialPricingNumber } from "@/lib/material-pricing";
import { isWorkItemIncluded } from "@/lib/work-item-selection";
import {
  buildOfferSnapshot,
  type OfferCalculationValues,
} from "./buildOfferSnapshot";

type CreateOfferFromProjectParams = {
  companyProfile: CompanyProfile;
  projectDraft: ProjectDraft;
  calculations: OfferCalculationValues;
};

type CreateOfferFromProjectResult =
  | { success: true; offer: Offer }
  | { success: false; message: string };

export function createOfferFromProject({
  companyProfile,
  projectDraft,
  calculations,
}: CreateOfferFromProjectParams): CreateOfferFromProjectResult {
  const missing: string[] = [];
  const customerName = projectDraft.customer.name?.trim() ?? "";
  const projectTitle = projectDraft.project.title?.trim() ?? "";
  const projectDescription =
    projectDraft.project.offerDescription?.trim() ??
    projectDraft.project.description?.trim() ??
    "";
  const includedWorkItems = projectDraft.workItems.filter(isWorkItemIncluded);
  const acceptedMaterials = projectDraft.materials.filter(
    (material) => material.status === "accepted",
  );

  const hasCompanyProfileData =
    companyProfile.companyName.trim() &&
    companyProfile.cvr.trim() &&
    companyProfile.contactName.trim() &&
    companyProfile.phone.trim() &&
    companyProfile.email.trim();

  if (!hasCompanyProfileData) {
    missing.push("Udfyld virksomhedsoplysninger.");
  }

  if (!customerName) missing.push("Udfyld kundenavn.");
  if (!projectTitle) missing.push("Udfyld projekttitel.");
  if (!projectDescription) missing.push("Udfyld projektbeskrivelse.");

  if (
    projectDraft.hourlyRate === null ||
    !Number.isFinite(projectDraft.hourlyRate) ||
    projectDraft.hourlyRate < 0
  ) {
    missing.push("Angiv en gyldig timepris.");
  }

  if (includedWorkItems.length === 0) {
    missing.push("Vælg mindst én arbejdsopgave.");
  } else if (
    includedWorkItems.some(
      (item) =>
        item.estimatedHours === null ||
        !Number.isFinite(item.estimatedHours) ||
        item.estimatedHours < 0,
    )
  ) {
    missing.push("Angiv gyldige tidsestimat for valgte arbejdsopgaver.");
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
    missing.push("Angiv antal og pris på valgte materialer.");
  }

  if (acceptedMaterials.some((material) => !material.unit?.trim())) {
    missing.push("Angiv enhed på valgte materialer.");
  }

  if (missing.length > 0) {
    return {
      success: false,
      message: `Tilbuddet kan ikke færdiggøres endnu. ${missing.join(" ")}`,
    };
  }

  try {
    const offer = buildOfferSnapshot({
      id: crypto.randomUUID(),
      companyProfile,
      projectDraft,
      calculations,
    });
    return { success: true, offer };
  } catch {
    return {
      success: false,
      message: "Tilbuddet kan ikke færdiggøres endnu. Projektets beregninger er ufuldstændige.",
    };
  }
}
