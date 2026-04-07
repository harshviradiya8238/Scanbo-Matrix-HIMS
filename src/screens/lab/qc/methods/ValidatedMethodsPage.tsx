"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
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
  Build as BuildIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import PageTemplate from "@/src/ui/components/PageTemplate";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
import CommonTabs, {
  type CommonTabItem,
} from "@/src/ui/components/molecules/CommonTabs";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";

interface ValidatedMethod {
  id: string;
  name: string;
  linkedAnalysis: string;
  principle: string;
  instrument: string;
  standard: string;
  department: string;
  validatedOn: string;
  status: "Active" | "Inactive";
}

const METHOD_TABS: CommonTabItem[] = [
  { id: "All", label: "All" },
  { id: "Haematology", label: "Haematology" },
  { id: "Biochemistry", label: "Biochemistry" },
  { id: "Microbiology", label: "Microbiology" },
];

const DUMMY_DATA: ValidatedMethod[] = [
  {
    id: "1",
    name: "Cyanmethaemoglobin",
    linkedAnalysis: "HGB",
    principle: "Photometric",
    instrument: "Sysmex XN-1000",
    standard: "ICSH",
    department: "Haematology",
    validatedOn: "12 Jan 2025",
    status: "Active",
  },
  {
    id: "2",
    name: "Electrical Impedance",
    linkedAnalysis: "WBC, PLT, RBC",
    principle: "Impedance",
    instrument: "Sysmex XN-1000",
    standard: "CLSI H20",
    department: "Haematology",
    validatedOn: "12 Jan 2025",
    status: "Active",
  },
  {
    id: "3",
    name: "GOD-POD Enzymatic",
    linkedAnalysis: "Glucose",
    principle: "Enzymatic Colorimetric",
    instrument: "Roche Cobas 6000",
    standard: "IFCC",
    department: "Biochemistry",
    validatedOn: "05 Feb 2025",
    status: "Active",
  },
  {
    id: "4",
    name: "Ion Selective Electrode",
    linkedAnalysis: "Na+, K+, Cl-",
    principle: "Potentiometry (ISE)",
    instrument: "Roche Cobas 6000",
    standard: "CLSI EP9",
    department: "Biochemistry",
    validatedOn: "05 Feb 2025",
    status: "Active",
  },
  {
    id: "5",
    name: "HPLC Ion Exchange",
    linkedAnalysis: "HbA1c",
    principle: "Chromatography",
    instrument: "Bio-Rad D-10",
    standard: "NGSP / IFCC",
    department: "Biochemistry",
    validatedOn: "18 Mar 2025",
    status: "Active",
  },
  {
    id: "6",
    name: "Automated Blood Culture",
    linkedAnalysis: "Blood Culture",
    principle: "Continuous Monitoring",
    instrument: "BD BACTEC FX",
    standard: "CLSI M47",
    department: "Microbiology",
    validatedOn: "22 Nov 2024",
    status: "Active",
  },
  {
    id: "7",
    name: "Homogeneous Enzymatic",
    linkedAnalysis: "LDL, HDL, TC, TG",
    principle: "Enzymatic Colorimetric",
    instrument: "Roche Cobas 6000",
    standard: "CDC NHLBI",
    department: "Biochemistry",
    validatedOn: "05 Feb 2025",
    status: "Inactive",
  },
];

export default function ValidatedMethodsPage() {
  const theme = useTheme();
  const [data, setData] = React.useState(DUMMY_DATA);
  const [activeTab, setActiveTab] = React.useState("All");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ValidatedMethod | null>(
    null,
  );

  const [formData, setFormData] = React.useState<Partial<ValidatedMethod>>({
    status: "Active",
  });

  const handleOpenModal = (item?: ValidatedMethod) => {
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
      } as ValidatedMethod;
      setData((prev) => [...prev, newItem]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this method?")) {
      setData((prev) => prev.filter((it) => it.id !== id));
    }
  };

  const filteredData = React.useMemo(() => {
    if (activeTab === "All") return data;
    return data.filter((it) => it.department === activeTab);
  }, [data, activeTab]);

  const columns: CommonColumn<ValidatedMethod>[] = [
    {
      headerName: "METHOD NAME",
      field: "name",
      width: 220,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {row.name}
        </Typography>
      ),
    },
    {
      headerName: "ANALYSIS LINKED",
      field: "linkedAnalysis",
      width: 180,
      renderCell: (row) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontFamily: "monospace" }}
        >
          {row.linkedAnalysis}
        </Typography>
      ),
    },
    {
      headerName: "PRINCIPLE",
      field: "principle",
      width: 180,
      renderCell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.principle}
        </Typography>
      ),
    },
    {
      headerName: "INSTRUMENT",
      field: "instrument",
      width: 180,
      renderCell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.instrument}
        </Typography>
      ),
    },
    {
      headerName: "STANDARD",
      field: "standard",
      width: 150,
      renderCell: (row) => {
        const color = row.department === "Biochemistry" ? "#9C27B0" : "#2196F3";
        return (
          <Chip
            size="small"
            label={row.standard}
            sx={{
              fontWeight: 600,
              bgcolor: alpha(color, 0.1),
              color: color,
              border: "none",
              borderRadius: 1,
              "&::before": {
                content: '""',
                width: 4,
                height: 4,
                borderRadius: "50%",
                bgcolor: color,
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
      headerName: "DEPARTMENT",
      field: "department",
      width: 150,
      renderCell: (row) => {
        const isBio = row.department === "Biochemistry";
        const color = isBio
          ? "#9C27B0"
          : row.department === "Microbiology"
            ? "#2E7D32"
            : "#2196F3";
        return (
          <Chip
            size="small"
            label={row.department}
            sx={{
              fontWeight: 600,
              bgcolor: alpha(color, 0.1),
              color: color,
              border: "none",
              "&::before": {
                content: '""',
                width: 4,
                height: 4,
                borderRadius: "50%",
                bgcolor: color,
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
      headerName: "VALIDATED ON",
      field: "validatedOn",
      width: 150,
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
              width: 4,
              height: 4,
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
      title="Validated Methods"
      subtitle="Manage validated analytical methods and standards"
    >
      <Stack spacing={1.25}>
        <WorkspaceHeaderCard>
          <Stack direction="row" alignItems="center" sx={{justifyContent:"space-between"}} spacing={3}>
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
                <BuildIcon sx={{ color: "primary.main" }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "primary.main" }}
              >
                Validated Methods
              </Typography>
            </Stack>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{ fontWeight: 700 }}
            >
              Add Method
            </Button>
          </Stack>
        </WorkspaceHeaderCard>

        <Box sx={{ mt: 1 }}>
          <CommonDataGrid
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row.id}
            toolbarRight={
              <CommonTabs
                tabs={METHOD_TABS}
                value={activeTab}
                onChange={setActiveTab}
              />
            }
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
          {editingItem ? "Edit Method" : "Add Method"}
          <IconButton onClick={() => setModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Method Name *"
              fullWidth
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. GOD-POD Enzymatic"
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Analysis Linked (Keywords) *"
                fullWidth
                value={formData.linkedAnalysis || ""}
                onChange={(e) =>
                  setFormData({ ...formData, linkedAnalysis: e.target.value })
                }
                placeholder="e.g. Glucose, HbA1c"
              />
              <TextField
                label="Principle"
                fullWidth
                value={formData.principle || ""}
                onChange={(e) =>
                  setFormData({ ...formData, principle: e.target.value })
                }
                placeholder="e.g. Enzymatic Colorimetric"
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Instrument"
                fullWidth
                value={formData.instrument || ""}
                onChange={(e) =>
                  setFormData({ ...formData, instrument: e.target.value })
                }
              >
                <MenuItem value="Sysmex XN-1000">Sysmex XN-1000</MenuItem>
                <MenuItem value="Roche Cobas 6000">Roche Cobas 6000</MenuItem>
                <MenuItem value="BD BACTEC FX">BD BACTEC FX</MenuItem>
                <MenuItem value="Bio-Rad D-10">Bio-Rad D-10</MenuItem>
                <MenuItem value="Abbott Architect">Abbott Architect</MenuItem>
                <MenuItem value="Other / Manual">Other / Manual</MenuItem>
              </TextField>
              <TextField
                select
                label="Validation Standard"
                fullWidth
                value={formData.standard || ""}
                onChange={(e) =>
                  setFormData({ ...formData, standard: e.target.value })
                }
              >
                <MenuItem value="CLSI EP15">CLSI EP15</MenuItem>
                <MenuItem value="CLSI EP9">CLSI EP9</MenuItem>
                <MenuItem value="CLSI H20">CLSI H20</MenuItem>
                <MenuItem value="CLSI M47">CLSI M47</MenuItem>
                <MenuItem value="ICSH">ICSH</MenuItem>
                <MenuItem value="IFCC">IFCC</MenuItem>
                <MenuItem value="NGSP / IFCC">NGSP / IFCC</MenuItem>
                <MenuItem value="CDC NHLBI">CDC NHLBI</MenuItem>
                <MenuItem value="ISO 15189">ISO 15189</MenuItem>
              </TextField>
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
                <MenuItem value="Serology">Serology</MenuItem>
                <MenuItem value="Histopathology">Histopathology</MenuItem>
              </TextField>
              <TextField
                label="Validated On"
                fullWidth
                type="text"
                placeholder="dd / mm / yyyy"
                value={formData.validatedOn || ""}
                onChange={(e) =>
                  setFormData({ ...formData, validatedOn: e.target.value })
                }
              />
            </Stack>
            <Stack direction="row" spacing={2}>
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
              label="Notes"
              fullWidth
              multiline
              rows={3}
              placeholder="Optional: linearity range, interferences, special instructions..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setModalOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" sx={{ px: 4 }}>
            {editingItem ? "Update Method" : "Save Method"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageTemplate>
  );
}
