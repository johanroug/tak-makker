import { useState } from "react";
import { createOfferFromProject } from "@/lib/offers/createOfferFromProject";
import type { CompanyProfile } from "@/schemas/company-profile";
import type { Offer } from "@/schemas/offer";
import type { ProjectDraft } from "@/schemas/project";
import type { ProjectWorkspace } from "@/schemas/project-store";

type ProjectCalculations = {
  totalLaborPrice: number | null;
  totalMaterialPrice: number;
  subtotal: number | null;
  vatAmount: number | null;
  finalTotal: number | null;
};

type UseOfferOptions = {
  companyProfile: CompanyProfile;
  projectDraft: ProjectDraft;
  activeProject: ProjectWorkspace | null;
  updateProject: (
    projectId: string,
    update: (workspace: ProjectWorkspace) => ProjectWorkspace,
  ) => void;
  calculations: ProjectCalculations;
};

export function useOffer({
  companyProfile,
  projectDraft,
  activeProject,
  updateProject,
  calculations,
}: UseOfferOptions) {
  const offer: Offer | null = activeProject?.currentOffer ?? null;
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  function createOffer() {
    const result = createOfferFromProject({ companyProfile, projectDraft, calculations });

    if (!result.success) {
      setValidationMessage(result.message);
      return;
    }

    setValidationMessage(null);
    if (activeProject !== null) {
      updateProject(activeProject.id, (workspace) => ({
        ...workspace,
        currentOffer: result.offer,
      }));
    }
  }

  return { offer, validationMessage, createOffer };
}
