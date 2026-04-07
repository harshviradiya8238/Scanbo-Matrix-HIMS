import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { Card } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Description as DescriptionIcon,
  Checklist as ChecklistIcon,
  ViewInAr as ViewInArIcon,
} from "@mui/icons-material";
import { ReportDetailViewProps } from "../types";
import { workflowPriorityColor } from "../utils";

export default function ReportDetailView({
  order,
  readingCase,
  onOpenWorklist,
  onViewPacs,
}: ReportDetailViewProps) {
  const theme = useTheme();

  if (!order) {
    return (
      <Card
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.16),
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Select a study from the list to view report details.
        </Typography>
      </Card>
    );
  }

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
                {order.patientName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.mrn} • {order.ageGender}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={order.priority}
              color={workflowPriorityColor(order.priority)}
            />
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              {order.study}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.modality} | Slot {order.scheduledSlot} |{" "}
              {order.validationState}
            </Typography>
          </Box>
        </Box>

        {readingCase ? (
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
                {readingCase.study} reviewed in {readingCase.subspecialty}.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Report State
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {readingCase.state}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Turnaround
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {readingCase.turnaround}
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
                backgroundColor: alpha(theme.palette.success.main, 0.04),
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
              <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>
                {readingCase.state === "Final Signed"
                  ? "Final interpretation available and signed."
                  : readingCase.state === "Need Addendum"
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
            <Button variant="contained" startIcon={<DescriptionIcon />}>
              Open Reports
            </Button>
            <Button
              variant="outlined"
              startIcon={<ChecklistIcon />}
              onClick={onOpenWorklist}
            >
              Open Worklist
            </Button>
            <Button
              variant="outlined"
              startIcon={<ViewInArIcon />}
              onClick={onViewPacs}
            >
              View PACS
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
