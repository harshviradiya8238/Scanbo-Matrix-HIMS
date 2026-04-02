"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { keyframes, styled } from "@mui/material/styles";

// ─── Animations ───────────────────────────────────────────────

const shimmerBar = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
`;

const drawEcg = keyframes`
  0%   { stroke-dashoffset: 320; opacity: 0; }
  10%  { opacity: 1; }
  70%  { stroke-dashoffset: 0;   opacity: 1; }
  90%  { stroke-dashoffset: 0;   opacity: 0; }
  100% { stroke-dashoffset: 320; opacity: 0; }
`;

const brandPulse = keyframes`
  0%, 100% { transform: scale(1);   opacity: 0.4; }
  50%       { transform: scale(1.4); opacity: 1; }
`;

const textFade = keyframes`
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
`;

const overlayIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

// ─── Styled Components ────────────────────────────────────────

const Overlay = styled(Box)(() => ({
  position: "fixed",
  inset: 0,
  background: "rgba(255,255,255,0.92)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "20px",
  zIndex: 9999,
  animation: `${overlayIn} 0.2s ease`,

  "&::before": {
    content: '""',
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background:
      "linear-gradient(90deg, transparent, #1172BA, #1172BA, #1172BA, transparent)",
    backgroundSize: "200% 100%",
    animation: `${shimmerBar} 1.8s linear infinite`,
  },
}));

const EcgPath = styled("path")(() => ({
  fill: "none",
  stroke: "#1172BA",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeDasharray: 320,
  strokeDashoffset: 320,
  animation: `${drawEcg} 1.8s ease-in-out infinite`,
}));

const BrandDot = styled(Box)<{ delay?: number }>(({ delay = 0 }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#1172BA",
  animation: `${brandPulse} 1.8s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

const LoaderText = styled(Typography)(() => ({
  fontSize: 14,
  color: "#64748b",
  fontWeight: 400,
  letterSpacing: "0.03em",
  animation: `${textFade} 1.8s ease-in-out infinite`,
}));

// ─── Props ────────────────────────────────────────────────────

interface HimsLoaderProps {
  /** Show or hide the loader */
  open: boolean;
  /** Message shown below the ECG line */
  message?: string;
}

// ─── Component ────────────────────────────────────────────────

const HimsLoader: React.FC<HimsLoaderProps> = ({
  open,
  message = "Loading...",
}) => {
  if (!open) return null;

  return (
    <Overlay>
      {/* ECG pulse line */}
      <Box sx={{ width: 140, height: 56 }}>
        <svg
          viewBox="0 0 140 56"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          <EcgPath d="M0,28 L22,28 L30,28 L36,10 L42,46 L48,4 L54,52 L60,28 L68,28 L74,22 L80,34 L86,28 L96,28 L118,28 L140,28" />
        </svg>
      </Box>

      {/* Dots + message */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <BrandDot />
        <LoaderText>{message}</LoaderText>
        <BrandDot delay={0.3} />
      </Box>

      {/* Brand label */}
      <Typography
        sx={{
          fontSize: 11,
          color: "#94a3b8",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          mt: "-14px",
        }}
      >
        Scanbo HIMS
      </Typography>
    </Overlay>
  );
};

export default HimsLoader;
