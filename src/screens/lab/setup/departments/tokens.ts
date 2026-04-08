export const T = {
  border: "#E2E8F0",
  surface: "#F8FAFC",
  surfaceHover: "#F1F5F9",
  white: "#FFFFFF",
  textPrimary: "#1172BA",
  textSecondary: "#475569",
  textMuted: "#94A3B8",

  primary: "#1172BA",
  primaryLight: "#EEF2FF",
  primaryMid: "#C7D2FE",
  primaryHover: "#1172BA",

  // Status
  activeTxt: "#0F766E",
  activeBg: "#F0FDFA",
  activeBdr: "#99F6E4",
  inactiveTxt: "#64748B",
  inactiveBg: "#F1F5F9",
  inactiveBdr: "#CBD5E1",

  shadowCard: "0 1px 3px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.03)",
  shadowCardHover: "0 6px 20px rgba(67,56,202,0.09), 0 0 0 1.5px #1172BA",
};

export const labelSx = {
  fontSize: "0.62rem",
  fontWeight: 700,
  color: T.textMuted,
  textTransform: "uppercase" as const,
  letterSpacing: "0.07em",
};

export const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "9px",
    fontSize: "0.85rem",
    bgcolor: "#FAFAFA",
    "& fieldset": { borderColor: T.border },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: T.primary, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: T.primary },
};
