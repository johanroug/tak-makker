import styles from "./HourlyRate.module.scss";
import { parseNullableNumberInput } from "@/lib/parse-nullable-number-input";

type HourlyRateProps = {
  hourlyRate: number | null;
  onHourlyRateChange: (hourlyRate: number | null) => void;
};

export default function HourlyRate({ hourlyRate, onHourlyRateChange }: HourlyRateProps) {
  return (
    <div className={styles.hourlyRate}>
      <label htmlFor="hourlyRate">Timepris</label>

      <div className={styles.inputWrapper}>
        <input
          id="hourlyRate"
          type="number"
          min="0"
          value={hourlyRate ?? ""}
          onChange={(event) => onHourlyRateChange(parseNullableNumberInput(event.target.value))}
        />

        <span>kr./time</span>
      </div>
    </div>
  );
}
