'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@/src/ui/components/atoms';
import type { LabSample } from '../lab-types';
import type { LabClient } from '../lab-types';
import type { LabTestCatalogItem } from '../lab-types';

export interface AddSampleForm {
  patient: string;
  dob: string;
  gender: string;
  phone: string;
  client: string;
  type: string;
  date: string;
  priority: LabSample['priority'];
  notes: string;
  requestedTests: string[];
}

const defaultForm: AddSampleForm = {
  patient: '',
  dob: '',
  gender: '',
  phone: '',
  client: '',
  type: 'Blood',
  date: new Date().toISOString().slice(0, 10),
  priority: 'NORMAL',
  notes: '',
  requestedTests: [],
};

export default function AddSampleModal({
  open,
  onClose,
  onSubmit,
  clients,
  tests,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: Omit<LabSample, 'id' | 'status' | 'analyst' | 'worksheetId'>) => void;
  clients: LabClient[];
  tests: LabTestCatalogItem[];
}) {
  const [form, setForm] = React.useState<AddSampleForm>(defaultForm);

  const reset = () => setForm({ ...defaultForm, date: new Date().toISOString().slice(0, 10) });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!form.patient.trim() || !form.client || form.requestedTests.length === 0) return;
    onSubmit({
      patient: form.patient.trim(),
      dob: form.dob || undefined,
      gender: form.gender || undefined,
      phone: form.phone || undefined,
      client: form.client,
      type: form.type,
      date: form.date,
      priority: form.priority,
      tests: form.requestedTests,
      notes: form.notes || undefined,
    });
    handleClose();
  };

  const toggleTest = (code: string) => {
    setForm((prev) => ({
      ...prev,
      requestedTests: prev.requestedTests.includes(code)
        ? prev.requestedTests.filter((t) => t !== code)
        : [...prev.requestedTests, code],
    }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Sample</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Patient Name"
            value={form.patient}
            onChange={(e) => setForm((p) => ({ ...p, patient: e.target.value }))}
            required
            fullWidth
            size="small"
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="DOB"
              type="date"
              value={form.dob}
              onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={form.gender}
                label="Gender"
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as string }))}
              >
                <MenuItem value="">—</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            size="small"
            fullWidth
          />
          <FormControl size="small" fullWidth required>
            <InputLabel>Client</InputLabel>
            <Select
              value={form.client}
              label="Client"
              onChange={(e) => setForm((p) => ({ ...p, client: e.target.value as string }))}
            >
              <MenuItem value="">Select client</MenuItem>
              {clients.filter((c) => c.active).map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Sample Type</InputLabel>
              <Select
                value={form.type}
                label="Sample Type"
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as string }))}
              >
                <MenuItem value="Blood">Blood</MenuItem>
                <MenuItem value="Serum">Serum</MenuItem>
                <MenuItem value="Urine">Urine</MenuItem>
                <MenuItem value="Swab">Swab</MenuItem>
                <MenuItem value="CSF">CSF</MenuItem>
                <MenuItem value="Tissue">Tissue</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Collection Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ flex: 1 }}
            />
          </Stack>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={form.priority}
              label="Priority"
              onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as LabSample['priority'] }))}
            >
              <MenuItem value="NORMAL">Normal</MenuItem>
              <MenuItem value="ROUTINE">Routine</MenuItem>
              <MenuItem value="URGENT">Urgent</MenuItem>
              <MenuItem value="STAT">STAT</MenuItem>
            </Select>
          </FormControl>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Requested Tests</Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {tests.map((t) => (
                <Chip
                  key={t.code}
                  label={t.name}
                  size="small"
                  onClick={() => toggleTest(t.code)}
                  color={form.requestedTests.includes(t.code) ? 'primary' : 'default'}
                  variant={form.requestedTests.includes(t.code) ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Box>
          <TextField
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            multiline
            rows={2}
            size="small"
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!form.patient.trim() || !form.client || form.requestedTests.length === 0}>
          Add Sample
        </Button>
      </DialogActions>
    </Dialog>
  );
}
