
"use client"
import React
  from "react";

  import { createContext, useContext, useState, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SnackbarSeverity = "success" | "error" | "warning" | "info";

export interface SnackbarOptions {
  message: string;
  severity?: SnackbarSeverity;
  duration?: number;        // ms, default 4000
  title?: string;           // optional bold heading
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SnackbarItem extends Required<Omit<SnackbarOptions, "action" | "title">> {
  id: string;
  title?: string;
  action?: SnackbarOptions["action"];
  exiting: boolean;
}

interface SnackbarContextValue {
  showSnackbar: (opts: SnackbarOptions) => void;
  success: (message: string, opts?: Partial<SnackbarOptions>) => void;
  error: (message: string, opts?: Partial<SnackbarOptions>) => void;
  warning: (message: string, opts?: Partial<SnackbarOptions>) => void;
  info: (message: string, opts?: Partial<SnackbarOptions>) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export const useSnackbar = (): SnackbarContextValue => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used inside <SnackbarProvider>");
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [snacks, setSnacks] = useState<SnackbarItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const remove = useCallback((id: string) => {
    setSnacks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, exiting: true } : s))
    );
    setTimeout(() => {
      setSnacks((prev) => prev.filter((s) => s.id !== id));
    }, 350); // matches CSS exit animation
  }, []);

  const showSnackbar = useCallback(
    (opts: SnackbarOptions) => {
      const id = `snack-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const item: SnackbarItem = {
        id,
        message: opts.message,
        severity: opts.severity ?? "info",
        duration: opts.duration ?? 4000,
        title: opts.title,
        action: opts.action,
        exiting: false,
      };

      setSnacks((prev) => [...prev.slice(-4), item]); // max 5 at once

      if (item.duration > 0) {
        timers.current[id] = setTimeout(() => remove(id), item.duration);
      }
    },
    [remove]
  );

  const success = useCallback(
    (message: string, opts?: Partial<SnackbarOptions>) =>
      showSnackbar({ ...opts, message, severity: "success" }),
    [showSnackbar]
  );
  const error = useCallback(
    (message: string, opts?: Partial<SnackbarOptions>) =>
      showSnackbar({ ...opts, message, severity: "error" }),
    [showSnackbar]
  );
  const warning = useCallback(
    (message: string, opts?: Partial<SnackbarOptions>) =>
      showSnackbar({ ...opts, message, severity: "warning" }),
    [showSnackbar]
  );
  const info = useCallback(
    (message: string, opts?: Partial<SnackbarOptions>) =>
      showSnackbar({ ...opts, message, severity: "info" }),
    [showSnackbar]
  );

  return (
    <SnackbarContext.Provider value={{ showSnackbar, success, error, warning, info }}>
      {children}
      <HIMSSnackbarStack snacks={snacks} onClose={remove} />
    </SnackbarContext.Provider>
  );
};

// ─── Stack UI ─────────────────────────────────────────────────────────────────

import {
  Box,
  Typography,
  IconButton,
  Button,
  LinearProgress,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const SEVERITY_CONFIG: Record<
  SnackbarSeverity,
  {
    Icon: React.ElementType;
    bg: string;
    border: string;
    iconColor: string;
    progress: string;
  }
> = {
  success: {
    Icon: CheckCircleRoundedIcon,
    bg: "linear-gradient(135deg, #0f2a1e 0%, #0d1f17 100%)",
    border: "1px solid rgba(52,211,153,0.35)",
    iconColor: "#34d399",
    progress: "#34d399",
  },
  error: {
    Icon: ErrorRoundedIcon,
    bg: "linear-gradient(135deg, #2a0f0f 0%, #1f0d0d 100%)",
    border: "1px solid rgba(248,113,113,0.35)",
    iconColor: "#f87171",
    progress: "#f87171",
  },
  warning: {
    Icon: WarningAmberRoundedIcon,
    bg: "linear-gradient(135deg, #2a1f0a 0%, #1f1708 100%)",
    border: "1px solid rgba(251,191,36,0.35)",
    iconColor: "#fbbf24",
    progress: "#fbbf24",
  },
  info: {
    Icon: InfoRoundedIcon,
    bg: "linear-gradient(135deg, #0a1a2a 0%, #08141f 100%)",
    border: "1px solid rgba(96,165,250,0.35)",
    iconColor: "#60a5fa",
    progress: "#60a5fa",
  },
};

const HIMSSnackbarStack: React.FC<{
  snacks: SnackbarItem[];
  onClose: (id: string) => void;
}> = ({ snacks, onClose }) => (
  <Box
    sx={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
      alignItems: "flex-end",
      pointerEvents: "none",
    }}
  >
    {snacks.map((snack) => (
      <HIMSSnackbar key={snack.id} snack={snack} onClose={onClose} />
    ))}
  </Box>
);

const HIMSSnackbar: React.FC<{
  snack: SnackbarItem;
  onClose: (id: string) => void;
}> = ({ snack, onClose }) => {
  const { Icon, bg, border, iconColor, progress } =
    SEVERITY_CONFIG[snack.severity];

  return (
    <Box
      sx={{
        pointerEvents: "all",
        minWidth: 320,
        maxWidth: 420,
        borderRadius: "14px",
        background: "#105489",
        border,
        boxShadow: `0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset`,
        backdropFilter: "blur(12px)",
        overflow: "hidden",
        animation: snack.exiting
          ? "himsExit 0.35s cubic-bezier(0.4,0,1,1) forwards"
          : "himsEnter 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "@keyframes himsEnter": {
          from: { opacity: 0, transform: "translateX(60px) scale(0.92)" },
          to: { opacity: 1, transform: "translateX(0) scale(1)" },
        },
        "@keyframes himsExit": {
          from: { opacity: 1, transform: "translateX(0) scale(1)" },
          to: { opacity: 0, transform: "translateX(60px) scale(0.88)" },
        },
      }}
    >
      {/* Body */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, p: "14px 16px 10px" }}>
        {/* Icon */}
        <Box
          sx={{
            mt: "1px",
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: `${iconColor}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon sx={{ fontSize: 18, color: iconColor }} />
        </Box>

        {/* Text */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {snack.title && (
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                mb: 0.3,
              }}
            >
              {snack.title}
            </Typography>
          )}
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            {snack.message}
          </Typography>

          {/* Action button */}
          {snack.action && (
            <Button
              size="small"
              onClick={() => {
                snack.action!.onClick();
                onClose(snack.id);
              }}
              sx={{
                mt: 0.8,
                px: 1.5,
                py: 0.4,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: iconColor,
                border: `1px solid ${iconColor}55`,
                borderRadius: "8px",
                textTransform: "none",
                "&:hover": {
                  background: `${iconColor}18`,
                  border: `1px solid ${iconColor}99`,
                },
              }}
            >
              {snack.action.label}
            </Button>
          )}
        </Box>

        {/* Close */}
        <IconButton
          size="small"
          onClick={() => onClose(snack.id)}
          sx={{
            mt: "-2px",
            mr: "-4px",
            color: "rgba(255,255,255,0.35)",
            "&:hover": { color: "#fff", background: "rgba(255,255,255,0.08)" },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Progress bar */}
      {snack.duration > 0 && (
        <LinearProgress
          variant="determinate"
          value={100}
          sx={{
            height: 3,
            background: "rgba(255,255,255,0.06)",
            "& .MuiLinearProgress-bar": {
              background: progress,
              transformOrigin: "left",
              animation: `himsProgress ${snack.duration}ms linear forwards`,
            },
            "@keyframes himsProgress": {
              from: { transform: "scaleX(1)" },
              to: { transform: "scaleX(0)" },
            },
          }}
        />
      )}
    </Box>
  );
};