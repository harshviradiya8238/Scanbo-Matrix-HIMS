import * as React from "react";
import { MenuItem, Stack, TextField } from "@/src/ui/components/atoms";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";
import { ANALYSTS, type LabWorksheet, type WorksheetStatus } from "../lab-types";

interface AddWorksheetModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: Omit<LabWorksheet, "id" | "samples">) => void;
}

const DEPARTMENT_OPTIONS = [
  "Biochemistry",
  "Haematology",
  "Microbiology",
  "Serology",
];

const STATUS_OPTIONS: WorksheetStatus[] = [
  "open",
  "to_be_verified",
  "verified",
  "closed",
];

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddWorksheetModal({
  open,
  onClose,
  onSubmit,
}: AddWorksheetModalProps) {
  const [template, setTemplate] = React.useState("");
  const [department, setDepartment] = React.useState(DEPARTMENT_OPTIONS[0]);
  const [analyst, setAnalyst] = React.useState(ANALYSTS[0] ?? "");
  const [status, setStatus] = React.useState<WorksheetStatus>("open");
  const [created, setCreated] = React.useState(todayIsoDate());
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setTemplate("");
    setDepartment(DEPARTMENT_OPTIONS[0]);
    setAnalyst(ANALYSTS[0] ?? "");
    setStatus("open");
    setCreated(todayIsoDate());
    setNotes("");
  }, [open]);

  const canSubmit =
    Boolean(template.trim()) &&
    Boolean(department) &&
    Boolean(analyst.trim()) &&
    Boolean(created);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      template: template.trim(),
      dept: department,
      analyst: analyst.trim(),
      status,
      created,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title="New Worksheet"
      subtitle="Create a worksheet to assign and track samples."
      onConfirm={handleSubmit}
      confirmLabel="Create Worksheet"
      contentDividers
      confirmButtonProps={{ disabled: !canSubmit }}
    >
      <Stack spacing={1.5}>
        <TextField
          size="small"
          label="Template"
          value={template}
          onChange={(event) => setTemplate(event.target.value)}
          placeholder="e.g. Biochemistry Panel"
        />
        <TextField
          select
          size="small"
          label="Department"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
        >
          {DEPARTMENT_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Analyst"
          value={analyst}
          onChange={(event) => setAnalyst(event.target.value)}
        >
          {ANALYSTS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Initial Status"
          value={status}
          onChange={(event) => setStatus(event.target.value as WorksheetStatus)}
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replaceAll("_", " ")}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          type="date"
          label="Created Date"
          value={created}
          onChange={(event) => setCreated(event.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          label="Notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          multiline
          minRows={2}
          placeholder="Optional notes"
        />
      </Stack>
    </CommonDialog>
  );
}
