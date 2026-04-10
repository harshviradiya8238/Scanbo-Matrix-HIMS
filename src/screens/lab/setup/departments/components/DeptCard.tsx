"use client";

import * as React from "react";
import {
  Box,
  Card,
  IconButton,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import {
  AccessTime as TatIcon,
  Build as InstrumentIcon,
  Edit as EditIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { DEPT_CONFIG } from "../data";
import { labelSx, T } from "../tokens";
import type { Department } from "../types";
import { getIconEl } from "./DepartmentIcon";
import { TatBar } from "./TatBar";

interface DeptCardProps {
  dept: Department;
  onEdit: (department: Department) => void;
}

function DeptCardBase({ dept, onEdit }: DeptCardProps) {
  const cfg = DEPT_CONFIG[dept.iconType] ?? DEPT_CONFIG.bio;
  const isActive = dept.status === "Active";

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
      <Box sx={{ px: 2, pt: 2, pb: 1.75 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{ flex: 1, mr: 1 }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "9px",
                flexShrink: 0,
                bgcolor: cfg.iconBg,
                border: `1px solid ${cfg.iconBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: cfg.iconColor,
              }}
            >
              {getIconEl(dept.iconType)}
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 800,
                  color: T.textPrimary,
                  lineHeight: 1.25,
                }}
              >
                {dept.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: T.textMuted,
                  fontFamily: "monospace",
                  mt: 0.2,
                }}
              >
                {dept.shortCode}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1,
                py: 0.3,
                bgcolor: isActive ? T.activeBg : T.inactiveBg,
                border: `1px solid ${isActive ? T.activeBdr : T.inactiveBdr}`,
                borderRadius: "6px",
              }}
            >
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor: isActive ? T.activeTxt : T.inactiveTxt,
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.63rem",
                  fontWeight: 700,
                  color: isActive ? T.activeTxt : T.inactiveTxt,
                  lineHeight: 1,
                }}
              >
                {dept.status}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => onEdit(dept)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: "7px",
                border: `1px solid ${T.border}`,
                color: T.textMuted,
                "&:hover": {
                  bgcolor: T.primaryLight,
                  borderColor: T.primaryMid,
                  color: T.primary,
                },
              }}
            >
              <EditIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ px: 2, flex: 1 }}>
        {[
          {
            icon: <PersonIcon sx={{ fontSize: 12 }} />,
            label: "Head",
            value: dept.head,
          },
          {
            icon: <PersonIcon sx={{ fontSize: 12 }} />,
            label: "Analysts",
            value: dept.analysts,
          },
          {
            icon: <InstrumentIcon sx={{ fontSize: 12 }} />,
            label: "Instruments",
            value: dept.instruments,
          },
          {
            icon: <TatIcon sx={{ fontSize: 12 }} />,
            label: "TAT Target",
            value: dept.tatTarget,
            accent: dept.tatTarget !== "—",
          },
        ].map((row, i) => (
          <Stack
            key={i}
            direction="row"
            alignItems="baseline"
            justifyContent="space-between"
            sx={{ py: 0.75, borderBottom: `1px solid ${T.border}` }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ color: T.textMuted, minWidth: 90 }}
            >
              {row.icon}
              <Typography sx={{ ...labelSx }}>{row.label}</Typography>
            </Stack>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textAlign: "right",
                color: row.accent ? "#92400E" : T.textSecondary,
                maxWidth: 160,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={String(row.value)}
            >
              {row.value}
            </Typography>
          </Stack>
        ))}
      </Box>

      <Box
        sx={{
          px: 2,
          py: 1.75,
          bgcolor: T.surface,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        {isActive && dept.tatCompliance > 0 ? (
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 0.75 }}
            >
              <Typography sx={labelSx}>TAT Compliance</Typography>
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: T.textMuted,
                }}
              >
                {dept.testsToday} tests today
              </Typography>
            </Stack>
            <TatBar value={dept.tatCompliance} />
          </Box>
        ) : (
          <Typography
            sx={{
              fontSize: "0.72rem",
              color: T.textMuted,
              fontStyle: "italic",
            }}
          >
            Not yet active — no compliance data
          </Typography>
        )}
      </Box>
    </Card>
  );
}

export const DeptCard = React.memo(DeptCardBase);
