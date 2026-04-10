import { Box, Stack } from "@mui/material";
import { SECONDARY_TOOLS, TOOLS } from "../utils/data";
import { renderToolIcon } from "./icons";
import { BRAND, BRAND_DARK, BRAND_DEEPER, BRAND_MID, DARK_BORDER } from "../utils/tokens";
import { ToolBtn, ToolSep } from "./viewerAtoms";

interface ViewerToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  layout: string;
  setLayout: (layout: string) => void;
}

export default function ViewerToolbar({
  activeTool,
  setActiveTool,
  layout,
  setLayout,
}: ViewerToolbarProps) {
  return (
    <Box
      sx={{
        bgcolor: BRAND_DEEPER, height: 52, flexShrink: 0,
        display: "flex", alignItems: "center", px: "14px", gap: "6px",
        borderBottom: `1px solid ${DARK_BORDER}`,
      }}
    >
      {TOOLS.map((t) => (
        <ToolBtn
          key={t.id}
          title={t.title}
          active={activeTool === t.id}
          onClick={() => setActiveTool(t.id)}
        >
          {renderToolIcon(t)}
        </ToolBtn>
      ))}

      <ToolSep />

      {SECONDARY_TOOLS.map((t) => (
        <ToolBtn
          key={t.id}
          title={t.title}
          active={activeTool === t.id}
          onClick={() => setActiveTool(t.id)}
        >
          {renderToolIcon(t)}
        </ToolBtn>
      ))}

      <ToolBtn title="OVL" danger>
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6" /><path d="M8 4v4l3 2M5 8H3M13 8h-2" />
        </svg>
      </ToolBtn>

      <Box
        sx={{
          px: "14px", py: "6px", borderRadius: "9px",
          bgcolor: "rgba(255,255,255,0.1)",
          border: "1.5px solid rgba(255,255,255,0.2)",
          fontSize: "11.5px", fontWeight: 700, color: "#fff",
          cursor: "pointer", flexShrink: 0,
          "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
        }}
      >
        Reset
      </Box>

      <ToolSep />

      <Stack direction="row" gap="3px">
        {["1×1", "1×2", "2×2"].map((l) => (
          <Box
            key={l}
            onClick={() => setLayout(l)}
            sx={{
              px: "12px", py: "6px", borderRadius: "9px",
              border: "1.5px solid",
              borderColor: layout === l ? BRAND_MID : "rgba(255,255,255,0.2)",
              fontSize: "11.5px", fontWeight: 700,
              color: layout === l ? "#fff" : "rgba(255,255,255,0.7)",
              bgcolor: layout === l ? BRAND : "transparent",
              cursor: "pointer", whiteSpace: "nowrap",
              transition: "all .15s",
              "&:hover": {
                bgcolor: layout === l ? BRAND_DARK : "rgba(255,255,255,0.1)",
                color: "#fff",
              },
            }}
          >
            {l}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
