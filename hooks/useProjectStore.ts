import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { createInitialProjectDraft } from "@/lib/projects/initial-project";
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
  const migratedDraft = draft
    ? {
        ...draft,
        project: {
          ...draft.project,
          offerDescription: draft.project.offerDescription ?? draft.project.description,
          offerDescriptionSource:
            draft.project.offerDescriptionSource ??
            (draft.project.offerDescription ? "ai" : null),
        },
      }
    : createInitialProjectDraft();
  const migratedStore: ProjectStore = {
    activeProjectId: id,
    projects: [
      {
        id,
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

  function createProject(): ProjectWorkspace {
    const workspace: ProjectWorkspace = {
      id: crypto.randomUUID(),
      draft: createInitialProjectDraft(defaultHourlyRate),
      messages: [],
      currentOffer: null,
    };

    setProjectStore((currentStore) => ({
      activeProjectId: workspace.id,
      projects: [...currentStore.projects, workspace],
    }));

    return workspace;
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
    createProject,
    updateProject,
    setActiveProjectId,
  };
}
