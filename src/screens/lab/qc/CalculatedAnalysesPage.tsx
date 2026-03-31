"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
} from "@/src/ui/components/atoms";
import { useTheme, alpha } from "@mui/material";
import {
  Calculate as CalculateIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import PageTemplate from "@/src/ui/components/PageTemplate";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface CalculatedAnalysis {
  id: string;
  keyword: string;
  name: string;
  formula: string;
  unit: string;
  refRange: string;
  department: string;
  status: "Active" | "Inactive";
}

const DUMMY_DATA: CalculatedAnalysis[] = [
  {
    id: "1",
    keyword: "AG",
    name: "Anion Gap",
    formula: "Na - Cl - HCO3",
    unit: "mEq/L",
    refRange: "8-16",
    department: "Biochemistry",
    status: "Active",
  },
  {
    id: "2",
    keyword: "eGFR",
    name: "Estimated GFR",
    formula: "186 x Cr^-1.154 x Age^-0.203",
    unit: "mL/min",
    refRange: ">60",
    department: "Biochemistry",
    status: "Active",
  },
  {
    id: "3",
    keyword: "MCHC",
    name: "Mean Cell Hb Concentration",
    formula: "(HGB / HCT) x 100",
    unit: "g/dL",
    refRange: "32-36",
    department: "Haematology",
    status: "Inactive",
  },
];

export default function CalculatedAnalysesPage() {
  const theme = useTheme();
  const [data, setData] = React.useState(DUMMY_DATA);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] =
    React.useState<CalculatedAnalysis | null>(null);

  const [formData, setFormData] = React.useState<Partial<CalculatedAnalysis>>({
    status: "Active",
  });

  const handleOpenModal = (item?: CalculatedAnalysis) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ status: "Active" });
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      setData((prev) =>
        prev.map((it) =>
          it.id === editingItem.id ? { ...it, ...formData } : it,
        ),
      );
    } else {
      const newItem = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as CalculatedAnalysis;
      setData((prev) => [...prev, newItem]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this calculation?")) {
      setData((prev) => prev.filter((it) => it.id !== id));
    }
  };

  const columns: CommonColumn<CalculatedAnalysis>[] = [
    {
      headerName: "KEYWORD",
      field: "keyword",
      width: 120,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {row.keyword}
        </Typography>
      ),
    },
    {
      headerName: "NAME",
      field: "name",
      width: 250,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {row.name}
        </Typography>
      ),
    },
    {
      headerName: "FORMULA / EXPRESSION",
      field: "formula",
      width: 250,
      renderCell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.formula}
        </Typography>
      ),
    },
    {
      headerName: "UNIT",
      field: "unit",
      width: 120,
    },
    {
      headerName: "REF RANGE",
      field: "refRange",
      width: 150,
    },
    {
      headerName: "DEPARTMENT",
      field: "department",
      width: 180,
      renderCell: (row) => {
        const isBio = row.department === "Biochemistry";
        return (
          <Chip
            size="small"
            label={row.department}
            sx={{
              fontWeight: 600,
              bgcolor: isBio ? alpha("#9C27B0", 0.1) : alpha("#2196F3", 0.1),
              color: isBio ? "#9C27B0" : "#2196F3",
              border: "none",
              "& .MuiChip-label": { px: 1.5, py: 0.5 },
              "&::before": {
                content: '""',
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: isBio ? "#9C27B0" : "#2196F3",
                mr: 1,
              },
              display: "flex",
              alignItems: "center",
            }}
          />
        );
      },
    },
    {
      headerName: "STATUS",
      field: "status",
      width: 120,
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.status}
          sx={{
            fontWeight: 600,
            bgcolor:
              row.status === "Active"
                ? alpha("#4CAF50", 0.1)
                : alpha("#757575", 0.1),
            color: row.status === "Active" ? "#2E7D32" : "#616161",
            border: "none",
            "&::before": {
              content: '""',
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: row.status === "Active" ? "#4CAF50" : "#757575",
              mr: 1,
            },
            display: "flex",
            alignItems: "center",
          }}
        />
      ),
    },
    {
      headerName: "ACTION",
      field: "action",
      width: 180,
      renderCell: (row) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleOpenModal(row)}
            sx={{ minWidth: 60 }}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => handleDelete(row.id)}
            sx={{ minWidth: 60 }}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <PageTemplate
      title="Calculated Analyses"
      subtitle="Define and manage auto-calculated laboratory tests"
    >
      <Stack spacing={3}>
        <Alert
          severity="info"
          sx={{
            fontWeight: 500,
            borderRadius: 1,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          Formulas auto-calculate when dependent analyte results are saved. Use
          analyte keywords in the expression (e.g. Na - Cl - HCO3).
        </Alert>

        <WorkspaceHeaderCard>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  p: 1.25,
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CalculateIcon sx={{ color: "primary.main" }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
                Calculated Analyses
              </Typography>
            </Stack>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{ fontWeight: 700 }}
            >
              Add Calculation
            </Button>
          </Stack>
        </WorkspaceHeaderCard>

        <Box sx={{ mt: 1 }}>
          <CommonDataGrid
            rows={data}
            columns={columns}
            getRowId={(row) => row.id}
          />
        </Box>
      </Stack>

      {/* Add / Edit Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {editingItem ? "Edit Calculation" : "Add Calculation"}
          <IconButton onClick={() => setModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Keyword (unique) *"
                fullWidth
                value={formData.keyword || ""}
                onChange={(e) =>
                  setFormData({ ...formData, keyword: e.target.value })
                }
                placeholder="e.g. AG"
              />
              <TextField
                label="Full Name *"
                fullWidth
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Anion Gap"
              />
            </Stack>
            <TextField
              label="Formula / Expression *"
              fullWidth
              value={formData.formula || ""}
              onChange={(e) =>
                setFormData({ ...formData, formula: e.target.value })
              }
              placeholder="e.g. Na - Cl - HCO3"
              helperText="Use analyte keywords separated by operators: + - * / ( )"
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Unit"
                fullWidth
                value={formData.unit || ""}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                placeholder="e.g. mEq/L"
              />
              <TextField
                label="Reference Range"
                fullWidth
                value={formData.refRange || ""}
                onChange={(e) =>
                  setFormData({ ...formData, refRange: e.target.value })
                }
                placeholder="e.g. 8-16"
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Department"
                fullWidth
                value={formData.department || "Biochemistry"}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              >
                <MenuItem value="Biochemistry">Biochemistry</MenuItem>
                <MenuItem value="Haematology">Haematology</MenuItem>
                <MenuItem value="Microbiology">Microbiology</MenuItem>
              </TextField>
              <TextField
                select
                label="Status"
                fullWidth
                value={formData.status || "Active"}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Stack>
            <TextField
              label="Notes / Description"
              fullWidth
              multiline
              rows={3}
              placeholder="Optional: describe when to use this calculation..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setModalOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" sx={{ px: 4 }}>
            {editingItem ? "Update Calculation" : "Save Calculation"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageTemplate>
  );
}
