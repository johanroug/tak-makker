"use client";

import { useState } from "react";
import type { CompanyProfile } from "@/schemas/company-profile";
import type { Offer as OfferSnapshot } from "@/schemas/offer";
import type { ProjectDraft, WorkItem } from "@/schemas/project";
import { formatMoney } from "@/lib/format-money";
import { isWorkItemIncluded } from "@/lib/work-item-selection";
import { hasCompleteMaterialPricing } from "@/lib/material-pricing";

type OfferPreviewProps = {
  companyProfile: CompanyProfile;
  projectDraft: ProjectDraft;
  projectNumber: string;
  currentOffer: OfferSnapshot | null;
  hasChangesSinceFinalization: boolean;
  totalLaborPrice: number | null;
  totalMaterialPrice: number;
  subtotal: number | null;
  vatAmount: number | null;
  finalTotal: number | null;
  onCustomerNameChange: (name: string) => void;
  onCustomerAddressChange: (address: string) => void;
  onProjectTitleChange: (title: string) => void;
  onProjectOfferDescriptionChange: (description: string) => void;
  onWorkItemDescriptionChange: (workItem: WorkItem, description: string) => void;
  onCreateOffer: () => void;
  offerActionLabel: string;
  validationMessage: string | null;
  onDownloadPdf: () => void;
  isDownloadingPdf: boolean;
  pdfError: string | null;
};

export default function OfferPreview({
  companyProfile,
  projectDraft,
  projectNumber,
  currentOffer,
  hasChangesSinceFinalization,
  totalLaborPrice,
  totalMaterialPrice,
  subtotal,
  vatAmount,
  finalTotal,
  onCustomerNameChange,
  onCustomerAddressChange,
  onProjectTitleChange,
  onProjectOfferDescriptionChange,
  onWorkItemDescriptionChange,
  onCreateOffer,
  offerActionLabel,
  validationMessage,
  onDownloadPdf,
  isDownloadingPdf,
  pdfError,
}: OfferPreviewProps) {
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingWorkItemId, setEditingWorkItemId] = useState<string | null>(null);
  const [editingWorkItemDescription, setEditingWorkItemDescription] = useState<string>("");
  const [isConfirmingIncompleteFinalization, setIsConfirmingIncompleteFinalization] =
    useState(false);

  const isOfferFinalized = currentOffer !== null;

  const includedWorkItems = projectDraft.workItems.filter(isWorkItemIncluded);
  const customerOfferDescription =
    projectDraft.project.offerDescription ?? projectDraft.project.description ?? "";
  const isProjectComplete = projectDraft.complete;

  const workItemGroups = Array.from(
    includedWorkItems.reduce((groups, item) => {
      const items = groups.get(item.trade) ?? [];
      groups.set(item.trade, [...items, item]);
      return groups;
    }, new Map<string, typeof includedWorkItems>()),
    ([trade, items]) => ({ trade, items }),
  );

  const acceptedMaterials = projectDraft.materials.filter(
    (material): material is typeof material & { quantity: number; unitPrice: number } =>
      material.status === "accepted" && hasCompleteMaterialPricing(material),
  );

  return (
    <div className="card card-stack">
      {/* Company header - compact */}
      {companyProfile.companyName && (
        <div className="text-xs text-neutral-600 leading-relaxed">
          <div className="font-medium">{companyProfile.companyName}</div>
          {companyProfile.cvr && <div>CVR {companyProfile.cvr}</div>}
          {(companyProfile.contactName || companyProfile.phone || companyProfile.email) && (
            <div>
              {[companyProfile.contactName, companyProfile.phone, companyProfile.email]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
        </div>
      )}

      {/* Project details - display or edit mode */}
      <div className={companyProfile.companyName ? "border-t border-neutral-200 pt-3" : ""}>
        {!isEditingProject ? (
          // Display mode: compact document view
          <div>
            {/* Section header */}
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
              <span>TILBUD</span>
              {!isOfferFinalized && !isProjectComplete && (
                <span className="ml-2 text-[10px] font-semibold tracking-[0.18em] text-neutral-400">
                  · UDKAST
                </span>
              )}
            </div>

            {isOfferFinalized && !hasChangesSinceFinalization && (
              <div
                className="mb-3 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs font-medium text-emerald-800"
                aria-live="polite"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                Tilbud færdiggjort
              </div>
            )}

            {hasChangesSinceFinalization && (
              <div
                className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs font-medium text-amber-900"
                aria-live="polite"
              >
                Tilbuddet er ændret siden færdiggørelse
              </div>
            )}

            {/* Project title and customer - prominent */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold leading-snug text-neutral-900 mb-1">
                  {projectDraft.project.title || "Projekt uden titel"}
                </h2>
                <p className="text-sm text-neutral-600">
                  Projektnr.: <span className="font-medium">{projectNumber}</span>
                </p>
                <p className="text-sm text-neutral-600">
                  Kunde: <span className="font-medium">
                    {projectDraft.customer.name || "Ikke angivet"}
                  </span>
                </p>
                <p className="text-sm text-neutral-600">
                  Adresse: <span className="font-medium">
                    {projectDraft.customer.address || "Ikke angivet"}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setIsEditingProject(true)}
                className="shrink-0 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium whitespace-nowrap"
              >
                Rediger
              </button>
            </div>

            {/* Customer-facing project description */}
            <p className="text-sm leading-6 text-neutral-700 mb-3">
              Beskrivelse: <span className="font-medium">
                {customerOfferDescription || "Ikke angivet"}
              </span>
            </p>
          </div>
        ) : (
          // Edit mode: form inputs
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-900">Rediger projektoplysninger</h3>
              <button
                onClick={() => setIsEditingProject(false)}
                className="px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900 hover:underline font-medium"
              >
                Færdig
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Projekttitel
                </label>
                <input
                  type="text"
                  value={projectDraft.project.title ?? ""}
                  onChange={(e) => onProjectTitleChange(e.target.value)}
                  placeholder="Projekttitel"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Kundenavn
                </label>
                <input
                  type="text"
                  value={projectDraft.customer.name ?? ""}
                  onChange={(e) => onCustomerNameChange(e.target.value)}
                  placeholder="Kundenavn"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Tilbudsbeskrivelse
                </label>
                <textarea
                  value={projectDraft.project.offerDescription ?? ""}
                  onChange={(e) => onProjectOfferDescriptionChange(e.target.value)}
                  placeholder="Tilbudsbeskrivelse"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Kundeadresse
                </label>
                <input
                  type="text"
                  value={projectDraft.customer.address ?? ""}
                  onChange={(e) => onCustomerAddressChange(e.target.value)}
                  placeholder="Kundeadresse"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Work items */}
      {workItemGroups.length > 0 && (
        <div className="border-t border-neutral-200 pt-4">
          <h3 className="card-title mb-3">Arbejde</h3>

          <div className="card-stack">
            {workItemGroups.map((group) => (
              <div key={group.trade}>
                <strong>{group.trade}</strong>

                <div className="card-stack mt-2">
                  {group.items.map((item) => (
                    <div key={item.id}>
                      {editingWorkItemId === item.id ? (
                        <div className="mb-2">
                          <textarea
                            autoFocus
                            value={editingWorkItemDescription}
                            onChange={(e) => setEditingWorkItemDescription(e.target.value)}
                            onBlur={() => {
                              if (editingWorkItemDescription.trim()) {
                                onWorkItemDescriptionChange(item, editingWorkItemDescription);
                              }
                              setEditingWorkItemId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && e.ctrlKey) {
                                if (editingWorkItemDescription.trim()) {
                                  onWorkItemDescriptionChange(item, editingWorkItemDescription);
                                }
                                setEditingWorkItemId(null);
                              }
                              if (e.key === "Escape") {
                                setEditingWorkItemId(null);
                              }
                            }}
                            className="w-full px-2 py-1 border border-neutral-300 rounded text-sm leading-5"
                            rows={3}
                          />
                        </div>
                      ) : (
                        <p
                          className="text-sm leading-5 text-neutral-600 cursor-pointer hover:text-blue-600 hover:underline"
                          onClick={() => {
                            setEditingWorkItemId(item.id);
                            setEditingWorkItemDescription(item.description);
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Materials */}
      {acceptedMaterials.length > 0 && (
        <div className="border-t border-neutral-200 pt-4">
          <h3 className="card-title mb-3">Materialer</h3>

          <div className="card-stack">
            {acceptedMaterials.map((material) => (
              <div className="flex items-start justify-between gap-4" key={material.id}>
                <div>
                  <strong>{material.name}</strong>
                  <p className="mt-1 text-sm leading-5 text-neutral-600">
                    {material.description}
                  </p>
                  <small className="text-neutral-500">
                    {(material.quantity ?? 0).toLocaleString("da-DK")} {material.unit} ×{" "}
                    {formatMoney(material.unitPrice)}
                  </small>
                </div>

                <div className="shrink-0 text-right text-sm whitespace-nowrap">
                  <strong>
                    {formatMoney(material.quantity * material.unitPrice)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing summary */}
      {(includedWorkItems.length > 0 || acceptedMaterials.length > 0) && (
        <div className="border-t border-neutral-200 pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Arbejde</span>
              <strong>{formatMoney(totalLaborPrice)}</strong>
            </div>

            {totalMaterialPrice > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span>Materialer</span>
                <strong>{formatMoney(totalMaterialPrice)}</strong>
              </div>
            )}

            <div className="border-t border-neutral-200 pt-2 flex items-center justify-between text-base">
              <span>Subtotal</span>
              <strong>{formatMoney(subtotal)}</strong>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>Moms (25%)</span>
              <strong>{formatMoney(vatAmount)}</strong>
            </div>

            <div className="border-t border-neutral-200 pt-2 flex items-center justify-between text-lg">
              <span className="font-semibold">I alt</span>
              <strong className="text-lg">{formatMoney(finalTotal)}</strong>
            </div>
          </div>

          {(!isOfferFinalized || hasChangesSinceFinalization) && validationMessage && (
            <p
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
              role="alert"
            >
              {validationMessage}
            </p>
          )}

          {(!isOfferFinalized || hasChangesSinceFinalization) &&
            isConfirmingIncompleteFinalization &&
            !isProjectComplete && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
              <p className="leading-6">
                Tak Makker mangler stadig oplysninger om projektet. Du kan godt færdiggøre
                tilbuddet alligevel.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmingIncompleteFinalization(false)}
                  className="flex-1 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
                >
                  Fortsæt arbejdet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmingIncompleteFinalization(false);
                    onCreateOffer();
                  }}
                  className="flex-1 rounded-md bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-800"
                >
                  Færdiggør alligevel
                </button>
              </div>
            </div>
          )}

          {(!isOfferFinalized || hasChangesSinceFinalization) &&
            !isConfirmingIncompleteFinalization && (
            <button
              type="button"
              onClick={() => {
                if (!isProjectComplete) {
                  setIsConfirmingIncompleteFinalization(true);
                  return;
                }

                onCreateOffer();
              }}
              className="primary-button mt-4 w-full"
            >
              {offerActionLabel}
            </button>
          )}

          {isOfferFinalized && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onDownloadPdf}
                disabled={isDownloadingPdf}
                className="primary-button w-full disabled:cursor-wait disabled:opacity-60"
              >
                {isDownloadingPdf ? "Genererer PDF…" : "Hent PDF"}
              </button>
              {pdfError && (
                <p
                  className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
                  role="alert"
                >
                  {pdfError}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
