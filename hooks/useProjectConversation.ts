import { useState } from "react";
import { requestProjectUpdate } from "@/lib/ai/requestProjectUpdate";
import { createInitialProjectDraft } from "@/lib/projects/initial-project";
import type { Message } from "@/schemas/message";
import type { ProjectResponse } from "@/schemas/project";
import type { ProjectWorkspace } from "@/schemas/project-store";

type UseProjectConversationOptions = {
  activeProject: ProjectWorkspace | null;
  createProject: () => ProjectWorkspace;
  updateProject: (
    projectId: string,
    update: (workspace: ProjectWorkspace) => ProjectWorkspace,
  ) => void;
  mergeProjectResponse: (response: ProjectResponse, projectId?: string) => void;
  defaultHourlyRate: number | null;
};

export function useProjectConversation({
  activeProject,
  createProject,
  updateProject,
  mergeProjectResponse,
  defaultHourlyRate,
}: UseProjectConversationOptions) {
  const [messageDraft, setMessageDraft] = useState("");
  const messages = activeProject?.messages ?? [];
  const [isAssistantResponding, setIsAssistantResponding] = useState(false);
  const [initialProjectError, setInitialProjectError] = useState<string | null>(null);

  async function sendMessage(isInitialRequest = false) {
    if (isAssistantResponding) {
      return;
    }

    setIsAssistantResponding(true);
    if (isInitialRequest) {
      setInitialProjectError(null);
    }

    const workspace =
      activeProject ??
      ({
        id: crypto.randomUUID(),
        draft: createInitialProjectDraft(defaultHourlyRate),
        messages: [],
        currentOffer: null,
      } satisfies ProjectWorkspace);
    const requestMessages: Message[] = [
      ...workspace.messages,
      { role: "user", content: messageDraft },
    ];
    const setMessages = (updatedMessages: Message[]) => {
      updateProject(workspace.id, (currentWorkspace) => ({
        ...currentWorkspace,
        messages: updatedMessages,
      }));
    };

    if (!isInitialRequest) {
      setMessages(requestMessages);
    }

    try {
      const response = await requestProjectUpdate({
        messages: requestMessages,
        project: workspace.draft,
      });
      const persistedWorkspace = activeProject ?? createProject();
      mergeProjectResponse(response, persistedWorkspace.id);

      if (response.complete) {
        if (isInitialRequest) {
          updateProject(persistedWorkspace.id, (currentWorkspace) => ({
            ...currentWorkspace,
            messages: requestMessages,
          }));
        }
      } else {
        updateProject(persistedWorkspace.id, (currentWorkspace) => ({
          ...currentWorkspace,
          messages: [
            ...requestMessages,
            { role: "assistant", content: response.questions.join("\n") },
          ],
        }));
      }

      setMessageDraft("");
    } catch (error) {
      console.error("Could not update project:", error);
      if (isInitialRequest) {
        setInitialProjectError("Tak Makker kunne ikke starte projektet. Prøv igen.");
      }
    } finally {
      setIsAssistantResponding(false);
    }
  }

  return {
    messageDraft,
    messages,
    isAssistantResponding,
    initialProjectError,
    setMessageDraft,
    sendMessage,
  };
}
