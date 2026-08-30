import type { CompanyProfile } from "@/schemas/company-profile";
import type { Offer } from "@/schemas/offer";
import type { ProjectDraft } from "@/schemas/project";
import {
  buildOfferContent,
  type OfferCalculationValues,
} from "./buildOfferSnapshot";

type HasOfferChangedParams = {
  companyProfile: CompanyProfile;
  projectDraft: ProjectDraft;
  calculations: OfferCalculationValues;
  currentOffer: Offer | null;
};

export function hasOfferChangedSinceFinalization({
  companyProfile,
  projectDraft,
  calculations,
  currentOffer,
}: HasOfferChangedParams): boolean {
  if (currentOffer === null) return false;

  const { id: currentOfferId, ...currentContent } = currentOffer;
  void currentOfferId;
  const liveContent = buildOfferContent({ companyProfile, projectDraft, calculations });

  return JSON.stringify(liveContent) !== JSON.stringify(currentContent);
}
