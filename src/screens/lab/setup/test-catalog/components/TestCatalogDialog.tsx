"use client";

import * as React from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
} from "@/src/ui/components/atoms";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";

interface TestCatalogDialogProps {
  open: boolean;
  onClose: () => void;
}

function TestCatalogDialogBase({ open, onClose }: TestCatalogDialogProps) {
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title="Add Analysis Service"
      maxWidth="md"
      content={
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2.5}>
            <Box sx={{ flex: 1 }}>
              
              <TextField
                label="Keyword*"
                fullWidth
                size="small"
                placeholder="e.g. HGB"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Full Name*"
                fullWidth
                size="small"
                placeholder="e.g. Haemoglobin"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>
          </Stack>

          <Stack direction="row" spacing={2.5}>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Category*"
                fullWidth
                size="small"
                placeholder="Haematology"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Unit*"
                fullWidth
                size="small"
                placeholder="e.g. g/dL"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>
          </Stack>

          <Stack direction="row" spacing={2.5}>
            <Box sx={{ flex: 1 }}>
            
              <TextField
                label="Normal Range (Male)"
                fullWidth
                size="small"
                placeholder="13.0–17.0"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
             
              <TextField
                label="Normal Range (Female)"
                fullWidth
                size="small"
                placeholder="12.0–16.0"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>
          </Stack>

          <Stack direction="row" spacing={2.5}>
            <Box sx={{ flex: 1 }}>
             
              <TextField
                label="Critical Low*"
                fullWidth
                size="small"
                placeholder="e.g. 7.0"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
            
              <TextField
                label="Critical High*"
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
            onClick={onClose}
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
            onClick={onClose}
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
  );
}

export const TestCatalogDialog = React.memo(TestCatalogDialogBase);
