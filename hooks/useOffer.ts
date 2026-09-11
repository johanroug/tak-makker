import { useState } from "react";
import { createOfferFromProject } from "@/lib/offers/createOfferFromProject";
import { hasOfferChangedSinceFinalization } from "@/lib/offers/hasOfferChangedSinceFinalization";
import { downloadOfferPdf } from "@/lib/offers/downloadOfferPdf";
import type { CompanyProfile } from "@/schemas/company-profile";
import type { Offer } from "@/schemas/offer";
import type { ProjectDraft } from "@/schemas/project";
import type { ProjectWorkspace } from "@/schemas/project-store";
import { saveOffer } from "@/lib/offers/saveOffer";

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
  const hasChangesSinceFinalization = hasOfferChangedSinceFinalization({
    projectNumber: activeProject?.projectNumber ?? "",
    companyProfile,
    projectDraft,
    calculations,
    currentOffer: offer,
  });
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  async function createOffer() {
    const result = createOfferFromProject({
      projectNumber: activeProject?.projectNumber ?? "",
      companyProfile,
      projectDraft,
      calculations,
    });

    if (!result.success) {
      setValidationMessage(result.message);
      return;
    }

    if (activeProject === null) {
      return;
    }

    setValidationMessage(null);

    try {
      await saveOffer(activeProject.id, result.offer);

      updateProject(activeProject.id, (workspace) => ({
        ...workspace,
        currentOffer: result.offer,
      }));
    } catch (error) {
      console.error("Could not save offer:", error);
      setValidationMessage("Tilbuddet kunne ikke gemmes. Prøv igen.");
    }
  }

  async function downloadPdf() {
    if (offer === null || isDownloadingPdf) return;

    setIsDownloadingPdf(true);
    setPdfError(null);
    try {
      await downloadOfferPdf(offer);
    } catch {
      setPdfError("PDF-filen kunne ikke hentes. Prøv igen.");
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  return {
    offer,
    hasChangesSinceFinalization,
    validationMessage,
    createOffer,
    downloadPdf,
    isDownloadingPdf,
    pdfError,
  };
}
