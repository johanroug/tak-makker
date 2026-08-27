import HourlyRate from "../HourlyRate/HourlyRate";

type CalculationProps = {
  hourlyRate: number | null;
  totalLaborPrice: number | null;
  onHourlyRateChange: (hourlyRate: number) => void;
};

export default function Calculation({
  hourlyRate,
  totalLaborPrice,
  onHourlyRateChange,
}: CalculationProps) {
  return (
    <section className="mt-6">
      <h2 className="section-heading">Kalkulation</h2>

      <div className="card card-stack">
        <HourlyRate hourlyRate={hourlyRate} onHourlyRateChange={onHourlyRateChange} />

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
