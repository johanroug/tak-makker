import type { ProjectDraft } from "@/schemas/project";

export function createInitialProjectDraft(): ProjectDraft {
  return {
    complete: false,
    customer: {
      name: null,
      nameSource: null,
    },
    project: {
      title: null,
      titleSource: null,
      description: null,
      descriptionSource: null,
      offerDescription: null,
      offerDescriptionSource: null,
    },
    hourlyRate: null,
    workItems: [],
    materials: [],
  };
}
