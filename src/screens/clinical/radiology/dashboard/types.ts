import { ImagingOrder, ModalityCase, ReadingCase } from "@/src/core/radiology/types";

export interface DashboardStats {
  totalStudies: number;
  pendingScans: number;
  inProgress: number;
  completedToday: number;
  statCases: number;
  urgentOrders: number;
  statOrders: number;
  unreadReports: number;
}

export interface RecentActivityItem {
  id: string;
  patient: string;
  study: string;
  status: string;
  priority: string;
  time: string;
}

export interface ModalityBreakdownItem {
  label: string;
  count: number;
  color: string;
}
