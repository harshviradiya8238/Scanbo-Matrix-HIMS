'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@/src/ui/components/atoms';
import type { LabTestCatalogItem } from '../lab-types';

const DEPTS = ['Biochemistry', 'Hematology', 'Microbiology', 'Immunology', 'Pathology'];

export default function AddTestModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: Omit<LabTestCatalogItem, 'code'> & { code?: string }) => void;
}) {
  const [code, setCode] = React.useState('');
  const [name, setName] = React.useState('');
  const [dept, setDept] = React.useState(DEPTS[0]);
  const [method, setMethod] = React.useState('Automated');
  const [tat, setTat] = React.useState('4h');
  const [price, setPrice] = React.useState('');
  const [analytesStr, setAnalytesStr] = React.useState('');

  const handleClose = () => {
    setCode('');
    setName('');
    setDept(DEPTS[0]);
    setMethod('Automated');
    setTat('4h');
    setPrice('');
    setAnalytesStr('');
    onClose();
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const analytes = analytesStr.split(/[,;]/).map((a) => a.trim()).filter(Boolean);
    onSubmit({
      code: code.trim() || undefined,
      name: name.trim(),
      dept,
      method,
      tat,
      price: price === '' ? 0 : parseFloat(price) || 0,
      analytes: analytes.length ? analytes : [name.trim()],
    });
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Test</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. CBC" size="small" fullWidth />
          <TextField label="Test Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth size="small" />
          <FormControl size="small" fullWidth>
            <InputLabel>Department</InputLabel>
            <Select value={dept} label="Department" onChange={(e) => setDept(e.target.value as string)}>
              {DEPTS.map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Method" value={method} onChange={(e) => setMethod(e.target.value)} size="small" fullWidth />
          <Stack direction="row" spacing={2}>
            <TextField label="TAT" value={tat} onChange={(e) => setTat(e.target.value)} size="small" sx={{ width: 100 }} />
            <TextField label="Price (₹)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} size="small" sx={{ width: 120 }} />
          </Stack>
          <TextField
            label="Analytes (comma-separated)"
            value={analytesStr}
            onChange={(e) => setAnalytesStr(e.target.value)}
            placeholder="e.g. WBC, RBC, Hemoglobin"
            multiline
            rows={2}
            size="small"
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!name.trim()}>Add Test</Button>
      </DialogActions>
    </Dialog>
  );
}
