import * as React from "react";
import {
  Medication as MedicationIcon,
  LocalPharmacy as LocalPharmacyIcon,
  EditOutlined as EditOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@/src/ui/components/atoms";
import { OpdVisitData } from "../utils/opd-visit-types";
import OpdTable from "../../common/components/OpdTable";

export const PrescriptionsTab = ({ data }: { data: OpdVisitData }) => {
  const {
    encounterPrescriptions,
    capabilities,
    handleOpenRxShieldComparison,
    openPrescriptionDialog,
    handleEditPrescription,
    handleDeletePrescription,
  } = data;

  return (
    <Stack spacing={1}>
      <OpdTable
        title="Current Medication & Prescriptions"
        action={
          <Stack direction="row" spacing={0.8}>
            {encounterPrescriptions.length >= 2 ? (
              <Button
                variant="outlined"
                size="small"
                startIcon={<MedicationIcon />}
                disabled={!capabilities.canPrescribe}
                onClick={handleOpenRxShieldComparison}
              >
                Rx Shield
              </Button>
            ) : null}
            <Button
              variant="outlined"
              size="small"
              startIcon={<LocalPharmacyIcon />}
              disabled={!capabilities.canPrescribe}
              onClick={openPrescriptionDialog}
            >
              + Add Prescription
            </Button>
          </Stack>
        }
        rows={encounterPrescriptions}
        emptyMessage="No prescriptions on this encounter."
        rowKey={(row: any) => row.id}
        variant="card"
        columns={[
          {
            id: "drug",
            label: "Medication",
            render: (row: any) => row.medicationName,
          },
          { id: "dose", label: "Dose", render: (row: any) => row.dose },
          {
            id: "freq",
            label: "Frequency",
            render: (row: any) => row.frequency,
          },
          {
            id: "duration",
            label: "Duration",
            render: (row: any) => `${row.durationDays} days`,
          },
          {
            id: "actions",
            label: "Actions",
            align: "right",
            render: (row: any) => (
              <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                <IconButton
                  size="small"
                  aria-label="Edit prescription"
                  disabled={!capabilities.canPrescribe}
                  onClick={() => handleEditPrescription(row.id)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Delete prescription"
                  color="error"
                  disabled={!capabilities.canPrescribe}
                  onClick={() => handleDeletePrescription(row.id)}
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
