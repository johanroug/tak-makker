import {
  ProjectResponseSchema,
  type ProjectDraft,
  type ProjectResponse,
} from "@/schemas/project";
import type { Message } from "@/types/message";

type RequestProjectUpdateParams = {
  messages: Message[];
  project: ProjectDraft;
};

export async function requestProjectUpdate({
  messages,
  project,
}: RequestProjectUpdateParams): Promise<ProjectResponse> {
  const response = await fetch("/api/project", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      customer: project.customer,
      project: project.project,
      workItems: project.workItems,
      materials: project.materials,
    }),
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    console.error("API error:", data);
    throw new Error("Kunne ikke opdatere projektet");
  }

  const parsedResponse = ProjectResponseSchema.safeParse(data);

  if (!parsedResponse.success) {
    console.error("Invalid ProjectResponse:", parsedResponse.error, data);
    throw new Error("API'et returnerede ugyldige data");
  }

  return parsedResponse.data;
}
