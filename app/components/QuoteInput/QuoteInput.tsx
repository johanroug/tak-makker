type QuoteInputProps = {
  description: string;
  buttonLabel: string;
  isLoading: boolean;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
};

export default function QuoteInput({
  description,
  buttonLabel,
  isLoading,
  onDescriptionChange,
  onSubmit,
}: QuoteInputProps) {
  return (
    <div className="card w-full max-w-[480px]">
      <label className="mb-2 block font-semibold" htmlFor="quote-description">
        Hvad skal vi lave?
      </label>

      <textarea
        id="quote-description"
        className="min-h-[160px] w-full resize-none"
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder="Beskriv opgaven..."
      />

      <div className="mt-4 flex justify-end">
        <button
          className="primary-button flex items-center gap-2"
          type="button"
          aria-busy={isLoading}
          disabled={isLoading}
          onClick={onSubmit}
        >
          {isLoading && (
            <span
              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            />
          )}
          <span aria-live="polite">{isLoading ? "Tak Makker tænker..." : buttonLabel}</span>
        </button>
      </div>
    </div>
  );
}
