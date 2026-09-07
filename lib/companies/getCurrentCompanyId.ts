import { createClient } from "@/lib/supabase/client";

export async function getCurrentCompanyId(): Promise<string | null> {
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
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data.company_id;
}
