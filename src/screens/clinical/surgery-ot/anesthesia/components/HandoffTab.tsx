import * as React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Avatar,
  TextField,
} from "@/src/ui/components/atoms";
import { Card } from "@/src/ui/components/molecules";
import { EnterpriseStatusChip } from "@/src/screens/clinical/components/EnterpriseUi";
import {
  Groups as GroupsIcon,
  Air as AirIcon,
  Verified as VerifiedIcon,
} from "@mui/icons-material";
import { WorklistCase } from "../types";
import { UI_THEME, WORKSPACE_PANEL_SX } from "../constants";

export function HandoffTab({
  caseData,
  onOpenVentSettings,
  onOpenFinalSignOff,
}: {
  caseData: WorklistCase;
  onOpenVentSettings: () => void;
  onOpenFinalSignOff: () => void;
}) {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "grid",
        gap: 0.9,
        gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" },
      }}
    >
      <Card
        elevation={0}
        sx={{ ...WORKSPACE_PANEL_SX, p: 0.9, overflow: "hidden" }}
      >
        <Stack
          direction="row"
          spacing={0.8}
          alignItems="center"
          sx={{ mb: 0.8 }}
        >
          <GroupsIcon fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Team on Duty
          </Typography>
        </Stack>
        <Stack spacing={0.7} sx={{ maxHeight: "100%", overflow: "auto" }}>
          {caseData.team.map((member) => (
            <Box
              key={member.name}
              sx={{
                p: 0.7,
                borderRadius: 1.2,
                border: "1px solid",
                borderColor: UI_THEME.border,
                backgroundColor: UI_THEME.panelSoft,
                display: "flex",
                alignItems: "center",
                gap: 0.8,
              }}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: member.color,
                  fontSize: "0.72rem",
                }}
              >
                {member.initials}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {member.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: UI_THEME.textSecondary }}
                >
                  {member.role}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Card>

      <Card elevation={0} sx={{ ...WORKSPACE_PANEL_SX, p: 0.9 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8 }}>
          PACU / Handoff
        </Typography>
        <Typography variant="caption" sx={{ color: UI_THEME.textSecondary }}>
          Allergies
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: 0.4, mb: 0.8 }}
        >
          {caseData.allergyTags.map((tag) => (
            <EnterpriseStatusChip
              key={tag}
              label={tag}
              tone={tag === "None" ? "active" : "critical"}
            />
          ))}
        </Stack>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={caseData.notes}
          InputProps={{ readOnly: true }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: UI_THEME.panelSoft,
              "& fieldset": { borderColor: UI_THEME.borderStrong },
            },
          }}
        />
        <Stack direction="row" spacing={0.7} sx={{ mt: 0.8, flexWrap: "wrap" }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AirIcon fontSize="small" />}
            sx={{ borderColor: UI_THEME.borderStrong, color: UI_THEME.primary }}
            onClick={onOpenVentSettings}
          >
            Vent Settings
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<VerifiedIcon fontSize="small" />}
            sx={{ backgroundColor: UI_THEME.primary }}
            onClick={onOpenFinalSignOff}
          >
            Final Sign-off
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}
