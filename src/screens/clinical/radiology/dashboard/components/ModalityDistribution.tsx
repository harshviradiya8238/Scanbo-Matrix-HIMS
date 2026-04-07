import * as React from "react";
import { Box, Typography } from "@/src/ui/components/atoms";
import { Card, StatTile } from "@/src/ui/components/molecules";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { Science as ScanIcon } from "@mui/icons-material";
import { ModalityBreakdownItem } from "../types";

import SectionHeader from "./SectionHeader";

interface ModalityDistributionProps {
  modalityBreakdown: ModalityBreakdownItem[];
  totalStudies: number;
}

export default function ModalityDistribution({
  modalityBreakdown,
  totalStudies,
}: ModalityDistributionProps) {
  return (
    <Card sx={{ p: 2.5, height: "100%", borderRadius: 3 }}>
      <SectionHeader
        icon={<ScanIcon sx={{ fontSize: 20 }} />}
        title="Modality Distribution"
      />
      <Grid container spacing={1.5}>
        {modalityBreakdown.map((mb) => (
          <Grid key={mb.label} item xs={12} sm={6} md={3}>
            <StatTile
              label={mb.label}
              value={mb.count.toString().padStart(2, "0")}
              subtitle={`${totalStudies > 0 ? Math.round((mb.count / totalStudies) * 100) : 0}% of total studies`}
              tone={
                mb.label === "MRI"
                  ? "primary"
                  : mb.label === "CT"
                    ? "success"
                    : mb.label === "X-Ray"
                      ? "warning"
                      : "info"
              }
              variant="soft"
              sx={{
                height: "100%",
                "& .MuiTypography-h4": {
                  fontSize: "1.5rem",
                  fontWeight: 900,
                },
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}
