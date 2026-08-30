"use client";

import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useOffer } from "@/hooks/useOffer";
import { useProject } from "@/hooks/useProject";
import { useProjectConversation } from "@/hooks/useProjectConversation";
import { useProjectStore } from "@/hooks/useProjectStore";
import { shouldShowProjectInNavigation } from "@/lib/projects/project-navigation";
import styles from "./page.module.scss";
import CompanyProfileForm from "./components/CompanyProfileForm/CompanyProfileForm";
import OfferPreview from "./components/OfferPreview/OfferPreview";
import ProjectMessageInput from "./components/ProjectMessageInput/ProjectMessageInput";
import ProjectNavigation from "./components/ProjectNavigation/ProjectNavigation";
import SidePanel from "./components/SidePanel/SidePanel";

export default function Home() {
  const companyProfileHook = useCompanyProfile();
  const projectStoreHook = useProjectStore({
    defaultHourlyRate: companyProfileHook.companyProfile.defaultHourlyRate,
  });
  const projectManagerHook = useProject({
    activeProject: projectStoreHook.activeProject,
    updateProject: projectStoreHook.updateProject,
  });
  const conversationHook = useProjectConversation({
    activeProject: projectStoreHook.activeProject,
    createProject: projectStoreHook.createProject,
    updateProject: projectStoreHook.updateProject,
    mergeProjectResponse: projectManagerHook.mergeProjectResponse,
    defaultHourlyRate: companyProfileHook.companyProfile.defaultHourlyRate,
  });
  const offerHook = useOffer({
    companyProfile: companyProfileHook.companyProfile,
    projectDraft: projectManagerHook.project,
    activeProject: projectStoreHook.activeProject,
    updateProject: projectStoreHook.updateProject,
    calculations: {
      totalLaborPrice: projectManagerHook.totalLaborPrice,
      totalMaterialPrice: projectManagerHook.totalMaterialPrice,
      subtotal: projectManagerHook.subtotal,
      vatAmount: projectManagerHook.vatAmount,
      finalTotal: projectManagerHook.finalTotal,
    },
  });

  const projectHasData =
    projectManagerHook.project.customer.name !== null ||
    projectManagerHook.project.project.title !== null ||
    projectManagerHook.project.project.description !== null ||
    projectManagerHook.project.project.offerDescription !== null ||
    projectManagerHook.project.hourlyRate !== null ||
    projectManagerHook.project.workItems.length > 0 ||
    projectManagerHook.project.materials.length > 0;
  const conversationStarted =
    conversationHook.messages.length > 0 || projectHasData || offerHook.offer !== null;
  const navigableProjects = projectStoreHook.projectStore.projects.filter(
    shouldShowProjectInNavigation,
  );

  const companyProfileFormProps = {
    companyProfile: companyProfileHook.companyProfile,
    onCompanyNameChange: companyProfileHook.handleCompanyNameChange,
    onCvrChange: companyProfileHook.handleCvrChange,
    onContactNameChange: companyProfileHook.handleContactNameChange,
    onPhoneChange: companyProfileHook.handlePhoneChange,
    onEmailChange: companyProfileHook.handleEmailChange,
    onDefaultHourlyRateChange: companyProfileHook.handleDefaultHourlyRateChange,
  };

  return (
    <main className={`${styles.page} ${conversationStarted ? styles.conversationStarted : ""}`}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Tak Makker</h1>
          <ProjectNavigation
            activeProjectId={projectStoreHook.projectStore.activeProjectId}
            projects={navigableProjects}
            disabled={conversationHook.isAssistantResponding}
            onSelectProject={projectStoreHook.setActiveProjectId}
            onNewProject={() => projectStoreHook.setActiveProjectId(null)}
          />
          {conversationStarted && (
            <details className={styles.companyProfileHeader}>
              <summary className="cursor-pointer text-sm font-semibold">Virksomhedsprofil</summary>
              <CompanyProfileForm {...companyProfileFormProps} />
            </details>
          )}
        </header>

        {!conversationStarted && (
          <div className={styles.startScreen}>
            <p className={styles.subtitle}>Din digitale makker på jobbet.</p>

            <details className={styles.startProfile}>
              <summary className="cursor-pointer font-semibold">Virksomhedsprofil</summary>
              <CompanyProfileForm {...companyProfileFormProps} />
            </details>

            <div className={styles.startFormWrapper}>
              <ProjectMessageInput
                messageDraft={conversationHook.messageDraft}
                buttonLabel="Start projekt"
                isLoading={conversationHook.isAssistantResponding}
                loadingLabel="Arbejder…"
                onMessageDraftChange={conversationHook.setMessageDraft}
                onSubmit={() => conversationHook.sendMessage(true)}
              />
              {conversationHook.initialProjectError && (
                <p
                  className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
                  role="alert"
                >
                  {conversationHook.initialProjectError}
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
                currentOffer={offerHook.offer}
                hasChangesSinceFinalization={offerHook.hasChangesSinceFinalization}
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
                onCreateOffer={offerHook.createOffer}
                offerActionLabel={
                  offerHook.offer === null ? "Færdiggør tilbud" : "Færdiggør ny version"
                }
                validationMessage={offerHook.validationMessage}
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
                messages={conversationHook.messages}
                messageDraft={conversationHook.messageDraft}
                isAssistantResponding={conversationHook.isAssistantResponding}
                onMessageDraftChange={conversationHook.setMessageDraft}
                onSendMessage={() => conversationHook.sendMessage()}
              />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
