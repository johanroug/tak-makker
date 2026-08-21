import styles from "./QuoteInput.module.scss";

type QuoteInputProps = {
  description: string;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
};

export default function QuoteInput({
  description,
  onDescriptionChange,
  onSubmit,
}: QuoteInputProps) {
  return (
    <div className={styles.inputCard}>
      <textarea
        className={styles.textarea}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Fortæl hvad du skal lave..."
      />

      <button
        className={styles.button}
        onClick={onSubmit}
      >
        Lav tilbud
      </button>
    </div>
  );
}