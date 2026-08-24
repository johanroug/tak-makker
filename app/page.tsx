"use client";

import { useState } from "react";
import { ProjectResponseSchema, type Material, type ProjectDraft, type ProjectResponse, type WorkItem } from "@/schemas/project";
import type { Message } from "@/types/message";
import styles from "./page.module.scss";
import QuoteInput from "./components/QuoteInput/QuoteInput";
import Conversation from "./components/Conversation/Conversation";
import QuoteResult from "./components/QuoteResult/QuoteResult";
import WorkItems from "./components/WorkItems/WorkItems";
import Materials from "./components/Materials/Materials";

export default function Home() {
  const [description, setDescription] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [projectResponse, setProjectResponse] = useState<ProjectResponse | null>(null);
  const [project, setProject] = useState<ProjectDraft>({
    workItems: [],
    materials: [],
  });

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
        workItems: project?.workItems ?? [],
        materials: project?.materials ?? [],
      }),
    });

    const data: unknown = await response.json();

    if (!response.ok) {
      console.error("API error:", data);
      return;
    }

    const parsedResponse = ProjectResponseSchema.safeParse(data);

    if (!parsedResponse.success) {
      console.error(
        "Invalid ProjectResponse:",
        parsedResponse.error,
        data
      );
      return;
    }

    const generatedResponse = parsedResponse.data;
    setProjectResponse(generatedResponse);

    setProject((currentProject) => {
      const workItems = generatedResponse.workItems.map((newItem) => {
        const existingItem = currentProject.workItems.find(
          (item) => item.id === newItem.id
        );

        if (!existingItem) {
          return newItem;
        }

        return {
          ...newItem,

          // ÆNDRET:
          // Brugerens accepted/rejected-status vinder over AI'ens status.
          status:
            existingItem.status !== "suggested"
              ? existingItem.status
              : newItem.status,

          // NYT:
          // Hvis håndværkeren selv har rettet timerne,
          // beholder vi håndværkerens værdi.
          estimatedHours:
            existingItem.estimatedHoursSource === "user"
              ? existingItem.estimatedHours
              : newItem.estimatedHours,

          // NYT:
          // Vi skal også bevare informationen om,
          // at timerne kommer fra håndværkeren.
          estimatedHoursSource:
            existingItem.estimatedHoursSource === "user"
              ? "user"
              : newItem.estimatedHoursSource,
        };
      });

      const materials = generatedResponse.materials.map((newMaterial) => {
        const existingMaterial = currentProject.materials.find(
          (material) => material.id === newMaterial.id
        );

        if (!existingMaterial) {
          return newMaterial;
        }

        return {
          ...newMaterial,

          // Brugerens accepted/rejected-status vinder.
          status:
            existingMaterial.status !== "suggested"
              ? existingMaterial.status
              : newMaterial.status,
        };
      });

      return {
        ...currentProject,
        workItems,
        materials,
      };
    });

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
    const updatedWorkItems: WorkItem[] =
      project.workItems.map((item) => {
        if (item.id !== workItem.id) {
          return item;
        }

        return {
          ...item,
          status: accepted ? "accepted" : "rejected",
        };
      });

    setProject({
      ...project,
      workItems: updatedWorkItems,
    });
  }

  function handleMaterialChange(
    material: Material,
    accepted: boolean
  ) {
    const updatedMaterials: Material[] =
      project.materials.map((item) => {
        if (item.id !== material.id) {
          return item;
        }

        return {
          ...item,
          status: accepted ? "accepted" : "rejected",
        };
      });

    setProject({
      ...project,
      materials: updatedMaterials,
    });
  }

  function handleEstimatedHoursChange(
    workItem: WorkItem,
    hours: number
  ) {
    // NYT: opdater den valgte arbejdsopgave
    const updatedWorkItems: WorkItem[] =
      project.workItems.map((item) => {
        if (item.id !== workItem.id) {
          return item;
        }

        return {
          ...item,
          estimatedHours: hours,

          // NYT: brugerens ændring skal beskyttes mod AI senere
          estimatedHoursSource: "user",
        };
      });

    setProject({
      ...project,
      workItems: updatedWorkItems,
    });
  }

  return (
    <main className={styles.page}>
      Jeg skal totalrenovere et badeværelse
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
                  <>
                    <WorkItems
                      workItems={project.workItems}
                      onWorkItemChange={handleWorkItemChange}
                      onEstimatedHoursChange={handleEstimatedHoursChange}
                    />

                    <Materials
                      materials={project.materials}
                      onMaterialChange={handleMaterialChange}
                    />
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}