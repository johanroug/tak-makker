import { useState } from "react";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { createOfferFromProject } from "@/lib/offers/createOfferFromProject";
import { STORAGE_KEYS } from "@/lib/storage/browser-storage";
import type { CompanyProfile } from "@/schemas/company-profile";
import { OfferSchema, type Offer } from "@/schemas/offer";
import type { ProjectDraft } from "@/schemas/project";

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
  calculations: ProjectCalculations;
};

const StoredOfferSchema = OfferSchema.nullable();

export function useOffer({ companyProfile, projectDraft, calculations }: UseOfferOptions) {
  const [offer, setOffer] = useLocalStorageState<Offer | null>({
    key: STORAGE_KEYS.currentOffer,
    schema: StoredOfferSchema,
    initialValue: null,
    removeWhenNull: true,
  });
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  function createOffer() {
    const result = createOfferFromProject({ companyProfile, projectDraft, calculations });

    if (!result.success) {
      setValidationMessage(result.message);
      return;
    }

    setValidationMessage(null);
    setOffer(result.offer);
  }

  return { offer, validationMessage, createOffer };
}
