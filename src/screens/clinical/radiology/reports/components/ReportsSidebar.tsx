import * as React from "react";
import {
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { Card } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import { Person as PersonIcon } from "@mui/icons-material";
import { ReportsSidebarProps } from "../types";
import { workflowPriorityColor } from "../utils";

export default function ReportsSidebar({
  orders,
  selectedOrderId,
  onSelectOrder,
}: ReportsSidebarProps) {
  const theme = useTheme();

  return (
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
          Imaging Orders ({orders.length})
        </Typography>
        <Divider />
        {orders.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No imaging orders available.
          </Typography>
        ) : (
          orders.map((row) => (
            <Box
              key={row.id}
              onClick={() => onSelectOrder(row.id)}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor:
                  selectedOrderId === row.id
                    ? alpha(theme.palette.primary.main, 0.4)
                    : "divider",
                backgroundColor:
                  selectedOrderId === row.id
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
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
                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
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
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                      noWrap
                    >
                      {row.study}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {row.modality} | {row.scheduledSlot}
                  </Typography>
                </Box>
                <Stack direction="column" spacing={0.75} alignItems="flex-end">
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
  );
}
