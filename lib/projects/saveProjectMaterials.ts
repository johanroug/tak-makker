import { createClient } from "@/lib/supabase/client";
import type { ProjectDraft } from "@/schemas/project";

export async function saveProjectMaterials(
  projectId: string,
  materials: ProjectDraft["materials"],
): Promise<void> {
  const supabase = createClient();

  const rows = materials.map((material) => ({
    id: material.id,
    project_id: projectId,
    name: material.name,
    description: material.description,
    status: material.status,
    quantity: material.quantity,
    unit: material.unit,
    unit_price: material.unitPrice,
    quantity_source: material.quantitySource,
    unit_source: material.unitSource,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("project_materials").upsert(rows, {
    onConflict: "id",
  });

  if (error) {
    throw new Error(`Kunne ikke gemme materialer: ${error.message}`);
  }
}
