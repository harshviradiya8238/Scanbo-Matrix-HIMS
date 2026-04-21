import React from "react";
import { Theme, alpha } from "@mui/material/styles";
import {
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { Card, CommonTable } from "@/src/ui/components/molecules";
import {
  EnterpriseSectionTitle,
  EnterpriseStatusChip,
  EnterpriseTimeline,
} from "../../../components/EnterpriseUi";
import {
  FactCheck as FactCheckIcon,
  TaskAlt as TaskAltIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import {
  OtCase,
  VitalReading,
  PreOpChecklistItemState,
  InstrumentCountRow,
  MedicationRow,
  DischargeMedicationRow,
  WorkspaceTab,
  PREOP_TIMELINE,
  INTRAOP_TIMELINE,
  POSTOP_CHECKLIST_ITEMS,
  toneToBg,
  toStatusTone,
} from "../OpTimeData";

export interface WorkspaceProps {
  selectedCase: OtCase;
  theme: Theme;
  workspaceCardSx: any;
  preOpChecklistRows: { label: string; done: boolean; time: string }[];
  preOpVitals: VitalReading[];
  intraOpVitals: VitalReading[];
  postOpVitals: VitalReading[];
  instrumentRows: InstrumentCountRow[];
  intraOpMedicationRows: MedicationRow[];
  dischargeMedicationRows: DischargeMedicationRow[];
  togglePreOpChecklistItem: (index: number) => void;
  countColumns: any;
  medicationColumns: any;
  dischargeMedicationColumns: any;
  onAddDischargeClick: () => void;
  onAddEventClick: () => void;
  onVerifyCountClick: () => void;
  onAddIntraOpMedClick: () => void;
  intraOpEvents: any[];
}

export const PreOpWorkspacePanel: React.FC<WorkspaceProps> = ({
  selectedCase,
  theme,
  workspaceCardSx,
  preOpChecklistRows,
  preOpVitals,
  togglePreOpChecklistItem,
}) => (
  <Stack spacing={1.1} sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 0.5 }}>
    <Grid container spacing={1.1}>
      <Grid item xs={12} md={4}>
        <Stack spacing={1.1} sx={{ height: "100%" }}>
          <Card elevation={0} sx={{ ...workspaceCardSx, flex: 1 }}>
            <EnterpriseSectionTitle title="Pre-Op Checklist" />
            <Stack spacing={0.6}>
              {preOpChecklistRows.map((item, index) => (
                <Stack
                  key={item.label}
                  direction="row"
                  spacing={0.8}
                  alignItems="center"
                  onClick={() => togglePreOpChecklistItem(index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      togglePreOpChecklistItem(index);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  sx={{
                    px: 1,
                    py: 0.6,
                    borderRadius: 1.2,
                    border: "1px solid",
                    borderColor: item.done ? alpha("#2FA77A", 0.4) : "divider",
                    bgcolor: item.done
                      ? alpha("#2FA77A", 0.12)
                      : "background.paper",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      borderColor: item.done
                        ? alpha("#2FA77A", 0.52)
                        : alpha(theme.palette.primary.main, 0.28),
                      bgcolor: item.done
                        ? alpha("#2FA77A", 0.17)
                        : alpha(theme.palette.primary.main, 0.06),
                    },
                  }}
                >
                  {item.done ? (
                    <TaskAltIcon sx={{ fontSize: 16, color: "#2FA77A" }} />
                  ) : (
                    <FactCheckIcon
                      sx={{ fontSize: 16, color: "text.disabled" }}
                    />
                  )}
                  <Typography
                    variant="caption"
                    sx={{ flex: 1, fontWeight: 600 }}
                  >
                    {item.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.time}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Card>
        </Stack>
      </Grid>
      <Grid item xs={12} md={8}>
        <Stack spacing={1.1} sx={{ height: "100%" }}>
          <Card elevation={0} sx={workspaceCardSx}>
            <EnterpriseSectionTitle title="Pre-Operative Notes" />
            <Grid container spacing={0.85}>
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  label="Pre-Operative Diagnosis"
                  value={selectedCase.diagnosis}
                />
              </Grid>
              <Grid item xs={6} md={2.5}>
                <TextField
                  fullWidth
                  select
                  label="ASA"
                  value={selectedCase.asaClass}
                  SelectProps={{ native: true }}
                >
                  <option value="ASA I">ASA I</option>
                  <option value="ASA II">ASA II</option>
                  <option value="ASA III">ASA III</option>
                  <option value="ASA IV">ASA IV</option>
                </TextField>
              </Grid>
              <Grid item xs={6} md={2.5}>
                <TextField
                  fullWidth
                  label="Duration (min)"
                  value={selectedCase.estimatedDurationMin}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  defaultValue={`Patient prepared for ${selectedCase.procedure}. Site verification and WHO timeout checklist confirmed by OT nursing.`}
                />
              </Grid>
            </Grid>
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 0.9 }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<SaveIcon fontSize="small" />}
              >
                Save Notes
              </Button>
            </Stack>
          </Card>
          <Grid container spacing={1.1} sx={{ flex: 1 }}>
            <Grid item xs={12} md={5}>
              <Card elevation={0} sx={workspaceCardSx}>
                <EnterpriseSectionTitle title="Pre-Op Vitals" />
                <Grid container spacing={0.7}>
                  {preOpVitals.map((vital) => (
                    <Grid item key={vital.label} xs={6}>
                      <Box
                        sx={{
                          p: 0.9,
                          borderRadius: 1.2,
                          bgcolor: toneToBg(vital.tone),
                          border: "1px solid",
                          borderColor: alpha("#1172BA", 0.15),
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {vital.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {vital.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={12} md={7}>
              <Card elevation={0} sx={workspaceCardSx}>
                <EnterpriseSectionTitle title="Case Timeline" />
                <EnterpriseTimeline items={PREOP_TIMELINE} />
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  </Stack>
);

export const IntraOpWorkspacePanel: React.FC<WorkspaceProps> = ({
  workspaceCardSx,
  intraOpVitals,
  instrumentRows,
  countColumns,
  intraOpMedicationRows,
  medicationColumns,
  onAddEventClick,
  onVerifyCountClick,
  onAddIntraOpMedClick,
  intraOpEvents,
}) => (
  <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 0.5 }}>
    <Grid container spacing={1.1}>
      <Grid item xs={12} md={7}>
        <Card elevation={0} sx={workspaceCardSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.8 }}
          >
            <EnterpriseSectionTitle title="Intra-Op Events" />
            <Button size="small" variant="outlined" onClick={onAddEventClick}>
              + Add Event
            </Button>
          </Stack>
          <EnterpriseTimeline items={intraOpEvents} />
        </Card>
      </Grid>
      <Grid item xs={12} md={5}>
        <Card elevation={0} sx={workspaceCardSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <EnterpriseSectionTitle title="Live Vitals" />
            <Chip size="small" label="LIVE" color="success" />
          </Stack>
          <Grid container spacing={0.7}>
            {intraOpVitals.map((vital) => (
              <Grid item key={vital.label} xs={6}>
                <Box
                  sx={{
                    p: 0.9,
                    borderRadius: 1.2,
                    bgcolor: toneToBg(vital.tone),
                    border: "1px solid",
                    borderColor: alpha("#1172BA", 0.15),
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {vital.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {vital.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card elevation={0} sx={workspaceCardSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.8 }}
          >
            <EnterpriseSectionTitle title="Instrument & Swab Count" />
            <Button size="small" variant="outlined" onClick={onVerifyCountClick}>
              Verify
            </Button>
          </Stack>
          <CommonTable
            rows={instrumentRows}
            columns={countColumns}
            getRowId={(row: InstrumentCountRow) => row.id}
            emptyMessage="No count records."
            initialRowsPerPage={4}
            rowsPerPageOptions={[4]}
          />
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card elevation={0} sx={workspaceCardSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.8 }}
          >
            <EnterpriseSectionTitle title="Intra-Op Medications" />
            <Button size="small" variant="outlined" onClick={onAddIntraOpMedClick}>
              + Add
            </Button>
          </Stack>
          <CommonTable
            rows={intraOpMedicationRows}
            columns={medicationColumns}
            getRowId={(row: MedicationRow) => row.id}
            emptyMessage="No medication entries."
            initialRowsPerPage={4}
            rowsPerPageOptions={[4]}
          />
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card elevation={0} sx={workspaceCardSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.8 }}
          >
            <EnterpriseSectionTitle title="Surgeon's Operative Notes" />
            <Button
              size="small"
              variant="contained"
              startIcon={<SaveIcon fontSize="small" />}
            >
              Save Notes
            </Button>
          </Stack>
          <TextField
            fullWidth
            multiline
            minRows={4}
            defaultValue="Procedure progressing as planned. Critical structures identified and preserved. Estimated blood loss ~150 ml."
          />
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export const PostOpWorkspacePanel: React.FC<WorkspaceProps> = ({
  theme,
  workspaceCardSx,
  postOpVitals,
  dischargeMedicationRows,
  dischargeMedicationColumns,
  onAddDischargeClick,
}) => (
  <Stack spacing={1.1} sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 0.5 }}>
    <Grid container spacing={1.1}>
      <Grid item xs={12} md={7}>
        <Card elevation={0} sx={{ ...workspaceCardSx, height: "auto" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <EnterpriseSectionTitle title="Recovery Summary" />
            <EnterpriseStatusChip label="PACU Cleared" tone="completed" />
          </Stack>
          <Grid container spacing={0.8}>
            {[
              { label: "Surgery End", value: "09:32 AM" },
              { label: "PACU In", value: "09:40 AM" },
              { label: "PACU Out", value: "11:10 AM" },
              { label: "Transferred", value: "Ward 4B" },
              { label: "Aldrete", value: "9 / 10" },
              { label: "Pain Score", value: "3 / 10" },
              { label: "Blood Loss", value: "~150 ml" },
              { label: "Fluids", value: "1200 ml" },
            ].map((stat) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1.2,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.16),
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Grid>
      <Grid item xs={12} md={5}>
        <Card elevation={0} sx={workspaceCardSx}>
          <EnterpriseSectionTitle title="Post-Op Vitals" />
          <Grid container spacing={0.7}>
            {postOpVitals.map((vital) => (
              <Grid item key={vital.label} xs={6}>
                <Box
                  sx={{
                    p: 0.9,
                    borderRadius: 1.2,
                    bgcolor: toneToBg(vital.tone),
                    border: "1px solid",
                    borderColor: alpha("#1172BA", 0.15),
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {vital.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {vital.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Grid>
      <Grid item xs={12} md={5}>
        <Card elevation={0} sx={workspaceCardSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.8 }}
          >
            <EnterpriseSectionTitle title="Discharge Medications" />
            <Button size="small" variant="outlined" onClick={onAddDischargeClick}>
              + Add
            </Button>
          </Stack>
          <CommonTable
            rows={dischargeMedicationRows}
            columns={dischargeMedicationColumns}
            getRowId={(row: DischargeMedicationRow) => row.id}
            searchBy={(row: DischargeMedicationRow) =>
              `${row.drug} ${row.dose} ${row.frequency} ${row.duration} ${row.instructions}`
            }
            searchPlaceholder="Search discharge medications..."
            emptyMessage="No discharge medications."
            initialRowsPerPage={4}
            rowsPerPageOptions={[4]}
          />
        </Card>
      </Grid>
      <Grid item xs={12} md={7}>
        <Card elevation={0} sx={workspaceCardSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.8 }}
          >
            <EnterpriseSectionTitle title="Surgeon's Post-Op Note" />
            <Button
              size="small"
              variant="contained"
              startIcon={<SaveIcon fontSize="small" />}
            >
              Complete & Discharge
            </Button>
          </Stack>
          <Stack spacing={0.8}>
            <TextField
              fullWidth
              multiline
              minRows={4}
              defaultValue="Laparoscopic cholecystectomy completed without complications. Patient stable in PACU and tolerating oral clear fluids."
            />
            <TextField
              fullWidth
              type="date"
              label="Follow-up Date"
              value="2026-04-03"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card elevation={0} sx={workspaceCardSx}>
          <EnterpriseSectionTitle title="Post-Op Checklist" />
          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
            {POSTOP_CHECKLIST_ITEMS.map((item) => (
              <Chip
                key={item}
                size="small"
                icon={<TaskAltIcon fontSize="small" />}
                label={item}
                color="success"
                variant="outlined"
              />
            ))}
          </Stack>
        </Card>
      </Grid>
    </Grid>
  </Stack>
);

export const renderWorkspacePanel = (
  workspaceTab: WorkspaceTab,
  props: WorkspaceProps,
) => {
  if (workspaceTab === "preop") {
    return <PreOpWorkspacePanel {...props} />;
  }

  if (workspaceTab === "intraop") {
    return <IntraOpWorkspacePanel {...props} />;
  }

  if (workspaceTab === "postop") {
    return <PostOpWorkspacePanel {...props} />;
  }

  return null;
};
