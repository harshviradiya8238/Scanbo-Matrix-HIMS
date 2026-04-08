"use client";

import * as React from "react";
import {
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";
import type { ValidatedMethod } from "../types";

interface ValidatedMethodDialogProps {
  open: boolean;
  editingItem: ValidatedMethod | null;
  formData: Partial<ValidatedMethod>;
  onClose: () => void;
  onSave: () => void;
  onFormDataChange: (formData: Partial<ValidatedMethod>) => void;
}

function ValidatedMethodDialogBase({
  open,
  editingItem,
  formData,
  onClose,
  onSave,
  onFormDataChange,
}: ValidatedMethodDialogProps) {
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 },
      }}
      title={
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {editingItem ? "Edit Method" : "Add Method"}
        </Typography>
      }
      contentDividers
      actionsSx={{ p: 3 }}
      actions={
        <>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={onSave} variant="contained" sx={{ px: 4 }}>
            {editingItem ? "Update Method" : "Save Method"}
          </Button>
        </>
      }
    >
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        <TextField
          label="Method Name *"
          fullWidth
          value={formData.name || ""}
          onChange={(e) =>
            onFormDataChange({ ...formData, name: e.target.value })
          }
          placeholder="e.g. GOD-POD Enzymatic"
        />
        <Stack direction="row" spacing={2}>
          <TextField
            label="Analysis Linked (Keywords) *"
            fullWidth
            value={formData.linkedAnalysis || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, linkedAnalysis: e.target.value })
            }
            placeholder="e.g. Glucose, HbA1c"
          />
          <TextField
            label="Principle"
            fullWidth
            value={formData.principle || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, principle: e.target.value })
            }
            placeholder="e.g. Enzymatic Colorimetric"
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Instrument"
            fullWidth
            value={formData.instrument || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, instrument: e.target.value })
            }
          >
            <MenuItem value="Sysmex XN-1000">Sysmex XN-1000</MenuItem>
            <MenuItem value="Roche Cobas 6000">Roche Cobas 6000</MenuItem>
            <MenuItem value="BD BACTEC FX">BD BACTEC FX</MenuItem>
            <MenuItem value="Bio-Rad D-10">Bio-Rad D-10</MenuItem>
            <MenuItem value="Abbott Architect">Abbott Architect</MenuItem>
            <MenuItem value="Other / Manual">Other / Manual</MenuItem>
          </TextField>
          <TextField
            select
            label="Validation Standard"
            fullWidth
            value={formData.standard || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, standard: e.target.value })
            }
          >
            <MenuItem value="CLSI EP15">CLSI EP15</MenuItem>
            <MenuItem value="CLSI EP9">CLSI EP9</MenuItem>
            <MenuItem value="CLSI H20">CLSI H20</MenuItem>
            <MenuItem value="CLSI M47">CLSI M47</MenuItem>
            <MenuItem value="ICSH">ICSH</MenuItem>
            <MenuItem value="IFCC">IFCC</MenuItem>
            <MenuItem value="NGSP / IFCC">NGSP / IFCC</MenuItem>
            <MenuItem value="CDC NHLBI">CDC NHLBI</MenuItem>
            <MenuItem value="ISO 15189">ISO 15189</MenuItem>
          </TextField>
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Department"
            fullWidth
            value={formData.department || "Biochemistry"}
            onChange={(e) =>
              onFormDataChange({ ...formData, department: e.target.value })
            }
          >
            <MenuItem value="Biochemistry">Biochemistry</MenuItem>
            <MenuItem value="Haematology">Haematology</MenuItem>
            <MenuItem value="Microbiology">Microbiology</MenuItem>
            <MenuItem value="Serology">Serology</MenuItem>
            <MenuItem value="Histopathology">Histopathology</MenuItem>
          </TextField>
          <TextField
            label="Validated On"
            fullWidth
            type="text"
            placeholder="dd / mm / yyyy"
            value={formData.validatedOn || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, validatedOn: e.target.value })
            }
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Status"
            fullWidth
            value={formData.status || "Active"}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                status: e.target.value as ValidatedMethod["status"],
              })
            }
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
        </Stack>
        <TextField
          label="Notes"
          fullWidth
          multiline
          rows={3}
          placeholder="Optional: linearity range, interferences, special instructions..."
        />
      </Stack>
    </CommonDialog>
  );
}

export const ValidatedMethodDialog = React.memo(ValidatedMethodDialogBase);
