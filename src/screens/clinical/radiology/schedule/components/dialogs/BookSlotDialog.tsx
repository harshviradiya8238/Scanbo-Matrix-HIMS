import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { Close as CloseIcon } from "@mui/icons-material";
import { AppointmentEvent, Priority } from "../../schedule.types";
import { RESOURCES } from "../../schedule.types";

// ─── Book Slot Dialog ─────────────────────────────────────────────────────────

export function BookSlotDialog({
  open,
  defaultStart,
  defaultResource,
  onClose,
  onBook,
}: {
  open: boolean;
  defaultStart: string;
  defaultResource: string;
  onClose: () => void;
  onBook: (e: Omit<AppointmentEvent, "id">) => void;
}) {
  const [form, setForm] = React.useState({
    patientName: "",
    mrn: "",
    study: "",
    resource: defaultResource,
    priority: "Routine" as Priority,
    duration: "30",
  });
  React.useEffect(() => {
    setForm((f) => ({ ...f, resource: defaultResource }));
  }, [defaultResource]);

  const submit = () => {
    if (!form.patientName.trim() || !form.study.trim()) return;
    const start = new Date(defaultStart || new Date());
    const end = new Date(start.getTime() + Number(form.duration) * 60000);
    const room =
      RESOURCES.find((r) => r.id === form.resource)?.title ?? form.resource;
    onBook({
      resourceId: form.resource,
      title: `${form.patientName} — ${form.study}`,
      start: start.toISOString(),
      end: end.toISOString(),
      extendedProps: {
        patientName: form.patientName,
        mrn: form.mrn || "MRN-NEW",
        study: form.study,
        status: "new",
        priority: form.priority,
        room,
      },
    });
    onClose();
    setForm({
      patientName: "",
      mrn: "",
      study: "",
      resource: defaultResource,
      priority: "Routine",
      duration: "30",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2.5 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: "0.95rem", pb: 1 }}>
        Book Appointment Slot
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", right: 10, top: 10 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1.5}>
          <TextField
            label="Patient Name *"
            size="small"
            fullWidth
            value={form.patientName}
            onChange={(e) =>
              setForm((f) => ({ ...f, patientName: e.target.value }))
            }
          />
          <TextField
            label="MRN"
            size="small"
            fullWidth
            value={form.mrn}
            onChange={(e) => setForm((f) => ({ ...f, mrn: e.target.value }))}
            placeholder="e.g. MRN-1234"
          />
          <TextField
            label="Study / Procedure *"
            size="small"
            fullWidth
            value={form.study}
            onChange={(e) => setForm((f) => ({ ...f, study: e.target.value }))}
          />
          <TextField
            select
            label="Room"
            size="small"
            fullWidth
            value={form.resource}
            onChange={(e) =>
              setForm((f) => ({ ...f, resource: e.target.value }))
            }
          >
            {RESOURCES.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.title}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={1}>
            <TextField
              select
              label="Priority"
              size="small"
              fullWidth
              value={form.priority}
              onChange={(e) =>
                setForm((f) => ({ ...f, priority: e.target.value as Priority }))
              }
            >
              {(["Routine", "Urgent", "STAT"] as Priority[]).map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Duration"
              size="small"
              fullWidth
              value={form.duration}
              onChange={(e) =>
                setForm((f) => ({ ...f, duration: e.target.value }))
              }
            >
              {["15", "20", "30", "45", "60", "90"].map((d) => (
                <MenuItem key={d} value={d}>
                  {d} min
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          {defaultStart && (
            <Box
              sx={{
                px: 1,
                py: 0.75,
                borderRadius: 1.5,
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontWeight: 600 }}
              >
                Slot:{" "}
                {new Date(defaultStart).toLocaleString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          sx={{ textTransform: "none", borderRadius: 1.5 }}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          disableElevation
          onClick={submit}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
        >
          Book Slot
        </Button>
      </DialogActions>
    </Dialog>
  );
}
