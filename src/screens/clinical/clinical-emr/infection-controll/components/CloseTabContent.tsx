"use client";

import * as React from "react";
import {
  Box,
  Card,
  Checkbox,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckCircle as CheckCircleIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Notifications as NotificationsIcon,
  PushPin as PushPinIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import { CLOSURE_CRITERIA, CASE_TIMELINE_EVENTS } from "../utils/infection-control-data";
import { InfectionCase } from "@/src/mocks/infection-control";

interface CloseTabContentProps {
  rows: InfectionCase[];
  columns: CommonColumn<InfectionCase>[];
  onRowClick: (row: InfectionCase) => void;
}

export default function CloseTabContent({
  rows,
  columns,
  onRowClick,
}: CloseTabContentProps) {
  const theme = useTheme();

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
        searchPlaceholder="Search resolved cases..."
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
                  <CheckCircleIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Closure Criteria
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Verification for case resolution
                  </Typography>
                </Box>
              </Stack>

              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  pr: 0.5,
                }}
              >
                <Stack spacing={1.25}>
                  {CLOSURE_CRITERIA.map((item) =>
                    item.met ? (
                      <Stack
                        key={item.id}
                        direction="row"
                        alignItems="flex-start"
                        spacing={1.5}
                        sx={{
                          py: 1.5,
                          px: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.success.main, 0.05),
                          border: "1px solid",
                          borderColor: alpha(theme.palette.success.main, 0.2),
                        }}
                      >
                        <CheckCircleIcon
                          sx={{ fontSize: 18, color: "success.main", mt: 0.25 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, fontSize: "0.85rem" }}
                        >
                          {item.label}
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack
                        key={item.id}
                        direction="row"
                        alignItems="flex-start"
                        spacing={1.5}
                        sx={{
                          py: 1.5,
                          px: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.grey[500], 0.04),
                          border: "1px solid",
                          borderColor: alpha(theme.palette.divider, 0.1),
                        }}
                      >
                        <Checkbox
                          checked={false}
                          readOnly
                          icon={
                            <CheckBoxOutlineBlankIcon sx={{ fontSize: 18 }} />
                          }
                          sx={{ p: 0, mt: 0.25 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            color: "text.secondary",
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Stack>
                    ),
                  )}
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
