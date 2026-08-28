"use client";

import { useState } from "react";
import type { Offer as OfferSnapshot } from "@/schemas/offer";
import type { Message } from "@/types/message";
import { useProject } from "@/hooks/useProject";
import { createOfferFromProject } from "@/lib/offers/createOfferFromProject";
import Conversation from "./components/Conversation/Conversation";
import WorkItems from "./components/WorkItems/WorkItems";
import Materials from "./components/Materials/Materials";
import styles from "./page.module.scss";
import { createQuoteRequest } from "../lib/ai/createQuote";
import QuoteInput from "./components/QuoteInput/QuoteInput";
import Calculation from "./components/Calculation/Calculation";
import Offer from "./components/Offer/Offer";

export default function Home() {
  const [description, setDescription] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [offer, setOffer] = useState<OfferSnapshot | null>(null);
  const [offerValidationMessage, setOfferValidationMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "conversation" | "workItems" | "materials" | "calculation"
  >("conversation");

  const projectManagerHook = useProject();

  function handleCreateOffer() {
    const result = createOfferFromProject({
      projectDraft: projectManagerHook.project,
      calculations: {
        totalLaborPrice: projectManagerHook.totalLaborPrice,
        totalMaterialPrice: projectManagerHook.totalMaterialPrice,
        subtotal: projectManagerHook.subtotal,
        vatAmount: projectManagerHook.vatAmount,
        finalTotal: projectManagerHook.finalTotal,
      },
    });

    if (!result.success) {
      setOfferValidationMessage(result.message);
      return;
    }

    setOfferValidationMessage(null);
    setOffer(result.offer);
  }

  function handleTabChange(nextTab: typeof activeTab) {
    if (
      activeTab === "materials" &&
      nextTab !== "materials" &&
      projectManagerHook.hasIncompleteAcceptedMaterials
    ) {
      return;
    }

    setActiveTab(nextTab);
  }

  async function createQuote() {
    if (isCreatingQuote) {
      return;
    }

    setIsCreatingQuote(true);

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
    } finally {
      setIsCreatingQuote(false);
    }
  }

  const conversationStarted = messages.length > 0;
  const tabsAreBlocked =
    activeTab === "materials" && projectManagerHook.hasIncompleteAcceptedMaterials;

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
              buttonLabel={conversationStarted ? "Fortsæt" : "Start projekt"}
              isLoading={isCreatingQuote}
              onDescriptionChange={setDescription}
              onSubmit={createQuote}
            />
          </section>

          <section className={styles.conversationColumn}>
            <div className={styles.tabs}>
              <button
                className={
                  activeTab === "conversation"
                    ? styles.activeTab
                    : tabsAreBlocked
                      ? styles.disabledTab
                      : ""
                }
                aria-disabled={tabsAreBlocked}
                disabled={tabsAreBlocked}
                onClick={() => handleTabChange("conversation")}
              >
                Samtale
              </button>

              <button
                className={
                  activeTab === "workItems"
                    ? styles.activeTab
                    : tabsAreBlocked
                      ? styles.disabledTab
                      : ""
                }
                aria-disabled={tabsAreBlocked}
                disabled={tabsAreBlocked}
                onClick={() => handleTabChange("workItems")}
              >
                Opgaver
              </button>

              <button
                className={activeTab === "materials" ? styles.activeTab : ""}
                aria-disabled={false}
                onClick={() => handleTabChange("materials")}
              >
                Materialer
              </button>

              <button
                className={
                  activeTab === "calculation"
                    ? styles.activeTab
                    : tabsAreBlocked
                      ? styles.disabledTab
                      : ""
                }
                aria-disabled={tabsAreBlocked}
                disabled={tabsAreBlocked}
                onClick={() => handleTabChange("calculation")}
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
                  hasIncompleteAcceptedMaterials={
                    projectManagerHook.hasIncompleteAcceptedMaterials
                  }
                  onMaterialChange={projectManagerHook.handleMaterialChange}
                  onMaterialQuantityChange={projectManagerHook.handleMaterialQuantityChange}
                  onMaterialUnitPriceChange={projectManagerHook.handleMaterialUnitPriceChange}
                />
              )}

              {activeTab === "calculation" && (
                <>
                  <Calculation
                    workItems={projectManagerHook.project.workItems}
                    hourlyRate={projectManagerHook.project.hourlyRate}
                    totalLaborPrice={projectManagerHook.totalLaborPrice}
                    totalMaterialPrice={projectManagerHook.totalMaterialPrice}
                    subtotal={projectManagerHook.subtotal}
                    vatAmount={projectManagerHook.vatAmount}
                    finalTotal={projectManagerHook.finalTotal}
                    customerName={projectManagerHook.project.customer.name}
                    projectTitle={projectManagerHook.project.project.title}
                    projectDescription={projectManagerHook.project.project.description}
                    offerActionLabel={offer ? "Opdater tilbud" : "Opret tilbud"}
                    validationMessage={offerValidationMessage}
                    onHourlyRateChange={projectManagerHook.handleHourlyRateChange}
                    onCustomerNameChange={projectManagerHook.handleCustomerNameChange}
                    onProjectTitleChange={projectManagerHook.handleProjectTitleChange}
                    onProjectDescriptionChange={
                      projectManagerHook.handleProjectDescriptionChange
                    }
                    onCreateOffer={handleCreateOffer}
                  />

                  {offer && <Offer offer={offer} />}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
