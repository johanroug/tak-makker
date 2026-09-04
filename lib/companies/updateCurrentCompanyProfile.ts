import { createClient } from "@/lib/supabase/client";
import type { CompanyProfile } from "@/schemas/company-profile";

export async function updateCurrentCompanyProfile(companyProfile: CompanyProfile) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Brugeren er ikke logget ind.");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (membershipError || !membership) {
    throw new Error("Kunne ikke finde brugerens virksomhed.");
  }

  const { error } = await supabase
    .from("companies")
    .update({
      name: companyProfile.companyName,
      cvr: companyProfile.cvr,
      contact_name: companyProfile.contactName,
      phone: companyProfile.phone,
      email: companyProfile.email,
      default_hourly_rate: companyProfile.defaultHourlyRate,
    })
    .eq("id", membership.company_id);

  if (error) {
    throw new Error("Kunne ikke gemme virksomhedsprofil.");
  }
}
