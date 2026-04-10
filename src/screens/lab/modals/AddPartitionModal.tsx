"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  MenuItem,
} from "@/src/ui/components/atoms";
import { Close as CloseIcon } from "@mui/icons-material";
import { useLabTheme } from "../lab-theme";
import { useTheme } from "@mui/material";

interface AddPartitionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (partition: {
    parentId: string;
    patient: string;
    volume: string;
    container: string;
    analyses: string[];
    department: string;
  }) => void;
  parentId: string;
  patientName: string;
}

const CONTAINERS = [
  "EDTA (Purple)",
  "SST (Yellow)",
  "Sodium Citrate (Blue)",
  "Heparin (Green)",
  "Fluoride (Grey)",
];

const DEPARTMENTS = [
  "Haematology",
  "Biochemistry",
  "Microbiology",
  "Pathology",
  "Serology",
];

export default function AddPartitionModal({
  open,
  onClose,
  onSubmit,
  parentId,
  patientName,
}: AddPartitionModalProps) {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const [formData, setFormData] = React.useState({
    container: "EDTA (Purple)",
    volume: "2",
    analyses: "",
    department: "Biochemistry",
  });

  const handleSumbit = () => {
    onSubmit({
      parentId,
      patient: patientName,
      volume: `${formData.volume} mL`,
      container: formData.container,
      analyses: formData.analyses.split(",").map((s) => s.trim()),
      department: formData.department,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Add Partition — {parentId}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "grid", gap: 2.5, pt: 1 }}>
          <TextField
            select
            label="Container"
            value={formData.container}
            onChange={(e) =>
              setFormData({ ...formData, container: e.target.value })
            }
            fullWidth
            size="medium"
          >
            {CONTAINERS.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Volume (mL)"
            type="number"
            value={formData.volume}
            onChange={(e) =>
              setFormData({ ...formData, volume: e.target.value })
            }
            fullWidth
            size="medium"
          />

          <TextField
            label="Analyses for this partition"
            placeholder="e.g. LFT, RFT"
            value={formData.analyses}
            onChange={(e) =>
              setFormData({ ...formData, analyses: e.target.value })
            }
            fullWidth
            size="medium"
          />

          <TextField
            select
            label="Department"
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
            fullWidth
            size="medium"
          >
            {DEPARTMENTS.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSumbit} variant="contained" color="primary">
          + Add Partition
        </Button>
      </DialogActions>
    </Dialog>
  );
}
