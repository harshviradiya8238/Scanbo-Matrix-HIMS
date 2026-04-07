"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  Input,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import {
  MonitorHeart as MonitorHeartIcon,
  Sync as SyncIcon,
} from "@mui/icons-material";
import { useAppDispatch } from "@/src/store/hooks";
import { addVitalTrend, updateEncounter } from "@/src/store/slices/opdSlice";
import { OpdEncounterCase, VitalTrendRecord } from "../../../../opd-mock-data";
import Image from "next/image";
import { alpha, useTheme } from "@/src/ui/theme";

interface VitalsDraft {
  bp: string;
  hr: string;
  rr: string;
  temp: string;
  spo2: string;
  ecg: string;
  weightKg: string;
  bmi: string;
}

interface VitalsTabProps {
  encounter: OpdEncounterCase | undefined;
  canDocumentConsultation: boolean;
  latestTrend?: VitalTrendRecord;
  setSnackbar: (snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }) => void;
  guardRoleAction: (allowed: boolean, actionLabel: string) => boolean;
}

export default function VitalsTab({
  encounter,
  canDocumentConsultation,
  latestTrend,
  setSnackbar,
  guardRoleAction,
}: VitalsTabProps) {
  const dispatch = useAppDispatch();
  const [isPullingScanboVitals, setIsPullingScanboVitals] =
    React.useState(false);
  const [vitalsDraft, setVitalsDraft] = React.useState<VitalsDraft>({
    bp: "",
    hr: "",
    rr: "",
    temp: "",
    spo2: "",
    ecg: "",
    weightKg: "",
    bmi: "",
  });

  const theme = useTheme();

  React.useEffect(() => {
    if (!encounter) return;
    setVitalsDraft({
      bp: encounter.vitals.bp,
      hr: encounter.vitals.hr,
      rr: encounter.vitals.rr,
      temp: encounter.vitals.temp,
      spo2: encounter.vitals.spo2,
      ecg: encounter.vitals.ecg ?? "",
      weightKg: encounter.vitals.weightKg,
      bmi: encounter.vitals.bmi,
    });
  }, [encounter?.id]);

  const saveVitals = () => {
    if (!guardRoleAction(canDocumentConsultation, "save vitals")) return;
    if (!encounter) return;
    if (
      !vitalsDraft.bp ||
      !vitalsDraft.hr ||
      !vitalsDraft.rr ||
      !vitalsDraft.temp ||
      !vitalsDraft.spo2
    ) {
      setSnackbar({
        open: true,
        message: "BP, HR, Breath Rate, Temp and SpO2 are required.",
        severity: "error",
      });
      return;
    }

    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: { vitals: vitalsDraft },
      }),
    );

    dispatch(
      addVitalTrend({
        id: `vt-${Date.now()}`,
        patientId: encounter.id,
        recordedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        bp: vitalsDraft.bp,
        hr: vitalsDraft.hr,
        rr: vitalsDraft.rr,
        temp: vitalsDraft.temp,
        spo2: vitalsDraft.spo2,
        ecg: vitalsDraft.ecg,
        painScore: latestTrend?.painScore ?? 0,
        nurse: "Nurse Duty",
      }),
    );

    setSnackbar({
      open: true,
      message: "Vitals saved to encounter timeline.",
      severity: "success",
    });
  };

  const handlePullVitalsFromScanbo = async () => {
    if (!guardRoleAction(canDocumentConsultation, "pull vitals from Scanbo"))
      return;
    if (!encounter || isPullingScanboVitals) return;

    setIsPullingScanboVitals(true);
    await new Promise((resolve) => {
      window.setTimeout(resolve, 650);
    });

    setVitalsDraft((prev: any) => ({
      ...prev,
      bp: latestTrend?.bp || prev.bp || encounter.vitals.bp || "122/80",
      hr: latestTrend?.hr || prev.hr || encounter.vitals.hr || "84 bpm",
      rr: latestTrend?.rr || prev.rr || encounter.vitals.rr || "18/min",
      temp: latestTrend?.temp || prev.temp || encounter.vitals.temp || "98.6 F",
      spo2: latestTrend?.spo2 || prev.spo2 || encounter.vitals.spo2 || "98%",
      ecg:
        latestTrend?.ecg ||
        prev.ecg ||
        encounter.vitals.ecg ||
        "Normal sinus rhythm",
      weightKg: prev.weightKg || encounter.vitals.weightKg || "72",
      bmi: prev.bmi || encounter.vitals.bmi || "24.4",
    }));

    setIsPullingScanboVitals(false);
    setSnackbar({
      open: true,
      message: "Vitals pulled from Scanbo and populated in form.",
      severity: "success",
    });
  };

  return (
    <Stack spacing={2.5} sx={{ pb: 1 }}>
      {/* Scanbo Device Card */}
      <Card
        variant="outlined"
        sx={{
          p: 1.5,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.1),
          boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2.5,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 1.5,
              }}
            >
              <Image
                src="/scanbo-logo.png"
                alt="Scanbo"
                width={40}
                height={60}
              />
            </Box>
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "success.main",
                    boxShadow:
                      "0 0 0 4px " + alpha(theme.palette.success.main, 0.15),
                    animation: "pulse 2s infinite ease-in-out",
                    "@keyframes pulse": {
                      "0%": {
                        transform: "scale(0.95)",
                        opacity: 0.7,
                      },
                      "50%": {
                        transform: "scale(1.2)",
                        opacity: 1,
                      },
                      "100%": {
                        transform: "scale(0.95)",
                        opacity: 0.7,
                      },
                    },
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, fontSize: "1.1rem" }}
                >
                  Scanbo D8
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.4 }}
              >
                Wireless vitals reader connected. Pull real-time readings
                directly.
              </Typography>
            </Stack>
          </Stack>
          <Button
            variant="outlined"
            size="large"
            startIcon={<SyncIcon />}
            disabled={!canDocumentConsultation || isPullingScanboVitals}
            onClick={handlePullVitalsFromScanbo}
            sx={{
              borderRadius: 2.5,
              px: 3.5,
              textTransform: "none",
              fontWeight: 700,
              borderColor: "primary.main",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderColor: "primary.main",
              },
            }}
          >
            {isPullingScanboVitals ? "Pulling..." : "Pull from Scanbo"}
          </Button>
        </Stack>
      </Card>

      {/* Vitals Input Grid */}
      <Grid container spacing={1}>
        {[
          {
            label: "Blood Pressure",
            field: "bp",
            placeholder: "112/74",
            xs: 12,
            sm: 6,
          },
          {
            label: "Heart Rate",
            field: "hr",
            placeholder: "88 bpm",
            xs: 12,
            sm: 6,
          },
          {
            label: "Breath Rate",
            field: "rr",
            placeholder: "17/min",
            xs: 12,
            sm: 6,
          },
          {
            label: "Temperature",
            field: "temp",
            placeholder: "99.4 F",
            xs: 12,
            sm: 6,
          },
          {
            label: "SpO2",
            field: "spo2",
            placeholder: "98%",
            xs: 12,
            sm: 6,
          },
          {
            label: "ECG",
            field: "ecg",
            placeholder: "e.g. Normal sinus rhythm",
            xs: 12,
            sm: 6,
          },
          {
            label: "Weight (kg)",
            field: "weightKg",
            placeholder: "54",
            xs: 12,
            sm: 3,
          },
          {
            label: "BMI",
            field: "bmi",
            placeholder: "21.6",
            xs: 12,
            sm: 3,
          },
        ].map((item) => (
          <Grid item xs={item.xs} sm={item.sm} key={item.field}>
            <Stack spacing={1}>
              <Input
                sx={{ mt: 1 }}
                label={item.label}
                fullWidth
                placeholder={item.placeholder}
                value={(vitalsDraft as any)[item.field]}
                onChange={(event) =>
                  setVitalsDraft((prev) => ({
                    ...prev,
                    [item.field]: event.target.value,
                  }))
                }
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": {
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Stack>
          </Grid>
        ))}
      </Grid>

      {/* Save Button */}
      <Stack direction="row" justifyContent="flex-end" sx={{ pt: 1 }}>
        <Button
          variant="contained"
          size="large"
          disabled={!canDocumentConsultation}
          onClick={saveVitals}
          sx={{
            borderRadius: 2,
            px: 6,
            py: 1.5,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 700,
          }}
        >
          Save Vitals
        </Button>
      </Stack>
    </Stack>
  );
}
