type ProjectMessageInputProps = {
  messageDraft: string;
  buttonLabel: string;
  isLoading: boolean;
  loadingLabel?: string;
  onMessageDraftChange: (value: string) => void;
  onSubmit: () => void;
};

export default function ProjectMessageInput({
  messageDraft,
  buttonLabel,
  isLoading,
  loadingLabel,
  onMessageDraftChange,
  onSubmit,
}: ProjectMessageInputProps) {
  return (
    <div className="card w-full max-w-[480px]">
      <label className="mb-2 block font-semibold" htmlFor="project-message">
        Hvad skal vi lave?
      </label>

      <textarea
        id="project-message"
        className="min-h-[160px] w-full resize-none"
        value={messageDraft}
        onChange={(event) => onMessageDraftChange(event.target.value)}
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
          <span aria-live="polite">
            {isLoading ? loadingLabel ?? "Tak Makker tænker..." : buttonLabel}
          </span>
        </button>
      </div>
    </div>
  );
}
