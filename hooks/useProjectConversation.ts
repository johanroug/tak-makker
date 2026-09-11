import { useEffect, useRef, useState } from "react";
import { requestProjectUpdate } from "@/lib/ai/requestProjectUpdate";
import { saveProjectMessage } from "@/lib/projects/saveProjectMessage";
import type { Message } from "@/schemas/message";
import type { ProjectResponse } from "@/schemas/project";
import type { ProjectWorkspace } from "@/schemas/project-store";

type UseProjectConversationOptions = {
  activeProject: ProjectWorkspace | null;
  prepareProject: () => Promise<ProjectWorkspace>;

  createProject: (preparedWorkspace: ProjectWorkspace) => ProjectWorkspace;
  updateProject: (
    projectId: string,
    update: (workspace: ProjectWorkspace) => ProjectWorkspace,
  ) => void;
  mergeProjectResponse: (response: ProjectResponse, projectId?: string) => void;
};

export function useProjectConversation({
  activeProject,
  prepareProject,
  createProject,
  updateProject,
  mergeProjectResponse,
}: UseProjectConversationOptions) {
  const [messageDraft, setMessageDraft] = useState("");
  const messages = activeProject?.messages ?? [];
  const [isAssistantResponding, setIsAssistantResponding] = useState(false);
  const [initialProjectError, setInitialProjectError] = useState<string | null>(null);
  const pendingInitialWorkspaceRef = useRef<ProjectWorkspace | null>(null);

  useEffect(() => {
    if (activeProject !== null) {
      pendingInitialWorkspaceRef.current = null;
    }
  }, [activeProject]);

  async function sendMessage(isInitialRequest = false) {
    if (isAssistantResponding) {
      return;
    }

    setIsAssistantResponding(true);

    if (isInitialRequest) {
      setInitialProjectError(null);
    }

    try {
      if (activeProject === null && pendingInitialWorkspaceRef.current === null) {
        pendingInitialWorkspaceRef.current = await prepareProject();
      }

      const workspace = activeProject ?? pendingInitialWorkspaceRef.current;

      if (workspace === null) {
        return;
      }

      // NYT: Gem brugerbeskeden som en variabel, så præcis samme
      // besked både bruges til AI-request og Supabase.
      const userMessage: Message = {
        role: "user",
        content: messageDraft,
      };

      const requestMessages: Message[] = [...workspace.messages, userMessage];

      const setMessages = (updatedMessages: Message[]) => {
        updateProject(workspace.id, (currentWorkspace) => ({
          ...currentWorkspace,
          messages: updatedMessages,
        }));
      };

      if (!isInitialRequest) {
        setMessages(requestMessages);
      }

      const response = await requestProjectUpdate({
        messages: requestMessages,
        project: workspace.draft,
      });

      const persistedWorkspace = activeProject ?? createProject(workspace);

      pendingInitialWorkspaceRef.current = null;

      mergeProjectResponse(response, persistedWorkspace.id);

      // NYT: AI-kaldet lykkedes, så brugerbeskeden gemmes i Supabase.
      await saveProjectMessage(persistedWorkspace.id, userMessage);

      if (response.complete) {
        if (isInitialRequest) {
          updateProject(persistedWorkspace.id, (currentWorkspace) => ({
            ...currentWorkspace,
            messages: requestMessages,
          }));
        }
      } else {
        // NYT: Opret assistentbeskeden én gang og genbrug den
        // både i Supabase og i workspace-state.
        const assistantMessage: Message = {
          role: "assistant",
          content: response.questions.join("\n"),
        };

        // NYT
        await saveProjectMessage(persistedWorkspace.id, assistantMessage);

        updateProject(persistedWorkspace.id, (currentWorkspace) => ({
          ...currentWorkspace,
          messages: [...requestMessages, assistantMessage],
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
