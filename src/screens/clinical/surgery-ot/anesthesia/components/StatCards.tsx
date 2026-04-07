import * as React from "react";
import { Stack, Typography } from "@/src/ui/components/atoms";
import { StatTile } from "@/src/ui/components/molecules";
import { UI_THEME } from "../constants";

export function VitalCard({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  tone: "normal" | "warning" | "info" | "special";
}) {
  const toneMap = {
    normal: "success",
    warning: "warning",
    info: "info",
    special: "secondary",
  } as const;

  return (
    <StatTile
      label={label}
      value={value}
      subtitle={unit}
      tone={toneMap[tone]}
      sx={{
        p: 1.25,
        borderRadius: 1.6,
        "& .MuiTypography-caption": {
          fontSize: "0.76rem",
        },
        "& .MuiTypography-h4": {
          fontSize: "2rem",
          lineHeight: 1.06,
          color: "text.primary",
        },
      }}
    />
  );
}

export function MiniStat({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        py: 0.45,
        borderBottom: isLast ? "none" : "1px solid",
        borderColor: UI_THEME.border,
      }}
    >
      <Typography variant="body2" sx={{ color: UI_THEME.textSecondary }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Stack>
  );
}
