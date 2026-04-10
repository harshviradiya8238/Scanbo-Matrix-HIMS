'use client';

import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, FormControl, InputLabel, MenuItem, Select } from '@/src/ui/components/atoms';
import type { LabWorksheet } from '../lab-types';
import { ANALYSTS } from '../lab-types';

const TEMPLATES = ['Biochemistry Panel', 'Hematology + UA', 'Microbiology', 'Neurology Panel', 'Immunology Panel'];
const DEPTS = ['Biochemistry', 'Hematology', 'Microbiology', 'Immunology', 'Pathology'];

export default function AddWorksheetModal(props: { open: boolean; onClose: () => void; onSubmit: (form: Omit<LabWorksheet, 'id' | 'samples'>) => void }) {
  const { open, onClose, onSubmit } = props;
  const [template, setTemplate] = React.useState(TEMPLATES[0]);
  const [dept, setDept] = React.useState(DEPTS[0]);
  const [analyst, setAnalyst] = React.useState(ANALYSTS[0]);
  const [notes, setNotes] = React.useState('');

  const handleClose = () => {
    setTemplate(TEMPLATES[0]);
    setDept(DEPTS[0]);
    setAnalyst(ANALYSTS[0]);
    setNotes('');
    onClose();
  };

  const handleSubmit = () => {
    onSubmit({ template, dept, analyst, status: 'open', created: new Date().toISOString().slice(0, 10), notes });
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>New Worksheet</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Template</InputLabel>
            <Select value={template} label="Template" onChange={(e) => setTemplate(e.target.value as string)}>
              {TEMPLATES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Department</InputLabel>
            <Select value={dept} label="Department" onChange={(e) => setDept(e.target.value as string)}>
              {DEPTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Analyst</InputLabel>
            <Select value={analyst} label="Analyst" onChange={(e) => setAnalyst(e.target.value as string)}>
              {ANALYSTS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} multiline rows={2} size="small" fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Create Worksheet</Button>
      </DialogActions>
    </Dialog>
  );
}
