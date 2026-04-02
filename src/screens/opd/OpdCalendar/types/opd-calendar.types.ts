import { AppointmentStatus, OpdAppointment, VisitType } from "../../opd-mock-data";

export interface BookingForm {
  date: string;
  time: string;
  provider: string;
  department: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  phone: string;
  visitType: VisitType;
  payerType: "General" | "Insurance" | "Corporate";
  chiefComplaint: string;
}

export type BookingErrors = Partial<Record<keyof BookingForm, string>>;
export type CalendarView = "timeGridWeek" | "timeGridDay" | "dayGridMonth";
export type SlotCheckTone =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

export type SlotCheckResult = {
  status: string;
  available: boolean;
  tone: SlotCheckTone;
  message: string;
};

export const appointmentStatusColor: Record<
  AppointmentStatus,
  "default" | "info" | "warning" | "success" | "error"
> = {
  Pending: "warning",
  Scheduled: "default",
  "Checked-In": "info",
  "In Triage": "warning",
  "In Consultation": "warning",
  Completed: "success",
  "No Show": "error",
  Cancelled: "error",
};