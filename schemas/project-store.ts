import { z } from "zod";
import { ProjectMessagesSchema } from "@/schemas/message";
import { OfferSchema } from "@/schemas/offer";
import { ProjectDraftSchema } from "@/schemas/project";

export const ProjectWorkspaceSchema = z.object({
  id: z.string(),
  draft: ProjectDraftSchema,
  messages: ProjectMessagesSchema,
  currentOffer: OfferSchema.nullable(),
});
export type ProjectWorkspace = z.infer<typeof ProjectWorkspaceSchema>;

export const ProjectStoreSchema = z.object({
  activeProjectId: z.string().nullable(),
  projects: z.array(ProjectWorkspaceSchema),
});
export type ProjectStore = z.infer<typeof ProjectStoreSchema>;
