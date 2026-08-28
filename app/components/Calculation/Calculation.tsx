import type { WorkItem } from "@/schemas/project";
import HourlyRate from "../HourlyRate/HourlyRate";

type CalculationProps = {
  workItems: WorkItem[];
  hourlyRate: number | null;
  totalLaborPrice: number | null;
  totalMaterialPrice: number;
  subtotal: number | null;
  vatAmount: number | null;
  finalTotal: number | null;
  onHourlyRateChange: (hourlyRate: number) => void;
};

function formatMoney(amount: number | null) {
  return amount === null ? "—" : `${amount.toLocaleString("da-DK")} kr.`;
}

export default function Calculation({
  workItems,
  hourlyRate,
  totalLaborPrice,
  totalMaterialPrice,
  subtotal,
  vatAmount,
  finalTotal,
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
                    <strong>{formatMoney(laborPrice)}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span>Samlet arbejdsløn</span>

          <strong>{formatMoney(totalLaborPrice)}</strong>
        </div>

        <div className="flex items-center justify-between">
          <span>Samlet materialer</span>

          <strong>{formatMoney(totalMaterialPrice)}</strong>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
          <span>Subtotal</span>

          <strong>{formatMoney(subtotal)}</strong>
        </div>

        <div className="flex items-center justify-between">
          <span>Moms (25 %)</span>

          <strong>{formatMoney(vatAmount)}</strong>
        </div>

        <div className="flex items-center justify-between text-lg">
          <strong>Total inkl. moms</strong>

          <strong>{formatMoney(finalTotal)}</strong>
        </div>
      </div>
    </section>
  );
}
