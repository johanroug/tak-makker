type OfferDetailsFormProps = {
  customerName: string | null;
  projectTitle: string | null;
  projectDescription: string | null;
  onCustomerNameChange: (name: string) => void;
  onProjectTitleChange: (title: string) => void;
  onProjectDescriptionChange: (description: string) => void;
};

export default function OfferDetailsForm({
  customerName,
  projectTitle,
  projectDescription,
  onCustomerNameChange,
  onProjectTitleChange,
  onProjectDescriptionChange,
}: OfferDetailsFormProps) {
  return (
    <div className="card-stack border-t border-neutral-200 pt-4">
      <h3 className="card-title mb-0">Tilbudsoplysninger</h3>

      <label className="card-stack gap-1 text-sm">
        <span>Kundenavn</span>
        <input
          type="text"
          value={customerName ?? ""}
          onChange={(event) => onCustomerNameChange(event.target.value)}
        />
      </label>

      <label className="card-stack gap-1 text-sm">
        <span>Projekttitel</span>
        <input
          type="text"
          value={projectTitle ?? ""}
          onChange={(event) => onProjectTitleChange(event.target.value)}
        />
      </label>

      <label className="card-stack gap-1 text-sm">
        <span>Projektbeskrivelse</span>
        <textarea
          className="min-h-[100px] resize-y"
          value={projectDescription ?? ""}
          onChange={(event) => onProjectDescriptionChange(event.target.value)}
        />
      </label>
    </div>
  );
}
