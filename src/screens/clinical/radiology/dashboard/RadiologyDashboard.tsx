"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { Stack } from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { useAppSelector } from "@/src/store/hooks";

// Internal
import {
  DashboardStats,
  RecentActivityItem,
  ModalityBreakdownItem,
} from "./types";
import { MODALITIES, getModalityColor } from "./constants";

// Components
import DashboardHeader from "./components/DashboardHeader";
import StatsGrid from "./components/StatsGrid";
import QuickAccess from "./components/QuickAccess";
import ModalityDistribution from "./components/ModalityDistribution";
import ActivitySection from "./components/ActivitySection";

export default function RadiologyDashboard() {
  // ── DATA FECTHING (Redux remains in main page) ─────────────────────
  const orders = useAppSelector((state) => state.radiology.orders);
  const worklist = useAppSelector((state) => state.radiology.worklist);
  const reading = useAppSelector((state) => state.radiology.reading);

  // ── DERIVED STATE / CALCULATIONS ────────────────────────────────────
  const totalStudies = orders.length + worklist.length + reading.length;
  const pendingScans = orders.filter(
    (o) =>
      o.validationState === "Ready" ||
      o.validationState === "Needs Clinical Review",
  ).length;
  const inProgress = worklist.filter((w) => w.state === "In Progress").length;
  const completedToday = reading.filter(
    (r) => r.state === "Final Signed",
  ).length;
  const statCases = [...orders, ...worklist, ...reading].filter(
    (item) => item.priority === "STAT",
  ).length;

  const dashboardStats: DashboardStats = {
    totalStudies,
    pendingScans,
    inProgress,
    completedToday,
    statCases,
    urgentOrders: orders.filter((o) => o.priority === "Urgent").length,
    statOrders: orders.filter((o) => o.priority === "STAT").length,
    unreadReports: reading.filter((r) => r.state === "Unread").length,
  };

  const modalityBreakdown: ModalityBreakdownItem[] = MODALITIES.map((mod) => ({
    label: mod,
    count: [...orders, ...worklist, ...reading].filter((item) =>
      item.modality.includes(mod),
    ).length,
    color: getModalityColor(mod),
  }));

  const recentActivity: RecentActivityItem[] = [
    ...reading.map((r) => ({
      id: r.id,
      patient: r.patientName,
      study: r.study,
      status: r.state,
      priority: r.priority,
      time: "Recently Updated",
    })),
    ...worklist.map((w) => ({
      id: w.id,
      patient: w.patientName,
      study: w.study,
      status: w.state,
      priority: w.priority,
      time: "Scheduled",
    })),
  ].slice(0, 5);

  const systemAlerts = [
    {
      type: "Equipment",
      msg: "MRI-01 requires calibration in 2 days.",
      sev: "warning",
    },
    {
      type: "STAT",
      msg: `${statCases} STAT cases pending across modalities.`,
      sev: "error",
    },
    {
      type: "Reports",
      msg: `${dashboardStats.unreadReports} reports awaiting signature.`,
      sev: "info",
    },
  ];

  return (
    <PageTemplate title="Radiology Dashboard">
      <Stack spacing={2.5}>
        <DashboardHeader />

        <StatsGrid stats={dashboardStats} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <QuickAccess />
          </Grid>
          <Grid item xs={12} md={6}>
            <ModalityDistribution
              modalityBreakdown={modalityBreakdown}
              totalStudies={totalStudies}
            />
          </Grid>
        </Grid>

        <ActivitySection
          recentActivity={recentActivity}
          systemAlerts={systemAlerts}
        />
      </Stack>
    </PageTemplate>
  );
}
