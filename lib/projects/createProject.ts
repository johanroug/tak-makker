import { createClient } from "@/lib/supabase/client";

export async function createProject(companyId: string) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("create_project", {
    p_company_id: companyId,
  });

  if (error) {
    throw new Error(`Kunne ikke oprette projekt: ${error.message}`);
  }

  return data;
}
