import { ImagingPriority } from "@/src/core/radiology/types";

export function workflowPriorityColor(
  priority: ImagingPriority | string,
): "error" | "warning" | "info" | "default" | "success" {
  if (priority === "STAT") return "error";
  if (priority === "Urgent") return "warning";
  return "default";
}
