"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Box, Typography, Stack } from "@/src/ui/components/atoms";
import { useTheme } from "@mui/material";
import PageTemplate from "@/src/ui/components/PageTemplate";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
import CommonTabs, {
  CommonTabItem,
} from "@/src/ui/components/molecules/CommonTabs";
import {
  Edit as EditIcon,
  Verified as VerifiedIcon,
  Description as ReportIcon,
} from "@mui/icons-material";

// Tabs
import ResultEntryTab from "./tabs/ResultEntryTab";
import VerificationTab from "./tabs/VerificationTab";
import PublishedReportTab from "./tabs/PublishedReportTab";

export default function LabClientsPage() {
  const theme = useTheme();
  const searchParams = useSearchParams();

  // Read URL params: ?sampleId=S-IPD-2026-001&tab=entry
  const urlSampleId = searchParams.get("sampleId") ?? undefined;
  const urlTab = searchParams.get("tab") ?? "entry";

  const [activeTab, setActiveTab] = React.useState(urlTab);

  // Keep tab in sync if URL param changes (e.g. browser back/forward)
  React.useEffect(() => {
    if (urlTab) setActiveTab(urlTab);
  }, [urlTab]);

  const LAB_TABS: CommonTabItem[] = [
    { id: "entry", label: "Result Entry", icon: <EditIcon /> },
    { id: "verification", label: "Verification", icon: <VerifiedIcon /> },
    { id: "published", label: "Published Report", icon: <ReportIcon /> },
  ];

  return (
    <PageTemplate
      title="Laboratory Workbench"
      subtitle="Result management and report publishing"
      currentPageTitle="Lab Workbench"
    >
      <Stack spacing={1.25}>
        <WorkspaceHeaderCard>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "primary.main", mb: 0.5 }}
              >
                Laboratory Workflow
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Manage result entry, verification and publishing reports for all
                samples
              </Typography>
            </Box>

            <CommonTabs
              tabs={LAB_TABS}
              value={activeTab}
              onChange={setActiveTab}
            />
          </Stack>
        </WorkspaceHeaderCard>

        <Box sx={{ mt: 1 }}>
          {activeTab === "entry" && <ResultEntryTab sampleId={urlSampleId} />}
          {activeTab === "verification" && <VerificationTab />}
          {activeTab === "published" && <PublishedReportTab />}
        </Box>
      </Stack>
    </PageTemplate>
  );
}
