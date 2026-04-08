import * as React from "react";
import { Box, Card, Chip, Typography } from "@/src/ui/components/atoms";
import { LAB_CARD_BORDER_RADIUS } from "../../../lab-theme";

export interface DashboardInstrumentsProps {
  instruments: any[];
  instrumentStatus: any;
  cardSx: any;
  chipSx: (color: any) => any;
}

export default function DashboardInstruments({
  instruments,
  instrumentStatus,
  cardSx,
  chipSx,
}: DashboardInstrumentsProps) {
  return (
    <Card>
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography
          variant="overline"
          sx={{
            color: "primary.main",
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          Instruments
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          px: 2,
          pb: 2,
        }}
      >
        {instruments.map((inst) => {
          const cfg = instrumentStatus[inst.status];
          return (
            <Box
              key={inst.id}
              sx={{
                p: 1.5,
                borderRadius: LAB_CARD_BORDER_RADIUS,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {inst.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {inst.dept}
              </Typography>
              <Chip
                size="small"
                label={cfg.label}
                sx={{ ...chipSx(cfg.color), mt: 1 }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5 }}
              >
                Calib: {inst.nextCalib}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}
