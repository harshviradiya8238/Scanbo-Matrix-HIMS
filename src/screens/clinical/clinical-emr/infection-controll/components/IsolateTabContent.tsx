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
  Chip,
  Divider,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckCircle as CheckCircleIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Hotel as HotelIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  ROOM_MAP_ITEMS,
  getPpeChecklistForPatient,
} from "../utils/infection-control-data";
import { IsolationRoom } from "../utils/infection-control-types";
import {
  type InfectionCase,
  INFECTION_CONTROL_CASES,
} from "@/src/mocks/infection-control";

interface IsolateTabContentProps {
  casesTableBlock: React.ReactNode;
  selectedCase?: InfectionCase;
  selectedIsolationRoomId: string | null;
  setSelectedIsolationRoomId: (id: string | null) => void;
  setSelectedCaseId: (id: string) => void;
  isolations: IsolationRoom[];
  openIsolateDialog: (targetCase: any) => void;
  canWrite: boolean;
  ppeChecklist: Record<string, Record<string, boolean>>;
  setPpeChecklist: React.Dispatch<React.SetStateAction<Record<string, Record<string, boolean>>>>;
}

export default function IsolateTabContent({
  casesTableBlock,
  selectedCase,
  selectedIsolationRoomId,
  setSelectedIsolationRoomId,
  setSelectedCaseId,
  isolations,
  openIsolateDialog,
  canWrite,
  ppeChecklist,
  setPpeChecklist,
}: IsolateTabContentProps) {
  const theme = useTheme();

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
          <Grid container spacing={2}>
            {/* Patient Details Section */}
            {/* <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.12),
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  height: '100%'
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{
                      width: 44, height: 44, borderRadius: 2,
                      display: 'grid', placeItems: 'center',
                      bgcolor: 'primary.main', color: '#fff'
                    }}>
                      <PersonIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {selectedCase?.patientName ?? "No Patient Selected"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        MRN: {selectedCase?.mrn ?? "—"} • ID: {selectedCase?.id ?? "—"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.1) }} />

                  <Grid container spacing={2}>
                    {[
                      { label: "Pathogen", value: selectedCase?.organism, color: 'error.main' },
                      { label: "Unit", value: selectedCase?.unit },
                      { label: "Bed / Room", value: selectedCase?.bed },
                      { label: "Isolation", value: selectedCase?.isolationType, badge: true },
                      { label: "Risk Level", value: selectedCase?.risk, color: selectedCase?.risk === 'High' ? 'error.main' : 'warning.main' },
                      { label: "Last Update", value: selectedCase?.lastUpdate },
                    ].map((item) => (
                      <Grid item xs={6} key={item.label}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', letterSpacing: 0.5 }}>
                          {item.label}
                        </Typography>
                        {item.badge ? (
                          <Chip
                            size="small"
                            label={item.value ?? "—"}
                            sx={{
                              mt: 0.5,
                              fontWeight: 700,
                              fontSize: '11px',
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                              height: 20
                            }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 700, color: item.color ?? 'text.primary' }}>
                            {item.value ?? "—"}
                          </Typography>
                        )}
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    border: '1px dashed',
                    borderColor: alpha(theme.palette.warning.main, 0.3)
                  }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                      Clinical Note:
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '12px', fontStyle: 'italic' }}>
                      "Patient requires strict {selectedCase?.isolationType} precautions. Ensure all staff are briefed before entry."
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid> */}

            {/* PPE Checklist Section */}
            {/* <Grid item xs={12} md={7}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.14),
                  overflow: "hidden",
                  boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
                  height: '100%'
                }}
              >
                <Stack spacing={1.25} sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      PPE Safety Checklist
                    </Typography>
                    <Chip
                      label={selectedCase?.isolationType ?? "Standard"}
                      size="small"
                      sx={{ fontWeight: 800, bgcolor: 'error.main', color: '#fff' }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                    Mandatory protocols for Room {selectedIsolation?.room ?? selectedCase?.bed ?? "—"}
                  </Typography>

                  <Box sx={{ maxHeight: 300, overflow: 'auto', pr: 1 }}>
                    {checklistItems.map((item) => {
                      const checked = checklistState[item.id] ?? item.checked;
                      return (
                        <Stack
                          key={item.id}
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{
                            py: 1,
                            px: 1.5,
                            mb: 1,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: checked ? alpha(theme.palette.success.main, 0.2) : 'divider',
                            bgcolor: checked
                              ? alpha(theme.palette.success.main, 0.04)
                              : "transparent",
                            transition: 'all 0.2s'
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
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '13px' }}>
                              {item.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Assigned to: {item.role}
                            </Typography>
                          </Box>
                        </Stack>
                      );
                    })}
                  </Box>
                </Stack>
              </Paper>
            </Grid> */}
          </Grid>
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
              {ROOM_MAP_ITEMS.map((rm) => {
                const isActive = selectedIsolationRoomId === rm.id;
                return (
                  <Box
                    key={rm.id}
                    onClick={() => {
                      setSelectedIsolationRoomId(rm.id);
                      // If room is occupied, find and select the case
                      const roomName = rm.label.split(' ')[0]; // E.g. "B" or "ICU"
                      const match = isolations.find(iso => iso.room.startsWith(roomName));
                      if (match) {
                        const caseMatch = INFECTION_CONTROL_CASES.find(c => c.mrn === match.mrn);
                        if (caseMatch) setSelectedCaseId(caseMatch.id);
                      }
                    }}
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border: "2px solid",
                      borderColor: isActive
                        ? theme.palette.primary.main
                        : "transparent",
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
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                      boxShadow: isActive
                        ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                        : "none",
                    }}
                  >
                    {rm.label}
                  </Box>
                );
              })}
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
