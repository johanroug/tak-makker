import type { WorkItem } from "@/schemas/project";
import HourlyRate from "../HourlyRate/HourlyRate";

type CalculationProps = {
  workItems: WorkItem[];
  hourlyRate: number | null;
  totalLaborPrice: number | null;
  onHourlyRateChange: (hourlyRate: number) => void;
};

export default function Calculation({
  workItems,
  hourlyRate,
  totalLaborPrice,
  onHourlyRateChange,
}: CalculationProps) {
  const acceptedWorkItemsByTrade = Array.from(
    workItems
      .filter((item) => item.status === "accepted")
      .reduce((trades, item) => {
        const estimatedHours = trades.get(item.trade) ?? 0;

        trades.set(item.trade, estimatedHours + (item.estimatedHours ?? 0));

        return trades;
      }, new Map<string, number>()),
    ([trade, estimatedHours]) => ({ trade, estimatedHours }),
  );

  return (
    <section className="mt-6">
      <h2 className="section-heading">Kalkulation</h2>

      <div className="card card-stack">
        <HourlyRate hourlyRate={hourlyRate} onHourlyRateChange={onHourlyRateChange} />

        {acceptedWorkItemsByTrade.length > 0 && (
          <div className="card-stack">
            {acceptedWorkItemsByTrade.map(({ trade, estimatedHours }) => {
              const laborPrice = hourlyRate !== null ? estimatedHours * hourlyRate : null;

              return (
                <div className="flex items-center justify-between gap-4" key={trade}>
                  <strong className="card-title mb-0">{trade}</strong>

                  <div className="flex items-center gap-4 text-sm">
                    <span>{estimatedHours} timer</span>
                    <strong>
                      {laborPrice !== null ? `${laborPrice.toLocaleString("da-DK")} kr.` : "—"}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span>Samlet arbejdsløn</span>

          <strong>
            {totalLaborPrice !== null ? `${totalLaborPrice.toLocaleString("da-DK")} kr.` : "—"}
          </strong>
        </div>
      </div>
    </section>
  );
}
