import type { ToolDef } from "../utils/types";

const PathIcon = ({
  d,
  size = 16,
  viewBox = "0 0 16 16",
}: {
  d: string;
  size?: number;
  viewBox?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d={d} />
  </svg>
);

export function renderToolIcon(t: ToolDef) {
  if (t.d) return <PathIcon d={t.d} />;
  if (t.custom === "zoom" || t.custom === "zoomin") {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3M5 7h4M7 5v4" />
      </svg>
    );
  }
  if (t.custom === "zoomout") {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3M5 7h4" />
      </svg>
    );
  }
  if (t.custom === "bright") {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" />
      </svg>
    );
  }
  if (t.custom === "rect") {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="12" height="10" rx="1.5" />
      </svg>
    );
  }
  if (t.custom === "ellipse") {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="8" cy="8" rx="6" ry="4" />
      </svg>
    );
  }
  if (t.custom === "wl") {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="6" /><path d="M8 4v4l3 2" />
      </svg>
    );
  }
  return null;
}
