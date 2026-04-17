"use client";

import * as React from "react";
import {
  Box,
  Button,
  Grid,
  Stack,
  Typography,
  Chip,
  Divider,
  Paper,
} from "@/src/ui/components/atoms";
import { CommonDialog } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import { T } from "../tokens";
import type { AnalysisProfile } from "../types";
import { DeptBadge } from "./DeptBadge";
import {
  Science as TestIcon,
  Timer as TatIcon,
  Payments as PriceIcon,
  Opacity as SampleIcon,
  LocalShipping as ContainerIcon,
} from "@mui/icons-material";

interface ViewProfileDialogProps {
  open: boolean;
  onClose: () => void;
  profile: AnalysisProfile | null;
}

export function ViewProfileDialog({ open, onClose, profile }: ViewProfileDialogProps) {
  const theme = useTheme();

  if (!profile) return null;

  const analytes = profile.analytesList.split(", ");

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title={profile.name}
      subtitle={`Profile Details • ${profile.department}`}
      maxWidth="sm"
      fullWidth
      content={
        <Box sx={{ mt: 1 }}>
          <Stack spacing={3}>
            {/* Quick Stats */}
            <Grid container spacing={1.5}>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", borderRadius: 2 }}>
                  <PriceIcon sx={{ color: "primary.main", mb: 0.5, fontSize: 20 }} />
                  <Typography variant="caption" display="block" color="text.secondary">Price</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{profile.price}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", borderRadius: 2 }}>
                  <TatIcon sx={{ color: "warning.main", mb: 0.5, fontSize: 20 }} />
                  <Typography variant="caption" display="block" color="text.secondary">TAT</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{profile.tat}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", borderRadius: 2 }}>
                  <TestIcon sx={{ color: "success.main", mb: 0.5, fontSize: 20 }} />
                  <Typography variant="caption" display="block" color="text.secondary">Tests</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{profile.analytesCount}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Specimen Details */}
            <Box>
              <Typography variant="overline" sx={{ fontWeight: 800, color: "text.secondary", mb: 1, display: "block" }}>
                Specimen Requirements
              </Typography>
              <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SampleIcon sx={{ fontSize: 18, color: "error.light" }} />
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary">Type</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{profile.sampleType}</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ContainerIcon sx={{ fontSize: 18, color: "info.light" }} />
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary">Container</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{profile.container}</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>

            {/* Included Tests */}
            <Box>
              <Typography variant="overline" sx={{ fontWeight: 800, color: "text.secondary", mb: 1.5, display: "block" }}>
                Included Analytes
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {analytes.map((item, idx) => (
                  <Chip
                    key={idx}
                    label={item}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderColor: alpha(theme.palette.primary.main, 0.12),
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Usage Trend */}
             <Box>
              <Typography variant="overline" sx={{ fontWeight: 800, color: "text.secondary", mb: 1, display: "block" }}>
                Usage Snapshot
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                This profile has been used <Typography component="span" sx={{ fontWeight: 800, color: "primary.main" }}>{profile.monthlyUsage}</Typography> times this month, accounting for approximately {Math.round((profile.monthlyUsage / (profile.maxUsage || 130)) * 100)}% of lab capacity for this bundle.
              </Typography>
            </Box>
          </Stack>
        </Box>
      }
      actions={
        <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
           <Button variant="outlined" color="primary" fullWidth sx={{ fontWeight: 700 }}>
            Edit Profile
          </Button>
          <Button variant="contained" fullWidth onClick={onClose} sx={{ fontWeight: 700, bgcolor: T.primary }}>
            Close
          </Button>
        </Stack>
      }
    />
  );
}
