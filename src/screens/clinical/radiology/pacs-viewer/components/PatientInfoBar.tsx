import React from "react";
import { Avatar, Box, Typography } from "@mui/material";
import { BRAND, BRAND_DARK } from "../utils/tokens";
import type { PacsPatient } from "../utils/types";

interface PatientInfoBarProps {
  patient: PacsPatient;
  onChangePatient: () => void;
}

export default function PatientInfoBar({
  patient,
  onChangePatient,
}: PatientInfoBarProps) {
  return (
    <Box
      sx={{
        bgcolor: "#F5F8FB", height: 48, flexShrink: 0,
        display: "flex", alignItems: "center", px: "18px", gap: 0,
        borderBottom: "1px solid #DDE8F0",
      }}
    >
      <Avatar sx={{ width: 32, height: 32, bgcolor: BRAND, fontSize: 11, fontWeight: 700, mr: "10px", flexShrink: 0 }}>
        {patient.initials}
      </Avatar>
      <Box sx={{ flexShrink: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{patient.name}</Typography>
        <Typography sx={{ fontSize: 10.5, color: "#9AAFBF", mt: "1px" }}>DOB: {patient.dob} · {patient.sex} · ID: {patient.id}</Typography>
      </Box>

      {[
        { label: "Modality", value: patient.modality },
        { label: "Date", value: "2026-03-27" },
        { label: "Description", value: patient.desc },
        { label: "Accession", value: patient.accession },
        { label: "Physician", value: patient.physician },
        { label: "Institution", value: patient.institution },
      ].map((f) => (
        <React.Fragment key={f.label}>
          <Box sx={{ width: "1px", height: 28, bgcolor: "#DDE8F0", mx: "16px", flexShrink: 0 }} />
          <Box sx={{ flexShrink: 0 }}>
            <Typography sx={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "#9AAFBF" }}>
              {f.label}
            </Typography>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#0D1B2A", mt: "1px" }}>
              {f.value}
            </Typography>
          </Box>
        </React.Fragment>
      ))}

      <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
        {patient.critical && (
          <Box sx={{
            px: "14px", py: "5px", borderRadius: "20px",
            bgcolor: "#FEE2E2", border: "1.5px solid #FCA5A5",
            color: "#991B1B", fontSize: "11.5px", fontWeight: 800, letterSpacing: "0.5px",
          }}>
            CRITICAL
          </Box>
        )}
        <Box
          onClick={onChangePatient}
          sx={{
            px: "16px", py: "8px", borderRadius: "10px",
            bgcolor: BRAND, color: "#fff",
            fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center", gap: "6px",
            cursor: "pointer", flexShrink: 0,
            "&:hover": { bgcolor: BRAND_DARK },
          }}
        >
          <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="8" cy="6" r="3" /><path d="M3 14a5 5 0 0110 0M12 4l2 2-2 2" />
          </svg>
          Change Patient
        </Box>
      </Box>
    </Box>
  );
}
