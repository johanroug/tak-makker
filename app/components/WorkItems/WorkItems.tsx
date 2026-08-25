import type { WorkItem } from "@/schemas/project";
import styles from "./WorkItems.module.scss";

type WorkItemsProps = {
  workItems: WorkItem[];
  hourlyRate: number | null;

  onWorkItemChange: (workItem: WorkItem, accepted: boolean) => void;

  onEstimatedHoursChange: (workItem: WorkItem, hours: number) => void;
};

export default function WorkItems({
  workItems,
  hourlyRate,
  onWorkItemChange,
  onEstimatedHoursChange,
}: WorkItemsProps) {
  if (workItems.length === 0) {
    return null;
  }

  // NYT:
  // Samlet arbejdsløn for accepterede arbejdsopgaver.
  const totalLaborPrice =
    hourlyRate === null
      ? null
      : workItems
          .filter((item) => item.status === "accepted")
          .reduce((total, item) => {
            return total + (item.estimatedHours ?? 0) * hourlyRate;
          }, 0);

  return (
    <section className={styles.container}>
      <h2>Foreslåede arbejdsopgaver</h2>

      <div className={styles.items}>
        {workItems.map((item) => {
          const laborPrice =
            item.estimatedHours !== null && hourlyRate !== null
              ? item.estimatedHours * hourlyRate
              : null;

          return (
            <div className={styles.item} key={item.id}>
              <label>
                <input
                  type="checkbox"
                  checked={item.status === "accepted"}
                  onChange={(event) => onWorkItemChange(item, event.target.checked)}
                />

                <strong className={styles.trade}>{item.trade}</strong>
              </label>

              <p>{item.description}</p>

              <label>
                Estimeret tid:
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={item.estimatedHours ?? ""}
                  onChange={(event) => onEstimatedHoursChange(item, Number(event.target.value))}
                />
                timer
              </label>

              {item.estimatedHoursSource === "ai" && <small>Foreslået af Tak Makker</small>}

              {item.estimatedHoursSource === "user" && <small>Rettet af dig</small>}

              {laborPrice !== null && (
                <p className={styles.price}>Arbejdsløn: {laborPrice.toLocaleString("da-DK")} kr.</p>
              )}
            </div>
          );
        })}
      </div>

      {/* NYT */}
      {totalLaborPrice !== null && (
        <div className={styles.total}>
          <strong>Samlet arbejdsløn</strong>

          <span>{totalLaborPrice.toLocaleString("da-DK")} kr.</span>
        </div>
      )}
    </section>
  );
}
