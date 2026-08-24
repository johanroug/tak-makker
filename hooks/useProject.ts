import { useState } from "react";
import type { Material, ProjectDraft, ProjectResponse, WorkItem } from "@/schemas/project";

export function useProject() {
  const [project, setProject] = useState<ProjectDraft>({
    hourlyRate: null,
    workItems: [],
    materials: [],
  });

  function handleWorkItemChange(workItem: WorkItem, accepted: boolean) {
    const updatedWorkItems: WorkItem[] = project.workItems.map((item) => {
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

  function handleMaterialChange(material: Material, accepted: boolean) {
    const updatedMaterials: Material[] = project.materials.map((item) => {
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

  function handleEstimatedHoursChange(workItem: WorkItem, hours: number) {
    const updatedWorkItems: WorkItem[] = project.workItems.map((item) => {
      if (item.id !== workItem.id) {
        return item;
      }

      return {
        ...item,
        estimatedHours: hours,
        estimatedHoursSource: "user",
      };
    });

    setProject({
      ...project,
      workItems: updatedWorkItems,
    });
  }

  function mergeProjectResponse(generatedResponse: ProjectResponse) {
    setProject((currentProject) => {
      const workItems = generatedResponse.workItems.map((newItem) => {
        const existingItem = currentProject.workItems.find((item) => item.id === newItem.id);

        if (!existingItem) {
          return newItem;
        }

        return {
          ...newItem,

          status: existingItem.status !== "suggested" ? existingItem.status : newItem.status,

          estimatedHours:
            existingItem.estimatedHoursSource === "user"
              ? existingItem.estimatedHours
              : newItem.estimatedHours,

          estimatedHoursSource:
            existingItem.estimatedHoursSource === "user" ? "user" : newItem.estimatedHoursSource,
        };
      });

      const materials = generatedResponse.materials.map((newMaterial) => {
        const existingMaterial = currentProject.materials.find(
          (material) => material.id === newMaterial.id,
        );

        if (!existingMaterial) {
          return newMaterial;
        }

        return {
          ...newMaterial,

          status:
            existingMaterial.status !== "suggested" ? existingMaterial.status : newMaterial.status,
        };
      });

      return {
        ...currentProject,
        workItems,
        materials,
      };
    });
  }

  function handleHourlyRateChange(hourlyRate: number) {
    setProject((currentProject) => {
      return {
        ...currentProject,
        hourlyRate,
      };
    });
  }

  return {
    project,
    handleWorkItemChange,
    handleMaterialChange,
    handleEstimatedHoursChange,
    handleHourlyRateChange,
    mergeProjectResponse,
  };
}
