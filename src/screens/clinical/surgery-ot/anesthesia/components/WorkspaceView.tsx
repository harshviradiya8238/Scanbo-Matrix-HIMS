import * as React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Avatar,
} from "@/src/ui/components/atoms";
import { WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import { EnterpriseStatusChip } from "@/src/screens/clinical/components/EnterpriseUi";
import { alpha } from "@/src/ui/theme";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Verified as VerifiedIcon,
  Timeline as TimelineIcon,
  LocalPharmacy as LocalPharmacyIcon,
  MonitorHeart as MonitorHeartIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material";
import { WorklistCase, WorkspaceTab } from "../types";
import { UI_THEME, TABS } from "../constants";
import { statusTone } from "../utils";
import { OverviewTab } from "./OverviewTab";
import { DrugsTab } from "./DrugsTab";
import { FlowsheetTab } from "./FlowsheetTab";
import { HandoffTab } from "./HandoffTab";
import CustomCardTabs from "@/src/ui/components/molecules/CustomCardTabs";

export function WorkspaceView({
  caseData,
  tab,
  setTab,
  onBack,
  onOpenAddEvent,
  onOpenSignClose,
  onOpenAddDrug,
  onOpenVentSettings,
  onOpenFinalSignOff,
}: {
  caseData: WorklistCase;
  tab: WorkspaceTab;
  setTab: (value: WorkspaceTab) => void;
  onBack: () => void;
  onOpenAddEvent: () => void;
  onOpenSignClose: () => void;
  onOpenAddDrug: () => void;
  onOpenVentSettings: () => void;
  onOpenFinalSignOff: () => void;
}) {
  const currentTabIndex = TABS.findIndex((t) => t.value === tab);

  const tabItems = [
    {
      label: "Overview",
      icon: <TimelineIcon />,
      child: <OverviewTab caseData={caseData} />,
    },
    {
      label: "Drug Chart",
      icon: <LocalPharmacyIcon />,
      child: <DrugsTab caseData={caseData} onOpenAddDrug={onOpenAddDrug} />,
    },
    {
      label: "Flowsheet",
      icon: <MonitorHeartIcon />,
      child: <FlowsheetTab caseData={caseData} />,
    },
    {
      label: "Team & Handoff",
      icon: <GroupsIcon />,
      child: (
        <HandoffTab
          caseData={caseData}
          onOpenVentSettings={onOpenVentSettings}
          onOpenFinalSignOff={onOpenFinalSignOff}
        />
      ),
    },
  ];

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        overflow: "hidden",
      }}
    >
      <WorkspaceHeaderCard
        sx={{
          p: 1,
          backgroundColor: alpha(UI_THEME.primary, 0.08),
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", lg: "center" }}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{
              borderColor: alpha(UI_THEME.primary, 0.28),
              color: UI_THEME.primary,
            }}
          >
            Worklist
          </Button>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: UI_THEME.violet,
              fontSize: "0.78rem",
            }}
          >
            {caseData.patientName
              .split(" ")
              .map((part) => part.charAt(0))
              .slice(0, 2)
              .join("")}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: UI_THEME.text }}
            >
              Anesthesia Record · {caseData.patientName}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: UI_THEME.textSecondary }}
            >
              {caseData.room} · {caseData.procedure} · MRN {caseData.mrn} ·{" "}
              {caseData.duration}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.7} flexWrap="wrap">
            <EnterpriseStatusChip
              label={caseData.status}
              tone={statusTone(caseData.status)}
            />
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon fontSize="small" />}
              sx={{
                borderColor: alpha(UI_THEME.primary, 0.28),
                color: UI_THEME.primary,
              }}
              onClick={onOpenAddEvent}
            >
              Add Event
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<VerifiedIcon fontSize="small" />}
              sx={{ backgroundColor: UI_THEME.primary }}
              onClick={onOpenSignClose}
            >
              Sign & Close
            </Button>
          </Stack>
        </Stack>
      </WorkspaceHeaderCard>

      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <CustomCardTabs
          items={tabItems}
          defaultValue={currentTabIndex}
          onChange={(index) => setTab(TABS[index].value as WorkspaceTab)}
          sticky={false}
          showBackground
        />
      </Box>
    </Box>
  );
}
