import type { ProjectDraft } from "@/schemas/project";

export function createInitialProjectDraft(hourlyRate: number | null = null): ProjectDraft {
  return {
    complete: false,
    customer: {
      name: null,
      nameSource: null,
      address: null,
      addressSource: null,
    },
    project: {
      title: null,
      titleSource: null,
      description: null,
      descriptionSource: null,
      offerDescription: null,
      offerDescriptionSource: null,
    },
    hourlyRate,
    workItems: [],
    materials: [],
  };
}
