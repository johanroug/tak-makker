"use client";

import { useState } from "react";
import type { ProjectResponse, WorkItem } from "@/schemas/project";
import type { Message } from "@/types/message";
import styles from "./page.module.scss";
import QuoteInput from "./components/QuoteInput/QuoteInput";
import Conversation from "./components/Conversation/Conversation";
import QuoteResult from "./components/QuoteResult/QuoteResult";
import WorkItems from "./components/WorkItems/WorkItems";

export default function Home() {
  const [description, setDescription] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [projectResponse, setProjectResponse] = useState<ProjectResponse | null>(null);

  async function createQuote() {
    const userMessage: Message = {
      role: "user",
      content: description,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);

    const response = await fetch("/api/quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: updatedMessages,
        workItems: projectResponse?.workItems ?? [],
      }),
    });

    const generatedResponse: ProjectResponse = await response.json();

    setProjectResponse(generatedResponse);

    if (!generatedResponse.complete) {
      const assistantMessage: Message = {
        role: "assistant",
        content: generatedResponse.questions.join("\n"),
      };

      setMessages([
        ...updatedMessages,
        assistantMessage,
      ]);
    }

    setDescription("");
  }

  const conversationStarted = messages.length > 0;

  function handleWorkItemChange(
    workItem: WorkItem,
    accepted: boolean
  ) {
    if (!projectResponse) {
      return;
    }

    const updatedWorkItems: WorkItem[] = projectResponse.workItems.map((item) => {
      if (item !== workItem) {
        return item;
      }

      return {
        ...item,
        status: accepted ? "accepted" : "rejected",
      };
    });

    setProjectResponse({
      ...projectResponse,
      workItems: updatedWorkItems,
    });
  }

  return (
    <main className={styles.page}>
      <div
        className={`${styles.container} ${conversationStarted ? styles.conversationStarted : ""
          }`}
      >
        <header className={styles.header}>
          <h1 className={styles.title}>Tak Makker</h1>

          <p className={styles.subtitle}>
            Din digitale makker på jobbet.
          </p>
        </header>

        <div className={styles.workspace}>
          <section className={styles.inputColumn}>
            <QuoteInput description={description} onDescriptionChange={setDescription} onSubmit={createQuote} />
          </section>

          <section className={styles.conversationColumn}>
            <div className={styles.conversationContent}>
              <div className={styles.conversationScroll}>
                <Conversation messages={messages} />

                <QuoteResult projectResponse={projectResponse} />
              </div>

              <div className={styles.suggestions}>
                {projectResponse && (
                  <WorkItems
                    workItems={projectResponse.workItems}
                    onWorkItemChange={handleWorkItemChange}
                  />
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}