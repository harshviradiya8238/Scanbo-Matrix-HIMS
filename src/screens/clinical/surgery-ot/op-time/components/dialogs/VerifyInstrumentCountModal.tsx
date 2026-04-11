import {
  Button,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { CommonDialog } from "@/src/ui/components/molecules";
import { InstrumentCountRow } from "../../OpTimeData";
import { useEffect, useState } from "react";

interface VerifyInstrumentCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  instrumentRows: InstrumentCountRow[];
  onSave: (updatedRows: InstrumentCountRow[]) => void;
}

export default function VerifyInstrumentCountModal({
  isOpen,
  onClose,
  instrumentRows,
  onSave,
}: VerifyInstrumentCountModalProps) {
  const [rows, setRows] = useState<InstrumentCountRow[]>([]);

  useEffect(() => {
    if (isOpen) {
      setRows(instrumentRows.map(row => ({ ...row })));
    }
  }, [isOpen, instrumentRows]);

  const handleFinalChange = (id: string, value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id 
          ? { 
              ...row, 
              final: value, 
              status: value === row.initial ? "OK" : "Pending" 
            } 
          : row
      )
    );
  };

  const handleSave = () => {
    onSave(rows);
    onClose();
  };

  return (
    <CommonDialog
      open={isOpen}
      onClose={onClose}
      title="Verify Instrument & Swab Count"
      confirmLabel="Verify & Save"
      confirmColor="success"
      onConfirm={handleSave}
      fullWidth
      maxWidth="sm"
      contentDividers
    >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Grid container sx={{ px: 1, mb: 1 }}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                ITEM
              </Typography>
            </Grid>
            <Grid item xs={3} textAlign="center">
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                INITIAL
              </Typography>
            </Grid>
            <Grid item xs={3} textAlign="center">
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                FINAL
              </Typography>
            </Grid>
          </Grid>

          {rows.map((row) => (
            <Grid container key={row.id} alignItems="center" spacing={1} sx={{ px: 1 }}>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight={600}>
                  {row.item}
                </Typography>
              </Grid>
              <Grid item xs={3} textAlign="center">
                <Typography variant="body2">{row.initial}</Typography>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Count"
                  value={row.final === "--" ? "" : row.final}
                  onChange={(e) => handleFinalChange(row.id, e.target.value)}
                  inputProps={{ style: { textAlign: 'center', padding: '4px 0' } }}
                />
              </Grid>
            </Grid>
          ))}
        </Stack>
    </CommonDialog>
  );
}
