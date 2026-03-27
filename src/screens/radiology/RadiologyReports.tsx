"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { Card, WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import { useAppSelector } from "@/src/store/hooks";
import { ImagingPriority } from "@/src/core/radiology/types";
import {
  Description as DescriptionIcon,
  Person as PersonIcon,
  Checklist as ChecklistIcon,
  ViewInAr as ViewInArIcon,
} from "@mui/icons-material";

function workflowPriorityColor(
  priority: ImagingPriority | string,
): "error" | "warning" | "info" | "default" | "success" {
  if (priority === "STAT") return "error";
  if (priority === "Urgent") return "warning";
  return "default";
}

interface RadiologyReportsProps {
  defaultTab?: string;
}

export default function RadiologyReports({
  defaultTab = "radiology",
}: RadiologyReportsProps) {
  const theme = useTheme();
  const router = useRouter();

  const radiologyOrders = useAppSelector((state) => state.radiology.orders);
  const radiologyReading = useAppSelector((state) => state.radiology.reading);

  const [selectedRadiologyOrderId, setSelectedRadiologyOrderId] =
    React.useState("");

  const selectedRadiologyOrder = React.useMemo(() => {
    if (!selectedRadiologyOrderId) return null;
    return (
      radiologyOrders.find((row) => row.id === selectedRadiologyOrderId) ?? null
    );
  }, [radiologyOrders, selectedRadiologyOrderId]);

  React.useEffect(() => {
    if (
      radiologyOrders.length > 0 &&
      !radiologyOrders.find((row) => row.id === selectedRadiologyOrderId)
    ) {
      setSelectedRadiologyOrderId(radiologyOrders[0].id);
    }
  }, [radiologyOrders, selectedRadiologyOrderId]);

  const selectedReadingCase = React.useMemo(() => {
    if (!selectedRadiologyOrder) return null;
    return (
      radiologyReading.find(
        (row) =>
          row.study.toLowerCase() ===
            selectedRadiologyOrder.study.toLowerCase() ||
          row.modality.toLowerCase() ===
            selectedRadiologyOrder.modality.toLowerCase(),
      ) ?? null
    );
  }, [radiologyReading, selectedRadiologyOrder]);

  return (
    <PageTemplate title="Radiology Reports">
      <Stack spacing={2}>
        <WorkspaceHeaderCard sx={{ p: 2, borderRadius: 2.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "primary.main" }}
              >
                Radiology Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View detailed impressions and findings for completed imaging
                studies.
              </Typography>
            </Box>
          </Stack>
        </WorkspaceHeaderCard>

        <Grid container spacing={2}>
          <Grid xs={12} md={5}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.16),
                height: "100%",
              }}
            >
              <Stack spacing={1.1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Imaging Orders ({radiologyOrders.length})
                </Typography>
                <Divider />
                {radiologyOrders.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No imaging orders available.
                  </Typography>
                ) : (
                  radiologyOrders.map((row) => (
                    <Box
                      key={row.id}
                      onClick={() => setSelectedRadiologyOrderId(row.id)}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor:
                          selectedRadiologyOrder?.id === row.id
                            ? alpha(theme.palette.primary.main, 0.4)
                            : "divider",
                        backgroundColor:
                          selectedRadiologyOrder?.id === row.id
                            ? alpha(theme.palette.primary.main, 0.08)
                            : "transparent",
                        cursor: "pointer",
                        transition: "all 0.2s easse-in-out",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.04,
                          ),
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={1}
                        alignItems="flex-start"
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                            sx={{ mb: 0.25 }}
                          >
                            <PersonIcon
                              sx={{ fontSize: 14, color: "text.secondary" }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700 }}
                              noWrap
                            >
                              {row.patientName}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mb: 0.5 }}
                          >
                            {row.mrn} • {row.ageGender}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "primary.main" }}
                              noWrap
                            >
                              {row.study}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {row.modality} | {row.scheduledSlot}
                          </Typography>
                        </Box>
                        <Stack
                          direction="column"
                          spacing={0.75}
                          alignItems="flex-end"
                        >
                          <Chip
                            size="small"
                            label={row.priority}
                            color={workflowPriorityColor(row.priority)}
                          />
                          <Chip
                            size="small"
                            label={row.validationState}
                            variant="outlined"
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  ))
                )}
              </Stack>
            </Card>
          </Grid>

          <Grid xs={12} md={7}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.16),
                height: "100%",
              }}
            >
              {selectedRadiologyOrder ? (
                <Stack spacing={2}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      border: "1px solid",
                      borderColor: alpha(theme.palette.primary.main, 0.1),
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={2}
                      sx={{ mb: 1.5 }}
                    >
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                          {selectedRadiologyOrder.patientName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedRadiologyOrder.mrn} •{" "}
                          {selectedRadiologyOrder.ageGender}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={selectedRadiologyOrder.priority}
                        color={workflowPriorityColor(
                          selectedRadiologyOrder.priority,
                        )}
                      />
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "primary.main" }}
                      >
                        {selectedRadiologyOrder.study}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedRadiologyOrder.modality} | Slot{" "}
                        {selectedRadiologyOrder.scheduledSlot} |{" "}
                        {selectedRadiologyOrder.validationState}
                      </Typography>
                    </Box>
                  </Box>

                  {selectedReadingCase ? (
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: alpha(theme.palette.info.main, 0.28),
                          backgroundColor: alpha(theme.palette.info.main, 0.04),
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.info.main,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          Radiology Details
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {selectedReadingCase.study} reviewed in{" "}
                          {selectedReadingCase.subspecialty}.
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Report State
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {selectedReadingCase.state}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Turnaround
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {selectedReadingCase.turnaround}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: alpha(theme.palette.success.main, 0.28),
                          backgroundColor: alpha(
                            theme.palette.success.main,
                            0.04,
                          ),
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.success.main,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          Impression
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ mt: 1, fontWeight: 500 }}
                        >
                          {selectedReadingCase.state === "Final Signed"
                            ? "Final interpretation available and signed."
                            : selectedReadingCase.state === "Need Addendum"
                              ? "Addendum requested prior to final release."
                              : "Preliminary interpretation in progress."}
                        </Typography>
                      </Box>
                    </Stack>
                  ) : (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Report not available yet for the selected study.
                    </Alert>
                  )}

                  <Box sx={{ pt: 2 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button
                        variant="contained"
                        startIcon={<DescriptionIcon />}
                      >
                        Open Reports
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ChecklistIcon />}
                        onClick={() => router.push("/radiology/worklist")}
                      >
                        Open Worklist
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ViewInArIcon />}
                        onClick={() => router.push("/radiology/pacs-viewer")}
                      >
                        View PACS
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Select a study from the list to view report details.
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </PageTemplate>
  );
}
