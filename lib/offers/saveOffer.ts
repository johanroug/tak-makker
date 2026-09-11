import { createClient } from "@/lib/supabase/client";
import type { Offer } from "@/schemas/offer";

export async function saveOffer(projectId: string, offer: Offer): Promise<void> {
  const supabase = createClient();

  const { error: offerError } = await supabase.from("offers").insert({
    id: offer.id,
    project_id: projectId,
    project_number: offer.projectNumber,

    company_name: offer.company.companyName,
    company_cvr: offer.company.cvr,
    company_contact_name: offer.company.contactName,
    company_phone: offer.company.phone,
    company_email: offer.company.email,
    company_default_hourly_rate: offer.company.defaultHourlyRate,

    customer_name: offer.customer.name,
    customer_address: offer.customer.address,

    project_title: offer.project.title,
    project_description: offer.project.description,

    pricing_labor: offer.pricing.labor,
    pricing_materials: offer.pricing.materials,
    pricing_subtotal: offer.pricing.subtotal,
    pricing_vat_rate: offer.pricing.vatRate,
    pricing_vat_amount: offer.pricing.vatAmount,
    pricing_total: offer.pricing.total,

    created_at: offer.createdAt,
  });

  if (offerError) {
    throw new Error(`Kunne ikke gemme tilbud: ${offerError.message}`);
  }

  if (offer.workItems.length > 0) {
    const workItemRows = offer.workItems.map((workItem) => ({
      offer_id: offer.id,
      id: workItem.id,
      trade: workItem.trade,
      description: workItem.description,
      estimated_hours: workItem.estimatedHours,
      hourly_rate: workItem.hourlyRate,
      total_price: workItem.totalPrice,
    }));

    const { error: workItemsError } = await supabase.from("offer_work_items").insert(workItemRows);

    if (workItemsError) {
      throw new Error(`Kunne ikke gemme tilbuddets arbejdsopgaver: ${workItemsError.message}`);
    }
  }

  if (offer.materials.length > 0) {
    const materialRows = offer.materials.map((material) => ({
      offer_id: offer.id,
      id: material.id,
      name: material.name,
      description: material.description,
      quantity: material.quantity,
      unit: material.unit,
      unit_price: material.unitPrice,
      total_price: material.totalPrice,
    }));

    const { error: materialsError } = await supabase.from("offer_materials").insert(materialRows);

    if (materialsError) {
      throw new Error(`Kunne ikke gemme tilbuddets materialer: ${materialsError.message}`);
    }
  }
}
