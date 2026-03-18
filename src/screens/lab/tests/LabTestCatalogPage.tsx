"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Box,
  Button,
  Chip,
  List,
  ListItem,
  Snackbar,
  Alert,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@/src/ui/components/atoms";
import { useTheme } from "@mui/material";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { addTest } from "@/src/store/slices/limsSlice";
import AddTestModal from "../modals/AddTestModal";
import { useLabTheme } from "../lab-theme";
import LabWorkspaceCard from "../components/LabWorkspaceCard";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import type { LabTestCatalogItem } from "../lab-types";

export default function LabTestCatalogPage() {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { tests } = useAppSelector((state) => state.lims);
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: "" });
  const selectedCode = searchParams.get("id");
  const selectedTest = tests.find((t) => t.code === selectedCode);

  const testColumns = React.useMemo<CommonColumn<LabTestCatalogItem>[]>(
    () => [
      {
        headerName: "Code",
        field: "code",
        width: 100,
        renderCell: (row) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            {row.code}
          </Typography>
        ),
      },
      {
        headerName: "Test Name",
        field: "name",
        width: 250,
        renderCell: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.name}
          </Typography>
        ),
      },
      {
        headerName: "Department",
        field: "dept",
        width: 150,
        renderCell: (row) => (
          <Chip
            size="small"
            label={row.dept}
            sx={lab.chipSx(theme.palette.secondary.main)}
          />
        ),
      },
      {
        headerName: "Method",
        field: "method",
        width: 150,
      },
      {
        headerName: "TAT",
        field: "tat",
        width: 100,
      },
      {
        headerName: "Price",
        field: "price",
        width: 100,
        renderCell: (row) => (
          <Typography variant="body2" sx={{ color: "success.main" }}>
            ₹{row.price}
          </Typography>
        ),
      },
      {
        headerName: "Actions",
        field: "code",
        width: 120,
        align: "right",
        headerAlign: "right",
        renderCell: (row) => (
          <Button
            size="small"
            variant="outlined"
            color="info"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/lab/tests?id=${row.code}`);
            }}
          >
            View
          </Button>
        ),
      },
    ],
    [theme, lab, router],
  );

  if (selectedTest) {
    return (
      <PageTemplate title="Test Catalog" currentPageTitle="Test Detail">
        <LabWorkspaceCard current="tests">
          <Stack spacing={2}>
            <Box>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push("/lab/tests")}
                size="small"
                sx={{ mb: 2 }}
              >
                Back
              </Button>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {selectedTest.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedTest.code} · {selectedTest.dept} ·{" "}
                {selectedTest.method}
              </Typography>
              <Typography variant="overline" sx={{ color: "primary.main" }}>
                Analytes
              </Typography>
              <List dense>
                {selectedTest.analytes.map((a) => (
                  <ListItem key={a} sx={{ py: 0.5 }}>
                    {a}
                  </ListItem>
                ))}
              </List>
            </Box>
          </Stack>
        </LabWorkspaceCard>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Test Catalog"
      subtitle={`${tests.length} tests configured`}
      currentPageTitle="Test Catalog"
    >
      <LabWorkspaceCard
        current="tests"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setAddModalOpen(true)}
          >
            Add Test
          </Button>
        }
      >
        <Stack spacing={2}>
          <CommonDataGrid<LabTestCatalogItem>
            rows={tests}
            columns={testColumns}
            getRowId={(row) => row.code}
            searchPlaceholder="Search tests..."
            onRowClick={(row) => router.push(`/lab/tests?id=${row.code}`)}
          />
        </Stack>
      </LabWorkspaceCard>
      <AddTestModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={(form) => {
          dispatch(addTest(form));
          setSnackbar({ open: true, message: "Test added." });
        }}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
