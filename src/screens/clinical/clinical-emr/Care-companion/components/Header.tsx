import * as React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import { Add as AddIcon, PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { usePermission } from "@/src/core/auth/usePermission";

interface HeaderProps {
  onAddNewCarePlan: () => void;
  onEnrollPatient: () => void;
}

export default function Header({ onAddNewCarePlan, onEnrollPatient }: HeaderProps) {
  const canWrite = usePermission()("clinical.care_companion.write");

  return (
    <WorkspaceHeaderCard>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1.5}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1.1 }}
          >
            Care Companion
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Post-discharge patient monitoring, adherence tracking, and
            remote health management.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            disabled={!canWrite}
            onClick={onAddNewCarePlan}
            sx={{ textTransform: "none", fontWeight: 600, flexShrink: 0 }}
          >
            Add New Care Plan
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            disabled={!canWrite}
            onClick={onEnrollPatient}
            sx={{ textTransform: "none", fontWeight: 600, flexShrink: 0 }}
          >
            Enroll Patient
          </Button>
        </Stack>
      </Stack>
    </WorkspaceHeaderCard>
  );
}