import { useEffect, useState } from "react";
import { type CompanyProfile } from "@/schemas/company-profile";
import { getCurrentCompanyProfile } from "@/lib/companies/getCurrentCompanyProfile";
import { updateCurrentCompanyProfile } from "@/lib/companies/updateCurrentCompanyProfile";

const initialCompanyProfile: CompanyProfile = {
  companyName: "",
  cvr: "",
  contactName: "",
  phone: "",
  email: "",
  defaultHourlyRate: null,
};

export function useCompanyProfile() {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(initialCompanyProfile);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCompanyProfile() {
      const currentCompanyProfile = await getCurrentCompanyProfile();

      if (cancelled) {
        return;
      }

      if (currentCompanyProfile !== null) {
        setCompanyProfile(currentCompanyProfile);
      }

      setHasLoaded(true);
    }

    loadCompanyProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveCompanyProfile() {
    setIsSaving(true);

    try {
      await updateCurrentCompanyProfile(companyProfile);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCompanyNameChange(companyName: string) {
    setCompanyProfile((currentProfile) => ({ ...currentProfile, companyName }));
  }

  function handleCvrChange(cvr: string) {
    setCompanyProfile((currentProfile) => ({ ...currentProfile, cvr }));
  }

  function handleContactNameChange(contactName: string) {
    setCompanyProfile((currentProfile) => ({ ...currentProfile, contactName }));
  }

  function handlePhoneChange(phone: string) {
    setCompanyProfile((currentProfile) => ({ ...currentProfile, phone }));
  }

  function handleEmailChange(email: string) {
    setCompanyProfile((currentProfile) => ({ ...currentProfile, email }));
  }

  function handleDefaultHourlyRateChange(defaultHourlyRate: number | null) {
    const validDefaultHourlyRate =
      defaultHourlyRate !== null && Number.isFinite(defaultHourlyRate) && defaultHourlyRate > 0
        ? defaultHourlyRate
        : null;

    setCompanyProfile((currentProfile) => ({
      ...currentProfile,
      defaultHourlyRate: validDefaultHourlyRate,
    }));
  }

  return {
    companyProfile,
    hasLoaded,
    isSaving,
    handleCompanyNameChange,
    handleCvrChange,
    handleContactNameChange,
    handlePhoneChange,
    handleEmailChange,
    handleDefaultHourlyRateChange,
    saveCompanyProfile,
  };
}
