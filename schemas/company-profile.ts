import { z } from "zod";

export const CompanyProfileSchema = z.object({
  companyName: z.string(),
  cvr: z.string(),
  contactName: z.string(),
  phone: z.string(),
  email: z.string(),
});

export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;
