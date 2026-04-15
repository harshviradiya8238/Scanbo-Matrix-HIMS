"use client";

import * as React from "react";
import { Box, Skeleton, TableCell, TableRow, Typography } from "@/src/ui/components/atoms";
import { keyframes, styled } from "@mui/material/styles";

export const appLoaderTokens = {
  brandColor: "#1172BA",
  overlayBackground: "rgba(255,255,255,0.86)",
  textColor: "#64748B",
  labelColor: "#94A3B8",
  overlayBlurPx: 4,
} as const;

const drawEcg = keyframes`
  0%   { stroke-dashoffset: 320; opacity: 0; }
  10%  { opacity: 1; }
  70%  { stroke-dashoffset: 0; opacity: 1; }
  90%  { stroke-dashoffset: 0; opacity: 0; }
  100% { stroke-dashoffset: 320; opacity: 0; }
`;

const dotPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50%      { transform: scale(1.35); opacity: 1; }
`;

const textFade = keyframes`
  0%, 100% { opacity: 0.55; }
  50%      { opacity: 1; }
`;

const inlineEcgDraw = keyframes`
  0%   { stroke-dashoffset: 90; opacity: 0; }
  15%  { opacity: 1; }
  70%  { stroke-dashoffset: 0; opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 0; }
`;

const EcgPath = styled("path")(() => ({
  fill: "none",
  stroke: appLoaderTokens.brandColor,
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeDasharray: 320,
  strokeDashoffset: 320,
  animation: `${drawEcg} 1.8s ease-in-out infinite`,
}));

const PulseDot = styled(Box)<{ delay?: number }>(({ delay = 0 }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: appLoaderTokens.brandColor,
  animation: `${dotPulse} 1.8s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

const LoaderText = styled(Typography)(() => ({
  fontSize: 14,
  color: appLoaderTokens.textColor,
  fontWeight: 500,
  letterSpacing: "0.02em",
  animation: `${textFade} 1.8s ease-in-out infinite`,
}));

type LoaderSize = "compact" | "regular";

export function useMinimumLoaderVisibility(
  loading: boolean,
  minimumVisibleMs = 450,
): boolean {
  const [visible, setVisible] = React.useState(loading);
  const startedAtRef = React.useRef<number | null>(loading ? Date.now() : null);
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (loading) {
      if (!visible) {
        setVisible(true);
      }
      if (!startedAtRef.current) {
        startedAtRef.current = Date.now();
      }
      return;
    }

    if (!visible) return;

    const startedAt = startedAtRef.current ?? Date.now();
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, minimumVisibleMs - elapsed);

    if (remaining === 0) {
      setVisible(false);
      startedAtRef.current = null;
      return;
    }

    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      startedAtRef.current = null;
      hideTimerRef.current = null;
    }, remaining);
  }, [loading, minimumVisibleMs, visible]);

  React.useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return visible;
}

export function useInitialContentLoading(durationMs = 500): boolean {
  const [loading, setLoading] = React.useState(durationMs > 0);

  React.useEffect(() => {
    if (durationMs <= 0) {
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => setLoading(false), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  return loading;
}

export function AppLoaderVisual({
  message = "Loading...",
  size = "regular",
}: {
  message?: string;
  size?: LoaderSize;
}) {
  const compact = size === "compact";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: compact ? 1 : 1.5,
        px: 1,
        py: compact ? 1 : 1.5,
      }}
    >
      <Box sx={{ width: compact ? 110 : 140, height: compact ? 44 : 56 }}>
        <svg
          viewBox="0 0 140 56"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
          aria-hidden
        >
          <EcgPath d="M0,28 L22,28 L30,28 L36,10 L42,46 L48,4 L54,52 L60,28 L68,28 L74,22 L80,34 L86,28 L96,28 L118,28 L140,28" />
        </svg>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PulseDot />
        <LoaderText sx={{ fontSize: compact ? 13 : 14 }}>{message}</LoaderText>
        <PulseDot delay={0.3} />
      </Box>

      <Typography
        sx={{
          fontSize: compact ? 10 : 11,
          color: appLoaderTokens.labelColor,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          mt: compact ? -0.5 : -1,
        }}
      >
        Scanbo HIMS
      </Typography>
    </Box>
  );
}

export function SectionLoader({
  message = "Loading...",
  minHeight = 140,
  compact = true,
}: {
  message?: string;
  minHeight?: number | string;
  compact?: boolean;
}) {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-live="polite"
      aria-busy
    >
      <AppLoaderVisual message={message} size={compact ? "compact" : "regular"} />
    </Box>
  );
}

const InlineEcgPath = styled("path")<{ color?: string }>(({ color }) => ({
  fill: "none",
  stroke: color ?? "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeDasharray: 90,
  strokeDashoffset: 90,
  animation: `${inlineEcgDraw} 0.9s ease-in-out infinite`,
}));

export function InlineLoaderIcon({
  size = 14,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        lineHeight: 0,
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 18 14"
        width={size}
        height={size}
        style={{ overflow: "visible" }}
      >
        <InlineEcgPath
          color={color}
          d="M0,7 L3.2,7 L4.6,6.9 L6.1,2.1 L7.4,11.1 L8.8,1.8 L10.2,10.8 L11.4,7 L13.2,7 L14.4,6.1 L15.7,8.1 L16.8,7 L18,7"
        />
      </svg>
    </Box>
  );
}

export type LoaderScope = "fullscreen" | "section";

export function AppLoaderOverlay({
  open,
  message = "Loading...",
  scope = "section",
  dimBackground = true,
  zIndex,
  pointerEvents = "auto",
}: {
  open: boolean;
  message?: string;
  scope?: LoaderScope;
  dimBackground?: boolean;
  zIndex?: number;
  pointerEvents?: "auto" | "none";
}) {
  if (!open) return null;

  const isFullscreen = scope === "fullscreen";

  return (
    <Box
      sx={{
        position: isFullscreen ? "fixed" : "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: dimBackground ? appLoaderTokens.overlayBackground : "transparent",
        backdropFilter: dimBackground ? `blur(${appLoaderTokens.overlayBlurPx}px)` : "none",
        WebkitBackdropFilter: dimBackground
          ? `blur(${appLoaderTokens.overlayBlurPx}px)`
          : "none",
        zIndex: zIndex ?? (isFullscreen ? 9999 : 20),
        pointerEvents,
      }}
      aria-live="polite"
      aria-busy={open}
    >
      <AppLoaderVisual message={message} size={isFullscreen ? "regular" : "compact"} />
    </Box>
  );
}

export function TableSkeletonRows({
  rowCount,
  columnCount,
  showSerialNo = false,
}: {
  rowCount: number;
  columnCount: number;
  showSerialNo?: boolean;
}) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, index) => (
        <TableRow key={`table-skeleton-row-${index}`}>
          {showSerialNo ? (
            <TableCell sx={{ py: 1.6, px: 2 }}>
              <Skeleton variant="text" width={22} />
            </TableCell>
          ) : null}
          {Array.from({ length: columnCount }).map((__, columnIndex) => (
            <TableCell key={`table-skeleton-cell-${index}-${columnIndex}`} sx={{ py: 1.6, px: 2 }}>
              <Skeleton variant="rounded" height={26} animation="wave" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
