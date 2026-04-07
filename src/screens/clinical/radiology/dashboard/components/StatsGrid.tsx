import * as React from "react";
import { StatTile } from "@/src/ui/components/molecules";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { DashboardStats } from "../types";
import { getStatsConfig } from "../constants";

interface StatsGridProps {
  stats: DashboardStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const statsConfig = getStatsConfig(stats);

  return (
    <Grid container spacing={2}>
      {statsConfig.map((stat) => (
        <Grid key={stat.label} item xs={12} sm={6} md={4} lg={2}>
          <StatTile
            label={stat.label}
            value={stat.value}
            subtitle={stat.subtitle}
            tone={stat.tone}
            icon={stat.icon}
            variant="soft"
          />
        </Grid>
      ))}
    </Grid>
  );
}
