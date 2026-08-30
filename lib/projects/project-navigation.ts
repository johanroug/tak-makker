import type { ProjectWorkspace } from "@/schemas/project-store";

export const UNTITLED_PROJECT_LABEL = "Projekt uden titel";

function hasMeaningfulText(value: string | null) {
  return value !== null && value.trim().length > 0;
}

export function getProjectNavigationTitle(workspace: ProjectWorkspace) {
  const title = workspace.draft.project.title?.trim();

  return title || UNTITLED_PROJECT_LABEL;
}

export function shouldShowProjectInNavigation(workspace: ProjectWorkspace) {
  const { draft } = workspace;

  return (
    workspace.currentOffer !== null ||
    workspace.messages.some((message) => message.content.trim().length > 0) ||
    draft.complete ||
    hasMeaningfulText(draft.customer.name) ||
    hasMeaningfulText(draft.project.title) ||
    hasMeaningfulText(draft.project.description) ||
    hasMeaningfulText(draft.project.offerDescription) ||
    draft.hourlyRate !== null ||
    draft.workItems.length > 0 ||
    draft.materials.length > 0
  );
}
