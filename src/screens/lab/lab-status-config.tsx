import type { SampleStatus, WorksheetStatus, InstrumentStatus } from '@/src/screens/lab/lab-types';
import { useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

export function useLabStatusConfig() {
  const theme = useTheme();
  const sampleStatus: Record<SampleStatus, { label: string; color: string }> = {
    registered: { label: 'Registered', color: theme.palette.text.secondary },
    received: { label: 'Received', color: theme.palette.info.main },
    assigned: { label: 'Assigned', color: theme.palette.secondary.main },
    analysed: { label: 'Analysed', color: theme.palette.warning.main },
    verified: { label: 'Verified', color: theme.palette.success.main },
    published: { label: 'Published', color: theme.palette.primary.main },
  };
  const worksheetStatus: Record<WorksheetStatus, { label: string; color: string }> = {
    open: { label: 'Open', color: theme.palette.info.main },
    to_be_verified: { label: 'To Be Verified', color: theme.palette.warning.main },
    verified: { label: 'Verified', color: theme.palette.success.main },
    closed: { label: 'Closed', color: theme.palette.text.secondary },
  };
  const instrumentStatus: Record<InstrumentStatus, { label: string; color: string }> = {
    online: { label: 'Online', color: theme.palette.success.main },
    maintenance: { label: 'Maintenance', color: theme.palette.error.main },
    offline: { label: 'Offline', color: theme.palette.text.secondary },
  };
  return { sampleStatus, worksheetStatus, instrumentStatus };
}

export function getFlagColor(flag: string, theme: { palette: { error: { main: string }; info: { main: string }; success: { main: string } } }) {
  if (flag === 'HIGH') return theme.palette.error.main;
  if (flag === 'LOW') return theme.palette.info.main;
  return theme.palette.success.main;
}
