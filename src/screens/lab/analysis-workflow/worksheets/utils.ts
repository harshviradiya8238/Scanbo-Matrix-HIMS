import type { LabWorksheet } from "../../lab-types";

export function worksheetProgress(
  w: LabWorksheet,
  results: { sampleId: string; status: string }[],
): number {
  if (w.samples.length === 0) return 0;
  const sampleIds = new Set(w.samples);
  const relevant = results.filter((r) => sampleIds.has(r.sampleId));
  if (relevant.length === 0) return 0;
  const verified = relevant.filter((r) => r.status === "verified").length;
  return Math.round((verified / relevant.length) * 100);
}
