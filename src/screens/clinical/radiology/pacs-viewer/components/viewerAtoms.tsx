import type React from "react";
import { Box, Tooltip } from "@mui/material";
import { BRAND, BRAND_DARK, BRAND_MID, DARK_BORDER, DARK_TEXT } from "../utils/tokens";

export function ToolBtn({
  active,
  danger,
  title,
  onClick,
  children,
}: {
  id?: string;
  active?: boolean;
  danger?: boolean;
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip title={title} placement="bottom">
      <Box
        onClick={onClick}
        sx={{
          width: 34, height: 34, borderRadius: "9px",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
          border: "1.5px solid",
          borderColor: danger ? "#FC8181" : active ? BRAND_MID : "transparent",
          bgcolor: danger ? "#E53E3E" : active ? BRAND : "transparent",
          transition: "all .15s",
          "& svg": { color: danger || active ? "#fff" : DARK_TEXT },
          "&:hover": {
            bgcolor: danger ? "#C53030" : active ? BRAND_DARK : "rgba(255,255,255,0.1)",
            borderColor: danger ? "#FC8181" : active ? BRAND_MID : "rgba(255,255,255,0.2)",
            "& svg": { color: "#fff" },
          },
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}

export const ToolSep = () => (
  <Box sx={{ width: "1px", height: 28, bgcolor: DARK_BORDER, mx: "4px", flexShrink: 0 }} />
);
