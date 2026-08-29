import { useId, useState } from "react";
import type { WorkItem } from "@/schemas/project";
import { parseNullableNumberInput } from "@/lib/parse-nullable-number-input";
import { isWorkItemIncluded } from "@/lib/work-item-selection";

type WorkItemsProps = {
  workItems: WorkItem[];
  hourlyRate: number | null;
  onWorkItemChange: (workItem: WorkItem, accepted: boolean) => void;
  onEstimatedHoursChange: (workItem: WorkItem, hours: number | null) => void;
  onWorkItemDescriptionChange: (workItem: WorkItem, description: string) => void;
};

export default function WorkItems({
  workItems,
  hourlyRate,
  onWorkItemChange,
  onEstimatedHoursChange,
  onWorkItemDescriptionChange,
}: WorkItemsProps) {
  const accordionId = useId();
  const [collapsedTrades, setCollapsedTrades] = useState<Set<string>>(() => new Set());
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState<string>("");

  if (workItems.length === 0) {
    return null;
  }

  const workItemsByTrade = Array.from(
    workItems.reduce((trades, item) => {
      const tradeItems = trades.get(item.trade) ?? [];

      trades.set(item.trade, [...tradeItems, item]);

      return trades;
    }, new Map<string, WorkItem[]>()),
    ([trade, items]) => ({ trade, items }),
  );

  function toggleTrade(trade: string) {
    setCollapsedTrades((currentTrades) => {
      const updatedTrades = new Set(currentTrades);

      if (updatedTrades.has(trade)) {
        updatedTrades.delete(trade);
      } else {
        updatedTrades.add(trade);
      }

      return updatedTrades;
    });
  }

  return (
    <section className="mt-6">
      <h2 className="section-heading">Foreslåede arbejdsopgaver</h2>

      <div className="card-stack">
        {workItemsByTrade.map(({ trade, items }, groupIndex) => {
          const isExpanded = !collapsedTrades.has(trade);
          const contentId = `${accordionId}-trade-${groupIndex}`;
          const totalEstimatedHours = items.reduce((total, item) => {
            const estimatedHours =
              item.estimatedHours !== null && Number.isFinite(item.estimatedHours)
                ? item.estimatedHours
                : 0;

            return isWorkItemIncluded(item) ? total + estimatedHours : total;
          }, 0);
          const hoursLabel = totalEstimatedHours === 1 ? "time" : "timer";

          return (
            <div className="card" key={trade}>
              <button
                className="flex w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent p-0 text-left font-[inherit]"
                type="button"
                aria-controls={contentId}
                aria-expanded={isExpanded}
                onClick={() => toggleTrade(trade)}
              >
                <strong className="text-base">{trade}</strong>

                <span className="flex items-center gap-3 text-sm text-neutral-600">
                  <span className="font-medium">
                    {totalEstimatedHours.toLocaleString("da-DK")} {hoursLabel}
                  </span>
                  <svg
                    className={`size-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </button>

              {isExpanded && (
                <div className="mt-4 border-t border-neutral-200" id={contentId}>
                  {items.map((item, itemIndex) => {
                    const laborPrice =
                      item.estimatedHours !== null && hourlyRate !== null
                        ? item.estimatedHours * hourlyRate
                        : null;

                    return (
                      <label
                        className={`card-row cursor-pointer gap-3.5 py-4 ${
                          itemIndex < items.length - 1 ? "border-b border-neutral-200" : ""
                        }`}
                        key={item.id}
                      >
                        <input
                          className="mt-[3px]"
                          type="checkbox"
                          checked={isWorkItemIncluded(item)}
                          onChange={(event) => onWorkItemChange(item, event.target.checked)}
                        />

                        <div className="min-w-0 flex-1">
                          {editingItemId === item.id ? (
                            <div className="mb-4">
                              <textarea
                                autoFocus
                                value={editingDescription}
                                onChange={(e) => setEditingDescription(e.target.value)}
                                onBlur={() => {
                                  if (editingDescription.trim()) {
                                    onWorkItemDescriptionChange(item, editingDescription);
                                  }
                                  setEditingItemId(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && e.ctrlKey) {
                                    if (editingDescription.trim()) {
                                      onWorkItemDescriptionChange(item, editingDescription);
                                    }
                                    setEditingItemId(null);
                                  }
                                  if (e.key === "Escape") {
                                    setEditingItemId(null);
                                  }
                                }}
                                className="w-full px-2 py-1 border border-neutral-300 rounded text-sm leading-6"
                                rows={3}
                              />
                            </div>
                          ) : (
                            <p
                              className="mb-4 mt-0 leading-6 cursor-pointer hover:text-blue-600 hover:underline"
                              onClick={() => {
                                setEditingItemId(item.id);
                                setEditingDescription(item.description);
                              }}
                            >
                              {item.description}
                            </p>
                          )}

                          <div className="mb-2.5 flex items-center gap-2 text-sm text-neutral-600">
                            <span>Estimeret tid</span>

                            <input
                              className="w-[90px]"
                              type="number"
                              min="0"
                              step="0.5"
                              value={item.estimatedHours ?? ""}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) =>
                                onEstimatedHoursChange(
                                  item,
                                  parseNullableNumberInput(event.target.value),
                                )
                              }
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
                            <small className="block text-neutral-500">
                              Foreslået af Tak Makker
                            </small>
                          )}

                          {item.estimatedHoursSource === "user" && (
                            <small className="block text-neutral-500">Rettet af dig</small>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
