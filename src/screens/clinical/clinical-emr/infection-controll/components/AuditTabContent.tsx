"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  Grid,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Download as DownloadIcon,
  ShowChart as ShowChartIcon,
} from "@mui/icons-material";
import {
  AUDIT_CHECKLIST,
  COMPLIANCE_SCORES,
} from "../utils/infection-control-data";

interface AuditTabContentProps {
  casesTableBlock: React.ReactNode;
}

export default function AuditTabContent({
  casesTableBlock,
}: AuditTabContentProps) {
  const theme = useTheme();
  const [auditChecklist, setAuditChecklist] = React.useState<
    Record<string, boolean>
  >(
    AUDIT_CHECKLIST.reduce(
      (acc, item) => ({ ...acc, [item.id]: item.checked }),
      {},
    ),
  );

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
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={1}
              >
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <CheckBoxIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Audit Checklist — AUD-031
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Hand Hygiene B-12
                </Typography>
              </Stack>
              {AUDIT_CHECKLIST.map((item) => (
                <Stack
                  key={item.id}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    py: 0.75,
                    px: 1,
                    borderRadius: 1,
                    bgcolor: auditChecklist[item.id]
                      ? alpha(theme.palette.success.main, 0.08)
                      : "transparent",
                  }}
                >
                  <Checkbox
                    checked={auditChecklist[item.id] ?? item.checked}
                    onChange={(_, checked) =>
                      setAuditChecklist((prev) => ({
                        ...prev,
                        [item.id]: checked,
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
                  {item.badge && (
                    <Chip
                      size="small"
                      label={item.badge}
                      sx={{
                        fontSize: "0.65rem",
                        height: 20,
                        bgcolor: item.badge.includes("Missing")
                          ? alpha(theme.palette.warning.main, 0.12)
                          : alpha(theme.palette.success.main, 0.12),
                        color: item.badge.includes("Missing")
                          ? "warning.dark"
                          : "success.dark",
                      }}
                    />
                  )}
                </Stack>
              ))}
              <TextField
                multiline
                rows={2}
                placeholder="Observations / corrective actions..."
                size="small"
                sx={{ mt: 0.5 }}
              />
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
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <ShowChartIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Compliance Scores
              </Typography>
            </Stack>
            {COMPLIANCE_SCORES.map((item) => (
              <Box key={item.id}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color:
                        item.score >= 85
                          ? "success.main"
                          : item.score < 70
                            ? "error.main"
                            : "warning.main",
                    }}
                  >
                    {item.score}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={item.score}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    "& .MuiLinearProgress-bar": { bgcolor: item.color },
                  }}
                />
              </Box>
            ))}
            <Box
              sx={{
                pt: 1,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "success.main" }}
              >
                92%
              </Typography>
              <Typography variant="body2" sx={{ color: "success.main" }}>
                Last 7 days — On target
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              fullWidth
              sx={{ textTransform: "none", fontWeight: 600, mt: 1 }}
            >
              Download Report
            </Button>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}
