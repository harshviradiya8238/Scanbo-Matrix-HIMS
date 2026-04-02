import * as React from "react";
import {
  History as HistoryIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  TextSnippet as TextSnippetIcon,
  HistoryEdu as HistoryEduIcon,
  LibraryAdd as LibraryAddIcon,
} from "@mui/icons-material";
import {
  Button,
  Card,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { OpdVisitData } from "../utils/opd-visit-types";

export const HistoryTab = ({ data }: { data: OpdVisitData }) => {
  const {
    historyDraft,
    setHistoryDraft,
    setSoap,
    handleUseComplaintTemplate,
    handleAddSymptom,
    handleViewPastHistory,
  } = data;

  return (
    <Stack spacing={1.2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <HistoryIcon color="primary" fontSize="small" />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          History
        </Typography>
      </Stack>
      <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
        <Stack spacing={1.1}>
          <Stack direction="row" spacing={0.6} alignItems="center">
            <RecordVoiceOverIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Chief Complaint
            </Typography>
          </Stack>
          <TextField
            fullWidth
            required
            multiline
            minRows={3}
            label="Primary Complaint"
            value={historyDraft.chiefComplaint}
            onChange={(event) => {
              setHistoryDraft((prev) => ({
                ...prev,
                chiefComplaint: event.target.value,
              }));
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Brief description of the patient&apos;s main concern.
          </Typography>
          <Stack direction="row" spacing={0.8} flexWrap="wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<TextSnippetIcon />}
              onClick={handleUseComplaintTemplate}
            >
              Use Template
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
        <Stack spacing={1.1}>
          <Stack direction="row" spacing={0.6} alignItems="center">
            <HistoryEduIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              History of Present Illness (HPI)
            </Typography>
          </Stack>
          <TextField
            fullWidth
            multiline
            minRows={6}
            label="Detailed History"
            value={historyDraft.hpi}
            onChange={(event) => {
              const nextHpi = event.target.value;
              setHistoryDraft((prev) => ({ ...prev, hpi: nextHpi }));
              setSoap((prev) => ({ ...prev, subjective: nextHpi }));
            }}
          />
          <Grid container spacing={1.2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Duration"
                value={historyDraft.duration}
                onChange={(event) => {
                  setHistoryDraft((prev) => ({
                    ...prev,
                    duration: event.target.value,
                  }));
                }}
              >
                <MenuItem value="">Select duration</MenuItem>
                {[
                  "Less than 24 hours",
                  "1-3 days",
                  "4-7 days",
                  "1-2 weeks",
                  "2-4 weeks",
                  "More than 1 month",
                ].map((durationOption) => (
                  <MenuItem key={durationOption} value={durationOption}>
                    {durationOption}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Severity"
                value={historyDraft.severity}
                onChange={(event) => {
                  setHistoryDraft((prev) => ({
                    ...prev,
                    severity: event.target.value,
                  }));
                }}
              >
                <MenuItem value="">Select severity</MenuItem>
                {["Mild", "Moderate", "Severe"].map((severityOption) => (
                  <MenuItem key={severityOption} value={severityOption}>
                    {severityOption}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={0.8} flexWrap="wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<LibraryAddIcon />}
              onClick={handleAddSymptom}
            >
              Add Symptom
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<HistoryIcon />}
              onClick={handleViewPastHistory}
            >
              Past History
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
};
