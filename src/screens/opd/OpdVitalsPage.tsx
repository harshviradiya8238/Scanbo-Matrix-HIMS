'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Alert, Box, Button, Chip, MenuItem, Snackbar, Stack, TextField, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import {
  MonitorHeart as MonitorHeartIcon,
  ShowChart as ShowChartIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import OpdFlowHeader from './components/OpdFlowHeader';
import { VitalTrendRecord } from './opd-mock-data';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { formatPatientLabel } from '@/src/core/patients/patientDisplay';
import { getPatientByMrn } from '@/src/mocks/global-patients';
import { useAppDispatch } from '@/src/store/hooks';
import { addVitalTrend, updateEncounter } from '@/src/store/slices/opdSlice';
import { useOpdData } from '@/src/store/opdHooks';

interface VitalsForm {
  bp: string;
  hr: string;
  rr: string;
  temp: string;
  spo2: string;
  painScore: number;
  nurse: string;
}

function buildDefaultForm(): VitalsForm {
  return {
    bp: '',
    hr: '',
    rr: '',
    temp: '',
    spo2: '',
    painScore: 0,
    nurse: 'Nurse Priya',
  };
}

export default function OpdVitalsPage() {
  const router = useRouter();
  const mrnParam = useMrnParam();
  const dispatch = useAppDispatch();
  const { encounters, vitalTrends, status: opdStatus, error: opdError } = useOpdData();
  const [selectedPatientId, setSelectedPatientId] = React.useState(encounters[0]?.id ?? '');
  const [form, setForm] = React.useState<VitalsForm>(buildDefaultForm());
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [mrnApplied, setMrnApplied] = React.useState(false);

  const selectedPatient = React.useMemo(
    () => encounters.find((item) => item.id === selectedPatientId),
    [encounters, selectedPatientId]
  );

  const flowMrn = selectedPatient?.mrn ?? mrnParam;
  const seededPatient = getPatientByMrn(flowMrn);
  const flowName = selectedPatient?.patientName || seededPatient?.name;
  const pageSubtitle = formatPatientLabel(flowName, flowMrn);
  const withMrn = React.useCallback(
    (route: string) => (flowMrn ? `${route}?mrn=${flowMrn}` : route),
    [flowMrn]
  );

  const patientRecords = React.useMemo(
    () => vitalTrends.filter((record) => record.patientId === selectedPatientId),
    [vitalTrends, selectedPatientId]
  );

  const latestRecord = patientRecords[patientRecords.length - 1];

  const highAlertCount = patientRecords.filter(
    (record) => record.bp.startsWith('15') || record.spo2.startsWith('9') === false
  ).length;

  const updateField = <K extends keyof VitalsForm>(field: K, value: VitalsForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = encounters.find((item) => item.mrn === mrnParam);
    if (match) {
      setSelectedPatientId(match.id);
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied, encounters]);

  const handleCaptureVitals = () => {
    if (!selectedPatient) return;
    if (!form.bp || !form.hr || !form.rr || !form.temp || !form.spo2 || !form.nurse) {
      setSnackbar({
        open: true,
        message: 'Please fill all vitals fields before saving.',
        severity: 'error',
      });
      return;
    }

    const newRecord: VitalTrendRecord = {
      id: `vt-${Date.now()}`,
      patientId: selectedPatient.id,
      recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bp: form.bp,
      hr: form.hr,
      rr: form.rr,
      temp: form.temp,
      spo2: form.spo2,
      painScore: form.painScore,
      nurse: form.nurse,
    };

    dispatch(addVitalTrend(newRecord));
    dispatch(
      updateEncounter({
        id: selectedPatient.id,
        changes: {
          vitals: {
            bp: form.bp,
            hr: form.hr,
            rr: form.rr,
            temp: form.temp,
            spo2: form.spo2,
            weightKg: selectedPatient.vitals.weightKg,
            bmi: selectedPatient.vitals.bmi,
          },
        },
      })
    );
    setForm(buildDefaultForm());
    setSnackbar({
      open: true,
      message: `Vitals captured for ${selectedPatient.patientName}.`,
      severity: 'success',
    });
  };

  return (
    <PageTemplate title="Vitals" subtitle={pageSubtitle} currentPageTitle="Vitals">
      <Stack spacing={2}>
        {opdStatus === 'loading' ? (
          <Alert severity="info">Loading OPD data from the local JSON server.</Alert>
        ) : null}
        {opdStatus === 'error' ? (
          <Alert severity="warning">
            OPD JSON server not reachable. Showing fallback data.
            {opdError ? ` (${opdError})` : ''}
          </Alert>
        ) : null}
        <OpdFlowHeader
          activeStep="visit"
          title="Vitals Capture Station"
          description="Record pre-consultation and intra-visit vitals with trend tracking and alerts."
          patientMrn={flowMrn}
          patientName={flowName}
          primaryAction={{ label: 'Back to Visit', route: '/appointments/visit' }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">Records Captured</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{patientRecords.length}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">Latest Capture</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{latestRecord?.recordedAt ?? '--'}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">Alert Events</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: highAlertCount > 0 ? 'error.main' : 'success.main' }}>
                {highAlertCount}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={1.2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Capture Vitals</Typography>

                <TextField
                  select
                  label="Patient"
                  value={selectedPatientId}
                  onChange={(event) => setSelectedPatientId(event.target.value)}
                >
                  {encounters.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.patientName} ({patient.mrn})
                    </MenuItem>
                  ))}
                </TextField>

                <Grid container spacing={1.2}>
                  <Grid item xs={12} sm={6}><TextField label="BP" fullWidth value={form.bp} onChange={(event) => updateField('bp', event.target.value)} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="HR" fullWidth value={form.hr} onChange={(event) => updateField('hr', event.target.value)} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="RR" fullWidth value={form.rr} onChange={(event) => updateField('rr', event.target.value)} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Temp" fullWidth value={form.temp} onChange={(event) => updateField('temp', event.target.value)} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="SpO2" fullWidth value={form.spo2} onChange={(event) => updateField('spo2', event.target.value)} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Pain Score" type="number" fullWidth value={form.painScore} onChange={(event) => updateField('painScore', Number(event.target.value))} /></Grid>
                </Grid>

                <TextField label="Nurse" value={form.nurse} onChange={(event) => updateField('nurse', event.target.value)} />

                <Button variant="contained" startIcon={<MonitorHeartIcon />} onClick={handleCaptureVitals}>
                  Save Vitals
                </Button>
                <Button variant="text" onClick={() => router.push(withMrn('/appointments/visit'))}>
                  Open Visit UI
                </Button>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={1.2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Vitals Trend</Typography>
                {selectedPatient ? (
                  <Typography variant="body2" color="text.secondary">
                    {selectedPatient.patientName} · {selectedPatient.chiefComplaint}
                  </Typography>
                ) : null}

                {patientRecords.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No vitals captured yet.</Typography>
                ) : (
                  patientRecords.map((record) => {
                    const alert = record.bp.startsWith('15') || !record.spo2.startsWith('9');
                    return (
                      <Card key={record.id} variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                          <Stack direction="row" spacing={0.75} flexWrap="wrap">
                            <Chip size="small" icon={<ShowChartIcon />} label={record.recordedAt} />
                            <Chip size="small" variant="outlined" label={`BP ${record.bp}`} />
                            <Chip size="small" variant="outlined" label={`HR ${record.hr}`} />
                            <Chip size="small" variant="outlined" label={`RR ${record.rr}`} />
                            <Chip size="small" variant="outlined" label={`Temp ${record.temp}`} />
                            <Chip size="small" variant="outlined" label={`SpO2 ${record.spo2}`} />
                            <Chip size="small" variant="outlined" label={`Pain ${record.painScore}`} />
                          </Stack>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            {alert ? <WarningAmberIcon color="error" fontSize="small" /> : null}
                            <Typography variant="caption" color="text.secondary">{record.nurse}</Typography>
                          </Stack>
                        </Stack>
                      </Card>
                    );
                  })
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3200}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Stack>
    </PageTemplate>
  );
}
