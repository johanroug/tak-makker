"use client";

import { useEffect, useState } from "react";
import { OfferSchema, type Offer as OfferSnapshot } from "@/schemas/offer";
import { ProjectMessagesSchema, type Message } from "@/schemas/message";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useProject } from "@/hooks/useProject";
import { createOfferFromProject } from "@/lib/offers/createOfferFromProject";
import { requestProjectUpdate } from "@/lib/ai/requestProjectUpdate";
import {
  readStoredValue,
  removeStoredValue,
  STORAGE_KEYS,
  writeStoredValue,
} from "@/lib/storage/browser-storage";
import Conversation from "./components/Conversation/Conversation";
import WorkItems from "./components/WorkItems/WorkItems";
import Materials from "./components/Materials/Materials";
import styles from "./page.module.scss";
import ProjectMessageInput from "./components/ProjectMessageInput/ProjectMessageInput";
import Calculation from "./components/Calculation/Calculation";
import Offer from "./components/Offer/Offer";
import CompanyProfileForm from "./components/CompanyProfileForm/CompanyProfileForm";

export default function Home() {
  const [messageDraft, setMessageDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasHydratedMessages, setHasHydratedMessages] = useState(false);
  const [isAssistantResponding, setIsAssistantResponding] = useState(false);
  const [offer, setOffer] = useState<OfferSnapshot | null>(null);
  const [hasHydratedOffer, setHasHydratedOffer] = useState(false);
  const [offerValidationMessage, setOfferValidationMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "conversation" | "workItems" | "materials" | "calculation"
  >("conversation");

  const projectManagerHook = useProject();
  const companyProfileHook = useCompanyProfile();

  useEffect(() => {
    const storedMessages = readStoredValue(
      STORAGE_KEYS.projectMessages,
      ProjectMessagesSchema,
    );
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      if (storedMessages !== null) {
        setMessages(storedMessages);
      }

      setHasHydratedMessages(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasHydratedMessages) {
      return;
    }

    writeStoredValue(STORAGE_KEYS.projectMessages, messages, ProjectMessagesSchema);
  }, [hasHydratedMessages, messages]);

  useEffect(() => {
    const storedOffer = readStoredValue(STORAGE_KEYS.currentOffer, OfferSchema);
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      if (storedOffer !== null) {
        setOffer(storedOffer);
      }

      setHasHydratedOffer(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasHydratedOffer) {
      return;
    }

    if (offer === null) {
      removeStoredValue(STORAGE_KEYS.currentOffer);
      return;
    }

    writeStoredValue(STORAGE_KEYS.currentOffer, offer, OfferSchema);
  }, [hasHydratedOffer, offer]);

  function handleCreateOffer() {
    const result = createOfferFromProject({
      companyProfile: companyProfileHook.companyProfile,
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

  async function sendProjectMessage() {
    if (isAssistantResponding) {
      return;
    }

    setIsAssistantResponding(true);

    const userMessage: Message = {
      role: "user",
      content: messageDraft,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);

    try {
      const generatedResponse = await requestProjectUpdate({
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

      setMessageDraft("");
    } catch (error) {
      console.error("Could not update project:", error);
    } finally {
      setIsAssistantResponding(false);
    }
  }

  const projectHasData =
    projectManagerHook.project.customer.name !== null ||
    projectManagerHook.project.project.title !== null ||
    projectManagerHook.project.project.description !== null ||
    projectManagerHook.project.hourlyRate !== null ||
    projectManagerHook.project.workItems.length > 0 ||
    projectManagerHook.project.materials.length > 0;
  const conversationStarted = messages.length > 0 || projectHasData || offer !== null;
  const tabsAreBlocked =
    activeTab === "materials" && projectManagerHook.hasIncompleteAcceptedMaterials;

  return (
    <main className={`${styles.page} ${conversationStarted ? styles.conversationStarted : ""}`}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Tak Makker</h1>

          <p className={styles.subtitle}>Din digitale makker på jobbet.</p>
        </header>

        <details className="mx-auto mb-8 max-w-[760px]">
          <summary className="cursor-pointer font-semibold">Virksomhedsprofil</summary>

          <CompanyProfileForm
            companyProfile={companyProfileHook.companyProfile}
            onCompanyNameChange={companyProfileHook.handleCompanyNameChange}
            onCvrChange={companyProfileHook.handleCvrChange}
            onContactNameChange={companyProfileHook.handleContactNameChange}
            onPhoneChange={companyProfileHook.handlePhoneChange}
            onEmailChange={companyProfileHook.handleEmailChange}
          />
        </details>

        <div className={styles.workspace}>
          <section className={styles.inputColumn}>
            <ProjectMessageInput
              messageDraft={messageDraft}
              buttonLabel={conversationStarted ? "Fortsæt" : "Start projekt"}
              isLoading={isAssistantResponding}
              onMessageDraftChange={setMessageDraft}
              onSubmit={sendProjectMessage}
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
                  onMaterialUnitChange={projectManagerHook.handleMaterialUnitChange}
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
