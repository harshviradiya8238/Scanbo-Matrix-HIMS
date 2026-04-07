import * as React from "react";
import { Box, Typography } from "@/src/ui/components/atoms";

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}

export default function SectionHeader({
  icon,
  title,
  action,
}: SectionHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>
      {action}
    </Box>
  );
}
