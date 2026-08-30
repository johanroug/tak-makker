import { useState } from "react";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { requestProjectUpdate } from "@/lib/ai/requestProjectUpdate";
import { STORAGE_KEYS } from "@/lib/storage/browser-storage";
import { ProjectMessagesSchema, type Message } from "@/schemas/message";
import type { ProjectDraft, ProjectResponse } from "@/schemas/project";

type UseProjectConversationOptions = {
  project: ProjectDraft;
  mergeProjectResponse: (response: ProjectResponse) => void;
};

export function useProjectConversation({
  project,
  mergeProjectResponse,
}: UseProjectConversationOptions) {
  const [messageDraft, setMessageDraft] = useState("");
  const [messages, setMessages] = useLocalStorageState<Message[]>({
    key: STORAGE_KEYS.projectMessages,
    schema: ProjectMessagesSchema,
    initialValue: [],
  });
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

    const requestMessages: Message[] = [...messages, { role: "user", content: messageDraft }];
    if (!isInitialRequest) {
      setMessages(requestMessages);
    }

    try {
      const response = await requestProjectUpdate({ messages: requestMessages, project });
      mergeProjectResponse(response);

      if (response.complete) {
        if (isInitialRequest) {
          setMessages(requestMessages);
        }
      } else {
        setMessages([
          ...requestMessages,
          { role: "assistant", content: response.questions.join("\n") },
        ]);
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
