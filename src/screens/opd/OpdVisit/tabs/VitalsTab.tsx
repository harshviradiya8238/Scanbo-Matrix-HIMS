import * as React from "react";
import {
  MonitorHeart as MonitorHeartIcon,
  Sync as SyncIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Grid,
  Input,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import Image from "next/image";
import { OpdVisitData } from "../utils/opd-visit-types";

export const VitalsTab = ({ data }: { data: OpdVisitData }) => {
  const theme = useTheme();
  const {
    vitalsDraft,
    setVitalsDraft,
    isPullingScanboVitals,
    handlePullVitalsFromScanbo,
    capabilities,
    saveVitals,
  } = data;

  return (
    <Stack spacing={2.5} sx={{ pb: 1 }}>
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
                      "0%": { transform: "scale(0.95)", opacity: 0.7 },
                      "50%": { transform: "scale(1.2)", opacity: 1 },
                      "100%": { transform: "scale(0.95)", opacity: 0.7 },
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
            disabled={
              !capabilities.canDocumentConsultation || isPullingScanboVitals
            }
            onClick={data.handlePullVitalsFromScanbo}
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
          { label: "SpO2", field: "spo2", placeholder: "98%", xs: 12, sm: 6 },
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
          { label: "BMI", field: "bmi", placeholder: "21.6", xs: 12, sm: 3 },
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
                  setVitalsDraft((prev: any) => ({
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

      <Stack direction="row" justifyContent="flex-end" sx={{ pt: 1 }}>
        <Button
          variant="contained"
          size="large"
          disabled={!capabilities.canDocumentConsultation}
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
};
