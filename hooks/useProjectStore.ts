import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { createInitialProjectDraft } from "@/lib/projects/initial-project";
import { getProjectCreationYear } from "@/lib/projects/project-number";
import {
  readStoredValue,
  removeStoredValue,
  STORAGE_KEYS,
  writeStoredValue,
} from "@/lib/storage/browser-storage";
import { ProjectMessagesSchema } from "@/schemas/message";
import { OfferSchema } from "@/schemas/offer";
import { ProjectDraftSchema } from "@/schemas/project";
import {
  ProjectStoreSchema,
  type ProjectStore,
  type ProjectWorkspace,
} from "@/schemas/project-store";
import { getCurrentCompanyId } from "@/lib/companies/getCurrentCompanyId";
import { createProject as createProjectInDatabase } from "@/lib/projects/createProject";
import { useEffect } from "react";
import { updateProjectDraft } from "@/lib/projects/updateProjectDraft";

const initialProjectStore: ProjectStore = {
  activeProjectId: null,
  projects: [],
};

function migrateLegacyProjectStore(): ProjectStore | null {
  const draft = readStoredValue(STORAGE_KEYS.projectDraft, ProjectDraftSchema);
  const messages = readStoredValue(STORAGE_KEYS.projectMessages, ProjectMessagesSchema);
  const currentOffer = readStoredValue(STORAGE_KEYS.currentOffer, OfferSchema);

  if (draft === null && messages === null && currentOffer === null) {
    return null;
  }

  const id = crypto.randomUUID();
  const createdAt = currentOffer?.createdAt ?? new Date().toISOString();
  const migratedDraft = draft
    ? {
        ...draft,
        project: {
          ...draft.project,
          offerDescription: draft.project.offerDescription ?? draft.project.description,
          offerDescriptionSource:
            draft.project.offerDescriptionSource ?? (draft.project.offerDescription ? "ai" : null),
        },
      }
    : createInitialProjectDraft();
  const migratedStore: ProjectStore = {
    activeProjectId: id,
    projects: [
      {
        id,
        createdAt,
        projectNumber: `${getProjectCreationYear(createdAt)}-0001`,
        draft: migratedDraft,
        messages: messages ?? [],
        currentOffer,
      },
    ],
  };

  const migrationPersisted = writeStoredValue(
    STORAGE_KEYS.projectStore,
    migratedStore,
    ProjectStoreSchema,
  );

  if (migrationPersisted) {
    removeStoredValue(STORAGE_KEYS.projectDraft);
    removeStoredValue(STORAGE_KEYS.projectMessages);
    removeStoredValue(STORAGE_KEYS.currentOffer);
  }

  return migratedStore;
}

type UseProjectStoreOptions = {
  defaultHourlyRate: number | null;
};

export function useProjectStore({ defaultHourlyRate }: UseProjectStoreOptions) {
  const [projectStore, setProjectStore] = useLocalStorageState<ProjectStore>({
    key: STORAGE_KEYS.projectStore,
    schema: ProjectStoreSchema,
    initialValue: initialProjectStore,
    migrate: migrateLegacyProjectStore,
  });

  const activeProject =
    projectStore.projects.find((project) => project.id === projectStore.activeProjectId) ?? null;

  useEffect(() => {
    if (activeProject === null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void updateProjectDraft(activeProject.id, activeProject.draft).catch((error) => {
        console.error("Could not save project draft:", error);
      });
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeProject]);

  async function prepareProject(): Promise<ProjectWorkspace> {
    const companyId = await getCurrentCompanyId();

    if (companyId === null) {
      throw new Error("Kunne ikke finde brugerens virksomhed.");
    }

    const createdProject = await createProjectInDatabase(companyId);

    return {
      id: createdProject.id,
      createdAt: new Date(createdProject.created_at).toISOString(),
      projectNumber: createdProject.project_number,
      draft: createInitialProjectDraft(defaultHourlyRate),
      messages: [],
      currentOffer: null,
    };
  }

  function createProject(preparedWorkspace: ProjectWorkspace): ProjectWorkspace {
    setProjectStore((currentStore) => ({
      activeProjectId: preparedWorkspace.id,
      projects: [...currentStore.projects, preparedWorkspace],
    }));

    return preparedWorkspace;
  }

  function updateProject(
    projectId: string,
    update: (workspace: ProjectWorkspace) => ProjectWorkspace,
  ) {
    setProjectStore((currentStore) => ({
      ...currentStore,
      projects: currentStore.projects.map((workspace) =>
        workspace.id === projectId ? update(workspace) : workspace,
      ),
    }));
  }

  function setActiveProjectId(projectId: string | null) {
    setProjectStore((currentStore) => ({
      ...currentStore,
      activeProjectId:
        projectId === null || currentStore.projects.some((project) => project.id === projectId)
          ? projectId
          : currentStore.activeProjectId,
    }));
  }

  return {
    projectStore,
    activeProject,
    prepareProject,
    createProject,
    updateProject,
    setActiveProjectId,
  };
}
