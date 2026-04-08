"use client";

import * as React from "react";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import WorkflowSectionCard from "@/src/screens/clinical/components/WorkflowSectionCard";
import {
  type EmergencyPatient,
  type EmergencyBed,
  type ToastSeverity,
} from "../../types";
import { BED_STATUS_META } from "../../AsapEmergencyData";

export type BedBoardFilter =
  | "ALL"
  | "Free"
  | "Occupied"
  | "Cleaning"
  | "Critical";

interface BedBoardSectionProps {
  beds: EmergencyBed[];
  patients: EmergencyPatient[];
  selectedPatient: EmergencyPatient | null;
  handleOpenPatientChart: (patientId: string) => void;
  handleSetBedFree: (bedId: string) => void;
  openAssignBedModal: (patientId: string, preferredBedId: string) => void;
  notify: (message: string, severity: ToastSeverity) => void;
}

export function BedBoardSection({
  beds,
  patients,
  selectedPatient,
  handleOpenPatientChart,
  handleSetBedFree,
  openAssignBedModal,
  notify,
}: BedBoardSectionProps) {
  const theme = useTheme();
  const [bedFilter, setBedFilter] = React.useState<BedBoardFilter>("ALL");

  const filteredBedRows = React.useMemo(
    () =>
      beds.filter((bed) =>
        bedFilter === "ALL" ? true : bed.status === bedFilter,
      ),
    [bedFilter, beds],
  );

  return (
    <WorkflowSectionCard
      title="Bed Board"
      subtitle="Grid view of ER beds with status and chart access"
    >
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {(["ALL", "Free", "Occupied", "Cleaning", "Critical"] as const).map(
            (item) => (
              <Chip
                key={item}
                label={item === "ALL" ? "All Beds" : item}
                clickable
                color={item === "ALL" ? "primary" : BED_STATUS_META[item].color}
                variant={bedFilter === item ? "filled" : "outlined"}
                onClick={() => setBedFilter(item)}
              />
            ),
          )}
        </Stack>

        {filteredBedRows.length === 0 ? (
          <Alert severity="info">No beds match the current filter.</Alert>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 1.25,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              alignItems: "stretch",
              gridAutoRows: "1fr",
            }}
          >
            {filteredBedRows.map((bed) => {
              const patient = bed.patientId
                ? patients.find((entry) => entry.id === bed.patientId)
                : null;
              const statusColor =
                bed.status === "Free"
                  ? theme.palette.success.main
                  : bed.status === "Occupied"
                    ? theme.palette.info.main
                    : bed.status === "Cleaning"
                      ? theme.palette.warning.main
                      : theme.palette.error.main;

              return (
                <Card
                  key={bed.id}
                  elevation={0}
                  sx={{
                    p: 1.25,
                    borderRadius: 1.75,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    height: "100%",
                    minHeight: 190,
                    display: "flex",
                    width: "100%",
                    boxShadow: "none",
                    transition: "all 0.15s ease-in-out",
                    "&:hover": {
                      borderColor: alpha(theme.palette.primary.main, 0.4),
                    },
                  }}
                >
                  <Stack
                    spacing={0.75}
                    sx={{ width: "100%", minHeight: 0, height: "100%" }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "primary.main" }}
                      >
                        {bed.id}
                      </Typography>
                      <Chip
                        size="small"
                        label={bed.status}
                        variant="outlined"
                        sx={{
                          fontWeight: 700,
                          color: statusColor,
                          border: "1px solid",
                          borderColor: alpha(statusColor, 0.55),
                          bgcolor: alpha(statusColor, 0.1),
                        }}
                      />
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      {bed.zone}
                    </Typography>

                    <Box sx={{ flex: 1, minHeight: 0 }}>
                      {patient ? (
                        <Stack spacing={0.25}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                            noWrap
                          >
                            {patient.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {patient.id} · {patient.triageLevel}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No active patient assigned.
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ pt: 0.5, minHeight: 38, mt: "auto" }}>
                      {patient ? (
                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth
                          onClick={() => handleOpenPatientChart(patient.id)}
                        >
                          Open Case Tracking
                        </Button>
                      ) : bed.status === "Cleaning" ? (
                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth
                          onClick={() => handleSetBedFree(bed.id)}
                        >
                          Mark Free
                        </Button>
                      ) : bed.status === "Free" ? (
                        <Button
                          size="small"
                          variant="contained"
                          fullWidth
                          disabled={!selectedPatient}
                          onClick={() =>
                            selectedPatient
                              ? openAssignBedModal(selectedPatient.id, bed.id)
                              : notify(
                                  "Select a patient first from queue or chart.",
                                  "info",
                                )
                          }
                        >
                          {selectedPatient
                            ? `Assign ${selectedPatient.id}`
                            : "Select Patient First"}
                        </Button>
                      ) : null}
                    </Box>
                  </Stack>
                </Card>
              );
            })}
          </Box>
        )}
      </Stack>
    </WorkflowSectionCard>
  );
}
