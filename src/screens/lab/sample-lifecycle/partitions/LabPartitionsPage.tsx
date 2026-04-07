"use client";

import * as React from "react";
import { useTheme, alpha } from "@mui/material";
import {
  Box,
  Button,
  Chip,
  Typography,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@/src/ui/components/atoms";
import {
  Add as AddIcon,
  ContentCut as ContentCutIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Science as ScienceIcon,
  AssignmentInd as UserIcon,
  Assignment as AssignmentIcon,
  Rule as RuleIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import StatTile from "@/src/ui/components/molecules/StatTile";
import PageTemplate from "@/src/ui/components/PageTemplate";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { addPartition } from "@/src/store/slices/limsSlice";
import { useLabTheme } from "../../lab-theme";
import type { LabPartition } from "../../lab-types";
import AddPartitionModal from "../../modals/AddPartitionModal";

export default function LabPartitionsPage() {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const dispatch = useAppDispatch();
  const { partitions, samples } = useAppSelector((state) => state.lims);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedParentId, setSelectedParentId] = React.useState("");

  const filteredPartitions = React.useMemo(() => {
    return partitions.filter((p) => {
      const matchSearch =
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.parentId.toLowerCase().includes(search.toLowerCase()) ||
        p.patient.toLowerCase().includes(search.toLowerCase());
      const matchParent = !selectedParentId || p.parentId === selectedParentId;
      return matchSearch && matchParent;
    });
  }, [partitions, search, selectedParentId]);

  const columns: CommonColumn<LabPartition>[] = [
    {
      headerName: "PARENT ID",
      field: "parentId",
      width: 150,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {row.parentId}
        </Typography>
      ),
    },
    {
      headerName: "PARTITION ID",
      field: "id",
      width: 150,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: "primary.main" }}
        >
          {row.id}
        </Typography>
      ),
    },
    {
      headerName: "PATIENT",
      field: "patient",
      width: 200,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.patient}
        </Typography>
      ),
    },
    {
      headerName: "VOLUME",
      field: "volume",
      width: 100,
    },
    {
      headerName: "CONTAINER",
      field: "container",
      width: 180,
      renderCell: (row) => {
        const color = row.container.toLowerCase().includes("purple")
          ? "secondary"
          : "warning";
        return (
          <Chip
            size="small"
            label={row.container}
            variant="outlined"
            sx={{
              fontSize: "11px",
              height: "24px",
              borderColor: alpha(theme.palette[color].main, 0.3),
              bgcolor: alpha(theme.palette[color].main, 0.05),
              color: theme.palette[color].main,
              "& .MuiChip-label": { px: 1 },
            }}
          />
        );
      },
    },
    {
      headerName: "ANALYSES ASSIGNED",
      field: "analyses",
      width: 200,
      renderCell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.analyses.join(", ")}
        </Typography>
      ),
    },
    {
      headerName: "DEPARTMENT",
      field: "department",
      width: 150,
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.department}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            fontWeight: 600,
            fontSize: "11px",
          }}
        />
      ),
    },
    {
      headerName: "STATUS",
      field: "status",
      width: 150,
      renderCell: (row) => {
        let color = "default";
        if (row.status === "In Analysis") color = "warning";
        if (row.status === "Received") color = "info";
        if (row.status === "To be Verified") color = "secondary";

        return (
          <Chip
            size="small"
            label={row.status}
            sx={lab.chipSx(
              (theme.palette as any)[color]?.main || theme.palette.grey[500],
            )}
          />
        );
      },
    },
  ];

  const handleAddPartition = (data: any) => {
    dispatch(addPartition(data));
  };

  const selectedSample = samples.find((s) => s.id === selectedParentId);

  return (
    <PageTemplate title="Sample Partition" currentPageTitle="Sample Partition">
      <Stack spacing={3}>
        <WorkspaceHeaderCard>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ContentCutIcon />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: "primary.main",
                    lineHeight: 1.1,
                  }}
                >
                  {selectedSample
                    ? `Partitioning: ${selectedSample.patient}`
                    : "Laboratory Workflow"}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {selectedSample
                    ? `Sample ID: ${selectedSample.id} | Type: ${selectedSample.type}`
                    : "Manage and track sample partitions across lab units"}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </WorkspaceHeaderCard>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2.5,
          }}
        >
          {(selectedSample
            ? [
                {
                  label: "Total Tests",
                  value: selectedSample.tests.length.toString(),
                  tone: "primary" as const,
                  icon: <AssignmentIcon />,
                },
                {
                  label: "Current Partitions",
                  value: filteredPartitions.length.toString(),
                  tone: "info" as const,
                  icon: <ContentCutIcon />,
                },
                {
                  label: "Current Status",
                  value: selectedSample.status,
                  tone: "success" as const,
                  icon: <InfoIcon />,
                },
              ]
            : [
                {
                  label: "Total Partitions",
                  value: partitions.length.toString(),
                  tone: "primary" as const,
                  icon: <ContentCutIcon />,
                },
                {
                  label: "In Analysis",
                  value: partitions
                    .filter((p) => p.status === "In Analysis")
                    .length.toString(),
                  tone: "warning" as const,
                  icon: <ScienceIcon />,
                },
                {
                  label: "To Verify",
                  value: partitions
                    .filter((p) => p.status === "To be Verified")
                    .length.toString(),
                  tone: "secondary" as const,
                  icon: <RuleIcon />,
                },
              ]
          ).map((stat) => (
            <StatTile
              key={stat.label}
              label={stat.label}
              value={stat.value}
              tone={stat.tone}
              icon={stat.icon}
            />
          ))}
        </Box>

        <Box sx={{ ...lab.cardSx }}>
          <CommonDataGrid
            toolbarLeft={
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ px: 1 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  <ContentCutIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    fontSize: "1.1rem",
                  }}
                >
                  Active Partitions
                </Typography>
              </Stack>
            }
            toolbarRight={
              <Stack direction="row" spacing={1.5} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Parent Sample</InputLabel>
                  <Select
                    value={selectedParentId}
                    label="Parent Sample"
                    onChange={(e) =>
                      setSelectedParentId(e.target.value as string)
                    }
                    sx={{
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    <MenuItem value="">All Samples</MenuItem>
                    {samples.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.id} - {s.patient}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setModalOpen(true)}
                  disabled={!selectedParentId}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    px: 3,
                    boxShadow: "none",
                    "&:hover": { boxShadow: "none" },
                  }}
                >
                  Add Partition
                </Button>
              </Stack>
            }
            searchPlaceholder="Search partitions..."
            externalSearchValue={search}
            onSearchChange={setSearch}
            rows={filteredPartitions}
            columns={columns}
            getRowId={(row) => row.id}
          />
        </Box>
      </Stack>

      <AddPartitionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddPartition}
        parentId={selectedParentId}
        patientName={selectedSample?.patient || ""}
      />
    </PageTemplate>
  );
}
