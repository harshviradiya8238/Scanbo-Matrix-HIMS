import {
  Avatar,
  Box,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";
import { PATIENTS } from "../utils/data";
import { BRAND } from "../utils/tokens";
import type { PacsPatient } from "../utils/types";

interface PatientChangeDialogProps {
  open: boolean;
  onClose: () => void;
  patient: PacsPatient;
  search: string;
  setSearch: (value: string) => void;
  setPatient: (patient: PacsPatient) => void;
}

export default function PatientChangeDialog({
  open,
  onClose,
  patient,
  search,
  setSearch,
  setPatient,
}: PatientChangeDialogProps) {
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px", border: "1px solid #DDE8F0" } }}
      hideActions
      title={
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 15 }}>
            Change Patient
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 400, mt: 0.5 }}
          >
            Search and select a patient to load their study
          </Typography>
        </Box>
      }
      titleSx={{ pb: 1 }}
      contentSx={{ pt: "8px !important" }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Search by name, MRN, or accession..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
        sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <svg width={15} height={15} viewBox="0 0 16 16" fill="none" stroke="#9AAFBF" strokeWidth="2">
                <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" />
              </svg>
            </InputAdornment>
          ),
        }}
      />

      <List disablePadding>
        {PATIENTS.filter((p) =>
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.id.toLowerCase().includes(search.toLowerCase()) ||
          p.accession.toLowerCase().includes(search.toLowerCase())
        ).map((p) => (
          <ListItemButton
            key={p.id}
            selected={p.id === patient.id}
            onClick={() => { setPatient(p); onClose(); }}
            sx={{
              borderRadius: "10px", mb: "6px",
              border: "1px solid",
              borderColor: p.id === patient.id ? BRAND : "#DDE8F0",
              bgcolor: p.id === patient.id ? "#E8F3FB" : "transparent",
              "&.Mui-selected": { bgcolor: "#E8F3FB" },
              "&:hover": { bgcolor: p.id === patient.id ? "#E8F3FB" : "#F5F8FB" },
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ width: 36, height: 36, bgcolor: BRAND, fontSize: 12, fontWeight: 700 }}>
                {p.initials}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{p.name}</Typography>
                  <Typography sx={{ fontSize: 11, color: "#9AAFBF" }}>{p.id}</Typography>
                  {p.critical && (
                    <Box sx={{ px: "8px", py: "2px", borderRadius: "20px", bgcolor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", fontSize: 10, fontWeight: 800 }}>
                      CRITICAL
                    </Box>
                  )}
                </Box>
              }
              secondary={
                <Typography sx={{ fontSize: 11.5, color: "#5A7184", mt: 0.25 }}>
                  {p.modality} · {p.desc} · {p.physician}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </CommonDialog>
  );
}
