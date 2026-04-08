import * as React from "react";
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
} from "@/src/ui/components/atoms";
import { CommonDialog } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  CalendarMonth as CalendarMonthIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

interface AuditForm {
  linkedPatient: string;
  wardArea: string;
  score: string;
  auditType: string;
  leadAuditor: string;
  auditDate: string;
  observations: string;
  correctiveActions: string;
}

interface InfectionCase {
  id: string;
  patientName: string;
  bed: string;
  status: string;
  icStatus: string;
}

interface AuditDialogProps {
  open: boolean;
  onClose: () => void;
  cases: InfectionCase[];
  onLogAudit: (data: AuditForm) => void;
  canWrite: boolean;
}

const AuditDialog: React.FC<AuditDialogProps> = ({
  open,
  onClose,
  cases,
  onLogAudit,
  canWrite,
}) => {
  const theme = useTheme();

  const [auditForm, setAuditForm] = React.useState<AuditForm>({
    linkedPatient: "",
    wardArea: "",
    score: "",
    auditType: "Hand Hygiene",
    leadAuditor: "",
    auditDate: "",
    observations: "",
    correctiveActions: "",
  });

  React.useEffect(() => {
    if (open) {
      setAuditForm({
        linkedPatient: "",
        wardArea: "",
        score: "",
        auditType: "Hand Hygiene",
        leadAuditor: "",
        auditDate: "",
        observations: "",
        correctiveActions: "",
      });
    }
  }, [open]);

  const handleSave = () => {
    onLogAudit(auditForm);
  };

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title="Log Audit"
      subtitle="Create or update an IPC compliance audit"
      icon={
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: "primary.main",
          }}
        >
          <SearchIcon sx={{ fontSize: 22 }} />
        </Box>
      }
      maxWidth="md"
      fullWidth
      content={
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Linked Patient (IPD)"
                value={auditForm.linkedPatient}
                onChange={(e) =>
                  setAuditForm((prev) => ({
                    ...prev,
                    linkedPatient: e.target.value,
                  }))
                }
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              >
                <MenuItem value="">— Select —</MenuItem>
                {auditForm.linkedPatient &&
                  !cases.some(
                    (c) =>
                      `${c.patientName} · ${c.bed}` === auditForm.linkedPatient,
                  ) && (
                    <MenuItem value={auditForm.linkedPatient}>
                      {auditForm.linkedPatient}
                    </MenuItem>
                  )}
                {cases
                  .filter(
                    (c) => c.status === "Active" || c.icStatus === "In Audit",
                  )
                  .map((c) => (
                    <MenuItem key={c.id} value={`${c.patientName} · ${c.bed}`}>
                      {c.patientName} · {c.bed}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ward / Area"
                value={auditForm.wardArea}
                onChange={(e) =>
                  setAuditForm((prev) => ({
                    ...prev,
                    wardArea: e.target.value,
                  }))
                }
                placeholder="e.g. Ward 3A · Bed B-12"
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Score (%)"
                type="number"
                value={auditForm.score}
                onChange={(e) =>
                  setAuditForm((prev) => ({ ...prev, score: e.target.value }))
                }
                placeholder="e.g. 85"
                size="small"
                fullWidth
                inputProps={{ min: 0, max: 100 }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Audit Type"
                value={auditForm.auditType}
                onChange={(e) =>
                  setAuditForm((prev) => ({
                    ...prev,
                    auditType: e.target.value,
                  }))
                }
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              >
                <MenuItem value="Hand Hygiene">Hand Hygiene</MenuItem>
                <MenuItem value="PPE Compliance">PPE Compliance</MenuItem>
                <MenuItem value="Env. Cleaning">Env. Cleaning</MenuItem>
                <MenuItem value="Isolation Compliance">
                  Isolation Compliance
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Lead Auditor"
                value={auditForm.leadAuditor}
                onChange={(e) =>
                  setAuditForm((prev) => ({
                    ...prev,
                    leadAuditor: e.target.value,
                  }))
                }
                placeholder="Name / Employee ID"
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Audit Date"
                value={auditForm.auditDate}
                onChange={(e) =>
                  setAuditForm((prev) => ({
                    ...prev,
                    auditDate: e.target.value,
                  }))
                }
                placeholder="dd / mm / yyyy"
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CalendarMonthIcon
                        sx={{ fontSize: 18, color: "text.disabled" }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Observations"
                value={auditForm.observations}
                onChange={(e) =>
                  setAuditForm((prev) => ({
                    ...prev,
                    observations: e.target.value,
                  }))
                }
                placeholder="What was observed during the audit..."
                size="small"
                fullWidth
                multiline
                rows={3}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Corrective Actions Required"
                value={auditForm.correctiveActions}
                onChange={(e) =>
                  setAuditForm((prev) => ({
                    ...prev,
                    correctiveActions: e.target.value,
                  }))
                }
                placeholder="Actions to be taken..."
                size="small"
                fullWidth
                multiline
                rows={3}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Grid>
          </Grid>
        </Box>
      }
      actions={
        <>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!canWrite}
            onClick={handleSave}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Save Audit
          </Button>
        </>
      }
    />
  );
};

export default AuditDialog;
