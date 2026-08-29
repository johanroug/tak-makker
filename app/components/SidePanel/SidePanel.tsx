"use client";

import { useState } from "react";
import type { WorkItem, Material } from "@/schemas/project";
import type { Message } from "@/schemas/message";
import WorkItems from "../WorkItems/WorkItems";
import Materials from "../Materials/Materials";
import HourlyRate from "../HourlyRate/HourlyRate";
import Conversation from "../Conversation/Conversation";
import ProjectMessageInput from "../ProjectMessageInput/ProjectMessageInput";

type SidePanelProps = {
  workItems: WorkItem[];
  materials: Material[];
  hourlyRate: number | null;
  hasIncompleteAcceptedMaterials: boolean;
  onWorkItemChange: (workItem: WorkItem, accepted: boolean) => void;
  onEstimatedHoursChange: (workItem: WorkItem, hours: number | null) => void;
  onWorkItemDescriptionChange: (workItem: WorkItem, description: string) => void;
  onHourlyRateChange: (hourlyRate: number | null) => void;
  onMaterialChange: (material: Material, accepted: boolean) => void;
  onMaterialQuantityChange: (material: Material, quantity: number | null) => void;
  onMaterialUnitChange: (material: Material, unit: string) => void;
  onMaterialUnitPriceChange: (material: Material, unitPrice: number | null) => void;
  messages: Message[];
  messageDraft: string;
  isAssistantResponding: boolean;
  onMessageDraftChange: (draft: string) => void;
  onSendMessage: () => void;
};

type SidePanelTab = "workItems" | "materials" | "conversation";

export default function SidePanel({
  workItems,
  materials,
  hourlyRate,
  hasIncompleteAcceptedMaterials,
  onWorkItemChange,
  onEstimatedHoursChange,
  onWorkItemDescriptionChange,
  onHourlyRateChange,
  onMaterialChange,
  onMaterialQuantityChange,
  onMaterialUnitChange,
  onMaterialUnitPriceChange,
  messages,
  messageDraft,
  isAssistantResponding,
  onMessageDraftChange,
  onSendMessage,
}: SidePanelProps) {
  const [activeTab, setActiveTab] = useState<SidePanelTab>("workItems");

  const hasWorkItems = workItems.length > 0;
  const hasMaterials = materials.length > 0;

  return (
    <aside className="flex flex-col gap-4">
      {/* Tab buttons */}
      <div className="flex gap-2 border-b border-neutral-200">
        {hasWorkItems && (
          <button
            onClick={() => setActiveTab("workItems")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "workItems"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Opgaver
          </button>
        )}

        {hasMaterials && (
          <button
            onClick={() => setActiveTab("materials")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "materials"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Materialer
          </button>
        )}

        <button
          onClick={() => setActiveTab("conversation")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "conversation"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-neutral-600 hover:text-neutral-900"
          }`}
        >
          Samtale
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {activeTab === "workItems" && hasWorkItems && (
          <div className="space-y-6">
            <HourlyRate hourlyRate={hourlyRate} onHourlyRateChange={onHourlyRateChange} />

            <WorkItems
              workItems={workItems}
              hourlyRate={hourlyRate}
              onWorkItemChange={onWorkItemChange}
              onEstimatedHoursChange={onEstimatedHoursChange}
              onWorkItemDescriptionChange={onWorkItemDescriptionChange}
            />
          </div>
        )}

        {activeTab === "materials" && hasMaterials && (
          <Materials
            materials={materials}
            hasIncompleteAcceptedMaterials={hasIncompleteAcceptedMaterials}
            onMaterialChange={onMaterialChange}
            onMaterialQuantityChange={onMaterialQuantityChange}
            onMaterialUnitChange={onMaterialUnitChange}
            onMaterialUnitPriceChange={onMaterialUnitPriceChange}
          />
        )}

        {activeTab === "conversation" && (
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex-1 overflow-y-auto">
              <Conversation messages={messages} />
            </div>
            <div className="flex-shrink-0">
              <ProjectMessageInput
                messageDraft={messageDraft}
                buttonLabel="Send"
                isLoading={isAssistantResponding}
                onMessageDraftChange={onMessageDraftChange}
                onSubmit={onSendMessage}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
