import type { Material } from "@/schemas/project";

export function isValidMaterialPricingNumber(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

export function hasCompleteMaterialPricing(
  material: Material,
): material is Material & { quantity: number; unitPrice: number } {
  return (
    isValidMaterialPricingNumber(material.quantity) &&
    isValidMaterialPricingNumber(material.unitPrice)
  );
}

export function hasIncompleteAcceptedMaterialDetails(materials: Material[]) {
  return materials.some(
    (material) =>
      material.status === "accepted" &&
      (!hasCompleteMaterialPricing(material) || !material.unit?.trim()),
  );
}
