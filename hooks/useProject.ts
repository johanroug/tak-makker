import { useState } from "react";
import type { Material, ProjectDraft, ProjectResponse, WorkItem } from "@/schemas/project";
import {
  hasCompleteMaterialPricing,
  hasIncompleteAcceptedMaterialPricing,
} from "@/lib/material-pricing";

export function useProject() {
  const [project, setProject] = useState<ProjectDraft>({
    customer: {
      name: null,
      nameSource: null,
    },
    project: {
      title: null,
      titleSource: null,
      description: null,
      descriptionSource: null,
    },
    hourlyRate: null,
    workItems: [],
    materials: [],
  });

  const hourlyRate = project.hourlyRate;

  const totalLaborPrice =
    hourlyRate === null
      ? null
      : project.workItems
          .filter((item) => item.status === "accepted")
          .reduce((total, item) => {
            return total + (item.estimatedHours ?? 0) * hourlyRate;
          }, 0);

  const totalMaterialPrice = project.materials.reduce((total, material) => {
    if (material.status !== "accepted" || !hasCompleteMaterialPricing(material)) {
      return total;
    }

    return total + material.quantity * material.unitPrice;
  }, 0);

  const hasIncompleteAcceptedMaterials = hasIncompleteAcceptedMaterialPricing(project.materials);

  const subtotal =
    totalLaborPrice === null ? null : totalLaborPrice + totalMaterialPrice;
  const vatAmount = subtotal === null ? null : subtotal * 0.25;
  const finalTotal = subtotal === null || vatAmount === null ? null : subtotal + vatAmount;

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
    setProject((currentProject) => {
      const materials: Material[] = currentProject.materials.map((item) => {
        if (item.id !== material.id) {
          return item;
        }

        return {
          ...item,
          status: accepted ? "accepted" : "rejected",
        };
      });

      return {
        ...currentProject,
        materials,
      };
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

  function handleMaterialUnitPriceChange(material: Material, unitPrice: number | null) {
    const validUnitPrice = unitPrice !== null && Number.isFinite(unitPrice) ? unitPrice : null;

    setProject((currentProject) => {
      const materials = currentProject.materials.map((item) => {
        if (item.id !== material.id) {
          return item;
        }

        return {
          ...item,
          unitPrice: validUnitPrice,
        };
      });

      return {
        ...currentProject,
        materials,
      };
    });
  }

  function handleMaterialQuantityChange(material: Material, quantity: number | null) {
    const validQuantity = quantity !== null && Number.isFinite(quantity) ? quantity : null;

    setProject((currentProject) => {
      const materials = currentProject.materials.map((item) => {
        if (item.id !== material.id) {
          return item;
        }

        return {
          ...item,
          quantity: validQuantity,
          quantitySource: "user" as const,
        };
      });

      return {
        ...currentProject,
        materials,
      };
    });
  }

  function handleCustomerNameChange(name: string) {
    setProject((currentProject) => ({
      ...currentProject,
      customer: {
        name,
        nameSource: "user",
      },
    }));
  }

  function handleProjectTitleChange(title: string) {
    setProject((currentProject) => ({
      ...currentProject,
      project: {
        ...currentProject.project,
        title,
        titleSource: "user",
      },
    }));
  }

  function handleProjectDescriptionChange(description: string) {
    setProject((currentProject) => ({
      ...currentProject,
      project: {
        ...currentProject.project,
        description,
        descriptionSource: "user",
      },
    }));
  }

  function mergeProjectResponse(generatedResponse: ProjectResponse) {
    setProject((currentProject) => {
      const customerName = generatedResponse.customer.name?.trim();
      const projectTitle = generatedResponse.project.title?.trim();
      const projectDescription = generatedResponse.project.description?.trim();
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

      const materials: Material[] = generatedResponse.materials.map((newMaterial) => {
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

          quantity:
            existingMaterial.quantitySource === "user"
              ? existingMaterial.quantity
              : newMaterial.quantity,

          quantitySource:
            existingMaterial.quantitySource === "user"
              ? "user"
              : newMaterial.quantitySource,

          unitPrice: existingMaterial.unitPrice,
        };
      });

      return {
        ...currentProject,
        customer: {
          name:
            currentProject.customer.nameSource === "user"
              ? currentProject.customer.name
              : customerName || currentProject.customer.name,
          nameSource:
            currentProject.customer.nameSource === "user"
              ? "user"
              : customerName
                ? "ai"
                : currentProject.customer.nameSource,
        },
        project: {
          title:
            currentProject.project.titleSource === "user"
              ? currentProject.project.title
              : projectTitle || currentProject.project.title,
          titleSource:
            currentProject.project.titleSource === "user"
              ? "user"
              : projectTitle
                ? "ai"
                : currentProject.project.titleSource,
          description:
            currentProject.project.descriptionSource === "user"
              ? currentProject.project.description
              : projectDescription || currentProject.project.description,
          descriptionSource:
            currentProject.project.descriptionSource === "user"
              ? "user"
              : projectDescription
                ? "ai"
                : currentProject.project.descriptionSource,
        },
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
    totalLaborPrice,
    totalMaterialPrice,
    hasIncompleteAcceptedMaterials,
    subtotal,
    vatAmount,
    finalTotal,
    handleWorkItemChange,
    handleMaterialChange,
    handleMaterialUnitPriceChange,
    handleMaterialQuantityChange,
    handleCustomerNameChange,
    handleProjectTitleChange,
    handleProjectDescriptionChange,
    handleEstimatedHoursChange,
    handleHourlyRateChange,
    mergeProjectResponse,
  };
}
