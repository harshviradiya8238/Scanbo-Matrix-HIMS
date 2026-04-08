"use client";

import * as React from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Avatar,
  Switch,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  Tooltip,
  Button,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Shield as ShieldIcon,
  CheckCircleOutline as ActiveIcon,
  SettingsOutlined as SystemIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { alpha } from "@mui/material/styles";
import { PageTemplate } from "@/src/ui/components";
import { StatTile } from "@/src/ui/components/molecules";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BRAND       = "#1172BA";
const BRAND_DARK  = "#0D5A94";
const BRAND_LIGHT = "#E8F3FB";
const BRAND_MID   = "#5BA4D4";
const BORDER      = "#DDE8F0";
const TEXT_PRIMARY   = "#0D1B2A";
const TEXT_SECONDARY = "#5A7184";
const TEXT_MUTED     = "#9AAFBF";
const BG_SURFACE     = "#F5F8FB";

// ─── Types ────────────────────────────────────────────────────────────────────
type Privilege = {
  key: string;
  name: string;
  module: string;
  moduleColor: string;
};

type Role = {
  id: string;
  name: string;
  description: string;
  type: "system" | "custom";
  active: boolean;
  fullAccess: boolean;
  privileges: string[];
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const ALL_PRIVILEGES: Privilege[] = [
  { key: "appointments.read",   name: "Appointments",     module: "Appointments", moduleColor: "#60A5FA" },
  { key: "appointments.write",  name: "Appointments",     module: "Appointments", moduleColor: "#60A5FA" },
  { key: "patients.read",       name: "Patient Records",  module: "Patients",     moduleColor: "#34D399" },
  { key: "patients.write",      name: "Patient Records",  module: "Patients",     moduleColor: "#34D399" },
  { key: "clinical.read",       name: "Clinical Records", module: "Clinical",     moduleColor: "#A78BFA" },
  { key: "clinical.write",      name: "Clinical Records", module: "Clinical",     moduleColor: "#A78BFA" },
  { key: "orders.read",         name: "Orders",           module: "Orders",       moduleColor: "#FBBF24" },
  { key: "orders.write",        name: "Orders",           module: "Orders",       moduleColor: "#FBBF24" },
  { key: "pharmacy.read",       name: "Pharmacy",         module: "Pharmacy",     moduleColor: "#F472B6" },
  { key: "pharmacy.write",      name: "Pharmacy",         module: "Pharmacy",     moduleColor: "#F472B6" },
  { key: "billing.read",        name: "Billing",          module: "Billing",      moduleColor: "#34D399" },
  { key: "billing.write",       name: "Billing",          module: "Billing",      moduleColor: "#34D399" },
  { key: "radiology.read",      name: "Radiology",        module: "Radiology",    moduleColor: "#F87171" },
  { key: "radiology.write",     name: "Radiology",        module: "Radiology",    moduleColor: "#F87171" },
  { key: "revenue_cycle.read",  name: "Revenue Cycle",    module: "Revenue",      moduleColor: "#A78BFA" },
  { key: "scheduling.read",     name: "Scheduling",       module: "Scheduling",   moduleColor: "#60A5FA" },
  { key: "scheduling.write",    name: "Scheduling",       module: "Scheduling",   moduleColor: "#60A5FA" },
  { key: "reports.read",        name: "Reports",          module: "Reports",      moduleColor: "#FB923C" },
  { key: "audit.read",          name: "Audit Logs",       module: "Admin",        moduleColor: "#94A3B8" },
  { key: "admin.roles",         name: "Role Management",  module: "Admin",        moduleColor: "#94A3B8" },
];

const INITIAL_ROLES: Role[] = [
  { id: "doctor",    name: "Doctor",          description: "Full clinical access and patient management",  type: "system", active: true,  fullAccess: false, privileges: ["clinical.read","clinical.write","patients.read","appointments.read","appointments.write","orders.read","orders.write","radiology.read"] },
  { id: "nurse",     name: "Nurse",           description: "Patient care and vitals management",           type: "custom", active: true,  fullAccess: false, privileges: ["clinical.read","patients.read","appointments.read"] },
  { id: "receptionist", name: "Receptionist", description: "Front desk and appointment scheduling",       type: "custom", active: true,  fullAccess: false, privileges: ["appointments.read","appointments.write","patients.read","scheduling.read","scheduling.write"] },
  { id: "pharmacist",   name: "Pharmacist",   description: "Pharmacy and medication management",          type: "custom", active: true,  fullAccess: false, privileges: ["pharmacy.read","pharmacy.write","orders.read","billing.read"] },
  { id: "admin",        name: "Hospital Admin", description: "Full hospital administration access",        type: "system", active: true,  fullAccess: true,  privileges: ALL_PRIVILEGES.map(p => p.key) },
  { id: "billing_mgr",  name: "Billing Manager", description: "Billing and revenue management",          type: "custom", active: false, fullAccess: false, privileges: ["billing.read","billing.write","revenue_cycle.read","reports.read"] },
];

const MODULE_COLORS: Record<string, string> = {
  Clinical: "#EDE9FE", Patients: "#DCFCE7", Appointments: "#DBEAFE",
  Billing: "#FEF3C7", Orders: "#FFE4E6", Pharmacy: "#FCE7F3",
  Radiology: "#FEE2E2", Revenue: "#F3E8FF", Scheduling: "#DBEAFE",
  Reports: "#FFEDD5", Admin: "#F1F5F9",
};
const MODULE_TEXT: Record<string, string> = {
  Clinical: "#5B21B6", Patients: "#166534", Appointments: BRAND,
  Billing: "#92400E", Orders: "#9F1239", Pharmacy: "#9D174D",
  Radiology: "#991B1B", Revenue: "#6B21A8", Scheduling: BRAND,
  Reports: "#9A3412", Admin: "#475569",
};

// ─── Module tag chip ──────────────────────────────────────────────────────────
function ModuleTag({ module }: { module: string }) {
  return (
    <Box sx={{
      display: "inline-block", px: "10px", py: "3px", borderRadius: "6px",
      bgcolor: MODULE_COLORS[module] ?? "#F1F5F9",
      fontSize: 11, fontWeight: 700,
      color: MODULE_TEXT[module] ?? "#475569",
    }}>
      {module}
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RolesPermissionsPage() {
  const [roles, setRoles] = React.useState<Role[]>(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = React.useState("nurse");
  const [selectedPrivKeys, setSelectedPrivKeys] = React.useState<string[]>([]);
  const [moduleFilter, setModuleFilter] = React.useState("All");
  const [availSearch, setAvailSearch] = React.useState("");
  const [grantedSearch, setGrantedSearch] = React.useState("");
  const [snackbar, setSnackbar] = React.useState<{ msg: string; severity: "success" | "error" | "info" } | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [allRolesOpen, setAllRolesOpen] = React.useState(false);
  const [newRole, setNewRole] = React.useState({ name: "", description: "", type: "custom" as "custom" | "system" });

  const selectedRole = roles.find(r => r.id === selectedRoleId)!;

  // Available = not yet in role's privileges
  const availablePrivs = ALL_PRIVILEGES.filter(p => {
    const notGranted = !selectedRole.privileges.includes(p.key);
    const matchModule = moduleFilter === "All" || p.module === moduleFilter;
    const matchSearch = !availSearch || p.name.toLowerCase().includes(availSearch.toLowerCase()) || p.key.toLowerCase().includes(availSearch.toLowerCase());
    return notGranted && matchModule && matchSearch;
  });

  const grantedPrivs = ALL_PRIVILEGES.filter(p => {
    const granted = selectedRole.privileges.includes(p.key);
    const matchSearch = !grantedSearch || p.name.toLowerCase().includes(grantedSearch.toLowerCase()) || p.key.toLowerCase().includes(grantedSearch.toLowerCase());
    return granted && matchSearch;
  });

  const modules = ["All", ...Array.from(new Set(ALL_PRIVILEGES.map(p => p.module)))];

  function togglePriv(key: string) {
    setSelectedPrivKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  function assignSelected() {
    if (!selectedPrivKeys.length) return;
    setRoles(prev => prev.map(r => r.id === selectedRoleId ? { ...r, privileges: [...r.privileges, ...selectedPrivKeys] } : r));
    setSelectedPrivKeys([]);
    setSnackbar({ msg: `${selectedPrivKeys.length} privilege(s) assigned to ${selectedRole.name}`, severity: "success" });
  }

  function removePrivilege(key: string) {
    setRoles(prev => prev.map(r => r.id === selectedRoleId ? { ...r, privileges: r.privileges.filter(k => k !== key) } : r));
    setSnackbar({ msg: "Privilege removed", severity: "info" });
  }

  function updateRole(patch: Partial<Role>) {
    setRoles(prev => prev.map(r => r.id === selectedRoleId ? { ...r, ...patch } : r));
  }

  function saveRole() {
    setSnackbar({ msg: `Role "${selectedRole.name}" saved successfully`, severity: "success" });
  }

  function confirmDelete() {
    const name = selectedRole.name;
    const remaining = roles.filter(r => r.id !== selectedRoleId);
    setRoles(remaining);
    setSelectedRoleId(remaining[0]?.id ?? "");
    setDeleteOpen(false);
    setSnackbar({ msg: `Role "${name}" deleted`, severity: "info" });
  }

  function createRole() {
    if (!newRole.name.trim()) return;
    const id = newRole.name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    const role: Role = { id, name: newRole.name.trim(), description: newRole.description, type: newRole.type, active: true, fullAccess: false, privileges: [] };
    setRoles(prev => [...prev, role]);
    setSelectedRoleId(id);
    setSelectedPrivKeys([]);
    setCreateOpen(false);
    setNewRole({ name: "", description: "", type: "custom" });
    setSnackbar({ msg: `Role "${role.name}" created`, severity: "success" });
  }

  const stats = {
    total: roles.length,
    custom: roles.filter(r => r.type === "custom").length,
    active: roles.filter(r => r.active).length,
    system: roles.filter(r => r.type === "system").length,
  };

  // ── Card shared style ───────────────────────────────────────────────────────
  const card = { borderRadius: "16px", border: `1px solid ${BORDER}`, bgcolor: "background.paper" };

  return (
    <PageTemplate title="Role Management" fullHeight>
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: 1.25 }}>

        {/* ── Page header ── */}
        <Box sx={{ ...card, borderRadius: "22px", px: "22px", py: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.75}>
            <Box sx={{ width: 44, height: 44, borderRadius: "13px", bgcolor: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShieldIcon sx={{ fontSize: 22, color: BRAND }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY }}>Role Management</Typography>
              <Typography sx={{ fontSize: 12, color: TEXT_MUTED, mt: "2px" }}>Manage roles &amp; assign granular permissions</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button onClick={() => setAllRolesOpen(true)} variant="outlined" sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 600, fontSize: 13, borderColor: BORDER, color: TEXT_SECONDARY, "&:hover": { borderColor: BRAND, color: BRAND, bgcolor: BRAND_LIGHT } }}>
              View All Roles
            </Button>
            <Button onClick={() => setCreateOpen(true)} variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, fontSize: 13, bgcolor: BRAND, boxShadow: "none", "&:hover": { bgcolor: BRAND_DARK, boxShadow: "none" } }}>
              Create Role
            </Button>
          </Stack>
        </Box>

        {/* ── Stats ── */}
        <Box sx={{ display: "flex", gap: 1.25, flexShrink: 0 }}>
          {[
            { label: "Total Roles",  value: stats.total,  tone: "primary" as const, icon: <ShieldIcon sx={{ fontSize: 24 }} /> },
            { label: "Custom",       value: stats.custom,  tone: "warning" as const, icon: <SystemIcon sx={{ fontSize: 24 }} /> },
            { label: "Active",       value: stats.active,  tone: "success" as const, icon: <ActiveIcon sx={{ fontSize: 24 }} /> },
            { label: "System",       value: stats.system,  tone: "error"   as const, icon: <ShieldIcon sx={{ fontSize: 24 }} /> },
          ].map(s => (
            <Box key={s.label} sx={{ flex: 1 }}>
              <StatTile label={s.label} value={s.value} tone={s.tone} icon={s.icon} variant="soft" />
            </Box>
          ))}
        </Box>

        {/* ── Role Configuration ── */}
        <Box sx={{ ...card, px: "22px", py: "18px", flexShrink: 0 }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY }}>Role Configuration</Typography>
              <Typography sx={{ fontSize: 11.5, color: TEXT_MUTED, mt: "2px" }}>Update role details and access level</Typography>
            </Box>
            <Stack direction="row" spacing={0.75}>
              {selectedRole.type === "custom" && (
                <Box sx={{ px: "14px", py: "5px", borderRadius: "20px", border: "1.5px solid #D97706", color: "#92400E", bgcolor: "#FEF3C7", fontSize: 11.5, fontWeight: 700 }}>
                  Custom
                </Box>
              )}
              <Box sx={{ px: "14px", py: "5px", borderRadius: "20px", border: `1.5px solid ${selectedRole.active ? "#16A34A" : BORDER}`, color: selectedRole.active ? "#166534" : TEXT_MUTED, bgcolor: selectedRole.active ? "#DCFCE7" : BG_SURFACE, fontSize: 11.5, fontWeight: 700 }}>
                {selectedRole.active ? "Active" : "Inactive"}
              </Box>
            </Stack>
          </Stack>

          {/* Fields row */}
          <Stack direction="row" alignItems="flex-end" gap={1.5} flexWrap="wrap">
            {/* Role selector */}
            <Box>
              <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.5px", mb: "4px" }}>Role</Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: "8px", px: "13px", py: "9px", border: `1.5px solid ${BORDER}`, borderRadius: "10px", bgcolor: BG_SURFACE, minWidth: 140, cursor: "pointer" }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: selectedRole.active ? "#16A34A" : "#94A3B8", flexShrink: 0 }} />
                <Select
                  value={selectedRoleId}
                  onChange={(e) => { setSelectedRoleId(e.target.value); setSelectedPrivKeys([]); }}
                  variant="standard"
                  disableUnderline
                  sx={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY, minWidth: 100, "& .MuiSelect-select": { p: 0 } }}
                >
                  {roles.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                </Select>
              </Box>
            </Box>

            {/* Role name */}
            <Box>
              <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.5px", mb: "4px" }}>Role Name</Typography>
              <TextField
                value={selectedRole.name}
                onChange={e => updateRole({ name: e.target.value })}
                size="small"
                sx={{ width: 160, "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: BG_SURFACE, fontSize: 13 } }}
              />
            </Box>

            {/* Description */}
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.5px", mb: "4px" }}>Description</Typography>
              <TextField
                value={selectedRole.description}
                onChange={e => updateRole({ description: e.target.value })}
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: BG_SURFACE, fontSize: 13 } }}
              />
            </Box>

            {/* Controls */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ ml: "auto", flexShrink: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Switch
                  checked={selectedRole.active}
                  onChange={e => updateRole({ active: e.target.checked })}
                  size="small"
                  sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: BRAND }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: BRAND } }}
                />
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: TEXT_SECONDARY }}>Active</Typography>
              </Stack>
              <FormControlLabel
                control={<Checkbox checked={selectedRole.fullAccess} onChange={e => updateRole({ fullAccess: e.target.checked })} size="small" sx={{ color: BORDER, "&.Mui-checked": { color: BRAND } }} />}
                label={<Typography sx={{ fontSize: 12.5, color: TEXT_SECONDARY }}>Full Access</Typography>}
                sx={{ m: 0 }}
              />
              <Button onClick={saveRole} variant="contained" sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, fontSize: 13, bgcolor: BRAND, boxShadow: "none", px: "22px", "&:hover": { bgcolor: BRAND_DARK, boxShadow: "none" } }}>
                Save
              </Button>
              <Button onClick={() => setDeleteOpen(true)} variant="outlined" startIcon={<DeleteIcon sx={{ fontSize: 14 }} />} sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, fontSize: 13, borderColor: "#FCA5A5", color: "#DC2626", bgcolor: "#FEE2E2", "&:hover": { bgcolor: "#FECACA", borderColor: "#F87171" } }}>
                Delete
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* ── Privileges two-column ── */}
        <Box sx={{ display: "flex", gap: 1.25, flex: 1, minHeight: 0 }}>

          {/* ─ Available Privileges ─ */}
          <Box sx={{ ...card, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Head */}
            <Box sx={{ px: "18px", py: "14px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.25 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.8px", textTransform: "uppercase", color: TEXT_MUTED }}>Available Privileges</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY, mt: "2px" }}>Select &amp; assign to {selectedRole.name}</Typography>
                </Box>
                <Box sx={{ px: "12px", py: "4px", borderRadius: "20px", bgcolor: BRAND_LIGHT, border: `1.5px solid ${BRAND_MID}`, fontSize: 11.5, fontWeight: 700, color: BRAND }}>
                  {availablePrivs.length} available
                </Box>
              </Stack>
              <Stack direction="row" gap={1}>
                <Select
                  value={moduleFilter}
                  onChange={e => setModuleFilter(e.target.value)}
                  size="small"
                  sx={{ flex: 1, fontSize: 12.5, borderRadius: "10px", bgcolor: BG_SURFACE, "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER } }}
                >
                  {modules.map(m => <MenuItem key={m} value={m}>{m === "All" ? "All Modules" : m}</MenuItem>)}
                </Select>
                <TextField
                  value={availSearch}
                  onChange={e => setAvailSearch(e.target.value)}
                  placeholder="Feature or key..."
                  size="small"
                  sx={{ flex: 2, "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: BG_SURFACE, fontSize: 12.5, "& fieldset": { borderColor: BORDER } } }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: TEXT_MUTED }} /></InputAdornment> }}
                />
              </Stack>
            </Box>

            {/* List */}
            <Box sx={{ flex: 1, overflowY: "auto", "&::-webkit-scrollbar": { width: 3 }, "&::-webkit-scrollbar-thumb": { bgcolor: BORDER, borderRadius: 3 } }}>
              {availablePrivs.map(p => {
                const checked = selectedPrivKeys.includes(p.key);
                return (
                  <Box
                    key={p.key}
                    onClick={() => togglePriv(p.key)}
                    sx={{ display: "flex", alignItems: "center", gap: "12px", px: "18px", py: "11px", borderBottom: `1px solid #F3F7FB`, cursor: "pointer", transition: "background .1s", bgcolor: checked ? BRAND_LIGHT : "transparent", "&:hover": { bgcolor: checked ? "#DDF0FB" : "#F8FBFF" } }}
                  >
                    {/* Checkbox */}
                    <Box sx={{ width: 16, height: 16, borderRadius: "5px", border: `2px solid ${checked ? BRAND : BORDER}`, bgcolor: checked ? BRAND : "background.paper", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .12s" }}>
                      {checked && <svg width={9} height={9} viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2"><path d="M2 5l2.5 2.5L8 3" /></svg>}
                    </Box>
                    {/* Module dot */}
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.moduleColor, flexShrink: 0 }} />
                    {/* Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: TEXT_PRIMARY }}>{p.name}</Typography>
                      <Typography sx={{ fontSize: 10.5, color: TEXT_MUTED, mt: "1px" }}>{p.module}</Typography>
                    </Box>
                    {/* Key */}
                    <Box sx={{ px: "10px", py: "3px", borderRadius: "6px", bgcolor: checked ? BRAND_LIGHT : BG_SURFACE, border: `1px solid ${checked ? BRAND_MID : BORDER}`, fontSize: 11, fontWeight: 600, color: checked ? BRAND : TEXT_SECONDARY, fontFamily: "monospace", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {p.key}
                    </Box>
                  </Box>
                );
              })}
              {availablePrivs.length === 0 && (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography sx={{ color: TEXT_MUTED, fontSize: 13 }}>No available privileges</Typography>
                </Box>
              )}
            </Box>

            {/* Footer */}
            <Box sx={{ px: "18px", py: "12px", borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <Typography sx={{ fontSize: 12, color: TEXT_SECONDARY, fontWeight: 500 }}>
                {selectedPrivKeys.length} privilege{selectedPrivKeys.length !== 1 ? "s" : ""} selected
              </Typography>
              <Button
                onClick={assignSelected}
                disabled={selectedPrivKeys.length === 0}
                variant="contained"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, fontSize: 12.5, bgcolor: BRAND, boxShadow: "none", "&:hover": { bgcolor: BRAND_DARK, boxShadow: "none" }, "&.Mui-disabled": { bgcolor: "#CBD5E1", color: "#fff" } }}
              >
                Assign ({selectedPrivKeys.length})
              </Button>
            </Box>
          </Box>

          {/* ─ Configured Privileges ─ */}
          <Box sx={{ ...card, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Head */}
            <Box sx={{ px: "18px", py: "14px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.25 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.8px", textTransform: "uppercase", color: TEXT_MUTED }}>Configured Privileges</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY, mt: "2px" }}>Currently granted to {selectedRole.name}</Typography>
                </Box>
                <Box sx={{ px: "12px", py: "4px", borderRadius: "20px", bgcolor: "#DCFCE7", border: "1.5px solid #86EFAC", fontSize: 11.5, fontWeight: 700, color: "#166534" }}>
                  {grantedPrivs.length} granted
                </Box>
              </Stack>
              <TextField
                value={grantedSearch}
                onChange={e => setGrantedSearch(e.target.value)}
                placeholder="Search assigned privileges..."
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: BG_SURFACE, fontSize: 12.5, "& fieldset": { borderColor: BORDER } } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: TEXT_MUTED }} /></InputAdornment> }}
              />
            </Box>

            {/* Table header */}
            <Box sx={{ display: "grid", gridTemplateColumns: "130px 1fr 170px 36px", px: "18px", py: "10px", bgcolor: BG_SURFACE, borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
              {["Module", "Feature", "Key", ""].map(h => (
                <Typography key={h} sx={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: TEXT_MUTED }}>{h}</Typography>
              ))}
            </Box>

            {/* Rows */}
            <Box sx={{ flex: 1, overflowY: "auto", "&::-webkit-scrollbar": { width: 3 }, "&::-webkit-scrollbar-thumb": { bgcolor: BORDER, borderRadius: 3 } }}>
              {grantedPrivs.map(p => (
                <Box
                  key={p.key}
                  sx={{ display: "grid", gridTemplateColumns: "130px 1fr 170px 36px", alignItems: "center", px: "18px", py: "12px", borderBottom: `1px solid #F3F7FB`, transition: "background .1s", "&:hover": { bgcolor: "#F8FBFF" } }}
                >
                  <Box><ModuleTag module={p.module} /></Box>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: TEXT_PRIMARY }}>{p.name}</Typography>
                  <Box sx={{ px: "10px", py: "3px", borderRadius: "6px", bgcolor: BG_SURFACE, border: `1px solid ${BORDER}`, fontSize: 11, fontWeight: 600, color: TEXT_SECONDARY, fontFamily: "monospace", display: "inline-block" }}>
                    {p.key}
                  </Box>
                  <Tooltip title="Remove privilege">
                    <Box
                      onClick={() => removePrivilege(p.key)}
                      sx={{ width: 26, height: 26, borderRadius: "7px", border: `1px solid ${BORDER}`, bgcolor: "background.paper", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { bgcolor: "#FEE2E2", borderColor: "#FCA5A5", "& svg": { color: "#DC2626" } } }}
                    >
                      <CloseIcon sx={{ fontSize: 12, color: TEXT_MUTED }} />
                    </Box>
                  </Tooltip>
                </Box>
              ))}
              {grantedPrivs.length === 0 && (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography sx={{ color: TEXT_MUTED, fontSize: 13 }}>No privileges configured</Typography>
                </Box>
              )}
            </Box>

            {/* Footer */}
            <Box sx={{ px: "18px", py: "12px", borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
              <Typography sx={{ fontSize: 12, color: TEXT_SECONDARY, fontWeight: 500 }}>
                {grantedPrivs.length} privilege{grantedPrivs.length !== 1 ? "s" : ""} configured
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Create Role Dialog ── */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 16 }}>Create New Role</DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Stack spacing={2}>
            <TextField label="Role Name" value={newRole.name} onChange={e => setNewRole(p => ({ ...p, name: e.target.value }))} fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
            <TextField label="Description" value={newRole.description} onChange={e => setNewRole(p => ({ ...p, description: e.target.value }))} fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
            <Select value={newRole.type} onChange={e => setNewRole(p => ({ ...p, type: e.target.value as "custom" | "system" }))} size="small" sx={{ borderRadius: "10px" }}>
              <MenuItem value="custom">Custom</MenuItem>
              <MenuItem value="system">System</MenuItem>
            </Select>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setCreateOpen(false)} variant="outlined" sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, borderColor: BORDER, color: TEXT_SECONDARY }}>Cancel</Button>
          <Button onClick={createRole} variant="contained" disabled={!newRole.name.trim()} sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, bgcolor: BRAND, boxShadow: "none", "&:hover": { bgcolor: BRAND_DARK, boxShadow: "none" } }}>Create Role</Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 16 }}>Delete Role</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: TEXT_SECONDARY }}>
            Are you sure you want to delete <strong>{selectedRole?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="outlined" sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, borderColor: BORDER, color: TEXT_SECONDARY }}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, bgcolor: "#DC2626", boxShadow: "none", "&:hover": { bgcolor: "#B91C1C", boxShadow: "none" } }}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* ── View All Roles Dialog ── */}
      <Dialog open={allRolesOpen} onClose={() => setAllRolesOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 16 }}>All Roles</DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Stack spacing={1}>
            {roles.map(r => (
              <Box key={r.id} onClick={() => { setSelectedRoleId(r.id); setSelectedPrivKeys([]); setAllRolesOpen(false); }} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: "14px", py: "12px", borderRadius: "10px", border: `1.5px solid ${r.id === selectedRoleId ? BRAND : BORDER}`, bgcolor: r.id === selectedRoleId ? BRAND_LIGHT : "transparent", cursor: "pointer", "&:hover": { bgcolor: r.id === selectedRoleId ? BRAND_LIGHT : BG_SURFACE } }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: r.active ? "#16A34A" : "#94A3B8", flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 13, color: TEXT_PRIMARY }}>{r.name}</Typography>
                    <Typography sx={{ fontSize: 11, color: TEXT_MUTED }}>{r.description}</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Box sx={{ px: "10px", py: "3px", borderRadius: "20px", fontSize: 11, fontWeight: 700, bgcolor: r.type === "custom" ? "#FEF3C7" : "#DBEAFE", color: r.type === "custom" ? "#92400E" : BRAND }}>{r.type}</Box>
                  <Typography sx={{ fontSize: 11, color: TEXT_MUTED }}>{r.privileges.length} privs</Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setAllRolesOpen(false)} variant="outlined" sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, borderColor: BORDER, color: TEXT_SECONDARY }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={Boolean(snackbar)} autoHideDuration={4000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        {snackbar ? (
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)} variant="filled" sx={{ borderRadius: "10px", fontWeight: 600 }}>
            {snackbar.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </PageTemplate>
  );
}
