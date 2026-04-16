import * as React from "react";
import { Box, Button, Stack, Typography } from "@/src/ui/components/atoms";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
import {
  LocalHospital as HospitalIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material";

export interface IpdOrdersHeaderProps {
  errorMainColor: string;
}

export default function IpdOrdersHeader({
  errorMainColor,
}: IpdOrdersHeaderProps) {
  return (
    <WorkspaceHeaderCard>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.5}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              bgcolor: alpha(errorMainColor, 0.12),
              p: 1.25,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
            }}
          >
            <HospitalIcon sx={{ color: "error.main" }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1172BA" }}>
              Sample Orders Queue
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </WorkspaceHeaderCard>
  );
}
