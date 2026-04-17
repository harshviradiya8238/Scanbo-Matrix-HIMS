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
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
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
  rows: InfectionCase[];
  columns: CommonColumn<InfectionCase>[];
  onRowClick: (row: InfectionCase) => void;
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
  rows,
  columns,
  onRowClick,
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
    <Grid container spacing={2} sx={{ flex: 1, minHeight: 0, height: "100%" }}>
      <Grid item xs={12} lg={9.5} sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <CommonDataGrid<InfectionCase>
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          showSerialNo={true}
          searchPlaceholder="Search patients in isolation..."
          searchFields={["patientName", "mrn", "organism"]}
          onRowClick={onRowClick}
          disableRowPointer={true}
        />
      </Grid>
      <Grid
        item
        xs={12}
        lg={2.5}
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          height: "100%",
        }}
      >
        <Card
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.12),
            boxShadow: "0 10px 30px rgba(10, 77, 104, 0.06)",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
            {/* Header */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    display: "flex",
                  }}
                >
                  <HotelIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
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
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "8px",
                  fontSize: "0.7rem",
                  px: 1,
                }}
              >
                Assign
              </Button>
            </Stack>

            {/* Room Map Grid - Scrollable if needed */}
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                pr: 0.5,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(1, 1fr)",
                  gap: 1.25,
                }}
              >
                {ROOM_MAP_ITEMS.map((rm) => {
                  const isActive = selectedIsolationRoomId === rm.id;
                  return (
                    <Box
                      key={rm.id}
                      onClick={() => {
                        setSelectedIsolationRoomId(rm.id);
                        const roomName = rm.label.split(" ")[0];
                        const match = isolations.find((iso) =>
                          iso.room.startsWith(roomName),
                        );
                        if (match) {
                          const caseMatch = INFECTION_CONTROL_CASES.find(
                            (c) => c.mrn === match.mrn,
                          );
                          if (caseMatch) setSelectedCaseId(caseMatch.id);
                        }
                      }}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        textAlign: "left",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        border: "2px solid",
                        borderColor: isActive
                          ? theme.palette.primary.main
                          : alpha(theme.palette.divider, 0.05),
                        bgcolor:
                          rm.status === "occupied"
                            ? alpha(theme.palette.error.main, 0.08)
                            : rm.status === "free"
                              ? alpha(theme.palette.success.main, 0.08)
                              : rm.status === "cleaning"
                                ? alpha(theme.palette.warning.main, 0.08)
                                : alpha(theme.palette.grey[500], 0.08),
                        color:
                          rm.status === "occupied"
                            ? "error.dark"
                            : rm.status === "free"
                              ? "success.dark"
                              : rm.status === "cleaning"
                                ? "warning.dark"
                                : "grey.700",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        "&:hover": {
                          transform: "translateX(4px)",
                          bgcolor: alpha(theme.palette.primary.main, 0.03),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor:
                            rm.status === "occupied"
                              ? "error.main"
                              : rm.status === "free"
                                ? "success.main"
                                : rm.status === "cleaning"
                                  ? "warning.main"
                                  : "grey.400",
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {rm.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Legend */}
            <Divider sx={{ opacity: 0.6 }} />
            <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ pt: 0.5 }}>
              {[
                { label: "Occupied", color: "error.main" },
                { label: "Free", color: "success.main" },
                { label: "Cleaning", color: "warning.main" },
                { label: "Maintenance", color: "grey.400" },
              ].map((item) => (
                <Stack
                  key={item.label}
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: item.color,
                    }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Card>
      </Grid>
      {/* </Grid>     </Grid> */}
    </Grid>
  );
}
