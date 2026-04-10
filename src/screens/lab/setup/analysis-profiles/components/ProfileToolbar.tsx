"use client";

import * as React from "react";
import { Button, Stack } from "@/src/ui/components/atoms";
import { Add as AddIcon } from "@mui/icons-material";
import CommonTabs from "@/src/ui/components/molecules/CommonTabs";
import { PROFILE_TABS } from "../data";
import { T } from "../tokens";

interface ProfileToolbarProps {
  activeDept: string;
  onDeptChange: (dept: string) => void;
}

function ProfileToolbarBase({ activeDept, onDeptChange }: ProfileToolbarProps) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <CommonTabs
        tabs={PROFILE_TABS}
        value={activeDept}
        onChange={onDeptChange}
      />
      <Button
        variant="contained"
        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
        sx={{
          bgcolor: T.primary,
          fontWeight: 700,
          fontSize: "0.82rem",
          textTransform: "none",
          borderRadius: "9px",
          height: 36,
          px: 2.5,
          boxShadow: "none",
          "&:hover": { bgcolor: T.primaryHover, boxShadow: "none" },
        }}
      >
        Create Profile
      </Button>
    </Stack>
  );
}

export const ProfileToolbar = React.memo(ProfileToolbarBase);
