import * as React from "react";
import { MenuItem, Stack, TextField } from "@/src/ui/components/atoms";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";
import type { LabPartition } from "../lab-types";

interface AddPartitionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: Omit<LabPartition, "id" | "status">) => void;
  parentId: string;
  patientName: string;
}

const CONTAINER_OPTIONS = [
  "EDTA (Purple)",
  "SST (Yellow)",
  "Fluoride (Gray)",
  "Plain (Red)",
];

const DEPARTMENT_OPTIONS = [
  "Biochemistry",
  "Haematology",
  "Microbiology",
  "Serology",
];

const DEFAULT_VOLUME = "2 mL";

export default function AddPartitionModal({
  open,
  onClose,
  onSubmit,
  parentId,
  patientName,
}: AddPartitionModalProps) {
  const [volume, setVolume] = React.useState(DEFAULT_VOLUME);
  const [container, setContainer] = React.useState(CONTAINER_OPTIONS[0]);
  const [department, setDepartment] = React.useState(DEPARTMENT_OPTIONS[0]);
  const [analysesInput, setAnalysesInput] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setVolume(DEFAULT_VOLUME);
    setContainer(CONTAINER_OPTIONS[0]);
    setDepartment(DEPARTMENT_OPTIONS[0]);
    setAnalysesInput("");
  }, [open]);

  const canSubmit =
    Boolean(parentId.trim()) &&
    Boolean(patientName.trim()) &&
    Boolean(volume.trim()) &&
    Boolean(container) &&
    Boolean(department) &&
    Boolean(analysesInput.trim());

  const handleSubmit = () => {
    if (!canSubmit) return;

    const analyses = analysesInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (analyses.length === 0) return;

    onSubmit({
      parentId,
      patient: patientName,
      volume: volume.trim(),
      container,
      analyses,
      department,
    });
    onClose();
  };

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title="Add Partition"
      subtitle="Create a child partition for the selected sample."
      onConfirm={handleSubmit}
      confirmLabel="Create Partition"
      contentDividers
      confirmButtonProps={{ disabled: !canSubmit }}
    >
      <Stack spacing={1.5}>
        <TextField
          size="small"
          label="Parent Sample ID"
          value={parentId}
          disabled
        />
        <TextField
          size="small"
          label="Patient"
          value={patientName}
          disabled
        />
        <TextField
          size="small"
          label="Volume"
          value={volume}
          onChange={(event) => setVolume(event.target.value)}
          placeholder="e.g. 2 mL"
        />
        <TextField
          select
          size="small"
          label="Container"
          value={container}
          onChange={(event) => setContainer(event.target.value)}
        >
          {CONTAINER_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
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
          size="small"
          label="Analyses"
          value={analysesInput}
          onChange={(event) => setAnalysesInput(event.target.value)}
          placeholder="Comma separated values (e.g. CBC, ESR)"
          helperText="Enter one or more analyses separated by commas."
        />
      </Stack>
    </CommonDialog>
  );
}
