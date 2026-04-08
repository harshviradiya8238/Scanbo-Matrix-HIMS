"use client";

import * as React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@mui/material";
import {
  Add as AddIcon,
  Build as BuildIcon,
} from "@mui/icons-material";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";

interface ValidatedMethodsHeaderProps {
  onAdd: () => void;
}

function ValidatedMethodsHeaderBase({ onAdd }: ValidatedMethodsHeaderProps) {
  const theme = useTheme();

  return (
    <WorkspaceHeaderCard>
      <Stack
        direction="row"
        alignItems="center"
        sx={{justifyContent:"space-between"}}
        spacing={3}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              p: 1.25,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BuildIcon sx={{ color: "primary.main" }} />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: "primary.main" }}
          >
            Validated Methods
          </Typography>
        </Stack>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ fontWeight: 700 }}
        >
          Add Method
        </Button>
      </Stack>
    </WorkspaceHeaderCard>
  );
}

export const ValidatedMethodsHeader = React.memo(ValidatedMethodsHeaderBase);
