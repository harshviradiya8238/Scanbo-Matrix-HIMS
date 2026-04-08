import * as React from "react";
import {
  Box,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@/src/ui/components/atoms";
import type { LabSample } from "../../../lab-types";

export interface DashboardRecentSamplesProps {
  samples: LabSample[];
  sampleStatus: any;
  cardSx: any;
  tableContainerSx: any;
  chipSx: (color: any) => any;
  onSampleClick: (id: string) => void;
}

export default function DashboardRecentSamples({
  samples,
  sampleStatus,
  cardSx,
  tableContainerSx,
  chipSx,
  onSampleClick,
}: DashboardRecentSamplesProps) {
  return (
    <Card 
    >
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography
          variant="overline"
          sx={{
            color: "primary.main",
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          Recent samples
        </Typography>
      </Box>
      <TableContainer sx={tableContainerSx}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...samples]
              .reverse()
              .slice(0, 6)
              .map((s) => {
                const cfg = sampleStatus[s.status];
                return (
                  <TableRow
                    key={s.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => onSampleClick(s.id)}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>
                      {s.id}
                    </TableCell>
                    <TableCell>{s.patient}</TableCell>
                    <TableCell>{s.type}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={cfg.label}
                        sx={chipSx(cfg.color)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
