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
import styles from "./page.module.scss";
import ProjectMessageInput from "./components/ProjectMessageInput/ProjectMessageInput";
import CompanyProfileForm from "./components/CompanyProfileForm/CompanyProfileForm";
import OfferPreview from "./components/OfferPreview/OfferPreview";
import SidePanel from "./components/SidePanel/SidePanel";

export default function Home() {
  const [messageDraft, setMessageDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasHydratedMessages, setHasHydratedMessages] = useState(false);
  const [isAssistantResponding, setIsAssistantResponding] = useState(false);
  const [initialProjectError, setInitialProjectError] = useState<string | null>(null);
  const [offer, setOffer] = useState<OfferSnapshot | null>(null);
  const [hasHydratedOffer, setHasHydratedOffer] = useState(false);
  const [offerValidationMessage, setOfferValidationMessage] = useState<string | null>(null);

  const projectManagerHook = useProject();
  const companyProfileHook = useCompanyProfile();

  useEffect(() => {
    const storedMessages = readStoredValue(STORAGE_KEYS.projectMessages, ProjectMessagesSchema);
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

  async function sendProjectMessage(isInitialRequest = false) {
    if (isAssistantResponding) {
      return;
    }

    setIsAssistantResponding(true);
    if (isInitialRequest) {
      setInitialProjectError(null);
    }

    const userMessage: Message = {
      role: "user",
      content: messageDraft,
    };

    const requestMessages = [...messages, userMessage];

    if (!isInitialRequest) {
      setMessages(requestMessages);
    }

    try {
      const generatedResponse = await requestProjectUpdate({
        messages: requestMessages,
        project: projectManagerHook.project,
      });

      projectManagerHook.mergeProjectResponse(generatedResponse);

      if (!generatedResponse.complete) {
        const assistantMessage: Message = {
          role: "assistant",
          content: generatedResponse.questions.join("\n"),
        };

        const nextMessages = isInitialRequest
          ? [...requestMessages, assistantMessage]
          : [...requestMessages, assistantMessage];

        setMessages(nextMessages);
      } else if (isInitialRequest) {
        setMessages(requestMessages);
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

  const projectHasData =
    projectManagerHook.project.customer.name !== null ||
    projectManagerHook.project.project.title !== null ||
    projectManagerHook.project.project.description !== null ||
    projectManagerHook.project.project.offerDescription !== null ||
    projectManagerHook.project.hourlyRate !== null ||
    projectManagerHook.project.workItems.length > 0 ||
    projectManagerHook.project.materials.length > 0;
  const conversationStarted = messages.length > 0 || projectHasData || offer !== null;

  return (
    <main className={`${styles.page} ${conversationStarted ? styles.conversationStarted : ""}`}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Tak Makker</h1>
          {conversationStarted && (
            <details className={styles.companyProfileHeader}>
              <summary className="cursor-pointer text-sm font-semibold">Virksomhedsprofil</summary>
              <CompanyProfileForm
                companyProfile={companyProfileHook.companyProfile}
                onCompanyNameChange={companyProfileHook.handleCompanyNameChange}
                onCvrChange={companyProfileHook.handleCvrChange}
                onContactNameChange={companyProfileHook.handleContactNameChange}
                onPhoneChange={companyProfileHook.handlePhoneChange}
                onEmailChange={companyProfileHook.handleEmailChange}
              />
            </details>
          )}
        </header>

        {!conversationStarted && (
          <div className={styles.startScreen}>
            <p className={styles.subtitle}>Din digitale makker på jobbet.</p>

            <details className={styles.startProfile}>
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

            <div className={styles.startFormWrapper}>
              <ProjectMessageInput
                messageDraft={messageDraft}
                buttonLabel="Start projekt"
                isLoading={isAssistantResponding}
                loadingLabel="Arbejder…"
                onMessageDraftChange={setMessageDraft}
                onSubmit={() => sendProjectMessage(true)}
              />
              {initialProjectError && (
                <p
                  className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
                  role="alert"
                >
                  {initialProjectError}
                </p>
              )}
            </div>
          </div>
        )}

        {conversationStarted && (
          <div className={styles.workspace}>
            <section className={styles.offerColumn}>
              <OfferPreview
                companyProfile={companyProfileHook.companyProfile}
                projectDraft={projectManagerHook.project}
                currentOffer={offer}
                totalLaborPrice={projectManagerHook.totalLaborPrice}
                totalMaterialPrice={projectManagerHook.totalMaterialPrice}
                subtotal={projectManagerHook.subtotal}
                vatAmount={projectManagerHook.vatAmount}
                finalTotal={projectManagerHook.finalTotal}
                onCustomerNameChange={projectManagerHook.handleCustomerNameChange}
                onProjectTitleChange={projectManagerHook.handleProjectTitleChange}
                onProjectOfferDescriptionChange={
                  projectManagerHook.handleProjectOfferDescriptionChange
                }
                onWorkItemDescriptionChange={projectManagerHook.handleWorkItemDescriptionChange}
                onCreateOffer={handleCreateOffer}
                offerActionLabel={offer === null ? "Færdiggør tilbud" : "Færdiggør ny version"}
                validationMessage={offerValidationMessage}
              />
            </section>

            <section className={styles.sidePanelColumn}>
              <SidePanel
                workItems={projectManagerHook.project.workItems}
                materials={projectManagerHook.project.materials}
                hourlyRate={projectManagerHook.project.hourlyRate}
                hasIncompleteAcceptedMaterials={projectManagerHook.hasIncompleteAcceptedMaterials}
                onWorkItemChange={projectManagerHook.handleWorkItemChange}
                onEstimatedHoursChange={projectManagerHook.handleEstimatedHoursChange}
                onWorkItemDescriptionChange={projectManagerHook.handleWorkItemDescriptionChange}
                onHourlyRateChange={projectManagerHook.handleHourlyRateChange}
                onMaterialChange={projectManagerHook.handleMaterialChange}
                onMaterialQuantityChange={projectManagerHook.handleMaterialQuantityChange}
                onMaterialUnitChange={projectManagerHook.handleMaterialUnitChange}
                onMaterialUnitPriceChange={projectManagerHook.handleMaterialUnitPriceChange}
                messages={messages}
                messageDraft={messageDraft}
                isAssistantResponding={isAssistantResponding}
                onMessageDraftChange={setMessageDraft}
                onSendMessage={() => sendProjectMessage(false)}
              />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
