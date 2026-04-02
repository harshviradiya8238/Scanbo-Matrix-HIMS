import * as React from "react";
import {
  Description as DescriptionIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  TextSnippet as TextSnippetIcon,
  Bolt as BoltIcon,
  Timer as TimerIcon,
  EditOutlined as EditOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
} from "@mui/icons-material";
import {
  Alert,
  Button,
  Card,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { OpdVisitData } from "../utils/opd-visit-types";
import { FOLLOWUP_OPTIONS } from "../utils/opd-visit.utils";
import OpdTable from "../../common/components/OpdTable";
import { useOpdData } from "@/src/store/opdHooks";

export const NotesTab = ({ data }: { data: OpdVisitData }) => {
  const {
    notesTabDraft,
    setNotesTabDraft,
    selectedNoteTemplateId,
    setSelectedNoteTemplateId,
    handleInsertNotesTemplate,
    handleInsertNotesMacro,
    voiceConsentTranscript,
    setVoiceConsentTranscript,
    voiceConsentCapturedAt,
    capabilities,
    handleGenerateHandout,
    handleScheduleFollowup,
    encounterNotes,
    openNotesDialog,
    handleEditNote,
    handleDeleteNote,
  } = data;

  const { noteTemplates } = useOpdData();

  return (
    <Stack spacing={1.2}>
      <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
        <Stack spacing={1.1}>
          <Stack direction="row" spacing={0.6} alignItems="center">
            <DescriptionIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Additional Notes
            </Typography>
          </Stack>
          <TextField
            fullWidth
            multiline
            minRows={8}
            label="Additional Notes"
            value={notesTabDraft.progressNotes}
            onChange={(event) =>
              setNotesTabDraft((prev) => ({
                ...prev,
                progressNotes: event.target.value,
              }))
            }
          />
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={0.8}
            flexWrap="wrap"
          >
            <TextField
              select
              size="small"
              label="Template"
              value={selectedNoteTemplateId}
              onChange={(event) =>
                setSelectedNoteTemplateId(event.target.value)
              }
              sx={{ minWidth: { xs: "100%", md: 220 } }}
            >
              {noteTemplates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              size="small"
              startIcon={<TextSnippetIcon />}
              onClick={handleInsertNotesTemplate}
            >
              Template
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BoltIcon />}
              onClick={handleInsertNotesMacro}
            >
              Macro
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
        <Stack spacing={1.1}>
          <Stack direction="row" spacing={0.6} alignItems="center">
            <RecordVoiceOverIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Patient Consent (Voice)
            </Typography>
          </Stack>
          <Alert severity={voiceConsentTranscript ? "success" : "warning"}>
            {voiceConsentTranscript
              ? `Voice consent captured${voiceConsentCapturedAt ? ` at ${voiceConsentCapturedAt}` : ""}.`
              : "Voice consent is pending for this consultation."}
          </Alert>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Consent Transcript"
            value={voiceConsentTranscript}
            onChange={(event) => setVoiceConsentTranscript(event.target.value)}
          />
          <Typography variant="caption" color="text.secondary">
            Use header `Ambient Consult` button to capture conversation and
            auto-fill consent.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={0.8}>
            <Button
              variant="text"
              size="small"
              disabled={!voiceConsentTranscript}
              onClick={() => {
                setVoiceConsentTranscript("");
                // We'd need to clear capturedAt too, but it's in data
              }}
            >
              Clear Consent
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
        <Stack spacing={1.1}>
          <Stack direction="row" spacing={0.6} alignItems="center">
            <TextSnippetIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Instructions
            </Typography>
          </Stack>
          <TextField
            fullWidth
            multiline
            minRows={6}
            label="Patient Instructions"
            value={notesTabDraft.patientInstructions}
            onChange={(event) =>
              setNotesTabDraft((prev) => ({
                ...prev,
                patientInstructions: event.target.value,
              }))
            }
          />
          <Stack direction="row">
            <Button
              variant="outlined"
              size="small"
              startIcon={<DescriptionIcon />}
              disabled={!capabilities.canDocumentConsultation}
              onClick={handleGenerateHandout}
            >
              Generate Handout
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
        <Stack spacing={1.1}>
          <Stack direction="row" spacing={0.6} alignItems="center">
            <TimerIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Follow-up
            </Typography>
          </Stack>
          <TextField
            select
            fullWidth
            label="Follow-up Required"
            value={notesTabDraft.followupRequired}
            onChange={(event) =>
              setNotesTabDraft((prev) => ({
                ...prev,
                followupRequired: event.target.value,
              }))
            }
          >
            <MenuItem value="">Select follow-up timeframe</MenuItem>
            {FOLLOWUP_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Follow-up Notes"
            value={notesTabDraft.followupNotes}
            onChange={(event) =>
              setNotesTabDraft((prev) => ({
                ...prev,
                followupNotes: event.target.value,
              }))
            }
          />
          <Stack direction="row">
            <Button
              variant="contained"
              size="small"
              startIcon={<TimerIcon />}
              disabled={!capabilities.canDocumentConsultation}
              onClick={handleScheduleFollowup}
            >
              Schedule Follow-up
            </Button>
          </Stack>
        </Stack>
      </Card>

      <OpdTable
        title="Saved Additional Notes"
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<DescriptionIcon />}
            disabled={!capabilities.canDocumentConsultation}
            onClick={openNotesDialog}
          >
            Manage Additional Notes
          </Button>
        }
        rows={encounterNotes}
        emptyMessage="No consultation notes saved yet."
        rowKey={(row: any) => row.id}
        variant="card"
        columns={[
          {
            id: "title",
            label: "Title",
            render: (row: any) => (
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {row.title}
              </Typography>
            ),
          },
          {
            id: "preview",
            label: "Preview",
            render: (row: any) => (
              <Typography variant="caption" color="text.secondary">
                {row.content.split("\n")[0] || "--"}
              </Typography>
            ),
          },
          {
            id: "savedAt",
            label: "Saved At",
            render: (row: any) => row.savedAt,
          },
          { id: "author", label: "Author", render: (row: any) => row.author },
          {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (row: any) => (
              <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                <IconButton
                  size="small"
                  aria-label="Edit note"
                  disabled={!capabilities.canDocumentConsultation}
                  onClick={() => handleEditNote(row.id)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Delete note"
                  color="error"
                  disabled={!capabilities.canDocumentConsultation}
                  onClick={() => handleDeleteNote(row.id)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ),
          },
        ]}
      />
    </Stack>
  );
};
