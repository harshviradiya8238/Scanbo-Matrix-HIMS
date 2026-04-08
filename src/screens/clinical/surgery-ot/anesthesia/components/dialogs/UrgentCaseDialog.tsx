import * as React from "react";
import { Stack, TextField, MenuItem } from "@/src/ui/components/atoms";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";

interface UrgentCaseDialogProps {
  open: boolean;
  onClose: () => void;
  urgentCaseForm: {
    room: string;
    patientName: string;
    procedure: string;
    surgeon: string;
    anesthetist: string;
    asaClass: string;
  };
  setUrgentCaseForm: React.Dispatch<
    React.SetStateAction<{
      room: string;
      patientName: string;
      procedure: string;
      surgeon: string;
      anesthetist: string;
      asaClass: string;
    }>
  >;
  onConfirm: () => void;
}

export const UrgentCaseDialog = ({
  open,
  onClose,
  urgentCaseForm,
  setUrgentCaseForm,
  onConfirm,
}: UrgentCaseDialogProps) => {
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title="Add Urgent Case"
      onConfirm={onConfirm}
      confirmLabel="Create Case"
      contentDividers
    >
      <Stack spacing={1}>
        <TextField
          label="Patient Name *"
          size="small"
          value={urgentCaseForm.patientName}
          onChange={(event) =>
            setUrgentCaseForm((prev) => ({
              ...prev,
              patientName: event.target.value,
            }))
          }
        />
        <TextField
          label="Procedure *"
          size="small"
          value={urgentCaseForm.procedure}
          onChange={(event) =>
            setUrgentCaseForm((prev) => ({
              ...prev,
              procedure: event.target.value,
            }))
          }
        />
        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <TextField
            label="OR Room"
            size="small"
            value={urgentCaseForm.room}
            onChange={(event) =>
              setUrgentCaseForm((prev) => ({
                ...prev,
                room: event.target.value,
              }))
            }
          />
          <TextField
            select
            label="ASA Class"
            size="small"
            value={urgentCaseForm.asaClass}
            onChange={(event) =>
              setUrgentCaseForm((prev) => ({
                ...prev,
                asaClass: event.target.value,
              }))
            }
          >
            {["ASA I", "ASA II", "ASA III", "ASA IV"].map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <TextField
            label="Surgeon"
            size="small"
            value={urgentCaseForm.surgeon}
            onChange={(event) =>
              setUrgentCaseForm((prev) => ({
                ...prev,
                surgeon: event.target.value,
              }))
            }
          />
          <TextField
            label="Anesthetist"
            size="small"
            value={urgentCaseForm.anesthetist}
            onChange={(event) =>
              setUrgentCaseForm((prev) => ({
                ...prev,
                anesthetist: event.target.value,
              }))
            }
          />
        </Stack>
      </Stack>
    </CommonDialog>
  );
};
