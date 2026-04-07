import { ImagingOrder, ReadingCase } from "@/src/core/radiology/types";

export interface ReportsSidebarProps {
  orders: ImagingOrder[];
  selectedOrderId: string;
  onSelectOrder: (id: string) => void;
}

export interface ReportDetailViewProps {
  order: ImagingOrder | null;
  readingCase: ReadingCase | null;
  onOpenWorklist: () => void;
  onViewPacs: () => void;
}
