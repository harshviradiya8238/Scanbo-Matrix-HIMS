"use client";

import * as React from "react";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import {
  Close as CloseIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";
import { labelSx, T } from "../tokens";
import type { Department } from "../types";

interface DepartmentDialogProps {
  open: boolean;
  editingDept: Department | null;
  formData: Partial<Department>;
  onClose: () => void;
  onSave: () => void;
  onFormDataChange: (formData: Partial<Department>) => void;
}

function DepartmentDialogBase({
  open,
  editingDept,
  formData,
  onClose,
  onSave,
  onFormDataChange,
}: DepartmentDialogProps) {
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      hideActions
      PaperProps={{
        sx: {
          borderRadius: "16px",
          border: `1px solid ${T.border}`,
          boxShadow: "0 24px 48px rgba(15,23,42,0.12)",
          overflow: "hidden",
        },
      }}
      contentSx={{ p: 0, pt: 0, pb: 0 }}
    >
      <Box
        sx={{
          px: 3,
          py: 2.25,
          bgcolor: T.surface,
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            sx={{ fontSize: "1rem", fontWeight: 800, color: T.textPrimary }}
          >
            {editingDept ? "Edit Department" : "Add Department"}
          </Typography>
          <Typography
            sx={{ fontSize: "0.72rem", color: T.textMuted, mt: 0.25 }}
          >
            {editingDept
              ? `Editing: ${editingDept.name}`
              : "Configure a new lab department"}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            width: 30,
            height: 30,
            borderRadius: "8px",
            border: `1px solid ${T.border}`,
            color: T.textMuted,
            "&:hover": { bgcolor: T.surfaceHover },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, bgcolor: T.white }}>
        <Stack spacing={2}>
          <Typography sx={{ ...labelSx, mb: 0.5 }}>Basic Info</Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Department Name *"
              placeholder="e.g. Molecular Biology"
              value={formData.name || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, name: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Short Code"
              placeholder="e.g. MOL"
              value={formData.shortCode || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, shortCode: e.target.value })
              }
            />
          </Stack>

          <Box sx={{ my: 0.25, borderTop: `1px dashed ${T.border}` }} />
          <Typography sx={{ ...labelSx, mb: 0.5 }}>Staff</Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Department Head"
              placeholder="e.g. Dr. Rajesh Kumar"
              value={formData.head || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, head: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Analysts / Staff"
              placeholder="e.g. M. Joseph, S. Pillai"
              value={formData.analysts || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, analysts: e.target.value })
              }
            />
          </Stack>

          <Box sx={{ my: 0.25, borderTop: `1px dashed ${T.border}` }} />
          <Typography sx={{ ...labelSx, mb: 0.5 }}>Operations</Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Instruments"
              placeholder="e.g. Sysmex XN-1000"
              value={formData.instruments || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, instruments: e.target.value })
              }                />
            <TextField
              fullWidth
              label="TAT Target"
              placeholder="e.g. 2 hrs"
              value={formData.tatTarget || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, tatTarget: e.target.value })
              }                />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="TAT Compliance (%)"
              type="number"
              placeholder="e.g. 88"
              value={formData.tatCompliance || ""}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  tatCompliance: Number(e.target.value),
                })
              }                />
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status || "Active"}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  status: e.target.value as "Active" | "Inactive",
                })
              }                >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
          <TextField
            select
            fullWidth
            label="Icon Type"
            value={formData.iconType || "bio"}
            onChange={(e) =>
              onFormDataChange({ ...formData, iconType: e.target.value })
            }
          >
            <MenuItem value="blood">Blood — Haematology</MenuItem>
            <MenuItem value="bio">Science — Biochemistry</MenuItem>
            <MenuItem value="micro">Microbe — Microbiology</MenuItem>
            <MenuItem value="serology">Vaccine — Serology</MenuItem>
            <MenuItem value="histo">Store — Histopathology</MenuItem>
            <MenuItem value="cyto">Biotech — Cytology</MenuItem>
            <MenuItem value="molec">Memory — Molecular Biology</MenuItem>
          </TextField>
        </Stack>
      </Box>

      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${T.border}`,
          bgcolor: T.surface,
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.25,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            height: 38,
            px: 2.5,
            fontSize: "0.8rem",
            fontWeight: 600,
            borderRadius: "9px",
            textTransform: "none",
            borderColor: T.border,
            color: T.textSecondary,
            "&:hover": { bgcolor: T.surfaceHover, borderColor: "#94A3B8" },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
          onClick={onSave}
          sx={{
            height: 38,
            px: 3,
            fontSize: "0.8rem",
            fontWeight: 700,
            borderRadius: "9px",
            textTransform: "none",
            bgcolor: T.primary,
          
          }}
        >
          Save Department
        </Button>
      </Box>
    </CommonDialog>
  );
}

export const DepartmentDialog = React.memo(DepartmentDialogBase);
