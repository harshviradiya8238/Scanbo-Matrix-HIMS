"use client";

import * as React from "react";
import {
  Button,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { Add as AddIcon } from "@mui/icons-material";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
import { T } from "../tokens";

interface LabDepartmentsHeaderProps {
  onAdd: () => void;
}

function LabDepartmentsHeaderBase({ onAdd }: LabDepartmentsHeaderProps) {
  return (
    <WorkspaceHeaderCard>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
          <Typography variant="subtitle1" sx={{ fontWeight: 800 , color:T.textPrimary }}>
                         Laboratory Departments
                       </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 15 }} />}
          onClick={onAdd}
          sx={{
            bgcolor: T.primary,
            fontWeight: 700,
            fontSize: "0.8rem",
            textTransform: "none",
            borderRadius: "9px",
            height: 36,
            px: 2.5,
            boxShadow: "none",
            "&:hover": { bgcolor: T.primaryHover, boxShadow: "none" },
          }}
        >
          Add Department
        </Button>
      </Stack>
    </WorkspaceHeaderCard>
  );
}

export const LabDepartmentsHeader = React.memo(LabDepartmentsHeaderBase);
