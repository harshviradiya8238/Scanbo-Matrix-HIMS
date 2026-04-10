"use client";

import * as React from "react";
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { Science as ScienceIcon } from "@mui/icons-material";
import { CommonDialog } from "@/src/ui/components/molecules";

export interface OrderCatalogItem {
  id: string;
  name: string;
  category: string;
  defaultPriority?: string;
}

export interface DraftOrderLine {
  id: string;
  catalogId: string;
  orderName: string;
  category: string;
  priority: string;
  instructions: string;
  frequency: string;
  duration: string;
}

interface CommonOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (order: DraftOrderLine) => void;
  catalog: OrderCatalogItem[];
  categories: string[];
  initialData?: DraftOrderLine | null;
  title?: string;
  // Options to show/hide specific fields
  showFrequency?: boolean;
  showDuration?: boolean;
}

export const CommonOrderDialog: React.FC<CommonOrderDialogProps> = ({
  open,
  onClose,
  onSave,
  catalog,
  categories,
  initialData,
  title,
  showFrequency = false,
  showDuration = false,
}) => {
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [draft, setDraft] = React.useState<DraftOrderLine>(() => ({
    id: `order-line-${Date.now()}`,
    catalogId: catalog[0]?.id ?? "",
    orderName: catalog[0]?.name ?? "",
    category: catalog[0]?.category ?? "Lab",
    priority: catalog[0]?.defaultPriority ?? "Routine",
    instructions: "",
    frequency: "Once",
    duration: "",
  }));

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setDraft(initialData);
      } else {
        setDraft({
          id: `order-line-${Date.now()}`,
          catalogId: catalog[0]?.id ?? "",
          orderName: catalog[0]?.name ?? "",
          category: catalog[0]?.category ?? "Lab",
          priority: catalog[0]?.defaultPriority ?? "Routine",
          instructions: "",
          frequency: "Once",
          duration: "",
        });
      }
    }
  }, [open, initialData, catalog]);

  const filteredCatalog = React.useMemo(
    () =>
      catalog.filter(
        (item) =>
          (categoryFilter === "All" || item.category === categoryFilter) &&
          (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())),
      ),
    [categoryFilter, searchQuery, catalog],
  );

  const handleSelectFromCatalog = (item: OrderCatalogItem) => {
    setDraft((prev) => ({
      ...prev,
      catalogId: item.id,
      orderName: item.name,
      category: item.category,
      priority: item.defaultPriority ?? prev.priority,
    }));
  };

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      title={title || (initialData ? "Edit Order" : "Place New Orders")}
      icon={<ScienceIcon fontSize="small" />}
      contentDividers
      content={
        <Grid container spacing={2}>
          {!initialData && (
            <Grid item xs={12} md={5}>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    select
                    size="small"
                    label="Category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    sx={{ minWidth: 120 }}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    size="small"
                    placeholder="Search catalog..."
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Stack>
                <Stack
                  spacing={0.5}
                  sx={{
                    maxHeight: 350,
                    overflowY: "auto",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 0.5,
                    backgroundColor: "background.paper",
                  }}
                >
                  {filteredCatalog.map((item) => (
                    <Button
                      key={item.id}
                      variant={
                        draft.catalogId === item.id ? "contained" : "text"
                      }
                      size="small"
                      fullWidth
                      sx={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        py: 0.75,
                        px: 1,
                        borderRadius: 1,
                      }}
                      onClick={() => handleSelectFromCatalog(item)}
                    >
                      <Stack>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="inherit"
                          sx={{ opacity: 0.8 }}
                        >
                          {item.category}
                        </Typography>
                      </Stack>
                    </Button>
                  ))}
                  {filteredCatalog.length === 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        p: 2,
                        textAlign: "center",
                        color: "text.secondary",
                      }}
                    >
                      No orders match search
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Grid>
          )}
          <Grid item xs={12} md={initialData ? 12 : 7}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Order Details
              </Typography>
              <TextField
                fullWidth
                disabled
                label="Selected Order"
                value={draft.orderName || "Select an order from catalog"}
                variant="outlined"
              />
              <Stack direction="row" spacing={1.5}>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  value={draft.priority}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      priority: e.target.value,
                    }))
                  }
                >
                  {["Routine", "Urgent", "STAT"].map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  disabled
                  label="Category"
                  value={draft.category || "--"}
                />
              </Stack>

              {(showFrequency || showDuration) && (
                <Stack direction="row" spacing={1.5}>
                  {showFrequency && (
                    <TextField
                      fullWidth
                      label="Frequency"
                      placeholder="e.g. Once, Q8H, Daily"
                      value={draft.frequency}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          frequency: e.target.value,
                        }))
                      }
                    />
                  )}
                  {showDuration && (
                    <TextField
                      fullWidth
                      label="Duration"
                      placeholder="e.g. 3 days, Ongoing"
                      value={draft.duration}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          duration: e.target.value,
                        }))
                      }
                    />
                  )}
                </Stack>
              )}

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Instructions / Reason"
                placeholder="Enter any specific instructions or reason for this order..."
                value={draft.instructions}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    instructions: e.target.value,
                  }))
                }
              />
            </Stack>
          </Grid>
        </Grid>
      }
      actions={
        <Stack direction="row" spacing={1} sx={{ px: 1, pb: 0.5 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<ScienceIcon />}
            onClick={() => onSave(draft)}
            disabled={!draft.orderName}
          >
            {initialData ? "Update Order" : "Place Order"}
          </Button>
        </Stack>
      }
    />
  );
};
