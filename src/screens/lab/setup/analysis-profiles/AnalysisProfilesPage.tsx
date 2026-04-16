"use client";

import * as React from "react";
import { Stack } from "@/src/ui/components/atoms";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { DUMMY_PROFILES } from "./data";
import { ProfileStats } from "./components/ProfileStats";
import { ProfileToolbar } from "./components/ProfileToolbar";
import { AnalysisProfilesTable } from "./components/AnalysisProfilesTable";
import { RegisterSampleDialog } from "./components/RegisterSampleDialog";
import type { AnalysisProfile } from "./types";

export default function AnalysisProfilesPage() {
  const [activeDept, setActiveDept] = React.useState("All");
  const [searchQuery] = React.useState("");
  const [registerModalOpen, setRegisterModalOpen] = React.useState(false);
  const [selectedProfile, setSelectedProfile] =
    React.useState<AnalysisProfile | null>(null);

  const filteredProfiles = React.useMemo(() => {
    return DUMMY_PROFILES.filter((profile) => {
      const matchDept =
        activeDept === "All" || profile.department === activeDept;
      const matchSearch = profile.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [activeDept, searchQuery]);

  const handleUseProfile = React.useCallback((profile: AnalysisProfile) => {
    setSelectedProfile(profile);
    setRegisterModalOpen(true);
  }, []);

  const handleCloseRegisterModal = React.useCallback(
    () => setRegisterModalOpen(false),
    [],
  );

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

        <ProfileToolbar activeDept={activeDept} onDeptChange={setActiveDept} />

        <AnalysisProfilesTable
          profiles={filteredProfiles}
          onUseProfile={handleUseProfile}
        />

        <RegisterSampleDialog
          open={registerModalOpen}
          selectedProfile={selectedProfile}
          onClose={handleCloseRegisterModal}
          onSelectedProfileChange={setSelectedProfile}
        />
      </Stack>
    </PageTemplate>
  );
}
