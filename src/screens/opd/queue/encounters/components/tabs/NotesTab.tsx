"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import {
  Bolt as BoltIcon,
  DeleteOutline as DeleteOutlineIcon,
  Description as DescriptionIcon,
  EditOutlined as EditOutlinedIcon,
  Mic as MicIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  TextSnippet as TextSnippetIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { addNote, removeNote, updateNote } from "@/src/store/slices/opdSlice";
import { OpdEncounterCase } from "../../../../opd-mock-data";
import OpdTable from "../../../../components/OpdTable";
import { CommonDialog } from "@/src/ui/components/molecules";

interface NotesTabDraft {
  progressNotes: string;
  patientInstructions: string;
  followupRequired: string;
  followupNotes: string;
}

interface ExternalNoteDraft {
  id: string;
  title: string;
  content: string;
}

interface NoteTemplate {
  id: string;
  name: string;
  content: string;
}

interface NotesTabProps {
  encounter: OpdEncounterCase | undefined;
  canDocumentConsultation: boolean;
  setSnackbar: (snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }) => void;
  guardRoleAction: (allowed: boolean, actionLabel: string) => boolean;
}

const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: "nt-1",
    name: "Standard OPD Note",
    content:
      "Patient presents for routine follow-up. Vital signs stable. Adjustments to treatment plan discussed.",
  },
  {
    id: "nt-2",
    name: "Pre-procedure Note",
    content:
      "Patient cleared for minor procedure. Risks and benefits explained. Consent obtained.",
  },
  {
    id: "nt-3",
    name: "Consultation Request",
    content:
      "Requesting specialist opinion for persistent symptoms. Patient referred to cardiology.",
  },
];

export default function NotesTab({
  encounter,
  canDocumentConsultation,
  setSnackbar,
  guardRoleAction,
}: NotesTabProps) {
  const dispatch = useAppDispatch();
  const allNotes = useAppSelector((state) => state.opd.notes);

  const encounterNotes = React.useMemo(() => {
    if (!encounter) return [];
    return allNotes.filter((item) => item.patientId === encounter.id);
  }, [allNotes, encounter?.id]);

  const [notesTabDraft, setNotesTabDraft] = React.useState<NotesTabDraft>({
    progressNotes: "",
    patientInstructions: "",
    followupRequired: "No",
    followupNotes: "",
  });
  const [selectedNoteTemplateId, setSelectedNoteTemplateId] = React.useState(
    NOTE_TEMPLATES[0].id,
  );
  const [externalNoteDialogOpen, setExternalNoteDialogOpen] =
    React.useState(false);
  const [editingExternalNoteId, setEditingExternalNoteId] = React.useState<
    string | null
  >(null);
  const [externalNoteDraft, setExternalNoteDraft] =
    React.useState<ExternalNoteDraft>({
      id: "",
      title: "",
      content: "",
    });
  const [voiceConsentTranscript, setVoiceConsentTranscript] =
    React.useState("");
  const [voiceConsentCapturedAt, setVoiceConsentCapturedAt] =
    React.useState("");

  const handleOpenExternalNoteDialog = () => {
    if (
      !guardRoleAction(canDocumentConsultation, "create custom external notes")
    )
      return;
    setEditingExternalNoteId(null);
    setExternalNoteDraft({ id: "", title: "", content: "" });
    setExternalNoteDialogOpen(true);
  };

  const handleEditExternalNote = (noteId: string) => {
    if (!guardRoleAction(canDocumentConsultation, "edit consultation notes"))
      return;
    const selected = encounterNotes.find((item) => item.id === noteId);
    if (!selected) return;
    setExternalNoteDraft({
      id: selected.id,
      title: selected.title,
      content: selected.content,
    });
    setEditingExternalNoteId(selected.id);
    setExternalNoteDialogOpen(true);
  };

  const handleDeleteExternalNote = (noteId: string) => {
    if (!guardRoleAction(canDocumentConsultation, "delete consultation notes"))
      return;
    dispatch(removeNote(noteId));
    setSnackbar({
      open: true,
      message: "Consultation note removed.",
      severity: "success",
    });
  };

  const handleSaveExternalNote = () => {
    if (!guardRoleAction(canDocumentConsultation, "save custom notes")) return;
    if (!encounter) return;

    if (!externalNoteDraft.title.trim() || !externalNoteDraft.content.trim()) {
      setSnackbar({
        open: true,
        message: "Title and content are required.",
        severity: "error",
      });
      return;
    }

    const savedAt = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (editingExternalNoteId) {
      dispatch(
        updateNote({
          id: editingExternalNoteId,
          changes: {
            title: externalNoteDraft.title,
            content: externalNoteDraft.content,
            savedAt,
          },
        }),
      );
      setExternalNoteDialogOpen(false);
      setEditingExternalNoteId(null);
      setSnackbar({
        open: true,
        message: "Note updated successfully.",
        severity: "success",
      });
      return;
    }

    dispatch(
      addNote({
        id: `external-${Date.now()}`,
        patientId: encounter.id,
        title: externalNoteDraft.title,
        content: externalNoteDraft.content,
        savedAt,
        author: encounter.doctor,
      }),
    );

    setExternalNoteDialogOpen(false);
    setSnackbar({
      open: true,
      message: "Custom note added.",
      severity: "success",
    });
  };

  const handleInsertNotesTemplate = () => {
    const selected = NOTE_TEMPLATES.find(
      (t) => t.id === selectedNoteTemplateId,
    );
    if (selected) {
      setNotesTabDraft((prev) => ({
        ...prev,
        progressNotes: prev.progressNotes
          ? `${prev.progressNotes}\n\n${selected.content}`
          : selected.content,
      }));
    }
  };

  const handleInsertNotesMacro = () => {
    const macro =
      "Patient continues medication as prescribed. Stable progress.";
    setNotesTabDraft((prev) => ({
      ...prev,
      progressNotes: prev.progressNotes
        ? `${prev.progressNotes} ${macro}`
        : macro,
    }));
  };

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
              setNotesTabDraft((prev: any) => ({
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
              {NOTE_TEMPLATES.map((template) => (
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
              : "No voice consent has been recorded for this encounter."}
          </Alert>
          <Stack direction="row" spacing={0.8}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MicIcon />}
              disabled={!canDocumentConsultation}
              onClick={() => {
                setVoiceConsentTranscript(
                  "I agree to the proposed treatment plan.",
                );
                setVoiceConsentCapturedAt(new Date().toLocaleTimeString());
              }}
            >
              Capture Voice Consent
            </Button>
          </Stack>
        </Stack>
      </Card>

      <OpdTable
        title="Consultation History & Notes"
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<DescriptionIcon />}
            disabled={!canDocumentConsultation}
            onClick={handleOpenExternalNoteDialog}
          >
            + Create Custom Note
          </Button>
        }
        rows={encounterNotes}
        emptyMessage="No consultation notes captured for this patient."
        rowKey={(row) => row.id}
        variant="card"
        columns={[
          {
            id: "title",
            label: "Note Title",
            render: (row) => (
              <Stack spacing={0.15}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {row.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.savedAt} • {row.author}
                </Typography>
              </Stack>
            ),
          },
          {
            id: "content",
            label: "Content Snippet",
            render: (row) => (
              <Typography
                variant="caption"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {row.content}
              </Typography>
            ),
          },
          {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (row) => (
              <Stack direction="row" justifyContent="flex-end" spacing={0.25}>
                <IconButton
                  size="small"
                  aria-label="Edit note"
                  disabled={!canDocumentConsultation}
                  onClick={() => handleEditExternalNote(row.id)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Delete note"
                  color="error"
                  disabled={!canDocumentConsultation}
                  onClick={() => handleDeleteExternalNote(row.id)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ),
          },
        ]}
      />

      <CommonDialog
        open={externalNoteDialogOpen}
        onClose={() => setExternalNoteDialogOpen(false)}
        maxWidth="sm"
        title={
          editingExternalNoteId ? "Edit Custom Note" : "Create Custom Note"
        }
        icon={<DescriptionIcon fontSize="small" />}
        contentDividers
        content={
          <Stack spacing={1.2}>
            <TextField
              fullWidth
              label="Note Title"
              value={externalNoteDraft.title}
              onChange={(e) =>
                setExternalNoteDraft((p: any) => ({
                  ...p,
                  title: e.target.value,
                }))
              }
            />
            <TextField
              fullWidth
              multiline
              minRows={5}
              label="Note Content"
              value={externalNoteDraft.content}
              onChange={(e) =>
                setExternalNoteDraft((p: any) => ({
                  ...p,
                  content: e.target.value,
                }))
              }
            />
          </Stack>
        }
        actions={
          <>
            <Button onClick={() => setExternalNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<DescriptionIcon />}
              onClick={handleSaveExternalNote}
            >
              {editingExternalNoteId ? "Update Note" : "Save Note"}
            </Button>
          </>
        }
      />
    </Stack>
  );
}
