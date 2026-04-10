"use client";

import * as React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { Add as AddIcon } from "@mui/icons-material";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";

interface TestCatalogHeaderProps {
  onAdd: () => void;
}

function TestCatalogHeaderBase({ onAdd }: TestCatalogHeaderProps) {
  return (
    <WorkspaceHeaderCard sx={{ p: 2, borderRadius: '22px' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "primary.main", mb: 0.5 }}
          >
            Analysis Service Catalog
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            Define and manage tests, analysis services and normative
            reference ranges.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ borderRadius: 1.5, px: 2, fontWeight: 700 }}
        >
          Add Analysis
        </Button>
      </Stack>
    </WorkspaceHeaderCard>
  );
}

export const TestCatalogHeader = React.memo(TestCatalogHeaderBase);
