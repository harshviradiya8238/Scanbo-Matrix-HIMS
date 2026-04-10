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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@/src/ui/components/atoms';
import type { LabResultRow, ResultFlag } from '../lab-types';

function flagResult(value: string, refLow: string, refHigh: string): ResultFlag {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return 'NORMAL';
  const low = parseFloat(refLow);
  const high = parseFloat(refHigh);
  if (!Number.isNaN(low) && num < low) return 'LOW';
  if (!Number.isNaN(high) && num > high) return 'HIGH';
  return 'NORMAL';
}

export interface ResultLine {
  analyte: string;
  result: string;
  unit: string;
  refLow: string;
  refHigh: string;
  flag: ResultFlag;
}

type EnterResultsProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (rows: LabResultRow[]) => void;
  sampleId: string;
  testCode: string;
  testName: string;
  analytes: string[];
  analyst: string;
};

export default function EnterResultsModal(p: EnterResultsProps) {
  const { open, onClose, onSubmit, sampleId, testCode, testName, analytes, analyst } = p;
  const [lines, setLines] = React.useState<ResultLine[]>(() =>
    analytes.map((a) => ({ analyte: a, result: '', unit: '', refLow: '', refHigh: '', flag: 'NORMAL' as ResultFlag }))
  );
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

  React.useEffect(() => {
    if (open && analytes.length) {
      setLines(analytes.map((a) => ({ analyte: a, result: '', unit: '', refLow: '', refHigh: '', flag: 'NORMAL' as ResultFlag })));
    }
  }, [open, analytes]);

  const updateLine = (index: number, field: keyof ResultLine, value: string) => {
    setLines((prev) => {
      const next = [...prev];
      const line = { ...next[index], [field]: value };
      if (field === 'result' && (line.refLow || line.refHigh)) {
        line.flag = flagResult(value, line.refLow, line.refHigh);
      }
      next[index] = line;
      return next;
    });
  };

  const handleSubmit = () => {
    const rows: LabResultRow[] = lines
      .filter((l) => l.result.trim() !== '')
      .map((l, i) => ({
        id: 'R-' + String(Date.now()) + '-' + String(i),
        sampleId,
        test: testCode,
        analyte: l.analyte,
        result: l.result.trim(),
        unit: l.unit.trim(),
        refLow: l.refLow,
        refHigh: l.refHigh,
        flag: l.flag,
        status: 'pending' as const,
        analyst,
        enteredAt: now,
        verifiedBy: undefined,
      }));
    if (rows.length === 0) return;
    onSubmit(rows);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Enter Results — {testName}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sample: {sampleId}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Analyte</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Result</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ref Low</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ref High</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Flag</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line, i) => (
                <TableRow key={line.analyte}>
                  <TableCell>{line.analyte}</TableCell>
                  <TableCell>
                    <TextField size="small" value={line.result} onChange={(e) => updateLine(i, 'result', e.target.value)} sx={{ minWidth: 100 }} />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" value={line.unit} onChange={(e) => updateLine(i, 'unit', e.target.value)} sx={{ minWidth: 80 }} />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" value={line.refLow} onChange={(e) => updateLine(i, 'refLow', e.target.value)} sx={{ minWidth: 70 }} />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" value={line.refHigh} onChange={(e) => updateLine(i, 'refHigh', e.target.value)} sx={{ minWidth: 70 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color={line.flag !== 'NORMAL' ? 'error' : 'text.secondary'}>
                      {line.flag}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Save Results</Button>
      </DialogActions>
    </Dialog>
  );
}
