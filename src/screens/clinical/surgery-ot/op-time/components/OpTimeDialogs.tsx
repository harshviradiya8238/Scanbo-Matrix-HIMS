import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Alert,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";
import { CasePriority, ROOM_OPTIONS, ScheduleForm } from "../OpTimeData";

interface OpTimeDialogsProps {
  scheduleDialogOpen: boolean;
  setScheduleDialogOpen: (open: boolean) => void;
  scheduleForm: ScheduleForm;
  updateFormField: <K extends keyof ScheduleForm>(
    key: K,
    value: ScheduleForm[K],
  ) => void;
  handleScheduleCase: () => void;
}

export const OpTimeDialogs: React.FC<OpTimeDialogsProps> = ({
  scheduleDialogOpen,
  setScheduleDialogOpen,
  scheduleForm,
  updateFormField,
  handleScheduleCase,
}) => {
  return (
    <Dialog
      open={scheduleDialogOpen}
      onClose={() => setScheduleDialogOpen(false)}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Schedule New OT Case</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.35} sx={{ pt: 0.5 }}>
          <Alert severity="info">
            Minimum required details are enough. Case opens directly in
            enterprise workspace after scheduling.
          </Alert>
          <Grid container spacing={1.05}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Patient Name"
                value={scheduleForm.patientName}
                onChange={(event) =>
                  updateFormField("patientName", event.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="MRN"
                value={scheduleForm.mrn}
                onChange={(event) => updateFormField("mrn", event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Scheduled At"
                value={scheduleForm.scheduledAt}
                onChange={(event) =>
                  updateFormField("scheduledAt", event.target.value)
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                label="Procedure"
                value={scheduleForm.procedure}
                onChange={(event) =>
                  updateFormField("procedure", event.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Department"
                value={scheduleForm.department}
                onChange={(event) =>
                  updateFormField("department", event.target.value)
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis"
                value={scheduleForm.diagnosis}
                onChange={(event) =>
                  updateFormField("diagnosis", event.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Surgeon"
                value={scheduleForm.surgeon}
                onChange={(event) =>
                  updateFormField("surgeon", event.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Anaesthetist"
                value={scheduleForm.anesthetist}
                onChange={(event) =>
                  updateFormField("anesthetist", event.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Room"
                value={scheduleForm.roomId}
                onChange={(event) =>
                  updateFormField("roomId", event.target.value)
                }
              >
                {ROOM_OPTIONS.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Priority"
                value={scheduleForm.priority}
                onChange={(event) =>
                  updateFormField(
                    "priority",
                    event.target.value as CasePriority,
                  )
                }
              >
                <MenuItem value="STAT">STAT</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
                <MenuItem value="Elective">Elective</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleScheduleCase}
          startIcon={<AddCircleOutlineIcon fontSize="small" />}
        >
          Schedule & Open
        </Button>
      </DialogActions>
    </Dialog>
  );
};
