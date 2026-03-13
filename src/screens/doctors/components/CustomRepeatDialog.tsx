"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  RadioGroup,
  Radio,
  Typography,
  IconButton,
  Divider,
  Box,
  Paper,
  Select,
} from "@/src/ui/components/atoms";
import { InputBase, alpha, styled } from "@mui/material";
import {
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Sync as SyncIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from "@mui/icons-material";

const StyledLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  fontWeight: 700,
  color: theme.palette.text.secondary,
  letterSpacing: "0.05em",
  marginBottom: theme.spacing(1),
  textTransform: "uppercase",
}));

const RoundedInput = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "12px",
  padding: "8px 12px",
  backgroundColor: theme.palette.background.paper,
  "&:focus-within": {
    borderColor: theme.palette.primary.main,
  },
}));

const DayBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ theme, active }) => ({
  flex: 1,
  height: "44px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
  border: "1px solid",
  borderColor: active ? theme.palette.primary.main : theme.palette.divider,
  backgroundColor: active
    ? alpha(theme.palette.primary.main, 0.05)
    : theme.palette.background.paper,
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  fontSize: "0.8125rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
}));

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type CustomRepeatFrequency = "daily" | "weekly" | "monthly" | "yearly";
export type CustomRepeatEndType = "never" | "end_date";

export interface CustomRepeatConfig {
  startDate: string;
  frequency: CustomRepeatFrequency;
  interval: number;
  days: string[];
  endType: CustomRepeatEndType;
  endDate: string;
}

const defaultConfig: CustomRepeatConfig = {
  startDate: "",
  frequency: "weekly",
  interval: 1,
  days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  endType: "never",
  endDate: "",
};

function formatSummary(config: CustomRepeatConfig): string {
  const freq =
    config.frequency === "daily"
      ? "day"
      : config.frequency === "weekly"
        ? "week"
        : config.frequency === "monthly"
          ? "month"
          : "year";
  const interval = config.interval;
  const every = interval === 1 ? `Every ${freq}` : `Every ${interval} ${freq}s`;

  let daysPart = "";
  if (config.frequency === "weekly" && config.days.length > 0) {
    daysPart = ` on ${config.days.join(", ")}`;
  }

  let endPart = "";
  if (config.endType === "end_date" && config.endDate) {
    endPart = `, until ${config.endDate}`;
  }

  return `${every}${daysPart}${endPart}`;
}

export interface CustomRepeatDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: CustomRepeatConfig) => void;
  initialConfig?: Partial<CustomRepeatConfig>;
  startDate?: string;
}

export default function CustomRepeatDialog({
  open,
  onClose,
  onSave,
  initialConfig,
  startDate,
}: CustomRepeatDialogProps) {
  const [config, setConfig] = React.useState<CustomRepeatConfig>({
    ...defaultConfig,
    ...initialConfig,
  });

  React.useEffect(() => {
    if (open) {
      const defaultStart = startDate || new Date().toISOString().slice(0, 10);
      setConfig({
        ...defaultConfig,
        ...initialConfig,
        startDate: initialConfig?.startDate || defaultStart,
      });
    }
  }, [open, initialConfig, startDate]);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const toggleDay = (day: string) => {
    setConfig((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day].sort(
            (a, b) =>
              DAY_NAMES.indexOf(a as (typeof DAY_NAMES)[number]) -
              DAY_NAMES.indexOf(b as (typeof DAY_NAMES)[number]),
          ),
    }));
  };

  const minEndDate = startDate || new Date().toISOString().slice(0, 10);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 2,
          px: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 800, fontSize: "1.125rem", color: "text.primary" }}
        >
          Custom repeat
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            bgcolor: "action.hover",
            borderRadius: "8px",
            "&:hover": { bgcolor: "action.selected" },
          }}
        >
          <CloseIcon sx={{ fontSize: "1rem", color: "text.secondary" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={3}>
          {/* Section: Starts on */}
          <Box>
            <StyledLabel>Starts on</StyledLabel>
            <RoundedInput>
              <InputBase
                type="date"
                fullWidth
                value={config.startDate}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, startDate: e.target.value }))
                }
                sx={{ fontSize: "0.9375rem", fontWeight: 500 }}
              />
            </RoundedInput>
          </Box>

          {/* Section: Repeat Every */}
          <Box>
            <StyledLabel>Repeat every</StyledLabel>
            <Stack direction="row" spacing={2}>
              <RoundedInput sx={{ width: "80px" }}>
                <InputBase
                  autoFocus
                  type="number"
                  value={config.interval}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      interval: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                  sx={{ fontSize: "0.9375rem", fontWeight: 600 }}
                  inputProps={{ style: { textAlign: "center" } }}
                />
              </RoundedInput>
              <RoundedInput sx={{ flex: 1, cursor: "pointer" }}>
                <Select
                  value={config.frequency}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      frequency: e.target.value as CustomRepeatFrequency,
                      days:
                        e.target.value === "weekly" && prev.days.length === 0
                          ? ["Mon", "Tue", "Wed", "Thu", "Fri"]
                          : prev.days,
                    }))
                  }
                  variant="standard"
                  fullWidth
                  disableUnderline
                  IconComponent={() => (
                    <ArrowDownIcon
                      sx={{ fontSize: "1.25rem", color: "text.secondary" }}
                    />
                  )}
                  sx={{
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    "& .MuiSelect-select": {
                      backgroundColor: "transparent !important",
                      paddingRight: "24px !important",
                    },
                    "&.Mui-focused .MuiSelect-select": {
                      backgroundColor: "transparent !important",
                    },
                  }}
                >
                  <MenuItem value="daily">Day(s)</MenuItem>
                  <MenuItem value="weekly">Week(s)</MenuItem>
                  <MenuItem value="monthly">Month(s)</MenuItem>
                  <MenuItem value="yearly">Year(s)</MenuItem>
                </Select>
              </RoundedInput>
            </Stack>
          </Box>

          {/* Section: Repeat On */}
          {config.frequency === "weekly" && (
            <Box>
              <StyledLabel>Repeat on</StyledLabel>
              <Stack direction="row" spacing={1}>
                {DAY_NAMES.map((day) => {
                  const active = config.days.includes(day);
                  return (
                    <DayBox
                      key={day}
                      active={active}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </DayBox>
                  );
                })}
              </Stack>
            </Box>
          )}

          <Divider sx={{ my: 0.5 }} />

          {/* Section: Ends */}
          <Box>
            <StyledLabel>Ends</StyledLabel>
            <RadioGroup
              value={config.endType}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  endType: e.target.value as CustomRepeatEndType,
                }))
              }
            >
              <Stack spacing={2}>
                <FormControlLabel
                  value="never"
                  control={
                    <Radio
                      size="small"
                      sx={{
                        color: "action.disabled",
                        "&.Mui-checked": { color: "primary.main" },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontSize: "0.9375rem",
                        fontWeight: 500,
                        color: "text.primary",
                      }}
                    >
                      Never
                    </Typography>
                  }
                />

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <FormControlLabel
                    value="end_date"
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: "action.disabled",
                          "&.Mui-checked": { color: "primary.main" },
                        }}
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          fontSize: "0.9375rem",
                          fontWeight: 500,
                          color: "text.primary",
                        }}
                      >
                        On date
                      </Typography>
                    }
                    sx={{ mr: 0 }}
                  />
                  <RoundedInput sx={{ width: "170px", py: "4px" }}>
                    <InputBase
                      type="date"
                      value={config.endDate}
                      disabled={config.endType !== "end_date"}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      sx={{ fontSize: "0.9375rem", fontWeight: 500 }}
                      inputProps={{ min: minEndDate }}
                    />
                  </RoundedInput>
                </Stack>
              </Stack>
            </RadioGroup>
          </Box>

          {/* Summary Box */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              border: "1px solid",
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
            }}
          >
            <SyncIcon sx={{ color: "primary.main", fontSize: "1.25rem", opacity: 0.8 }} />
            <Typography
              sx={{
                color: "text.primary",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              {formatSummary(config)}
            </Typography>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderColor: "divider",
            color: "text.secondary",
            borderRadius: "10px",
            fontWeight: 600,
            py: 1.25,
            "&:hover": {
              borderColor: "text.secondary",
              bgcolor: "action.hover",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          sx={{
            textTransform: "none",
            bgcolor: "primary.main",
            boxShadow: "none",
            borderRadius: "10px",
            fontWeight: 600,
            py: 1.25,
            "&:hover": {
              bgcolor: "primary.dark",
              boxShadow: "none",
            },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export { formatSummary };
