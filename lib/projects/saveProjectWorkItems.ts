import { createClient } from "@/lib/supabase/client";
import type { ProjectDraft } from "@/schemas/project";

export async function saveProjectWorkItems(
  projectId: string,
  workItems: ProjectDraft["workItems"],
): Promise<void> {
  const supabase = createClient();

  const rows = workItems.map((workItem) => ({
    id: workItem.id,
    project_id: projectId,
    trade: workItem.trade,
    description: workItem.description,
    status: workItem.status,
    estimated_hours: workItem.estimatedHours,
    estimated_hours_source: workItem.estimatedHoursSource,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("project_work_items").upsert(rows, {
    onConflict: "id",
  });

  if (error) {
    throw new Error(`Kunne ikke gemme arbejdsopgaver: ${error.message}`);
  }
}
