import { MEAN, SD, TREND_DATA } from "./data";

export const getYSize = (val: number) => {
  // Range: Mean +/- 4SD (8 SD total)
  // Map val to percentage of height (0 to 100)
  const min = MEAN - 4 * SD;
  const max = MEAN + 4 * SD;
  const percent = ((val - min) / (max - min)) * 100;
  return 100 - percent; // SVG Y is top-down
};

export const TREND_PLOT_POINTS = TREND_DATA.map((d, i) => ({
  ...d,
  x: (i * 1000) / (TREND_DATA.length - 1),
  y: getYSize(d.value),
}));

export const TREND_PATH = TREND_PLOT_POINTS.map(
  (d, i) => `${i === 0 ? "M" : "L"} ${d.x} ${d.y}`,
).join(" ");
