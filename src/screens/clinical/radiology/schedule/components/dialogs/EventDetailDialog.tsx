import * as React from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import {
  Close as CloseIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from "@mui/icons-material";
import { ApptExtended, SlotStatus } from "../../schedule.types";
import { STATUS_META } from "../../schedule.types";

// ─── Event Detail Dialog ──────────────────────────────────────────────────────

export function EventDetailDialog({
  event,
  onClose,
  onStatusChange,
}: {
  event: {
    id: string;
    start: string;
    end: string;
    extendedProps: ApptExtended;
  } | null;
  onClose: () => void;
  onStatusChange: (id: string, status: SlotStatus) => void;
}) {
  if (!event) return null;
  const meta = STATUS_META[event.extendedProps.status];

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2.5 } }}
    >
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          {event.extendedProps.patientName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {event.extendedProps.mrn}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", right: 10, top: 10 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Divider sx={{ mb: 1.5 }} />
        <Stack spacing={1.1}>
          {[
            { label: "Study", value: event.extendedProps.study },
            { label: "Room", value: event.extendedProps.room },
            {
              label: "Start",
              value: new Date(event.start).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
            {
              label: "End",
              value: new Date(event.end).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
            { label: "Priority", value: event.extendedProps.priority },
          ].map(({ label, value }) => (
            <Stack
              key={label}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  width: 70,
                }}
              >
                {label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, fontSize: "0.75rem" }}
              >
                {value}
              </Typography>
            </Stack>
          ))}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                fontSize: "0.7rem",
                width: 70,
              }}
            >
              Status
            </Typography>
            <Chip
              size="small"
              label={meta.label}
              sx={{
                backgroundColor: meta.bg,
                border: `1px solid ${meta.border}`,
                color: meta.textColor,
                fontWeight: 700,
                fontSize: "0.65rem",
                height: 20,
              }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2, gap: 0.75 }}>
        {event.extendedProps.status !== "done" && (
          <Button
            size="small"
            variant="contained"
            color="success"
            disableElevation
            startIcon={<CheckCircleOutlineIcon />}
            onClick={() => {
              onStatusChange(event.id, "done");
              onClose();
            }}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
          >
            Confirm
          </Button>
        )}
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={onClose}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
        >
          Cancel Appt
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          sx={{ textTransform: "none", borderRadius: 1.5 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
