import * as React from "react";
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@/src/ui/components/atoms";
import { Card, StatTile } from "@/src/ui/components/molecules";
import { EnterpriseStatusChip } from "@/src/screens/clinical/components/EnterpriseUi";
import {
  MonitorHeart as MonitorHeartIcon,
  Timeline as TimelineIcon,
  WaterDrop as WaterDropIcon,
  LocalPharmacy as LocalPharmacyIcon,
} from "@mui/icons-material";
import { alpha } from "@/src/ui/theme";
import { WorklistCase, WaveformMode } from "../types";
import {
  UI_THEME,
  WORKSPACE_PANEL_SX,
  WAVEFORM_OPTIONS,
  WAVEFORM_STROKE,
  WAVEFORM_SPEED,
  WAVEFORM_BASE_POINTS,
} from "../constants";
import { buildWavePoints } from "../utils";
import { VitalCard, MiniStat } from "./StatCards";

export function OverviewTab({ caseData }: { caseData: WorklistCase }) {
  const [waveformMode, setWaveformMode] = React.useState<WaveformMode>("ecg");
  const waveformPoints = React.useMemo(
    () => buildWavePoints(WAVEFORM_BASE_POINTS[waveformMode]),
    [waveformMode],
  );
  const waveformColor = WAVEFORM_STROKE[waveformMode];

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gap: 0.9,
          gridTemplateColumns: {
            xs: "repeat(2,minmax(0,1fr))",
            xl: "repeat(4,minmax(0,1fr))",
          },
        }}
      >
        <StatTile
          label="Case Status"
          value={caseData.status}
          subtitle="Intraoperative"
          tone="secondary"
          icon={<TimelineIcon fontSize="small" />}
        />
        <StatTile
          label="Case Duration"
          value={caseData.duration}
          subtitle="hours:mins"
          tone="success"
          icon={<MonitorHeartIcon fontSize="small" />}
        />
        <StatTile
          label="Total Fluids In"
          value={caseData.fluidsInMl}
          subtitle="mL"
          tone="warning"
          icon={<WaterDropIcon fontSize="small" />}
        />
        <StatTile
          label="Blood Loss"
          value={caseData.bloodLossMl}
          subtitle="mL"
          tone="error"
          icon={<LocalPharmacyIcon fontSize="small" />}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 0.9,
          gridTemplateColumns: {
            xs: "repeat(2,minmax(0,1fr))",
            xl: "repeat(6,minmax(0,1fr))",
          },
        }}
      >
        <VitalCard
          label="HR"
          value={caseData.vitals.hr}
          unit="bpm"
          tone="normal"
        />
        <VitalCard
          label="NIBP"
          value={caseData.vitals.bp}
          unit="mmHg"
          tone="normal"
        />
        <VitalCard
          label="SpO2"
          value={caseData.vitals.spo2}
          unit="percent"
          tone="normal"
        />
        <VitalCard
          label="EtCO2"
          value={caseData.vitals.etco2}
          unit="mmHg"
          tone="info"
        />
        <VitalCard
          label="Temp"
          value={caseData.vitals.temp}
          unit="deg C"
          tone="warning"
        />
        <VitalCard
          label="BIS"
          value={caseData.vitals.bis}
          unit="index"
          tone="special"
        />
      </Box>

      <Card
        elevation={0}
        sx={{
          ...WORKSPACE_PANEL_SX,
          p: 0.7,
          minHeight: 110,
          overflow: "hidden",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={0.8}
          sx={{ px: 0.3, pb: 0.7 }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 800, color: UI_THEME.text }}
          >
            Real-time Monitoring Waveforms
          </Typography>
          <Stack
            direction="row"
            spacing={0.45}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            {WAVEFORM_OPTIONS.map((option) => (
              <Button
                key={option.id}
                size="small"
                variant={waveformMode === option.id ? "contained" : "outlined"}
                onClick={() => setWaveformMode(option.id)}
                sx={
                  waveformMode === option.id
                    ? {
                        backgroundColor: "primary.main",
                        minWidth: 64,
                        py: 0.42,
                        px: 1.25,
                      }
                    : {
                        borderColor: "divider",
                        color: "text.secondary",
                        minWidth: 64,
                        py: 0.42,
                        px: 1.25,
                      }
                }
              >
                {option.label}
              </Button>
            ))}
            <Box
              sx={{
                px: 1,
                py: 0.28,
                borderRadius: 99,
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#16a34a",
                backgroundColor: alpha("#16a34a", 0.12),
                border: "1px solid",
                borderColor: alpha("#16a34a", 0.34),
              }}
            >
              Live · 25mm/s
            </Box>
          </Stack>
        </Stack>
        <Box
          sx={{
            height: 66,
            borderRadius: 1.2,
            backgroundColor: UI_THEME.waveform,
            border: "1px solid",
            borderColor: alpha("#5f7ea6", 0.3),
            overflow: "hidden",
            position: "relative",
            backgroundImage:
              "linear-gradient(rgba(56,86,133,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56,86,133,0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px, 24px 24px",
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 1200 66"
            preserveAspectRatio="none"
            sx={{
              width: "100%",
              height: "100%",
              "@keyframes monitorShift": {
                "0%": { transform: "translateX(0px)" },
                "100%": { transform: "translateX(-300px)" },
              },
            }}
          >
            <g
              style={{
                transformOrigin: "left center",
                animation: `monitorShift ${WAVEFORM_SPEED[waveformMode]} linear infinite`,
              }}
            >
              <polyline
                points={waveformPoints}
                fill="none"
                stroke={waveformColor}
                strokeWidth={5}
                strokeOpacity={0.16}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={waveformPoints}
                fill="none"
                stroke={waveformColor}
                strokeWidth={2.1}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </Box>
        </Box>
      </Card>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gap: 0.9,
          gridTemplateColumns: { xs: "1fr", xl: "1.5fr 1fr 1fr" },
        }}
      >
        <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.8 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: UI_THEME.textSecondary,
              mb: 0.6,
              display: "block",
            }}
          >
            Drug Snapshot
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Drug</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {caseData.drugs.slice(0, 3).map((drug) => (
                  <TableRow key={drug.name + drug.time}>
                    <TableCell>{drug.name}</TableCell>
                    <TableCell>{drug.route}</TableCell>
                    <TableCell>{drug.rate}</TableCell>
                    <TableCell>
                      <EnterpriseStatusChip
                        label={drug.status}
                        tone={drug.tone}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.8 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: UI_THEME.textSecondary,
              mb: 0.6,
              display: "block",
            }}
          >
            Ventilator / Gas
          </Typography>
          <MiniStat label="O2 Flow" value={caseData.ventilation.o2Flow} />
          <MiniStat label="FiO2" value={caseData.ventilation.fio2} />
          <MiniStat label="TV" value={caseData.ventilation.tidalVolume} />
          <MiniStat label="RR" value={caseData.ventilation.rr} />
          <MiniStat label="PEEP" value={caseData.ventilation.peep} />
          <MiniStat label="PIP" value={caseData.ventilation.pip} isLast />
        </Card>

        <Card
          elevation={0}
          sx={{ ...WORKSPACE_PANEL_SX, p: 0.8, overflow: "hidden" }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: UI_THEME.textSecondary,
              mb: 0.6,
              display: "block",
            }}
          >
            Event Log
          </Typography>
          <Stack spacing={0.5} sx={{ maxHeight: "100%", overflow: "auto" }}>
            {caseData.events.slice(0, 4).map((event) => (
              <Box
                key={event.time + event.text}
                sx={{
                  p: 0.6,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: UI_THEME.border,
                  backgroundColor: UI_THEME.panelSoft,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: UI_THEME.violet,
                    fontFamily: '"DM Mono","SFMono-Regular",Consolas,monospace',
                  }}
                >
                  {event.time}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.78rem" }}>
                  {event.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}
