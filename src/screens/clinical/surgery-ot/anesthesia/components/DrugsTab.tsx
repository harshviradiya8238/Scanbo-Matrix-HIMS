import * as React from "react";
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
} from "@/src/ui/components/atoms";
import { Card } from "@/src/ui/components/molecules";
import { EnterpriseStatusChip } from "@/src/screens/clinical/components/EnterpriseUi";
import { Add as AddIcon } from "@mui/icons-material";
import { WorklistCase } from "../types";
import { UI_THEME, WORKSPACE_PANEL_SX } from "../constants";

export function DrugsTab({
  caseData,
  onOpenAddDrug,
}: {
  caseData: WorklistCase;
  onOpenAddDrug: () => void;
}) {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "grid",
        gap: 0.9,
        gridTemplateColumns: { xs: "1fr", xl: "1.65fr 1fr" },
        overflow: "hidden",
      }}
    >
      <Card
        elevation={0}
        sx={{ ...WORKSPACE_PANEL_SX, p: 0, overflow: "hidden" }}
      >
        <Box
          sx={{
            p: 0.8,
            borderBottom: "1px solid",
            borderColor: UI_THEME.border,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: UI_THEME.text }}
            >
              Drug Infusions & Boluses
            </Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              sx={{ backgroundColor: UI_THEME.primary }}
              onClick={onOpenAddDrug}
            >
              Add Drug
            </Button>
          </Stack>
        </Box>
        <TableContainer sx={{ height: "calc(100% - 46px)" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Drug</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Rate / Dose</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {caseData.drugs.length ? (
                caseData.drugs.map((drug) => (
                  <TableRow key={drug.name + drug.time} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{drug.name}</TableCell>
                    <TableCell>{drug.route}</TableCell>
                    <TableCell>{drug.rate}</TableCell>
                    <TableCell
                      sx={{
                        fontFamily:
                          '"DM Mono","SFMono-Regular",Consolas,monospace',
                      }}
                    >
                      {drug.time}
                    </TableCell>
                    <TableCell>
                      <EnterpriseStatusChip
                        label={drug.status}
                        tone={drug.tone}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography
                      variant="body2"
                      sx={{ color: UI_THEME.textSecondary }}
                    >
                      No medications documented for this case.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Box
        sx={{
          minHeight: 0,
          display: "grid",
          gap: 0.9,
          gridTemplateRows: "auto auto 1fr",
        }}
      >
        <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.9 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8 }}>
            Medication Safety Checks
          </Typography>
          <Alert
            severity="warning"
            sx={{
              mb: 0.8,
              borderColor: "#f59e0b55",
              backgroundColor: "#fef3c710",
            }}
          >
            Verify allergy contraindications before additional opioid bolus.
          </Alert>
          <Alert
            severity="info"
            sx={{ borderColor: "#3b82f655", backgroundColor: "#dbeafe1a" }}
          >
            Reversal preparation should begin near closure phase.
          </Alert>
        </Card>

        <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.8 }}>
          <Typography
            variant="caption"
            sx={{
              color: UI_THEME.textSecondary,
              fontWeight: 700,
              mb: 0.6,
              display: "block",
            }}
          >
            Surgical Checklist
          </Typography>
          <Stack spacing={0.45}>
            {caseData.checklist.map((item) => (
              <Box
                key={item.step}
                sx={{
                  p: 0.55,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: UI_THEME.border,
                  backgroundColor: UI_THEME.panelSoft,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.step}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: UI_THEME.textMuted }}
                >
                  {item.owner}
                </Typography>
                <Box sx={{ mt: 0.25 }}>
                  <EnterpriseStatusChip
                    label={item.done ? "Completed" : "Pending"}
                    tone={item.done ? "active" : "warning"}
                  />
                </Box>
              </Box>
            ))}
          </Stack>
        </Card>

        <Card
          elevation={0}
          sx={{ ...WORKSPACE_PANEL_SX, p: 0.8, overflow: "hidden" }}
        >
          <Typography
            variant="caption"
            sx={{
              color: UI_THEME.textSecondary,
              fontWeight: 700,
              mb: 0.6,
              display: "block",
            }}
          >
            Case Note
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: UI_THEME.textSecondary, lineHeight: 1.45 }}
          >
            {caseData.notes}
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}
