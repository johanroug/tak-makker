import type { ProjectWorkspace } from "@/schemas/project-store";

export const UNTITLED_PROJECT_LABEL = "Projekt uden titel";

function hasMeaningfulText(value: string | null) {
  return value !== null && value.trim().length > 0;
}

export function getProjectNavigationTitle(workspace: ProjectWorkspace) {
  const title = workspace.draft.project.title?.trim();

  return title || UNTITLED_PROJECT_LABEL;
}

export function getProjectNavigationLabel(workspace: ProjectWorkspace) {
  return `${workspace.projectNumber} · ${getProjectNavigationTitle(workspace)}`;
}

export function filterProjectsForNavigation(
  projects: ProjectWorkspace[],
  searchTerm: string,
) {
  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase("da-DK");

  if (!normalizedSearchTerm) return projects;

  return projects
    .filter((workspace) =>
      [
        workspace.draft.project.title,
        workspace.draft.customer.name,
        workspace.draft.customer.address,
        workspace.projectNumber,
      ].some((value) => value?.toLocaleLowerCase("da-DK").includes(normalizedSearchTerm)),
    )
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

export type ProjectNavigationGroup = {
  year: string;
  months: Array<{
    key: string;
    label: string;
    projects: ProjectWorkspace[];
  }>;
};

export function groupProjectsForNavigation(
  projects: ProjectWorkspace[],
): ProjectNavigationGroup[] {
  const sortedProjects = [...projects].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );
  const groups = new Map<string, Map<string, ProjectWorkspace[]>>();

  for (const project of sortedProjects) {
    const date = new Date(project.createdAt);
    const dateParts = new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "2-digit",
      timeZone: "Europe/Copenhagen",
    }).formatToParts(date);
    const year = dateParts.find((part) => part.type === "year")?.value ?? "";
    const month = dateParts.find((part) => part.type === "month")?.value ?? "";
    const yearGroup = groups.get(year) ?? new Map<string, ProjectWorkspace[]>();
    yearGroup.set(month, [...(yearGroup.get(month) ?? []), project]);
    groups.set(year, yearGroup);
  }

  const monthFormatter = new Intl.DateTimeFormat("da-DK", {
    month: "long",
    timeZone: "UTC",
  });

  return [...groups.entries()]
    .sort(([left], [right]) => Number(right) - Number(left))
    .map(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort(([left], [right]) => Number(right) - Number(left))
        .map(([month, monthProjects]) => ({
          key: `${year}-${month}`,
          label: monthFormatter.format(new Date(`${year}-${month}-01T00:00:00.000Z`)),
          projects: monthProjects,
        })),
    }));
}

export function shouldShowProjectInNavigation(workspace: ProjectWorkspace) {
  const { draft } = workspace;

  return (
    workspace.currentOffer !== null ||
    workspace.messages.some((message) => message.content.trim().length > 0) ||
    draft.complete ||
    hasMeaningfulText(draft.customer.name) ||
    hasMeaningfulText(draft.customer.address) ||
    hasMeaningfulText(draft.project.title) ||
    hasMeaningfulText(draft.project.description) ||
    hasMeaningfulText(draft.project.offerDescription) ||
    draft.hourlyRate !== null ||
    draft.workItems.length > 0 ||
    draft.materials.length > 0
  );
}
