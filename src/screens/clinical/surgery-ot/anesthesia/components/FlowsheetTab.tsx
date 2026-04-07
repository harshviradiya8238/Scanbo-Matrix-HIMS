import * as React from "react";
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@/src/ui/components/atoms";
import { Card } from "@/src/ui/components/molecules";
import { EnterpriseStatusChip } from "@/src/screens/clinical/components/EnterpriseUi";
import { WorklistCase } from "../types";
import { UI_THEME, WORKSPACE_PANEL_SX } from "../constants";

export function FlowsheetTab({ caseData }: { caseData: WorklistCase }) {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "grid",
        gap: 0.9,
        gridTemplateColumns: { xs: "1fr", xl: "1.7fr 1fr" },
      }}
    >
      <Card
        elevation={0}
        sx={{
          ...WORKSPACE_PANEL_SX,
          minHeight: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: 0.8,
            borderBottom: "1px solid",
            borderColor: UI_THEME.border,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: UI_THEME.text }}
          >
            Intraoperative Flowsheet
          </Typography>
        </Box>
        <TableContainer sx={{ flex: 1, minHeight: 0 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Parameter</TableCell>
                {caseData.flowsheetTimes.length ? (
                  caseData.flowsheetTimes.map((time) => (
                    <TableCell key={time} align="center">
                      {time}
                    </TableCell>
                  ))
                ) : (
                  <TableCell align="center">No records</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {caseData.flowsheetRows.length ? (
                caseData.flowsheetRows.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell sx={{ fontWeight: 700 }}>{row.label}</TableCell>
                    {row.values.map((value, idx) => (
                      <TableCell
                        key={row.label + idx}
                        align="center"
                        sx={{
                          fontFamily:
                            '"DM Mono","SFMono-Regular",Consolas,monospace',
                        }}
                      >
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography
                      variant="body2"
                      sx={{ color: UI_THEME.textSecondary }}
                    >
                      Flowsheet will populate once intraoperative charting
                      starts.
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
          gridTemplateRows: "1fr 1fr",
        }}
      >
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
            Event Timeline
          </Typography>
          <Stack spacing={0.45} sx={{ maxHeight: "100%", overflow: "auto" }}>
            {caseData.events.length ? (
              caseData.events.map((event) => (
                <Box
                  key={event.time + event.text}
                  sx={{
                    p: 0.55,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: UI_THEME.border,
                    backgroundColor: UI_THEME.panelSoft,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: UI_THEME.violet,
                      fontFamily:
                        '"DM Mono","SFMono-Regular",Consolas,monospace',
                    }}
                  >
                    {event.time}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.78rem" }}>
                    {event.text}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography
                variant="body2"
                sx={{ color: UI_THEME.textSecondary }}
              >
                No event data available.
              </Typography>
            )}
          </Stack>
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
            WHO Checklist Progress
          </Typography>
          <Stack spacing={0.55}>
            {caseData.checklist.map((item) => (
              <Box
                key={item.step + item.owner}
                sx={{
                  p: 0.55,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: UI_THEME.border,
                  backgroundColor: "#fff",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.step}
                  </Typography>
                  <EnterpriseStatusChip
                    label={item.done ? "Done" : "Pending"}
                    tone={item.done ? "active" : "warning"}
                  />
                </Stack>
                <Typography
                  variant="caption"
                  sx={{ color: UI_THEME.textMuted }}
                >
                  Owner: {item.owner}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}
