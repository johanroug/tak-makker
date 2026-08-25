import type { Material } from "@/schemas/project";

type MaterialsProps = {
  materials: Material[];
  onMaterialChange: (material: Material, accepted: boolean) => void;
};

export default function Materials({ materials, onMaterialChange }: MaterialsProps) {
  if (materials.length === 0) {
    return null;
  }

  return (
    <section className="mt-6">
      <h2 className="section-heading">Foreslåede materialer</h2>

      <div className="card-stack">
        {materials.map((material) => (
          <label className="card card-row cursor-pointer" key={material.id}>
            <input
              className="mt-[3px]"
              type="checkbox"
              checked={material.status === "accepted"}
              onChange={(event) => onMaterialChange(material, event.target.checked)}
            />

            <div className="min-w-0 flex-1">
              <strong className="card-title">{material.name}</strong>

              <p className="mt-1.5 leading-6">{material.description}</p>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
