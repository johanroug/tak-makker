import type { WorkItem } from "@/schemas/project";

export function isWorkItemIncluded(workItem: Pick<WorkItem, "status">) {
  return workItem.status !== "rejected";
}
