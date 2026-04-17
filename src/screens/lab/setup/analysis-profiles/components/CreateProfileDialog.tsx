"use client";

import * as React from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Chip,
  Divider,
  Paper,
} from "@/src/ui/components/atoms";
import { CommonDialog } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import { T } from "../tokens";

interface CreateProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProfileDialog({ open, onClose }: CreateProfileDialogProps) {
  const theme = useTheme();

  const [selectedAnalytes, setSelectedAnalytes] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");

  const MOCK_AVIALABLE_TESTS = [
    "Glucose (Fasting)", "Glucose (Post Prandial)", "HbA1c", "Creatinine", "Urea", "Uric Acid",
    "SGOT (AST)", "SGPT (ALT)", "Bilirubin (Total)", "Bilirubin (Direct)", "Alkaline Phosphatase",
    "Sodium", "Potassium", "Chloride", "Calcium", "Phosphorus", "TSH", "Free T3", "Free T4"
  ];

  const handleAddAnalyte = (analyte: string) => {
    if (!selectedAnalytes.includes(analyte)) {
      setSelectedAnalytes([...selectedAnalytes, analyte]);
    }
    setSearchTerm("");
  };

  const handleRemoveAnalyte = (analyte: string) => {
    setSelectedAnalytes(selectedAnalytes.filter(a => a !== analyte));
  };

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title="Create Lab Analysis Profile"
      subtitle="Bundle multiple analytes into a single reusable test profile"
      maxWidth="md"
      fullWidth
      content={
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            {/* Basic Info */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2.5}>
                <Typography variant="overline" sx={{ fontWeight: 800, color: "text.secondary" }}>
                  General Configuration
                </Typography>
                <TextField
                  fullWidth
                  label="Profile Name"
                  placeholder="e.g. Executive Health Checkup"
                  required
                />
                <TextField
                  fullWidth
                  select
                  label="Department"
                  defaultValue="Biochemistry"
                  required
                >
                  <MenuItem value="Haematology">Haematology</MenuItem>
                  <MenuItem value="Biochemistry">Biochemistry</MenuItem>
                  <MenuItem value="Serology">Serology</MenuItem>
                  <MenuItem value="Microbiology">Microbiology</MenuItem>
                </TextField>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Price (₹)" type="number" placeholder="0.00" />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="TAT" placeholder="e.g. 2h" />
                  </Grid>
                </Grid>
              </Stack>
            </Grid>

            {/* Specimen Info */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2.5}>
                <Typography variant="overline" sx={{ fontWeight: 800, color: "text.secondary" }}>
                  Specimen Requirements
                </Typography>
                <TextField
                  fullWidth
                  select
                  label="Sample Type"
                  defaultValue="Blood"
                >
                  <MenuItem value="Blood">Blood (Whole Blood/Serum/Plasma)</MenuItem>
                  <MenuItem value="Urine">Urine</MenuItem>
                  <MenuItem value="Stool">Stool</MenuItem>
                  <MenuItem value="Sputum">Sputum</MenuItem>
                  <MenuItem value="CSF">CSF</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  select
                  label="Container"
                  defaultValue="SST (Yellow)"
                >
                  <MenuItem value="EDTA (Purple)">EDTA (Purple)</MenuItem>
                  <MenuItem value="SST (Yellow)">SST (Yellow)</MenuItem>
                  <MenuItem value="Fluoride (Grey)">Fluoride (Grey)</MenuItem>
                  <MenuItem value="Universal (White)">Universal (White)</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Collection Instructions"
                  placeholder="e.g. 12 hours fasting required"
                />
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Analytes Selection */}
            <Grid item xs={12}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="overline" sx={{ fontWeight: 800, color: "text.secondary" }}>
                    Included Analytes (Test Items)
                  </Typography>
                  <Chip
                    size="small"
                    label={`${selectedAnalytes.length} Selected`}
                    color="primary"
                    sx={{ fontWeight: 700, borderRadius: 1 }}
                  />
                </Stack>

                <Box sx={{ position: "relative" }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search and add tests (e.g. Glucose, TSH...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoComplete="off"
                  />
                  {searchTerm.length > 1 && (
                    <Paper
                      elevation={3}
                      sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        mt: 0.5,
                        maxHeight: 200,
                        overflowY: "auto",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider"
                      }}
                    >
                      {MOCK_AVIALABLE_TESTS.filter(t =>
                        t.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        !selectedAnalytes.includes(t)
                      ).map((test) => (
                        <MenuItem key={test} onClick={() => handleAddAnalyte(test)}>
                          {test}
                        </MenuItem>
                      ))}
                    </Paper>
                  )}
                </Box>

                <Box
                  sx={{
                    p: selectedAnalytes.length > 0 ? 2 : 4,
                    border: "1px dashed",
                    borderColor: selectedAnalytes.length > 0 ? "primary.main" : "divider",
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    minHeight: 100,
                  }}
                >
                  {selectedAnalytes.length > 0 ? (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedAnalytes.map((analyte) => (
                        <Chip
                          key={analyte}
                          label={analyte}
                          onDelete={() => handleRemoveAnalyte(analyte)}
                          sx={{
                            bgcolor: "background.paper",
                            fontWeight: 600,
                            borderRadius: 1.5,
                            border: "1px solid",
                            borderColor: alpha(theme.palette.primary.main, 0.2)
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                      No tests added yet. Use the search bar above to build your profile.
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      }
      actions={
        <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
          <Button variant="outlined" fullWidth onClick={onClose} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button variant="contained" fullWidth onClick={onClose} sx={{ fontWeight: 700, bgcolor: T.primary }}>
            Save Profile
          </Button>
        </Stack>
      }
    />
  );
}
