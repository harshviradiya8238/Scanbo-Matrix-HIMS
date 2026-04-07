import * as React from "react";
import type { EventContentArg } from "@fullcalendar/core";
import { Box, Stack, Typography } from "@/src/ui/components/atoms";
import { alpha } from "@/src/ui/theme";
import { ApptExtended } from "../schedule.types";
import { STATUS_META } from "../schedule.types";

// ─── Event Card ───────────────────────────────────────────────────────────────

export function EventContent({ info }: { info: EventContentArg }) {
  const ep = info.event.extendedProps as ApptExtended;
  const meta = STATUS_META[ep.status];
  const isMonth = info.view.type === "dayGridMonth";

  if (isMonth) {
    return (
      <Box
        sx={{
          px: 0.75,
          py: 0.2,
          borderRadius: "5px",
          backgroundColor: meta.bg,
          borderLeft: `3px solid ${meta.accent}`,
          overflow: "hidden",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.62rem",
            fontWeight: 700,
            color: meta.textColor,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {ep.patientName}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.57rem",
            color: alpha(meta.textColor, 0.75),
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {ep.study}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        px: 0.75,
        py: 0.5,
        borderRadius: "7px",
        border: `1px solid ${meta.border}`,
        borderLeft: `3px solid ${meta.accent}`,
        backgroundColor: meta.bg,
        overflow: "hidden",
        cursor: "pointer",
        transition: "filter 0.14s, box-shadow 0.14s",
        "&:hover": {
          filter: "brightness(0.97)",
          boxShadow: `0 3px 10px ${alpha(meta.accent, 0.2)}`,
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mb: 0.1 }}>
        <meta.Icon sx={{ fontSize: 10, color: meta.accent, flexShrink: 0 }} />
        <Typography
          sx={{
            fontSize: "0.66rem",
            fontWeight: 800,
            color: meta.textColor,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.2,
          }}
        >
          {ep.patientName}
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontSize: "0.59rem",
          color: alpha(meta.textColor, 0.78),
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "block",
        }}
      >
        {ep.study}
      </Typography>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 0.2 }}
      >
        <Typography sx={{ fontSize: "0.55rem", color: "#94a3b8" }}>
          {ep.mrn}
        </Typography>
        {ep.priority !== "Routine" && (
          <Box
            sx={{
              px: 0.5,
              py: 0.1,
              borderRadius: "4px",
              backgroundColor: ep.priority === "STAT" ? "#fee2e2" : "#fef3c7",
              border: `1px solid ${ep.priority === "STAT" ? "#fca5a5" : "#fde68a"}`,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.52rem",
                fontWeight: 800,
                color: ep.priority === "STAT" ? "#b91c1c" : "#92400e",
              }}
            >
              {ep.priority}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
