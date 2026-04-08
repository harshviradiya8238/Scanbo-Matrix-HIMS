import * as React from "react";
import { Stack, TextField } from "@/src/ui/components/atoms";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";
import { WorklistCase } from "../../types";

interface VentSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  ventSettingsForm: WorklistCase["ventilation"];
  setVentSettingsForm: React.Dispatch<
    React.SetStateAction<WorklistCase["ventilation"]>
  >;
  onConfirm: () => void;
}

export const VentSettingsDialog = ({
  open,
  onClose,
  ventSettingsForm,
  setVentSettingsForm,
  onConfirm,
}: VentSettingsDialogProps) => {
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title="Vent Settings"
      onConfirm={onConfirm}
      confirmLabel="Save Settings"
      contentDividers
    >
      <Stack spacing={1}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <TextField
            size="small"
            label="O2 Flow"
            value={ventSettingsForm.o2Flow}
            onChange={(event) =>
              setVentSettingsForm((prev: WorklistCase["ventilation"]) => ({
                ...prev,
                o2Flow: event.target.value,
              }))
            }
          />
          <TextField
            size="small"
            label="FiO2"
            value={ventSettingsForm.fio2}
            onChange={(event) =>
              setVentSettingsForm((prev: WorklistCase["ventilation"]) => ({
                ...prev,
                fio2: event.target.value,
              }))
            }
          />
        </Stack>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <TextField
            size="small"
            label="Tidal Volume"
            value={ventSettingsForm.tidalVolume}
            onChange={(event) =>
              setVentSettingsForm((prev: WorklistCase["ventilation"]) => ({
                ...prev,
                tidalVolume: event.target.value,
              }))
            }
          />
          <TextField
            size="small"
            label="RR"
            value={ventSettingsForm.rr}
            onChange={(event) =>
              setVentSettingsForm((prev: WorklistCase["ventilation"]) => ({
                ...prev,
                rr: event.target.value,
              }))
            }
          />
        </Stack>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <TextField
            size="small"
            label="PEEP"
            value={ventSettingsForm.peep}
            onChange={(event) =>
              setVentSettingsForm((prev: WorklistCase["ventilation"]) => ({
                ...prev,
                peep: event.target.value,
              }))
            }
          />
          <TextField
            size="small"
            label="PIP"
            value={ventSettingsForm.pip}
            onChange={(event) =>
              setVentSettingsForm((prev: WorklistCase["ventilation"]) => ({
                ...prev,
                pip: event.target.value,
              }))
            }
          />
        </Stack>
      </Stack>
    </CommonDialog>
  );
};
