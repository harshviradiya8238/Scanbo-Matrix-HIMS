"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Paper,
  Stack,
  Typography,
  Grid,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Hotel as HotelIcon,
} from "@mui/icons-material";
import {
  ROOM_MAP_ITEMS,
  getPpeChecklistForPatient,
} from "../utils/infection-control-data";
import { IsolationRoom } from "../utils/infection-control-types";
import type { InfectionCase } from "@/src/mocks/infection-control";

interface IsolateTabContentProps {
  casesTableBlock: React.ReactNode;
  selectedCase?: InfectionCase;
  selectedIsolationRoomId: string | null;
  isolations: IsolationRoom[];
  openIsolateDialog: (targetCase: any) => void;
  canWrite: boolean;
}

export default function IsolateTabContent({
  casesTableBlock,
  selectedCase,
  selectedIsolationRoomId,
  isolations,
  openIsolateDialog,
  canWrite,
}: IsolateTabContentProps) {
  const theme = useTheme();

  const [ppeChecklist, setPpeChecklist] = React.useState<
    Record<string, Record<string, boolean>>
  >({});

  const selectedIsolation = React.useMemo(
    () =>
      isolations.find((item) => item.mrn === selectedCase?.mrn) ??
      isolations.find((item) => item.id === selectedIsolationRoomId),
    [isolations, selectedCase?.mrn, selectedIsolationRoomId],
  );

  const checklistItems = React.useMemo(
    () =>
      getPpeChecklistForPatient(
        selectedCase?.mrn ?? selectedIsolation?.mrn,
        selectedCase?.isolationType ?? selectedIsolation?.type,
      ),
    [
      selectedCase?.isolationType,
      selectedCase?.mrn,
      selectedIsolation?.mrn,
      selectedIsolation?.type,
    ],
  );

  const checklistKey =
    selectedCase?.mrn ??
    selectedIsolation?.mrn ??
    selectedIsolationRoomId ??
    "default";
  const checklistState = ppeChecklist[checklistKey] ?? {};

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={9.5}>
        <Stack spacing={1.5}>
          {casesTableBlock}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.14),
              overflow: "hidden",
              boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
            }}
          >
            <Stack spacing={1.25} sx={{ p: 1.75 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                PPE Checklist —{" "}
                {selectedIsolation
                  ? `${selectedIsolation.room} (${selectedIsolation.patientName ?? selectedCase?.patientName ?? "—"})`
                  : selectedCase
                    ? `${selectedCase.bed} (${selectedCase.patientName})`
                    : "Select a patient"}
              </Typography>
              {checklistItems.map((item) => {
                const checked = checklistState[item.id] ?? item.checked;
                return (
                  <Stack
                    key={item.id}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      py: 0.75,
                      px: 1,
                      borderRadius: 1,
                      bgcolor: checked
                        ? alpha(theme.palette.success.main, 0.08)
                        : "transparent",
                    }}
                  >
                    <Checkbox
                      checked={checked}
                      onChange={(_, checked) =>
                        setPpeChecklist((prev) => ({
                          ...prev,
                          [checklistKey]: {
                            ...(prev[checklistKey] ?? {}),
                            [item.id]: checked,
                          },
                        }))
                      }
                      icon={<CheckBoxOutlineBlankIcon />}
                      checkedIcon={
                        <CheckBoxIcon sx={{ color: "success.main" }} />
                      }
                      sx={{ p: 0.25 }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.role}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Paper>
        </Stack>
      </Grid>
      <Grid item xs={12} lg={2.5}>
        <Card
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.14),
            boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
          }}
        >
          <Stack spacing={1.25}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={0.75}
            >
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <HotelIcon sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Room Map
                </Typography>
              </Stack>
              <Button
                size="small"
                variant="contained"
                disabled={!canWrite}
                onClick={() => {
                  const targetCase =
                    selectedCase ??
                    isolations.find((c) => c.status === "Active") ??
                    isolations[0];
                  if (targetCase) openIsolateDialog(targetCase);
                }}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Assign Room
              </Button>
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 1,
              }}
            >
              {ROOM_MAP_ITEMS.map((rm) => (
                <Box
                  key={rm.id}
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    bgcolor:
                      rm.status === "occupied"
                        ? alpha(theme.palette.error.main, 0.12)
                        : rm.status === "free"
                          ? alpha(theme.palette.success.main, 0.12)
                          : rm.status === "cleaning"
                            ? alpha(theme.palette.warning.main, 0.12)
                            : alpha(theme.palette.grey[500], 0.12),
                    color:
                      rm.status === "occupied"
                        ? "error.dark"
                        : rm.status === "free"
                          ? "success.dark"
                          : rm.status === "cleaning"
                            ? "warning.dark"
                            : "grey.700",
                  }}
                >
                  {rm.label}
                </Box>
              ))}
            </Box>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ pt: 0.5 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    bgcolor: alpha(theme.palette.error.main, 0.3),
                  }}
                />
                <Typography variant="caption">
                  Occupied (
                  {ROOM_MAP_ITEMS.filter((r) => r.status === "occupied").length}
                  )
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    bgcolor: alpha(theme.palette.success.main, 0.3),
                  }}
                />
                <Typography variant="caption">
                  Free (
                  {ROOM_MAP_ITEMS.filter((r) => r.status === "free").length})
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    bgcolor: alpha(theme.palette.warning.main, 0.3),
                  }}
                />
                <Typography variant="caption">
                  Cleaning (
                  {ROOM_MAP_ITEMS.filter((r) => r.status === "cleaning").length}
                  )
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    bgcolor: alpha(theme.palette.grey[500], 0.3),
                  }}
                />
                <Typography variant="caption">
                  Maintenance (
                  {
                    ROOM_MAP_ITEMS.filter((r) => r.status === "maintenance")
                      .length
                  }
                  )
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}
