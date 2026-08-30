import { useEffect, useState } from "react";
import {
  ProjectDraftSchema,
  type Material,
  type ProjectDraft,
  type ProjectResponse,
  type WorkItem,
} from "@/schemas/project";
import {
  hasCompleteMaterialPricing,
  hasIncompleteAcceptedMaterialDetails,
} from "@/lib/material-pricing";
import { isWorkItemIncluded } from "@/lib/work-item-selection";
import {
  readStoredValue,
  STORAGE_KEYS,
  writeStoredValue,
} from "@/lib/storage/browser-storage";

const initialProject: ProjectDraft = {
  complete: false,
  customer: {
    name: null,
    nameSource: null,
  },
  project: {
    title: null,
    titleSource: null,
    description: null,
    descriptionSource: null,
    offerDescription: null,
    offerDescriptionSource: null,
  },
  hourlyRate: null,
  workItems: [],
  materials: [],
};

export function useProject() {
  const [project, setProject] = useState<ProjectDraft>(initialProject);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const storedProject = readStoredValue(STORAGE_KEYS.projectDraft, ProjectDraftSchema);
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      if (storedProject !== null) {
        const hydratedProject = {
          ...storedProject,
          complete: storedProject.complete ?? false,
          project: {
            ...storedProject.project,
            offerDescription:
              storedProject.project.offerDescription ?? storedProject.project.description,
            offerDescriptionSource:
              storedProject.project.offerDescriptionSource ??
              (storedProject.project.offerDescription ? "ai" : null),
          },
        } satisfies ProjectDraft;

        setProject(hydratedProject);
      }

      setHasHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    writeStoredValue(STORAGE_KEYS.projectDraft, project, ProjectDraftSchema);
  }, [hasHydrated, project]);

  const hourlyRate = project.hourlyRate;

  const totalLaborPrice =
    hourlyRate === null
      ? null
      : project.workItems
          .filter(isWorkItemIncluded)
          .reduce((total, item) => {
            return total + (item.estimatedHours ?? 0) * hourlyRate;
          }, 0);

  const totalMaterialPrice = project.materials.reduce((total, material) => {
    if (material.status !== "accepted" || !hasCompleteMaterialPricing(material)) {
      return total;
    }

    return total + material.quantity * material.unitPrice;
  }, 0);

  const hasIncompleteAcceptedMaterials = hasIncompleteAcceptedMaterialDetails(project.materials);

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

  function handleEstimatedHoursChange(workItem: WorkItem, hours: number | null) {
    const validHours = hours !== null && Number.isFinite(hours) ? hours : null;

    setProject((currentProject) => {
      const workItems: WorkItem[] = currentProject.workItems.map((item) => {
        if (item.id !== workItem.id) {
          return item;
        }

        return {
          ...item,
          estimatedHours: validHours,
          estimatedHoursSource: "user",
        };
      });

      return {
        ...currentProject,
        workItems,
      };
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

  function handleMaterialUnitChange(material: Material, unit: string) {
    const trimmedUnit = unit.trim();

    setProject((currentProject) => {
      const materials: Material[] = currentProject.materials.map((item) => {
        if (item.id !== material.id) {
          return item;
        }

        return {
          ...item,
          unit: trimmedUnit || null,
          unitSource: "user",
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

  function handleProjectOfferDescriptionChange(description: string) {
    setProject((currentProject) => ({
      ...currentProject,
      project: {
        ...currentProject.project,
        offerDescription: description,
        offerDescriptionSource: "user",
      },
    }));
  }

  function mergeProjectResponse(generatedResponse: ProjectResponse) {
    setProject((currentProject) => {
      const customerName = generatedResponse.customer.name?.trim();
      const projectTitle = generatedResponse.project.title?.trim();
      const projectDescription = generatedResponse.project.description?.trim();
      const projectOfferDescription = generatedResponse.project.offerDescription?.trim();
      const workItems = generatedResponse.workItems.map((newItem) => {
        const existingItem = currentProject.workItems.find((item) => item.id === newItem.id);

        if (!existingItem) {
          return newItem;
        }

        return {
          ...newItem,

          status: existingItem.status !== "suggested" ? existingItem.status : newItem.status,

          description:
            existingItem.descriptionSource === "user"
              ? existingItem.description
              : newItem.description,

          descriptionSource:
            existingItem.descriptionSource === "user" ? "user" : newItem.descriptionSource,

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

          unit:
            existingMaterial.unitSource === "user" ? existingMaterial.unit : newMaterial.unit,

          unitSource:
            existingMaterial.unitSource === "user" ? "user" : newMaterial.unitSource,

          unitPrice: existingMaterial.unitPrice,
        };
      });

      return {
        ...currentProject,
        complete: generatedResponse.complete,
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
          offerDescription:
            currentProject.project.offerDescriptionSource === "user"
              ? currentProject.project.offerDescription
              : projectOfferDescription || currentProject.project.offerDescription,
          offerDescriptionSource:
            currentProject.project.offerDescriptionSource === "user"
              ? "user"
              : projectOfferDescription
                ? "ai"
                : currentProject.project.offerDescriptionSource,
        },
        workItems,
        materials,
      };
    });
  }

  function handleWorkItemDescriptionChange(workItem: WorkItem, description: string) {
    const trimmedDescription = description.trim();

    setProject((currentProject) => {
      const workItems: WorkItem[] = currentProject.workItems.map((item) => {
        if (item.id !== workItem.id) {
          return item;
        }

        return {
          ...item,
          description: trimmedDescription || item.description,
          descriptionSource: "user",
        };
      });

      return {
        ...currentProject,
        workItems,
      };
    });
  }

  function handleHourlyRateChange(hourlyRate: number | null) {
    const validHourlyRate =
      hourlyRate !== null && Number.isFinite(hourlyRate) ? hourlyRate : null;

    setProject((currentProject) => {
      return {
        ...currentProject,
        hourlyRate: validHourlyRate,
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
    handleMaterialUnitChange,
    handleCustomerNameChange,
    handleProjectTitleChange,
    handleProjectDescriptionChange,
    handleProjectOfferDescriptionChange,
    handleEstimatedHoursChange,
    handleWorkItemDescriptionChange,
    handleHourlyRateChange,
    mergeProjectResponse,
  };
}
