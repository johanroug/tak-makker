import type { CompanyProfile } from "@/schemas/company-profile";

type CompanyProfileFormProps = {
  companyProfile: CompanyProfile;
  onCompanyNameChange: (companyName: string) => void;
  onCvrChange: (cvr: string) => void;
  onContactNameChange: (contactName: string) => void;
  onPhoneChange: (phone: string) => void;
  onEmailChange: (email: string) => void;
};

export default function CompanyProfileForm({
  companyProfile,
  onCompanyNameChange,
  onCvrChange,
  onContactNameChange,
  onPhoneChange,
  onEmailChange,
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
    </div>
  );
}
