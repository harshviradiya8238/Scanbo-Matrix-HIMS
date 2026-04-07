import { CaseStatus, StatusTone, WorklistFilter } from './types';

export function statusTone(status: CaseStatus): StatusTone {
  if (status === 'In OR') return 'warning';
  if (status === 'Pre-Op') return 'pending';
  if (status === 'PACU') return 'active';
  if (status === 'Scheduled') return 'info';
  return 'completed';
}

export function matchesFilter(status: CaseStatus, filter: WorklistFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'in-or') return status === 'In OR';
  if (filter === 'pre-op') return status === 'Pre-Op';
  if (filter === 'pacu') return status === 'PACU';
  return status === 'Scheduled';
}

export function buildWavePoints(basePoints: Array<[number, number]>, repeats = 6, cycleWidth = 300): string {
  const points: string[] = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    basePoints.forEach((point, idx) => {
      if (repeat > 0 && idx === 0) return;
      points.push(`${point[0] + repeat * cycleWidth},${point[1]}`);
    });
  }
  return points.join(' ');
}

export function currentTimeStamp(): string {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
