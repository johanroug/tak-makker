import { z } from "zod";
import { ProjectMessagesSchema } from "@/schemas/message";
import { OfferSchema } from "@/schemas/offer";
import { ProjectDraftSchema } from "@/schemas/project";
import { allocateProjectNumber } from "@/lib/projects/project-number";

export const ProjectWorkspaceSchema = z.object({
  id: z.string(),
  projectNumber: z.string(),
  createdAt: z.string().datetime(),
  draft: ProjectDraftSchema,
  messages: ProjectMessagesSchema,
  currentOffer: OfferSchema.nullable(),
});
export type ProjectWorkspace = z.infer<typeof ProjectWorkspaceSchema>;

const LegacyProjectWorkspaceSchema = ProjectWorkspaceSchema.extend({
  projectNumber: z.string().optional(),
  createdAt: z.string().datetime().optional(),
});

export const ProjectStoreSchema = z.object({
  activeProjectId: z.string().nullable(),
  projects: z.array(LegacyProjectWorkspaceSchema),
}).transform((store) => {
  const migrationTimestamp = new Date().toISOString();
  const migratedProjects: ProjectWorkspace[] = [];

  for (const project of store.projects) {
    const createdAt = project.createdAt ?? project.currentOffer?.createdAt ?? migrationTimestamp;
    migratedProjects.push({
      ...project,
      createdAt,
      projectNumber:
        project.projectNumber ??
        allocateProjectNumber(createdAt, [...store.projects, ...migratedProjects]),
    });
  }

  return { ...store, projects: migratedProjects };
});
export type ProjectStore = z.infer<typeof ProjectStoreSchema>;
