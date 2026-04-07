"use client";

import * as React from "react";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import {
  type EmergencyPatient,
  type EmergencyBed,
  type BedAssignForm,
  type BedAssignPriority,
} from "../../types";
import {
  BED_ASSIGN_NURSES,
  BED_ASSIGN_PHYSICIANS,
  BED_STATUS_META,
} from "../../AsapEmergencyData";

interface AssignBedModalContentProps {
  assignBedPatient: EmergencyPatient | null;
  assignBedForm: BedAssignForm;
  assignBedZones: Array<{ zone: string; beds: EmergencyBed[] }>;
  patients: EmergencyPatient[];
  beds: EmergencyBed[];
  handleAssignBedField: <K extends keyof BedAssignForm>(
    field: K,
    value: BedAssignForm[K],
  ) => void;
  handleConfirmAssignBed: () => void;
}

export function AssignBedModalContent({
  assignBedPatient,
  assignBedForm,
  assignBedZones,
  patients,
  beds,
  handleAssignBedField,
  handleConfirmAssignBed,
}: AssignBedModalContentProps) {
  if (!assignBedPatient) {
    return (
      <Alert severity="info">
        Select a patient from Arrivals & Triage to assign bed.
      </Alert>
    );
  }

  const theme = useTheme();

  const initials = assignBedPatient.name
    .split(" ")
    .filter(Boolean)
    .map((part: string) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
  const selectedBed = beds.find((bed) => bed.id === assignBedForm.bedId);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={8}>
        <Stack spacing={1.25}>
          <Card
            elevation={0}
            sx={{
              p: 1.25,
              borderRadius: 1.8,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.2),
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            }}
          >
            <Stack direction="row" spacing={1.1} alignItems="flex-start">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1.1,
                  bgcolor: "primary.main",
                  color: "common.white",
                  fontWeight: 800,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {initials || "P"}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {assignBedPatient.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {assignBedPatient.id} · {assignBedPatient.mrn} ·{" "}
                  {assignBedPatient.age} / {assignBedPatient.gender}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.35 }}>
                  {assignBedPatient.chiefComplaint}
                </Typography>
              </Box>
            </Stack>
          </Card>

          {assignBedZones.map((zoneEntry) => {
            const freeCount = zoneEntry.beds.filter(
              (bed) => bed.status === "Free",
            ).length;
            return (
              <Box key={zoneEntry.zone}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 0.75 }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    {zoneEntry.zone}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${freeCount}/${zoneEntry.beds.length} free`}
                    color={freeCount > 0 ? "success" : "warning"}
                    variant="outlined"
                  />
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gap: 0.75,
                    gridTemplateColumns: {
                      xs: "repeat(2, minmax(0, 1fr))",
                      md: "repeat(3, minmax(0, 1fr))",
                      lg: "repeat(4, minmax(0, 1fr))",
                    },
                  }}
                >
                  {zoneEntry.beds.map((bed) => {
                    const occupiedPatient = bed.patientId
                      ? patients.find((patient) => patient.id === bed.patientId)
                      : null;
                    const selectable = bed.status === "Free";
                    const selected = assignBedForm.bedId === bed.id;

                    return (
                      <Card
                        key={bed.id}
                        elevation={0}
                        onClick={() => {
                          if (!selectable) return;
                          handleAssignBedField("bedId", bed.id);
                        }}
                        sx={{
                          p: 0.9,
                          borderRadius: 1.5,
                          border: "1px solid",
                          borderColor: selected
                            ? alpha(theme.palette.primary.main, 0.7)
                            : alpha(theme.palette.divider, 0.75),
                          bgcolor: selected
                            ? alpha(theme.palette.primary.main, 0.08)
                            : "background.paper",
                          cursor: selectable ? "pointer" : "not-allowed",
                          opacity: selectable ? 1 : 0.74,
                          transition: "all .15s ease-in-out",
                        }}
                      >
                        <Stack spacing={0.45}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 700 }}
                            >
                              {bed.id}
                            </Typography>
                            <Chip
                              size="small"
                              label={bed.status}
                              color={BED_STATUS_META[bed.status].color}
                              variant="outlined"
                              sx={{ "& .MuiChip-label": { px: 0.65 } }}
                            />
                          </Stack>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {occupiedPatient
                              ? occupiedPatient.name
                              : "Available"}
                          </Typography>
                        </Stack>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Stack spacing={1}>
          <Card
            elevation={0}
            sx={{
              p: 1.1,
              borderRadius: 1.6,
              border: "1px solid",
              borderColor: assignBedForm.bedId
                ? alpha(theme.palette.primary.main, 0.45)
                : "divider",
              bgcolor: assignBedForm.bedId
                ? alpha(theme.palette.primary.main, 0.05)
                : alpha(theme.palette.background.default, 0.6),
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: "text.secondary", fontWeight: 700 }}
            >
              Selected Bed
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.2 }}>
              {selectedBed?.id || "Not Selected"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedBed
                ? `${selectedBed.zone} · ${selectedBed.status}`
                : "Choose an available bed from the left panel."}
            </Typography>
          </Card>

          <TextField
            size="small"
            select
            label="Assign Physician"
            value={assignBedForm.physician}
            onChange={(event) =>
              handleAssignBedField("physician", event.target.value)
            }
            fullWidth
          >
            {BED_ASSIGN_PHYSICIANS.map((doctor: string) => (
              <MenuItem key={doctor} value={doctor}>
                {doctor}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            select
            label="Assign Nurse"
            value={assignBedForm.nurse}
            onChange={(event) =>
              handleAssignBedField("nurse", event.target.value)
            }
            fullWidth
          >
            {BED_ASSIGN_NURSES.map((nurse: string) => (
              <MenuItem key={nurse} value={nurse}>
                {nurse}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            select
            label="Priority"
            value={assignBedForm.priority}
            onChange={(event) =>
              handleAssignBedField(
                "priority",
                event.target.value as BedAssignPriority,
              )
            }
            fullWidth
          >
            {(["Immediate", "High", "Medium", "Standard"] as const).map(
              (item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ),
            )}
          </TextField>

          <TextField
            size="small"
            label="Nurse Notes"
            value={assignBedForm.notes}
            onChange={(event) =>
              handleAssignBedField("notes", event.target.value)
            }
            multiline
            minRows={3}
            placeholder="Any handoff notes, safety points, or transfer instructions"
            fullWidth
          />

          <Button
            variant="contained"
            disabled={!assignBedForm.bedId}
            onClick={handleConfirmAssignBed}
          >
            Confirm Bed Assignment
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
