"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Download as DownloadIcon,
  ShowChart as ShowChartIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import {
  AUDIT_CHECKLIST,
  COMPLIANCE_SCORES,
} from "../utils/infection-control-data";
import { InfectionCase } from "@/src/mocks/infection-control";

interface AuditTabContentProps {
  rows: InfectionCase[];
  columns: CommonColumn<InfectionCase>[];
  onRowClick: (row: InfectionCase) => void;
}

export default function AuditTabContent({
  rows,
  columns,
  onRowClick,
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
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        height: "100%",
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          lg: "minmax(0, 3.8fr) minmax(0, 1fr)",
        },
      }}
    >
      <CommonDataGrid<InfectionCase>
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        showSerialNo={true}
        searchPlaceholder="Search cases in audit..."
        searchFields={["patientName", "mrn", "organism"]}
        onRowClick={onRowClick}
        disableRowPointer={true}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          height: "100%",
        }}
      >
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.12),
              boxShadow: "0 10px 30px rgba(10, 77, 104, 0.06)",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              flex: 1,
            }}
          >
            <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={1}
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
                    <CheckBoxIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Audit Checklist
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Instance: AUD-031
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  pr: 0.5,
                }}
              >
                <Stack spacing={1}>
                  {AUDIT_CHECKLIST.map((item) => (
                    <Stack
                      key={item.id}
                      direction="row"
                      alignItems="flex-start"
                      spacing={1}
                      sx={{
                        py: 1.25,
                        px: 1.5,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: auditChecklist[item.id]
                          ? alpha(theme.palette.success.main, 0.2)
                          : alpha(theme.palette.divider, 0.05),
                        bgcolor: auditChecklist[item.id]
                          ? alpha(theme.palette.success.main, 0.04)
                          : alpha(theme.palette.grey[500], 0.02),
                        transition: "all 0.2s",
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
                        icon={
                          <CheckBoxOutlineBlankIcon sx={{ fontSize: 20 }} />
                        }
                        checkedIcon={
                          <CheckBoxIcon
                            sx={{ color: "success.main", fontSize: 20 }}
                          />
                        }
                        sx={{ p: 0, mt: 0.25 }}
                      />
                      <Stack spacing={0.5} sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.85rem",
                            lineHeight: 1.4,
                            fontWeight: 600,
                          }}
                        >
                          {item.label}
                        </Typography>
                        {item.badge && (
                          <Box>
                            <Chip
                              size="small"
                              label={item.badge}
                              sx={{
                                fontSize: "0.65rem",
                                fontWeight: 800,
                                height: 20,
                                borderRadius: "6px",
                                bgcolor: item.badge.includes("Missing")
                                  ? alpha(theme.palette.warning.main, 0.12)
                                  : alpha(theme.palette.success.main, 0.12),
                                color: item.badge.includes("Missing")
                                  ? "warning.dark"
                                  : "success.dark",
                                border: "1px solid",
                                borderColor: item.badge.includes("Missing")
                                  ? alpha(theme.palette.warning.main, 0.3)
                                  : alpha(theme.palette.success.main, 0.3),
                              }}
                            />
                          </Box>
                        )}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              <TextField
                multiline
                rows={3}
                placeholder="Audit observations or corrective actions..."
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.grey[500], 0.02),
                    fontSize: "0.85rem",
                  },
                }}
              />
            </Stack>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
