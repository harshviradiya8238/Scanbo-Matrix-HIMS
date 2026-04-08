"use client";

import * as React from "react";
import {
  Box,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@mui/material";
import { TrendingUp as ChartIcon } from "@mui/icons-material";
import {
  CHART_LEGEND_ITEMS,
  CHART_SD_LABELS,
  CHART_SD_LINES,
  CHART_SUMMARY_ITEMS,
  TREND_DATA,
} from "../data";
import { TREND_PATH, TREND_PLOT_POINTS } from "../utils";

function QCTrendChartBase() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        p: 3,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
            }}
          >
            <ChartIcon />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Levey-Jennings Trend Analysis
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              Glucose — Cobas 6000 (Level 1)
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          {CHART_SUMMARY_ITEMS.map((s) => (
            <Box key={s.label} sx={{ textAlign: "right" }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.disabled",
                  display: "block",
                }}
              >
                {s.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 800, color: s.color }}
              >
                {s.val}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>

      <Box sx={{ height: 400, position: "relative", px: 4 }}>
        {/* Y-Axis Labels */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 40,
            width: 40,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-end",
            pr: 1,
          }}
        >
          {CHART_SD_LABELS.map((s) => (
            <Typography
              key={s}
              variant="caption"
              sx={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: s === 0 ? "primary.main" : "text.disabled",
              }}
            >
              {s > 0 ? `+${s}s` : s === 0 ? "Mean" : `${s}s`}
            </Typography>
          ))}
        </Box>

        {/* Chart Grid */}
        <Box
          sx={{
            position: "absolute",
            left: 40,
            right: 0,
            top: 0,
            bottom: 40,
            borderLeft: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Mean Line */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.4),
              zIndex: 0,
            }}
          />

          {/* SD Lines */}
          {CHART_SD_LINES.map((s) => (
            <React.Fragment key={s}>
              <Box
                sx={{
                  position: "absolute",
                  top: `${50 - s * 12.5}%`,
                  left: 0,
                  right: 0,
                  borderTop: "1px dashed",
                  borderColor:
                    s === 3
                      ? alpha("#dc2626", 0.3)
                      : s === 2
                        ? alpha("#ea580c", 0.3)
                        : "divider",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: `${50 + s * 12.5}%`,
                  left: 0,
                  right: 0,
                  borderTop: "1px dashed",
                  borderColor:
                    s === 3
                      ? alpha("#dc2626", 0.3)
                      : s === 2
                        ? alpha("#ea580c", 0.3)
                        : "divider",
                }}
              />
            </React.Fragment>
          ))}

          {/* SVG Data Line and Points */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            style={{
              position: "relative",
              zIndex: 1,
              overflow: "visible",
            }}
          >
            <path
              d={TREND_PATH}
              fill="none"
              stroke={theme.palette.primary.main}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.6 }}
            />
            {TREND_PLOT_POINTS.map((d, i) => {
              const color =
                d.status === "fail"
                  ? "#dc2626"
                  : d.status === "warning"
                    ? "#ea580c"
                    : "#16a34a";
              return (
                <g key={i}>
                  <circle
                    cx={d.x}
                    cy={d.y}
                    r="6"
                    fill={color}
                    stroke="#fff"
                    strokeWidth="2"
                    style={{ cursor: "pointer", transition: "all 0.2s" }}
                  />
                  {/* Tooltip Target */}
                  <rect
                    x={d.x - 10}
                    y={d.y - 10}
                    width="20"
                    height="20"
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                  >
                    <title>{`${d.date}: ${d.value} (${d.status.toUpperCase()})`}</title>
                  </rect>
                </g>
              );
            })}
          </svg>
        </Box>

        {/* X-Axis Labels */}
        <Box
          sx={{
            position: "absolute",
            left: 40,
            right: 0,
            bottom: 0,
            height: 30,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          {TREND_DATA.map((d, i) => (
            <Typography
              key={i}
              variant="caption"
              sx={{
                fontSize: "0.6rem",
                fontWeight: 700,
                color: "text.disabled",
                transform: "rotate(-45deg)",
                transformOrigin: "left top",
              }}
            >
              {d.date}
            </Typography>
          ))}
        </Box>
      </Box>

      <Stack
        direction="row"
        spacing={4}
        sx={{
          mt: 8,
          p: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderRadius: 2,
        }}
      >
        {CHART_LEGEND_ITEMS.map((item) => (
          <Typography
            key={item.label}
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: item.color,
                mr: 1,
              }}
            />{" "}
            {item.label}
          </Typography>
        ))}
        <Box sx={{ flexGrow: 1 }} />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Download Chart PDF
        </Typography>
      </Stack>
    </Box>
  );
}

export const QCTrendChart = React.memo(QCTrendChartBase);
