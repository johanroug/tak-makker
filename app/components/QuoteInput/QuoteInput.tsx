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
        <button className="primary-button" type="button" onClick={onSubmit}>
          Lav tilbud
        </button>
      </div>
    </div>
  );
}
