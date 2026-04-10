"use client";

import * as React from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha } from "@mui/material/styles";
import {
  AccessTime as TatIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";
import { DUMMY_PROFILES } from "../data";
import { labelSx, T } from "../tokens";
import type { AnalysisProfile } from "../types";
import { DeptBadge } from "./DeptBadge";

interface RegisterSampleDialogProps {
  open: boolean;
  selectedProfile: AnalysisProfile | null;
  onClose: () => void;
  onSelectedProfileChange: (profile: AnalysisProfile) => void;
}

function RegisterSampleDialogBase({
  open,
  selectedProfile,
  onClose,
  onSelectedProfileChange,
}: RegisterSampleDialogProps) {
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
            Register New Sample
          </Typography>
          {selectedProfile && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{ mt: 0.4 }}
            >
              <Typography sx={{ fontSize: "0.72rem", color: T.textMuted }}>
                Using profile:
              </Typography>
              <DeptBadge dept={selectedProfile.department} />
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: T.textSecondary,
                }}
              >
                {selectedProfile.name}
              </Typography>
            </Stack>
          )}
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
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography sx={{ ...labelSx }}>
              Patient Information
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Patient Name *"
              placeholder="e.g. Priya Mehta"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Patient UHID"
              placeholder="UHID-00482"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Age"
              placeholder="34"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Gender"
              placeholder="Female"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Ward / OPD"
              placeholder="OPD"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ my: 0.5, borderTop: `1px dashed ${T.border}` }} />
            <Typography sx={{ ...labelSx, mt: 1.5,  }}>
              Referral & Test Details
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Client *"
              defaultValue="MediCare Hospital (In-House)"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Contact Person"
              placeholder="Dr. A. Sharma"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="Analysis Profile"
              value={selectedProfile?.id || ""}
              onChange={(e) => {
                const profile = DUMMY_PROFILES.find(
                  (x) => x.id === e.target.value,
                );
                if (profile) onSelectedProfileChange(profile);
              }}
            >
              {DUMMY_PROFILES.map((profile) => (
                <MenuItem key={profile.id} value={profile.id}>
                  {profile.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Or type analyses"
              placeholder="TSH, T3, T4, CBC..."
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ my: 0.5, borderTop: `1px dashed ${T.border}` }} />
            <Typography sx={{ ...labelSx, mt: 1.5,  }}>
              Sample & Collection
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Sample Type *"
              defaultValue={selectedProfile?.sampleType || ""}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Container"
              defaultValue={selectedProfile?.container || ""}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="Priority"
              defaultValue="Routine"
            >
              <MenuItem value="Routine">Routine</MenuItem>
              <MenuItem value="Urgent">Urgent / STAT</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Collection Time"
              defaultValue="10:30"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <TatIcon sx={{ fontSize: 16, color: T.textMuted }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Batch (optional)"
              placeholder="— No Batch —"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Clinical Notes"
              placeholder="Diagnosis, clinical history..."
            />
          </Grid>
        </Grid>
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
          sx={{
            height: 38,
            px: 3,
            fontSize: "0.8rem",
            fontWeight: 700,
            borderRadius: "9px",
            textTransform: "none",
            bgcolor: T.primary,
            boxShadow: `0 4px 12px ${alpha(T.primary, 0.3)}`,
            "&:hover": {
              bgcolor: T.primaryHover,
              boxShadow: `0 6px 18px ${alpha(T.primary, 0.35)}`,
            },
          }}
        >
          Register Sample
        </Button>
      </Box>
    </CommonDialog>
  );
}

export const RegisterSampleDialog = React.memo(RegisterSampleDialogBase);
