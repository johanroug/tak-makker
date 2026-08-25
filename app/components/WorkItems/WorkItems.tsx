import type { WorkItem } from "@/schemas/project";

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

  const totalLaborPrice =
    hourlyRate === null
      ? null
      : workItems
          .filter((item) => item.status === "accepted")
          .reduce((total, item) => {
            return total + (item.estimatedHours ?? 0) * hourlyRate;
          }, 0);

  return (
    <section className="mt-6">
      <h2 className="section-heading">Foreslåede arbejdsopgaver</h2>

      <div className="card-stack">
        {workItems.map((item) => {
          const laborPrice =
            item.estimatedHours !== null && hourlyRate !== null
              ? item.estimatedHours * hourlyRate
              : null;

          return (
            <label className="card card-row cursor-pointer" key={item.id}>
              <input
                className="mt-[3px]"
                type="checkbox"
                checked={item.status === "accepted"}
                onChange={(event) => onWorkItemChange(item, event.target.checked)}
              />

              <div className="min-w-0 flex-1">
                <strong className="card-title">
                  {item.trade}
                </strong>

                <p className="mb-4 mt-0 leading-6">{item.description}</p>

                <div className="mb-2.5 flex items-center gap-2 text-sm text-neutral-600">
                  <span>Estimeret tid</span>

                  <input
                    className="w-[90px]"
                    type="number"
                    min="0"
                    step="0.5"
                    value={item.estimatedHours ?? ""}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => onEstimatedHoursChange(item, Number(event.target.value))}
                  />

                  <span>timer</span>
                </div>

                {laborPrice !== null && (
                  <div className="mb-2 flex gap-2">
                    <span>Arbejdsløn</span>
                    <strong>{laborPrice.toLocaleString("da-DK")} kr.</strong>
                  </div>
                )}

                {item.estimatedHoursSource === "ai" && (
                  <small className="block text-neutral-500">Foreslået af Tak Makker</small>
                )}

                {item.estimatedHoursSource === "user" && (
                  <small className="block text-neutral-500">Rettet af dig</small>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {totalLaborPrice !== null && (
        <div className="card mt-4 flex justify-between gap-4 text-lg">
          <strong>Samlet arbejdsløn</strong>
          <span>{totalLaborPrice.toLocaleString("da-DK")} kr.</span>
        </div>
      )}
    </section>
  );
}
