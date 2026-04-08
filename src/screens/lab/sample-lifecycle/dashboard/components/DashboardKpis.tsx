import * as React from "react";
import { Grid } from "@/src/ui/components/atoms";
import StatTile from "@/src/ui/components/molecules/StatTile";
import {
  Science as ScienceIcon,
  PlaylistAddCheck as ChecklistIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircleOutline as CheckCircleIcon,
  Storefront as StorefrontIcon,
  Inventory2 as InventoryIcon,
  Assessment as AssessmentIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";

export interface DashboardKpisProps {
  samplesCount: number;
  pendingAnalysis: number;
  resultsPending: number;
  publishedToday: number;
  activeClients: number;
  totalClients: number;
  worksheetsCount: number;
  toVerify: number;
  lowStock: number;
}

export default function DashboardKpis({
  samplesCount,
  pendingAnalysis,
  resultsPending,
  publishedToday,
  activeClients,
  totalClients,
  worksheetsCount,
  toVerify,
  lowStock,
}: DashboardKpisProps) {
  return (
    <Grid container spacing={1.5}>
      {[
        {
          label: "Total Samples",
          value: samplesCount,
          subtitle: `${pendingAnalysis} pending analysis`,
          tone: "primary" as const,
          icon: <ScienceIcon sx={{ fontSize: 28 }} />,
        },
        {
          label: "Pending Analysis",
          value: pendingAnalysis,
          subtitle: "Received or assigned status",
          tone: "warning" as const,
          icon: <ChecklistIcon sx={{ fontSize: 28 }} />,
        },
        {
          label: "Results Pending",
          value: resultsPending,
          subtitle: "Analysed, awaiting finalization",
          tone: "error" as const,
          icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
        },
        {
          label: "Published Today",
          value: publishedToday,
          subtitle: "Ready for client delivery",
          tone: "success" as const,
          icon: <CheckCircleIcon sx={{ fontSize: 28 }} />,
        },
        {
          label: "Active Clients",
          value: activeClients,
          subtitle: `${totalClients} total registered`,
          tone: "info" as const,
          icon: <StorefrontIcon sx={{ fontSize: 28 }} />,
        },
        {
          label: "Worksheets",
          value: worksheetsCount,
          subtitle: `${toVerify} pending verification`,
          tone: "primary" as const,
          icon: <InventoryIcon sx={{ fontSize: 28 }} />,
        },
        {
          label: "To Verify",
          value: toVerify,
          subtitle: "Awaiting validation",
          tone: "warning" as const,
          icon: <AssessmentIcon sx={{ fontSize: 28 }} />,
        },
        {
          label: "Low Stock Items",
          value: lowStock,
          subtitle: "Below reorder threshold",
          tone: lowStock > 0 ? ("error" as const) : ("success" as const),
          icon: <WarningAmberIcon sx={{ fontSize: 28 }} />,
        },
      ].map((kpi) => (
        <Grid key={kpi.label} item xs={6} sm={4} md={3}>
          <StatTile
            label={kpi.label}
            value={kpi.value}
            subtitle={kpi.subtitle}
            tone={kpi.tone}
            icon={kpi.icon}
            variant="soft"
          />
        </Grid>
      ))}
    </Grid>
  );
}
