'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  TrendingDown as TrendingDownIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { addInventoryItem, adjustInventoryStock } from '@/src/store/slices/limsSlice';
import type { InventoryItemStatus, LabInventoryItem } from '../lab-types';
import LabWorkspaceCard from '../components/LabWorkspaceCard';

type FilterMode = 'all' | InventoryItemStatus | 'expiring';
type AdjustMode = 'restock' | 'consume';

type AddInventoryForm = {
  sku: string;
  name: string;
  category: string;
  unit: string;
  onHand: string;
  reorderLevel: string;
  expiry: string;
  location: string;
  vendor: string;
};

const DEFAULT_FORM: AddInventoryForm = {
  sku: '',
  name: '',
  category: 'Reagent',
  unit: 'unit',
  onHand: '0',
  reorderLevel: '0',
  expiry: '',
  location: '',
  vendor: '',
};

function getStatus(item: LabInventoryItem): InventoryItemStatus {
  if (item.onHand <= 0) return 'out';
  if (item.onHand <= item.reorderLevel) return 'low';
  return 'ok';
}

function expiringSoon(item: LabInventoryItem): boolean {
  if (!item.expiry) return false;
  const expiry = new Date(item.expiry);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= 45;
}

function statusChip(status: InventoryItemStatus) {
  if (status === 'ok') return <Chip size="small" label="In Stock" color="success" />;
  if (status === 'low') return <Chip size="small" label="Low Stock" color="warning" />;
  return <Chip size="small" label="Out of Stock" color="error" />;
}

function InventoryDetailView({
  item,
  onBack,
  onAdjust,
}: {
  item: LabInventoryItem;
  onBack: () => void;
  onAdjust: (mode: AdjustMode, quantity: number) => void;
}) {
  const [mode, setMode] = React.useState<AdjustMode>('restock');
  const [quantity, setQuantity] = React.useState('1');

  const status = getStatus(item);
  const thresholdGap = item.onHand - item.reorderLevel;

  const submit = () => {
    const parsed = Math.max(0, parseInt(quantity, 10) || 0);
    if (parsed <= 0) return;
    onAdjust(mode, parsed);
    setQuantity('1');
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} size="small">
          Back
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.sku} · {item.category}
          </Typography>
        </Box>
        {statusChip(status)}
      </Stack>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, mb: 2 }}>
        <Card elevation={0} sx={{ borderRadius: 1.5, p: 2 }}>
          <Typography variant="overline" color="primary.main">On Hand</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{item.onHand}</Typography>
        </Card>
        <Card elevation={0} sx={{ borderRadius: 1.5, p: 2 }}>
          <Typography variant="overline" color="primary.main">Reorder Level</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{item.reorderLevel}</Typography>
        </Card>
        <Card elevation={0} sx={{ borderRadius: 1.5, p: 2 }}>
          <Typography variant="overline" color="primary.main">Threshold Gap</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: thresholdGap < 0 ? 'error.main' : 'success.main' }}>
            {thresholdGap >= 0 ? `+${thresholdGap}` : thresholdGap}
          </Typography>
        </Card>
        <Card elevation={0} sx={{ borderRadius: 1.5, p: 2 }}>
          <Typography variant="overline" color="primary.main">Expiry</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.expiry || '—'}</Typography>
          {expiringSoon(item) && <Typography variant="caption" color="warning.main">Expires in ≤45 days</Typography>}
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Card elevation={0} sx={{ borderRadius: 1.5, p: 2 }}>
          <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 1.5, mb: 1.5, display: 'block' }}>
            Item Details
          </Typography>
          {[
            ['SKU', item.sku],
            ['Item', item.name],
            ['Category', item.category],
            ['Unit', item.unit],
            ['Vendor', item.vendor || '—'],
            ['Location', item.location || '—'],
            ['Expiry', item.expiry || '—'],
          ].map(([label, value]) => (
            <Stack key={String(label)} direction="row" justifyContent="space-between" sx={{ py: 0.85, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(value)}</Typography>
            </Stack>
          ))}
        </Card>

        <Card elevation={0} sx={{ borderRadius: 1.5, p: 2 }}>
          <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 1.5, mb: 1.5, display: 'block' }}>
            Stock Adjustment
          </Typography>
          <Stack spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Action</InputLabel>
              <Select value={mode} label="Action" onChange={(e) => setMode(e.target.value as AdjustMode)}>
                <MenuItem value="restock">Restock</MenuItem>
                <MenuItem value="consume">Consume</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Quantity"
              type="number"
              size="small"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              inputProps={{ min: 1 }}
            />
            <Button
              variant="contained"
              color={mode === 'restock' ? 'success' : 'warning'}
              onClick={submit}
              disabled={Math.max(0, parseInt(quantity, 10) || 0) <= 0}
            >
              {mode === 'restock' ? 'Apply Restock' : 'Apply Consumption'}
            </Button>
            <Typography variant="caption" color="text.secondary">
              Use this panel to keep inventory levels accurate after receipt or test run usage.
            </Typography>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}

export default function LabInventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { inventory } = useAppSelector((state) => state.lims);

  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<FilterMode>('all');
  const [addOpen, setAddOpen] = React.useState(false);
  const [form, setForm] = React.useState<AddInventoryForm>(DEFAULT_FORM);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const selectedId = searchParams.get('id');
  const selectedItem = inventory.find((item) => item.id === selectedId) ?? null;

  const rows = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    return inventory
      .filter((item) => {
        const status = getStatus(item);
        const matchesSearch =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          (item.vendor || '').toLowerCase().includes(q) ||
          (item.location || '').toLowerCase().includes(q);

        if (!matchesSearch) return false;
        if (filter === 'all') return true;
        if (filter === 'expiring') return expiringSoon(item);
        return status === filter;
      })
      .sort((a, b) => {
        const rank = { out: 0, low: 1, ok: 2 } as const;
        return rank[getStatus(a)] - rank[getStatus(b)];
      });
  }, [inventory, search, filter]);

  const totalItems = inventory.length;
  const outOfStock = inventory.filter((item) => getStatus(item) === 'out').length;
  const lowStock = inventory.filter((item) => getStatus(item) === 'low').length;
  const expiring = inventory.filter(expiringSoon).length;

  const resetAddForm = () => setForm(DEFAULT_FORM);

  const handleAddItem = () => {
    if (!form.sku.trim() || !form.name.trim()) {
      setSnackbar({ open: true, message: 'SKU and item name are required.', severity: 'error' });
      return;
    }

    dispatch(
      addInventoryItem({
        sku: form.sku.trim(),
        name: form.name.trim(),
        category: form.category,
        unit: form.unit.trim() || 'unit',
        onHand: Math.max(0, parseInt(form.onHand, 10) || 0),
        reorderLevel: Math.max(0, parseInt(form.reorderLevel, 10) || 0),
        expiry: form.expiry || undefined,
        location: form.location.trim() || undefined,
        vendor: form.vendor.trim() || undefined,
      })
    );

    setAddOpen(false);
    resetAddForm();
    setSnackbar({ open: true, message: 'Inventory item added.', severity: 'success' });
  };

  const handleAdjust = (item: LabInventoryItem, mode: AdjustMode, quantity: number) => {
    const delta = mode === 'restock' ? quantity : -quantity;
    dispatch(adjustInventoryStock({ itemId: item.id, delta }));
    setSnackbar({
      open: true,
      severity: 'success',
      message: `${item.name} ${mode === 'restock' ? 'restocked' : 'consumed'} by ${quantity}.`,
    });
  };

  if (selectedItem) {
    return (
      <PageTemplate title="Inventory" currentPageTitle="Inventory Detail">
        <LabWorkspaceCard current="inventory">
          <Stack spacing={2}>
            <InventoryDetailView
            item={selectedItem}
            onBack={() => router.push('/lab/inventory')}
            onAdjust={(mode, quantity) => handleAdjust(selectedItem, mode, quantity)}
          />
          </Stack>
        </LabWorkspaceCard>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4500}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Inventory"
      subtitle="Manage reagents, consumables and stock thresholds"
      currentPageTitle="Inventory"
    >
      <LabWorkspaceCard
        current="inventory"
        actions={
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
            Add Item
          </Button>
        }
      >
        <Stack spacing={2}>
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
          <Card elevation={0} sx={{ borderRadius: 1.5, p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <InventoryIcon color="primary" fontSize="small" />
              <Typography variant="overline" color="primary.main">Total Items</Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{totalItems}</Typography>
          </Card>
          <Card elevation={0} sx={{ borderTop: '2px solid', borderTopColor: 'warning.main', borderRadius: 1.5, p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <TrendingDownIcon color="warning" fontSize="small" />
              <Typography variant="overline" color="warning.main">Low Stock</Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{lowStock}</Typography>
          </Card>
          <Card elevation={0} sx={{ borderTop: '2px solid', borderTopColor: 'error.main', borderRadius: 1.5, p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <WarningAmberIcon color="error" fontSize="small" />
              <Typography variant="overline" color="error.main">Out Of Stock</Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{outOfStock}</Typography>
          </Card>
          <Card elevation={0} sx={{ borderTop: '2px solid', borderTopColor: 'info.main', borderRadius: 1.5, p: 2 }}>
            <Typography variant="overline" color="info.main">Expiring ≤ 45 Days</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{expiring}</Typography>
          </Card>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by SKU, item, location or vendor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ maxWidth: 340 }}
          />
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Filter</InputLabel>
            <Select value={filter} label="Filter" onChange={(e) => setFilter(e.target.value as FilterMode)}>
              <MenuItem value="all">All Items</MenuItem>
              <MenuItem value="ok">In Stock</MenuItem>
              <MenuItem value="low">Low Stock</MenuItem>
              <MenuItem value="out">Out of Stock</MenuItem>
              <MenuItem value="expiring">Expiring Soon</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary">{rows.length} item(s)</Typography>
        </Stack>

        <Card elevation={0} sx={{ borderRadius: 1.5 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>On Hand</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reorder</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Expiry</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((item) => {
                  const status = getStatus(item);
                  return (
                    <TableRow key={item.id} hover sx={{ cursor: 'pointer' }} onClick={() => router.push(`/lab/inventory?id=${item.id}`)}>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{item.sku}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.vendor || '—'} · {item.unit}</Typography>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.onHand}</TableCell>
                      <TableCell>{item.reorderLevel}</TableCell>
                      <TableCell>
                        {item.expiry || '—'}
                        {expiringSoon(item) && <Chip size="small" color="warning" label="Soon" sx={{ ml: 0.75 }} />}
                      </TableCell>
                      <TableCell>{item.location || '—'}</TableCell>
                      <TableCell>{statusChip(status)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button size="small" variant="outlined" color="info" onClick={() => router.push(`/lab/inventory?id=${item.id}`)}>
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {rows.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No inventory items found.</Typography>
            </Box>
          )}
        </Card>
        </Stack>
      </LabWorkspaceCard>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Inventory Item</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="SKU" value={form.sku} onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))} size="small" fullWidth required />
              <TextField label="Item Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} size="small" fullWidth required />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Category" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} size="small" fullWidth />
              <TextField label="Unit" value={form.unit} onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))} size="small" fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="On Hand" type="number" value={form.onHand} onChange={(e) => setForm((prev) => ({ ...prev, onHand: e.target.value }))} size="small" fullWidth />
              <TextField label="Reorder Level" type="number" value={form.reorderLevel} onChange={(e) => setForm((prev) => ({ ...prev, reorderLevel: e.target.value }))} size="small" fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Expiry" type="date" value={form.expiry} onChange={(e) => setForm((prev) => ({ ...prev, expiry: e.target.value }))} size="small" InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="Location" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} size="small" fullWidth />
            </Stack>
            <TextField label="Vendor" value={form.vendor} onChange={(e) => setForm((prev) => ({ ...prev, vendor: e.target.value }))} size="small" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddItem}>Add Item</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
}
