"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  IconButton,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import {
  Biotech as ScienceIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as UseIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { labelSx, T } from "../tokens";
import type { AnalysisProfile } from "../types";
import { DeptBadge } from "./DeptBadge";

interface ProfileCardProps {
  profile: AnalysisProfile;
  onUse: (profile: AnalysisProfile) => void;
}

function ProfileCardBase({ profile: p, onUse }: ProfileCardProps) {
  return (
    <Card
      sx={{
        p: 0,
        borderRadius: "14px",
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowCard,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "box-shadow 0.18s, border-color 0.18s",
        "&:hover": { boxShadow: T.shadowCardHover, borderColor: "#A5B4FC" },
      }}
    >
      <Box sx={{ px: 2, pt: 1.75, pb: 1.25 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
          <Box
            sx={{
              width: 28, height: 28, borderRadius: "7px", flexShrink: 0,
              bgcolor: T.primaryLight, border: `1px solid ${T.primaryMid}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ScienceIcon sx={{ fontSize: 14, color: T.primary }} />
          </Box>
          <Typography
            sx={{ fontSize: "0.82rem", fontWeight: 800, color: T.textPrimary, flex: 1, lineHeight: 1.25 }}
          >
            {p.name}
          </Typography>
          <DeptBadge dept={p.department} />
        </Stack>

        <Typography
          sx={{ fontSize: "0.72rem", color: T.textMuted, lineHeight: 1.45 }}
          noWrap
          title={p.analytesList}
        >
          <Box component="span" sx={{ fontWeight: 700, color: T.textSecondary }}>
            {p.analytesCount} analytes:&nbsp;
          </Box>
          {p.analytesList}
        </Typography>
      </Box>

      <Box
        sx={{
          mx: 2, mb: 1.25,
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "1px", bgcolor: T.border,
          border: `1px solid ${T.border}`, borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {[
          { label: "Sample",    value: p.sampleType },
          { label: "Container", value: p.container },
          { label: "TAT",       value: p.tat,    color: "#92400E" },
          { label: "Price",     value: p.price,  color: T.primary },
        ].map((item) => (
          <Box key={item.label} sx={{ bgcolor: T.surface, px: 1.25, py: 0.75 }}>
            <Typography sx={{ ...labelSx, mb: 0.2 }}>{item.label}</Typography>
            <Typography
              sx={{
                fontSize: "0.75rem", fontWeight: 700,
                color: item.color ?? T.textPrimary,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
              title={item.value}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ px: 2, mb: 1.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.4 }}>
          <Typography sx={labelSx}>Monthly usage</Typography>
          <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: T.textMuted }}>
            {p.monthlyUsage}×
          </Typography>
        </Stack>
        <Box sx={{ height: 3, bgcolor: T.usageBg, borderRadius: 99, overflow: "hidden" }}>
          <Box
            sx={{
              width: `${Math.min(((p.monthlyUsage) / (p.maxUsage ?? 130)) * 100, 100)}%`,
              height: "100%", bgcolor: T.primary, borderRadius: 99,
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          px: 2, py: 1.25,
          borderTop: `1px solid ${T.border}`,
          bgcolor: T.surface, mt: "auto",
        }}
      >
        <Stack direction="row" spacing={0.75}>
          <Button
            variant="outlined" size="small"
            startIcon={<EditIcon sx={{ fontSize: "12px !important" }} />}
            sx={{
              flex: 1, height: 28, fontSize: "0.68rem", fontWeight: 600,
              borderRadius: "7px", textTransform: "none",
              borderColor: T.border, color: T.textSecondary,
              "&:hover": { bgcolor: T.surfaceHover, borderColor: "#94A3B8" },
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined" size="small"
            startIcon={<ViewIcon sx={{ fontSize: "12px !important" }} />}
            sx={{
              flex: 1, height: 28, fontSize: "0.68rem", fontWeight: 600,
              borderRadius: "7px", textTransform: "none",
              borderColor: T.border, color: T.textSecondary,
              "&:hover": { bgcolor: T.surfaceHover, borderColor: "#94A3B8" },
            }}
          >
            View
          </Button>
          <Button
            variant="contained" size="small"
            startIcon={<UseIcon sx={{ fontSize: "12px !important" }} />}
            onClick={() => onUse(p)}
            sx={{
              flex: 1, height: 28, fontSize: "0.68rem", fontWeight: 700,
              borderRadius: "7px", textTransform: "none",
              bgcolor: T.primary, boxShadow: "none",
              "&:hover": { bgcolor: T.primaryHover, boxShadow: "none" },
            }}
          >
            Use
          </Button>
          <IconButton
            size="small"
            sx={{
              width: 28, height: 28, borderRadius: "7px",
              border: `1px solid ${T.border}`, color: T.textMuted,
              "&:hover": { bgcolor: "#FFF1F2", borderColor: "#FECDD3", color: "#9F1239" },
            }}
          >
            <DeleteIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Stack>
      </Box>
    </Card>
  );
}

export const ProfileCard = React.memo(ProfileCardBase);
