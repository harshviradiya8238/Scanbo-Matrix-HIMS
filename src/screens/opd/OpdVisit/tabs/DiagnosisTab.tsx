import * as React from "react";
import {
  Biotech as BiotechIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  EditOutlined as EditOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
} from "@mui/icons-material";
import {
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { OpdVisitData } from "../utils/opd-visit-types";
import OpdTable from "../../common/components/OpdTable";

export const DiagnosisTab = ({ data }: { data: OpdVisitData }) => {
  const {
    diagnosisLines,
    capabilities,
    openDiagnosisDialog,
    handleEditDiagnosis,
    handleDeleteDiagnosis,
    soap,
    setSoap,
    saveClinicalNote,
  } = data;
  return (
    <Stack spacing={1.2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <BiotechIcon color="primary" fontSize="small" />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Diagnosis
        </Typography>
      </Stack>
      <OpdTable
        title="Diagnosis List"
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<BiotechIcon />}
            disabled={!capabilities.canDocumentConsultation}
            onClick={openDiagnosisDialog}
          >
            Manage Diagnosis
          </Button>
        }
        rows={diagnosisLines}
        emptyMessage="No diagnosis added yet."
        rowKey={(row: any) => row.id}
        variant="card"
        columns={[
          {
            id: "diagnosis",
            label: "Diagnosis",
            render: (row: any) => (
              <Stack spacing={0.2}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {row.diagnosisName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.icd10 || "ICD code not set"}
                </Typography>
              </Stack>
            ),
          },
          { id: "type", label: "Type", render: (row: any) => row.type },
          {
            id: "status",
            label: "Status",
            render: (row: any) => (
              <Chip
                size="small"
                label={row.status}
                color={
                  row.status === "Active"
                    ? "success"
                    : row.status === "Resolved"
                      ? "default"
                      : "warning"
                }
                variant={row.status === "Active" ? "filled" : "outlined"}
              />
            ),
          },
          {
            id: "notes",
            label: "Notes",
            render: (row: any) => row.notes || "--",
          },
          {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (row: any) => (
              <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                <IconButton
                  size="small"
                  aria-label="Edit diagnosis"
                  disabled={!capabilities.canDocumentConsultation}
                  onClick={() => handleEditDiagnosis(row.id)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Delete diagnosis"
                  color="error"
                  disabled={!capabilities.canDocumentConsultation}
                  onClick={() => handleDeleteDiagnosis(row.id)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ),
          },
        ]}
      />

      <Stack spacing={1}>
        <Stack direction="row" spacing={0.8} alignItems="center">
          <DescriptionIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Assessment & Plan
          </Typography>
        </Stack>
        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Clinical Assessment"
          value={soap.assessment}
          onChange={(event) =>
            setSoap((prev) => ({ ...prev, assessment: event.target.value }))
          }
        />
        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Treatment Plan"
          value={soap.plan}
          onChange={(event) =>
            setSoap((prev) => ({ ...prev, plan: event.target.value }))
          }
        />
      </Stack>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={!capabilities.canDocumentConsultation}
          onClick={saveClinicalNote}
        >
          Save Consultation Note
        </Button>
      </Stack>
    </Stack>
  );
};
