import type { WorkItem } from "@/schemas/project";
import styles from "./WorkItems.module.scss";

type WorkItemsProps = {
  workItems: WorkItem[];

  onWorkItemChange: (
    workItem: WorkItem,
    accepted: boolean
  ) => void;

  onEstimatedHoursChange: (
    workItem: WorkItem,
    hours: number
  ) => void;
};

export default function WorkItems({
  workItems,
  onWorkItemChange,
  onEstimatedHoursChange,
}: WorkItemsProps) {
  if (workItems.length === 0) {
    return null;
  }

  return (
    <section className={styles.container}>
      <h2>Foreslåede arbejdsopgaver</h2>

      <div className={styles.items}>
        {workItems.map((item) => {
          return (
            <div className={styles.item} key={item.id}>
              <label>
                <input
                  type="checkbox"
                  checked={item.status === "accepted"}
                  onChange={(event) =>
                    onWorkItemChange(
                      item,
                      event.target.checked
                    )
                  }
                />

                <strong className={styles.trade}>
                  {item.trade}
                </strong>
              </label>

              <p>{item.description}</p>

              <label>
                Estimeret tid:

                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={item.estimatedHours ?? ""}
                  onChange={(event) =>
                    onEstimatedHoursChange(
                      item,
                      Number(event.target.value)
                    )
                  }
                />

                timer
              </label>

              {item.estimatedHoursSource === "ai" && (
                <small>Foreslået af Tak Makker</small>
              )}

              {item.estimatedHoursSource === "user" && (
                <small>Rettet af dig</small>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}