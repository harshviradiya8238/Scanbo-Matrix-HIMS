import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  SettingsApplications as ModalityIcon,
  VideoSettings as PacsIcon,
  CalendarMonth as ScheduleIcon,
  ListAlt as WorklistIcon,
} from "@mui/icons-material";

export default function DashboardHeader() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <WorkspaceHeaderCard sx={{ p: 2.5, borderRadius: 2.5 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: "primary.main",
            }}
          >
            <ModalityIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Welcome back, Radiology Lead
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {" · "}
              Center: MG Road Diagnostics
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<WorklistIcon />}
            onClick={() => router.push("/radiology/worklist")}
            sx={{ borderRadius: 2 }}
          >
            Worklist
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ScheduleIcon />}
            onClick={() => router.push("/radiology/schedule")}
            sx={{ borderRadius: 2 }}
          >
            Calendar
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<PacsIcon />}
            onClick={() => router.push("/radiology/pacs-viewer")}
            sx={{ borderRadius: 2, boxShadow: "none" }}
          >
            Launch PACS
          </Button>
        </Stack>
      </Box>
    </WorkspaceHeaderCard>
  );
}
