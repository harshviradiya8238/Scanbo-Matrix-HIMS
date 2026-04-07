import * as React from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@/src/ui/components/atoms";
import { Card } from "@/src/ui/components/molecules";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { alpha, useTheme } from "@/src/ui/theme";
import { ListAlt as WorklistIcon } from "@mui/icons-material";
import { getQuickLinks } from "../constants";

import SectionHeader from "./SectionHeader";

export default function QuickAccess() {
  const theme = useTheme();
  const router = useRouter();
  const quickLinks = getQuickLinks(theme);

  return (
    <Card sx={{ p: 2.5, height: "100%", borderRadius: 3 }}>
      <SectionHeader
        icon={<WorklistIcon sx={{ fontSize: 20 }} />}
        title="Quick Access"
      />
      <Grid container spacing={2}>
        {quickLinks.map((link) => (
          <Grid key={link.label} item xs={6} sm={3}>
            <Box
              onClick={() => router.push(link.route)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                p: 2.5,
                borderRadius: 3,
                cursor: "pointer",
                bgcolor: alpha(link.color, 0.05),
                border: `1px solid ${alpha(link.color, 0.1)}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-6px)",
                  bgcolor: alpha(link.color, 0.1),
                  boxShadow: `0 8px 24px ${alpha(link.color, 0.15)}`,
                  borderColor: alpha(link.color, 0.3),
                },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(link.color, 0.15),
                  color: link.color,
                  transition: "all 0.3s",
                }}
              >
                {React.cloneElement(link.icon as React.ReactElement, {
                  sx: { fontSize: 24 },
                })}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  fontSize: "0.75rem",
                }}
              >
                {link.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}
