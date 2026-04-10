"use client";

import * as React from "react";
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";
import type { CalculatedAnalysis } from "../types";

interface CalculatedAnalysisDialogProps {
  open: boolean;
  editingItem: CalculatedAnalysis | null;
  formData: Partial<CalculatedAnalysis>;
  onClose: () => void;
  onSave: () => void;
  onFormDataChange: (formData: Partial<CalculatedAnalysis>) => void;
}

function CalculatedAnalysisDialogBase({
  open,
  editingItem,
  formData,
  onClose,
  onSave,
  onFormDataChange,
}: CalculatedAnalysisDialogProps) {
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
          {editingItem ? "Edit Calculation" : "Add Calculation"}
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
            {editingItem ? "Update Calculation" : "Save Calculation"}
          </Button>
        </>
      }
    >
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Keyword (unique) *"
            fullWidth
            value={formData.keyword || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, keyword: e.target.value })
            }
            placeholder="e.g. AG"
          />
          <TextField
            label="Full Name *"
            fullWidth
            value={formData.name || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, name: e.target.value })
            }
            placeholder="e.g. Anion Gap"
          />
        </Stack>
        <TextField
          label="Formula / Expression *"
          fullWidth
          value={formData.formula || ""}
          onChange={(e) =>
            onFormDataChange({ ...formData, formula: e.target.value })
          }
          placeholder="e.g. Na - Cl - HCO3"
          helperText="Use analyte keywords separated by operators: + - * / ( )"
        />
        <Stack direction="row" spacing={2}>
          <TextField
            label="Unit"
            fullWidth
            value={formData.unit || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, unit: e.target.value })
            }
            placeholder="e.g. mEq/L"
          />
          <TextField
            label="Reference Range"
            fullWidth
            value={formData.refRange || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, refRange: e.target.value })
            }
            placeholder="e.g. 8-16"
          />
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
          </TextField>
          <TextField
            select
            label="Status"
            fullWidth
            value={formData.status || "Active"}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                status: e.target.value as CalculatedAnalysis["status"],
              })
            }
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
        </Stack>
        <TextField
          label="Notes / Description"
          fullWidth
          multiline
          rows={3}
          placeholder="Optional: describe when to use this calculation..."
        />
      </Stack>
    </CommonDialog>
  );
}

export const CalculatedAnalysisDialog = React.memo(CalculatedAnalysisDialogBase);
