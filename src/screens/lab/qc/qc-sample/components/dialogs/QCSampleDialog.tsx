"use client";

import * as React from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
} from "@/src/ui/components/atoms";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";

interface QCSampleDialogProps {
  open: boolean;
  onClose: () => void;
}

function QCSampleDialogBase({ open, onClose }: QCSampleDialogProps) {
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title="Add QC Sample"
      maxWidth="sm"
      content={
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Box>
            <TextField
              label="QC Material*"
              fullWidth
              size="small"
              placeholder="Seronorm Level 1"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
            />
          </Box>

          <Box>
            <TextField
              label="Instrument*"
              fullWidth
              size="small"
              placeholder="Cobas 6000"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
            />
          </Box>

          <Box>
            <TextField
              label="Analyses*"
              fullWidth
              size="small"
              placeholder="Glucose, HbA1c..."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
            />
          </Box>

          <Box>
            <TextField
              label="Westgard Rules to Apply*"
              fullWidth
              size="small"
              placeholder="1₂ₛ + 1₃ₛ + 2₂ₛ + R₄ₛ"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
            />
          </Box>
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
            sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
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
            Add QC Sample
          </Button>
        </Stack>
      }
    />
  );
}

export const QCSampleDialog = React.memo(QCSampleDialogBase);
