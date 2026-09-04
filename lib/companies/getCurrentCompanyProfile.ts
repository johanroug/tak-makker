import { createClient } from "@/lib/supabase/client";
import type { CompanyProfile } from "@/schemas/company-profile";

export async function getCurrentCompanyProfile(): Promise<CompanyProfile | null> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("company_members")
    .select(
      `
      company:companies (
        id,
        name,
        cvr,
        contact_name,
        phone,
        email,
        default_hourly_rate
      )
    `,
    )
    .eq("user_id", user.id)
    .single();

  if (error || !data?.company) {
    return null;
  }

  return {
    companyName: data.company.name ?? "",
    cvr: data.company.cvr ?? "",
    contactName: data.company.contact_name ?? "",
    phone: data.company.phone ?? "",
    email: data.company.email ?? "",
    defaultHourlyRate: data.company.default_hourly_rate,
  };
}
