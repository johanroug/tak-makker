import type { Material } from "@/schemas/quote";
import styles from "./Materials.module.scss";

type MaterialsProps = {
  materials: Material[];
  onMaterialChange: (
    material: Material,
    accepted: boolean
  ) => void;
};

export default function Materials({
  materials,
  onMaterialChange,
}: MaterialsProps) {
  if (materials.length === 0) {
    return null;
  }

  return (
    <section className={styles.container}>
      <h2>Foreslåede materialer</h2>

      <div className={styles.items}>
        {materials.map((material, index) => (
          <label className={styles.item} key={index}>
            <input
              type="checkbox"
              checked={material.status === "accepted"}
              onChange={(event) =>
                onMaterialChange(
                  material,
                  event.target.checked
                )
              }
            />

            <div>
              <strong>{material.name}</strong>
              <p>{material.description}</p>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}