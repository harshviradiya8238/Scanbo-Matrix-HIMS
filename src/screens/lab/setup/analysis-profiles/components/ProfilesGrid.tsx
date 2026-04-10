"use client";

import * as React from "react";
import { Grid } from "@/src/ui/components/atoms";
import type { AnalysisProfile } from "../types";
import { ProfileCard } from "./ProfileCard";

interface ProfilesGridProps {
  profiles: AnalysisProfile[];
  onUseProfile: (profile: AnalysisProfile) => void;
}

function ProfilesGridBase({ profiles, onUseProfile }: ProfilesGridProps) {
  return (
    <Grid container spacing={2}>
      {profiles.map((profile) => (
        <Grid item xs={12} md={6} lg={4} key={profile.id}>
          <ProfileCard profile={profile} onUse={onUseProfile} />
        </Grid>
      ))}
    </Grid>
  );
}

export const ProfilesGrid = React.memo(ProfilesGridBase);
