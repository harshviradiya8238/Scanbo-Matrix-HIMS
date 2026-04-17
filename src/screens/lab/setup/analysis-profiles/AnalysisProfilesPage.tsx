"use client";

import * as React from "react";
import { Stack, Button } from "@/src/ui/components/atoms";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { Add as AddIcon } from "@mui/icons-material";
import CustomCardTabs from "@/src/ui/components/molecules/CustomCardTabs";
import { PROFILE_TABS, DUMMY_PROFILES, PROFILE_STATS } from "./data";
import { ProfileStats } from "./components/ProfileStats";
import { AnalysisProfilesTable } from "./components/AnalysisProfilesTable";
import { RegisterSampleDialog } from "./components/RegisterSampleDialog";
import { CreateProfileDialog } from "./components/CreateProfileDialog";
import { ViewProfileDialog } from "./components/ViewProfileDialog";
import { T } from "./tokens";
import type { AnalysisProfile } from "./types";


export default function AnalysisProfilesPage() {
  const [searchQuery] = React.useState("");
  const [registerModalOpen, setRegisterModalOpen] = React.useState(false);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [viewModalOpen, setViewModalOpen] = React.useState(false);
  const [selectedProfile, setSelectedProfile] =
    React.useState<AnalysisProfile | null>(null);
  const [viewingProfile, setViewingProfile] =
    React.useState<AnalysisProfile | null>(null);

  const handleUseProfile = React.useCallback((profile: AnalysisProfile) => {
    setSelectedProfile(profile);
    setRegisterModalOpen(true);
  }, []);

  const handleViewProfile = React.useCallback((profile: AnalysisProfile) => {
    setViewingProfile(profile);
    setViewModalOpen(true);
  }, []);

  const handleCreateProfile = React.useCallback(() => {
    setCreateModalOpen(true);
  }, []);

  const handleCloseRegisterModal = React.useCallback(
    () => setRegisterModalOpen(false),
    [],
  );

  const tabItems = React.useMemo(() => {
    return PROFILE_TABS.map((tab) => ({
      label: tab.label,
      child: (
        <AnalysisProfilesTable
          profiles={DUMMY_PROFILES.filter((profile) => {
            const matchDept = tab.id === "All" || profile.department === tab.id;
            const matchSearch = profile.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
            return matchDept && matchSearch;
          })}
          onUseProfile={handleUseProfile}
          onViewProfile={handleViewProfile}
        />
      ),
    }));
  }, [searchQuery, handleUseProfile, handleViewProfile]);

  return (
    <PageTemplate
      title="Analysis Profiles"
      subtitle="Define reusable test bundles to speed up sample registration"
      fullHeight
    >
      <Stack
        spacing={1.25}
        sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
      >
        <ProfileStats />

        <CustomCardTabs
          items={tabItems}
          header={
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={handleCreateProfile}
              sx={{
                bgcolor: T.primary,
                fontWeight: 700,
                fontSize: "0.82rem",
                textTransform: "none",
                borderRadius: "9px",
                height: 36,
                px: 2.5,
                boxShadow: "none",
                "&:hover": { bgcolor: T.primaryHover, boxShadow: "none" },
              }}
            >
              Create Profile
            </Button>
          }
        />

        <RegisterSampleDialog
          open={registerModalOpen}
          selectedProfile={selectedProfile}
          onClose={handleCloseRegisterModal}
          onSelectedProfileChange={setSelectedProfile}
        />

        <CreateProfileDialog
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />

        <ViewProfileDialog
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          profile={viewingProfile}
        />
      </Stack>
    </PageTemplate>
  );
}
