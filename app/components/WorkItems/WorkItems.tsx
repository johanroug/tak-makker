import type { WorkItem } from "@/schemas/quote";
import styles from "./WorkItems.module.scss";

type WorkItemsProps = {
  workItems: WorkItem[];
  onWorkItemChange: (
    workItem: WorkItem,
    accepted: boolean
  ) => void;
};

export default function WorkItems({
  workItems,
  onWorkItemChange,
}: WorkItemsProps) {
  if (workItems.length === 0) {
    return null;
  }

  return (
    <section className={styles.container}>
      <h2>Foreslåede arbejdsopgaver</h2>

      <div className={styles.items}>
        {workItems.map((item, index) => {
          return (
            <label className={styles.item} key={index}>
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

              <div>
                <strong className={styles.trade}>
                  {item.trade}
                </strong>

                <p>{item.description}</p>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}