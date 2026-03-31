"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  TextField,
  IconButton,
  Divider,
} from "@/src/ui/components/atoms";
import { useTheme, alpha } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import PageTemplate from "@/src/ui/components/PageTemplate";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";

const T = {
  border: "#E2E8F0",
  surface: "#F8FAFC",
  surfaceHover: "#F1F5F9",
  white: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",

  primary: "#1172BA",
  primaryHover: "#0D5A94",

  // Category Colors
  haemText: "#1172BA",
  haemBg: "#EEF2FF",
  haemBorder: "#C7D2FE",

  bioText: "#7E22CE",
  bioBg: "#FDF4FF",
  bioBorder: "#E9D5FF",

  microText: "#0F766E",
  microBg: "#F0FDFA",
  microBorder: "#99F6E4",

  seroText: "#059669",
  seroBg: "#ECFDF5",
  seroBorder: "#A7F3D0",

  histoText: "#92400E",
  histoBg: "#FFFBEB",
  histoBorder: "#FDE68A",

  defaultText: "#475569",
  defaultBg: "#F1F5F9",
  defaultBorder: "#CBD5E1",
};

interface AnalysisService {
  id: string;
  keyword: string;
  service: string;
  category: string;
  method: string;
  instrument: string;
  unit: string;
  normalRangeM: string;
  normalRangeF: string;
  tat: string;
  price: string;
}

const MOCK_SERVICES: AnalysisService[] = [
  {
    id: "hgb",
    keyword: "HGB",
    service: "Haemoglobin",
    category: "Haematology",
    method: "Cyanmethaemoglobin",
    instrument: "Sysmex XN",
    unit: "g/dL",
    normalRangeM: "13.0–17.0",
    normalRangeF: "12.0–16.0",
    tat: "2h",
    price: "₹150",
  },
  {
    id: "wbc",
    keyword: "WBC",
    service: "WBC Count",
    category: "Haematology",
    method: "Impedance",
    instrument: "Sysmex XN",
    unit: "x10³/µL",
    normalRangeM: "4.0–10.0",
    normalRangeF: "4.0–10.0",
    tat: "2h",
    price: "₹200",
  },
  {
    id: "gluc",
    keyword: "GLUC",
    service: "Glucose (Random)",
    category: "Biochemistry",
    method: "GOD–POD",
    instrument: "Cobas 6000",
    unit: "mg/dL",
    normalRangeM: "70–200",
    normalRangeF: "70–200",
    tat: "2h",
    price: "₹80",
  },
  {
    id: "hba1c",
    keyword: "HBA1C",
    service: "Glycated Haemoglobin",
    category: "Biochemistry",
    method: "HPLC",
    instrument: "Bio-Rad D10",
    unit: "%",
    normalRangeM: "<5.7%",
    normalRangeF: "<5.7%",
    tat: "4h",
    price: "₹600",
  },
  {
    id: "tsh",
    keyword: "TSH",
    service: "Thyroid Stimulating Hormone",
    category: "Serology",
    method: "CLIA",
    instrument: "Cobas e411",
    unit: "mIU/L",
    normalRangeM: "0.4–4.0",
    normalRangeF: "0.4–4.0",
    tat: "4h",
    price: "₹450",
  },
];

const CATEGORIES = [
  "All",
  "Haematology",
  "Biochemistry",
  "Microbiology",
  "Serology",
  "Histopathology",
];

export default function TestCatalogPage() {
  const theme = useTheme();
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case "Haematology":
        return { text: T.haemText, bg: T.haemBg, border: T.haemBorder };
      case "Biochemistry":
        return { text: T.bioText, bg: T.bioBg, border: T.bioBorder };
      case "Microbiology":
        return { text: T.microText, bg: T.microBg, border: T.microBorder };
      case "Serology":
        return { text: T.seroText, bg: T.seroBg, border: T.seroBorder };
      case "Histopathology":
        return { text: T.histoText, bg: T.histoBg, border: T.histoBorder };
      default:
        return {
          text: T.defaultText,
          bg: T.defaultBg,
          border: T.defaultBorder,
        };
    }
  };

  const columns: CommonColumn<AnalysisService>[] = [
    {
      headerName: "KEYWORD",
      field: "keyword",
      width: 120,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.75rem" }}
        >
          {row.keyword}
        </Typography>
      ),
    },
    {
      headerName: "ANALYSIS SERVICE",
      field: "service",
      width: 250,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 800, color: "text.primary" }}
        >
          {row.service}
        </Typography>
      ),
    },
    {
      headerName: "CATEGORY",
      field: "category",
      width: 150,
      renderCell: (row) => {
        const c = getCategoryTheme(row.category);
        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.25,
              py: 0.45,
              bgcolor: c.bg,
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: "6px",
            }}
          >
            <Box
              sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: c.text }}
            />
            <Typography
              sx={{ fontSize: "0.68rem", fontWeight: 700, lineHeight: 1 }}
            >
              {row.category}
            </Typography>
          </Box>
        );
      },
    },
    {
      headerName: "METHOD",
      field: "method",
      width: 180,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {row.method}
        </Typography>
      ),
    },
    {
      headerName: "INSTRUMENT",
      field: "instrument",
      width: 150,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {row.instrument}
        </Typography>
      ),
    },
    {
      headerName: "UNIT",
      field: "unit",
      width: 100,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {row.unit}
        </Typography>
      ),
    },
    {
      headerName: "NORMAL RANGE (M)",
      field: "normalRangeM",
      width: 180,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 600 }}
        >
          {row.normalRangeM}
        </Typography>
      ),
    },
    {
      headerName: "NORMAL RANGE (F)",
      field: "normalRangeF",
      width: 180,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 600 }}
        >
          {row.normalRangeF}
        </Typography>
      ),
    },
    {
      headerName: "TAT",
      field: "tat",
      width: 80,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {row.tat}
        </Typography>
      ),
    },
    {
      headerName: "PRICE",
      field: "price",
      width: 100,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 700 }}
        >
          {row.price}
        </Typography>
      ),
    },
  ];

  const filteredServices = MOCK_SERVICES.filter(
    (s) => activeCategory === "All" || s.category === activeCategory,
  );

  return (
    <PageTemplate
      title="Analysis Service Catalog"
      currentPageTitle="Test Catalog"
    >
      <Stack spacing={2.5}>
        <WorkspaceHeaderCard sx={{ p: 2, borderRadius: 2.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "primary.main", mb: 0.5 }}
              >
                Analysis Service Catalog
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Define and manage tests, analysis services and normative
                reference ranges.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsModalOpen(true)}
              sx={{ borderRadius: 1.5, px: 2, fontWeight: 700 }}
            >
              Add Analysis
            </Button>
          </Stack>
        </WorkspaceHeaderCard>

        <Stack direction="row" spacing={1} sx={{ px: 0.5 }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <Box
                key={cat}
                onClick={() => setActiveCategory(cat)}
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  transition: "all 0.15s ease",
                  bgcolor: isActive ? T.primary : T.white,
                  color: isActive ? T.white : T.textSecondary,
                  border: `1px solid ${isActive ? T.primary : T.border}`,
                  boxShadow: isActive
                    ? `0 4px 12px ${alpha(T.primary, 0.25)}`
                    : "none",
                  "&:hover": {
                    borderColor: isActive ? T.primary : "#94A3B8",
                    bgcolor: isActive ? T.primary : T.surfaceHover,
                  },
                }}
              >
                {cat}
              </Box>
            );
          })}
        </Stack>

        <CommonDataGrid<AnalysisService>
          rows={filteredServices}
          columns={columns}
          getRowId={(row) => row.id}
          hideSearch={false}
          searchPlaceholder="Search analysis services..."
        />
      </Stack>

      <CommonDialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Analysis Service"
        maxWidth="md"
        content={
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2.5}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    mb: 0.5,
                    display: "block",
                  }}
                >
                  Keyword (unique) *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. HGB"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    mb: 0.5,
                    display: "block",
                  }}
                >
                  Full Name *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. Haemoglobin"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Box>
            </Stack>

            <Stack direction="row" spacing={2.5}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    mb: 0.5,
                    display: "block",
                  }}
                >
                  Category
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Haematology"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    mb: 0.5,
                    display: "block",
                  }}
                >
                  Unit
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. g/dL"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Box>
            </Stack>

            <Stack direction="row" spacing={2.5}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    mb: 0.5,
                    display: "block",
                  }}
                >
                  Normal Range (Male)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="13.0–17.0"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    mb: 0.5,
                    display: "block",
                  }}
                >
                  Normal Range (Female)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="12.0–16.0"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Box>
            </Stack>

            <Stack direction="row" spacing={2.5}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    mb: 0.5,
                    display: "block",
                  }}
                >
                  Critical Low
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. 7.0"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    mb: 0.5,
                    display: "block",
                  }}
                >
                  Critical High
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. 20.0"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Box>
            </Stack>
          </Stack>
        }
        actions={
          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="flex-end"
            sx={{ width: "100%" }}
          >
            <Button
              variant="outlined"
              onClick={() => setIsModalOpen(false)}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setIsModalOpen(false)}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
            >
              Add Analysis
            </Button>
          </Stack>
        }
      />
    </PageTemplate>
  );
}
