import type { Material } from "@/schemas/project";
import { isValidMaterialPricingNumber } from "@/lib/material-pricing";
import { parseNullableNumberInput } from "@/lib/parse-nullable-number-input";

type MaterialsProps = {
  materials: Material[];
  hasIncompleteAcceptedMaterials: boolean;
  onMaterialChange: (material: Material, accepted: boolean) => void;
  onMaterialQuantityChange: (material: Material, quantity: number | null) => void;
  onMaterialUnitChange: (material: Material, unit: string) => void;
  onMaterialUnitPriceChange: (material: Material, unitPrice: number | null) => void;
};

export default function Materials({
  materials,
  hasIncompleteAcceptedMaterials,
  onMaterialChange,
  onMaterialQuantityChange,
  onMaterialUnitChange,
  onMaterialUnitPriceChange,
}: MaterialsProps) {
  if (materials.length === 0) {
    return null;
  }

  return (
    <section className="mt-6">
      <h2 className="section-heading">Foreslåede materialer</h2>

      {hasIncompleteAcceptedMaterials && (
        <p
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
          role="alert"
        >
          Udfyld antal, enhed og pris på de valgte materialer, før du fortsætter.
        </p>
      )}

      <div className="card-stack">
        {materials.map((material) => {
          const quantity = isValidMaterialPricingNumber(material.quantity)
            ? material.quantity
            : null;
          const unitPrice = isValidMaterialPricingNumber(material.unitPrice)
            ? material.unitPrice
            : null;
          const quantityIsInvalid = material.status === "accepted" && quantity === null;
          const unitIsInvalid = material.status === "accepted" && !material.unit?.trim();
          const unitPriceIsInvalid = material.status === "accepted" && unitPrice === null;
          const materialIsIncomplete = quantityIsInvalid || unitIsInvalid || unitPriceIsInvalid;
          const quantityErrorId = `${material.id}-quantity-error`;
          const unitErrorId = `${material.id}-unit-error`;
          const unitPriceErrorId = `${material.id}-unit-price-error`;
          const totalPrice =
            quantity !== null && unitPrice !== null ? quantity * unitPrice : null;
          return (
            <div
              className={`card card-row ${
                materialIsIncomplete ? "border border-red-200 !bg-red-50" : ""
              }`}
              key={material.id}
            >
              <input
                className="mt-[3px]"
                type="checkbox"
                aria-label={`Vælg ${material.name}`}
                checked={material.status === "accepted"}
                onChange={(event) => onMaterialChange(material, event.target.checked)}
              />

              <div className="min-w-0 flex-1">
                <strong className="card-title">{material.name}</strong>

                <p className="mt-1.5 leading-6">{material.description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
                  <span>Antal</span>

                  <input
                    aria-label={`Antal for ${material.name}`}
                    aria-describedby={quantityIsInvalid ? quantityErrorId : undefined}
                    aria-invalid={quantityIsInvalid}
                    className={`w-[110px] ${quantityIsInvalid ? "border-red-600" : ""}`}
                    type="number"
                    min="0"
                    step="any"
                    value={quantity ?? ""}
                    onChange={(event) =>
                      onMaterialQuantityChange(
                        material,
                        parseNullableNumberInput(event.target.value),
                      )
                    }
                  />

                  <input
                    aria-label={`Enhed for ${material.name}`}
                    aria-describedby={unitIsInvalid ? unitErrorId : undefined}
                    aria-invalid={unitIsInvalid}
                    className={`w-[110px] ${unitIsInvalid ? "border-red-600" : ""}`}
                    type="text"
                    value={material.unit ?? ""}
                    onChange={(event) => onMaterialUnitChange(material, event.target.value)}
                  />
                </div>

                {quantityIsInvalid && (
                  <small className="mt-1 block text-red-700" id={quantityErrorId}>
                    Udfyld antal.
                  </small>
                )}

                {unitIsInvalid && (
                  <small className="mt-1 block text-red-700" id={unitErrorId}>
                    Udfyld enhed.
                  </small>
                )}

                {material.quantitySource === "ai" && (
                  <small className="mt-1 block text-neutral-500">Foreslået af Tak Makker</small>
                )}

                {material.quantitySource === "user" && (
                  <small className="mt-1 block text-neutral-500">Rettet af dig</small>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
                  <span>Pris pr. enhed</span>

                  <input
                    aria-label={`Pris pr. enhed for ${material.name}`}
                    aria-describedby={unitPriceIsInvalid ? unitPriceErrorId : undefined}
                    aria-invalid={unitPriceIsInvalid}
                    className={`w-[110px] ${unitPriceIsInvalid ? "border-red-600" : ""}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={material.unitPrice ?? ""}
                    onChange={(event) =>
                      onMaterialUnitPriceChange(
                        material,
                        parseNullableNumberInput(event.target.value),
                      )
                    }
                  />

                  <span>kr.</span>
                </div>

                {unitPriceIsInvalid && (
                  <small className="mt-1 block text-red-700" id={unitPriceErrorId}>
                    Udfyld pris.
                  </small>
                )}

                {totalPrice !== null && (
                  <div className="mt-3 flex gap-2">
                    <span>I alt</span>
                    <strong>{totalPrice.toLocaleString("da-DK")} kr.</strong>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
