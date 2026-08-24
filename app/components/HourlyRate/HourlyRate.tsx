import styles from "./HourlyRate.module.scss";

type HourlyRateProps = {
  hourlyRate: number | null;
  onHourlyRateChange: (hourlyRate: number) => void;
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
          onChange={(event) => onHourlyRateChange(Number(event.target.value))}
        />

        <span>kr./time</span>
      </div>
    </div>
  );
}
