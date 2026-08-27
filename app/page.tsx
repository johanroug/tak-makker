"use client";

import { useState } from "react";
import { type ProjectResponse } from "@/schemas/project";
import type { Message } from "@/types/message";
import { useProject } from "@/hooks/useProject";
import Conversation from "./components/Conversation/Conversation";
import WorkItems from "./components/WorkItems/WorkItems";
import Materials from "./components/Materials/Materials";
import styles from "./page.module.scss";
import { createQuoteRequest } from "../lib/ai/createQuote";
import QuoteInput from "./components/QuoteInput/QuoteInput";
import Calculation from "./components/Calculation/Calculation";

export default function Home() {
  const [description, setDescription] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<
    "conversation" | "workItems" | "materials" | "calculation"
  >("conversation");

  const projectManagerHook = useProject();

  async function createQuote() {
    const userMessage: Message = {
      role: "user",
      content: description,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);

    try {
      const generatedResponse = await createQuoteRequest({
        messages: updatedMessages,
        project: projectManagerHook.project,
      });

      projectManagerHook.mergeProjectResponse(generatedResponse);

      if (!generatedResponse.complete) {
        const assistantMessage: Message = {
          role: "assistant",
          content: generatedResponse.questions.join("\n"),
        };

        setMessages([...updatedMessages, assistantMessage]);
      }

      setDescription("");
    } catch (error) {
      console.error("Could not create quote:", error);
    }
  }

  const conversationStarted = messages.length > 0;

  return (
    <main className={`${styles.page} ${conversationStarted ? styles.conversationStarted : ""}`}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Tak Makker</h1>

          <p className={styles.subtitle}>Din digitale makker på jobbet.</p>
        </header>

        <div className={styles.workspace}>
          <section className={styles.inputColumn}>
            <QuoteInput
              description={description}
              onDescriptionChange={setDescription}
              onSubmit={createQuote}
            />
          </section>

          <section className={styles.conversationColumn}>
            <div className={styles.tabs}>
              <button
                className={activeTab === "conversation" ? styles.activeTab : ""}
                onClick={() => setActiveTab("conversation")}
              >
                Samtale
              </button>

              <button
                className={activeTab === "workItems" ? styles.activeTab : ""}
                onClick={() => setActiveTab("workItems")}
              >
                Opgaver
              </button>

              <button
                className={activeTab === "materials" ? styles.activeTab : ""}
                onClick={() => setActiveTab("materials")}
              >
                Materialer
              </button>

              <button
                className={activeTab === "calculation" ? styles.activeTab : ""}
                onClick={() => setActiveTab("calculation")}
              >
                Kalkulation
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === "conversation" && (
                <>
                  <Conversation messages={messages} />
                </>
              )}

              {activeTab === "workItems" && (
                <WorkItems
                  workItems={projectManagerHook.project.workItems}
                  hourlyRate={projectManagerHook.project.hourlyRate}
                  onWorkItemChange={projectManagerHook.handleWorkItemChange}
                  onEstimatedHoursChange={projectManagerHook.handleEstimatedHoursChange}
                />
              )}

              {activeTab === "materials" && (
                <Materials
                  materials={projectManagerHook.project.materials}
                  onMaterialChange={projectManagerHook.handleMaterialChange}
                />
              )}

              {activeTab === "calculation" && (
                <Calculation
                  hourlyRate={projectManagerHook.project.hourlyRate}
                  totalLaborPrice={projectManagerHook.totalLaborPrice}
                  onHourlyRateChange={projectManagerHook.handleHourlyRateChange}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
