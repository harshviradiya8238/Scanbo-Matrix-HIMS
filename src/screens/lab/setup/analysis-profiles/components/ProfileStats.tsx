"use client";

import * as React from "react";
import { Grid } from "@/src/ui/components/atoms";
import StatTile from "@/src/ui/components/molecules/StatTile";
import { PROFILE_STATS } from "../data";

function ProfileStatsBase() {
  return (
    <Grid container spacing={2}>
      {PROFILE_STATS.map((s) => (
        <Grid item xs={12} sm={6} md={3} key={s.label}>
          <StatTile
            label={s.label}
            value={s.value}
            subtitle={s.subtitle}
            tone={s.tone}
            icon={s.icon}
            variant="soft"
          />
        </Grid>
      ))}
    </Grid>
  );
}

export const ProfileStats = React.memo(ProfileStatsBase);
