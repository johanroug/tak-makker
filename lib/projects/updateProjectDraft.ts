import { createClient } from "@/lib/supabase/client";
import type { ProjectDraft } from "@/schemas/project";

export async function updateProjectDraft(
  projectId: string,
  projectDraft: ProjectDraft,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("projects")
    .update({
      customer_name: projectDraft.customer.name,
      customer_address: projectDraft.customer.address,
      title: projectDraft.project.title,
      description: projectDraft.project.description,
      offer_description: projectDraft.project.offerDescription,
      hourly_rate: projectDraft.hourlyRate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) {
    throw new Error(`Kunne ikke gemme projekt: ${error.message}`);
  }
}
