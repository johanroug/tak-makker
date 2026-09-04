import type { CompanyProfile } from "@/schemas/company-profile";
import { parseNullableNumberInput } from "@/lib/parse-nullable-number-input";

type CompanyProfileFormProps = {
  companyProfile: CompanyProfile;
  onCompanyNameChange: (companyName: string) => void;
  onCvrChange: (cvr: string) => void;
  onContactNameChange: (contactName: string) => void;
  onPhoneChange: (phone: string) => void;
  onEmailChange: (email: string) => void;
  onDefaultHourlyRateChange: (defaultHourlyRate: number | null) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
};

export default function CompanyProfileForm({
  companyProfile,
  onCompanyNameChange,
  onCvrChange,
  onContactNameChange,
  onPhoneChange,
  onEmailChange,
  onDefaultHourlyRateChange,
  onSave,
  isSaving,
}: CompanyProfileFormProps) {
  return (
    <div className="card card-stack mt-3">
      <label className="card-stack gap-1 text-sm">
        <span>Firmanavn</span>
        <input
          type="text"
          value={companyProfile.companyName}
          onChange={(event) => onCompanyNameChange(event.target.value)}
        />
      </label>

      <label className="card-stack gap-1 text-sm">
        <span>CVR</span>
        <input
          type="text"
          inputMode="numeric"
          value={companyProfile.cvr}
          onChange={(event) => onCvrChange(event.target.value)}
        />
      </label>

      <label className="card-stack gap-1 text-sm">
        <span>Kontaktperson</span>
        <input
          type="text"
          value={companyProfile.contactName}
          onChange={(event) => onContactNameChange(event.target.value)}
        />
      </label>

      <label className="card-stack gap-1 text-sm">
        <span>Telefon</span>
        <input
          type="tel"
          value={companyProfile.phone}
          onChange={(event) => onPhoneChange(event.target.value)}
        />
      </label>

      <label className="card-stack gap-1 text-sm">
        <span>E-mail</span>
        <input
          type="email"
          value={companyProfile.email}
          onChange={(event) => onEmailChange(event.target.value)}
        />
      </label>

      <label className="card-stack gap-1 text-sm">
        <span>Standard timepris</span>
        <span className="flex items-center gap-2">
          <input
            className="min-w-0 flex-1"
            type="number"
            min="0.01"
            step="any"
            value={companyProfile.defaultHourlyRate ?? ""}
            onChange={(event) =>
              onDefaultHourlyRateChange(parseNullableNumberInput(event.target.value))
            }
          />
          <span>kr./time</span>
        </span>
      </label>

      <button
        type="button"
        onClick={() => {
          void onSave();
        }}
        disabled={isSaving}
      >
        {isSaving ? "Gemmer..." : "Gem"}
      </button>
    </div>
  );
}
