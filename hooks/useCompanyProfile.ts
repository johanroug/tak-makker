import { useEffect, useState } from "react";
import { CompanyProfileSchema, type CompanyProfile } from "@/schemas/company-profile";
import { readStoredValue, STORAGE_KEYS, writeStoredValue } from "@/lib/storage/browser-storage";

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
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const storedCompanyProfile = readStoredValue(STORAGE_KEYS.companyProfile, CompanyProfileSchema);
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      if (storedCompanyProfile !== null) {
        setCompanyProfile(storedCompanyProfile);
      }

      setHasHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    writeStoredValue(STORAGE_KEYS.companyProfile, companyProfile, CompanyProfileSchema);
  }, [companyProfile, hasHydrated]);

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
    handleCompanyNameChange,
    handleCvrChange,
    handleContactNameChange,
    handlePhoneChange,
    handleEmailChange,
    handleDefaultHourlyRateChange,
  };
}
