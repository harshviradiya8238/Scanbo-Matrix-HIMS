'use client';

import * as React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, CardHeader, CommonDialog } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import {
  Add as AddIcon,
  Edit as EditIcon,
  CorporateFare as CorporateFareIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  MedicalServices as MedicalServicesIcon,
  Search as SearchIcon,
  LocalHospital as LocalHospitalIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';

interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  active: boolean;
  doctorIds: string[];
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

const ALL_DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Arun Mehta',   specialty: 'Cardiologist' },
  { id: 'd2', name: 'Dr. Priya Sharma', specialty: 'Gynaecologist' },
  { id: 'd3', name: 'Dr. Rakesh Patel', specialty: 'Orthopaedic' },
  { id: 'd4', name: 'Dr. Sneha Joshi',  specialty: 'Paediatrician' },
  { id: 'd5', name: 'Dr. Vikram Singh', specialty: 'Neurologist' },
  { id: 'd6', name: 'Dr. Meena Iyer',   specialty: 'Dermatologist' },
  { id: 'd7', name: 'Dr. Kiran Nair',   specialty: 'General Surgeon' },
  { id: 'd8', name: 'Dr. Ananya Roy',   specialty: 'Psychiatrist' },
];

const SEED_DEPARTMENTS: Department[] = [
  { id: 'dep1', name: 'Cardiology',       code: 'CARD', head: 'Dr. Arun Mehta',   active: true,  doctorIds: ['d1'] },
  { id: 'dep2', name: 'Gynaecology',      code: 'GYN',  head: 'Dr. Priya Sharma', active: true,  doctorIds: ['d2'] },
  { id: 'dep3', name: 'Orthopaedics',     code: 'ORTH', head: 'Dr. Rakesh Patel', active: true,  doctorIds: ['d3'] },
  { id: 'dep4', name: 'Paediatrics',      code: 'PED',  head: 'Dr. Sneha Joshi',  active: true,  doctorIds: ['d4'] },
  { id: 'dep5', name: 'Neurology',        code: 'NEUR', head: 'Dr. Vikram Singh', active: false, doctorIds: ['d5'] },
  { id: 'dep6', name: 'General Medicine', code: 'GM',   head: '',                 active: true,  doctorIds: ['d7', 'd8'] },
];

export default function DepartmentsPage() {
  const theme = useTheme();
  const [departments, setDepartments] = React.useState<Department[]>(SEED_DEPARTMENTS);
  const [selectedId, setSelectedId] = React.useState(SEED_DEPARTMENTS[0].id);
  const [search, setSearch] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState({ name: '', code: '', head: '' });
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const showSnack = (message: string, severity: 'success' | 'error' | 'info' = 'success') =>
    setSnackbar({ open: true, message, severity });

  const selected = React.useMemo(
    () => departments.find((d) => d.id === selectedId) ?? departments[0],
    [departments, selectedId]
  );

  const filtered = React.useMemo(
    () => departments.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
    ),
    [departments, search]
  );

  const assignedDoctors = React.useMemo(
    () => ALL_DOCTORS.filter((doc) => selected?.doctorIds.includes(doc.id)),
    [selected]
  );
  const unassignedDoctors = React.useMemo(
    () => ALL_DOCTORS.filter((doc) => !selected?.doctorIds.includes(doc.id)),
    [selected]
  );

  const stats = React.useMemo(() => ({
    total: departments.length,
    active: departments.filter((d) => d.active).length,
    inactive: departments.filter((d) => !d.active).length,
  }), [departments]);

  const handleOpenCreate = () => { setEditingId(null); setDraft({ name: '', code: '', head: '' }); setDialogOpen(true); };
  const handleOpenEdit = () => { if (!selected) return; setEditingId(selected.id); setDraft({ name: selected.name, code: selected.code, head: selected.head }); setDialogOpen(true); };

  const handleSave = () => {
    if (!draft.name.trim() || !draft.code.trim()) { showSnack('Name and code are required.', 'error'); return; }
    if (editingId) {
      setDepartments((prev) => prev.map((d) => d.id === editingId ? { ...d, ...draft } : d));
      showSnack('Department updated.');
    } else {
      const newDep: Department = { id: `dep${Date.now()}`, ...draft, active: true, doctorIds: [] };
      setDepartments((prev) => [...prev, newDep]);
      setSelectedId(newDep.id);
      showSnack('Department created.');
    }
    setDialogOpen(false);
  };

  const handleToggleActive = (id: string) => {
    setDepartments((prev) => prev.map((d) => d.id === id ? { ...d, active: !d.active } : d));
    showSnack('Status updated.', 'info');
  };

  const handleAssignDoctor = (doctorId: string) => {
    setDepartments((prev) => prev.map((d) => d.id === selectedId ? { ...d, doctorIds: [...d.doctorIds, doctorId] } : d));
    showSnack('Doctor assigned.');
  };

  const handleUnassignDoctor = (doctorId: string) => {
    setDepartments((prev) => prev.map((d) => d.id === selectedId ? { ...d, doctorIds: d.doctorIds.filter((id) => id !== doctorId) } : d));
    showSnack('Doctor removed.', 'info');
  };

  return (
    <PageTemplate title="Departments" currentPageTitle="Departments">
      <Stack spacing={1.25}>

        {/* Banner with Gradient & Modern Typography */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.15),
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 250,
              height: 250,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`,
              zIndex: 0
            }}
          />
          <Stack spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="small" label="Settings / Admin" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.dark', fontWeight: 600 }} />
              <Typography variant="body2" color="text.secondary">/</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Departments</Typography>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: 'text.primary' }}>
              Departments &amp; Services
            </Typography>
          </Stack>
        </Box>

        {/* Stats Section with Glassmorphism */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {[
            { label: 'Total Departments', value: stats.total, color: theme.palette.primary.main, icon: <CorporateFareIcon /> },
            { label: 'Active Operational', value: stats.active, color: theme.palette.success.main, icon: <LocalHospitalIcon /> },
            { label: 'Inactive / Suspended', value: stats.inactive, color: theme.palette.text.secondary, icon: <BadgeIcon /> }
          ].map((stat, idx) => (
            <Box
              key={idx}
              sx={{
                flex: 1,
                p: 2, /* Reduced from p: 3 */
                borderRadius: 4,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                boxShadow: `0 4px 20px ${alpha(stat.color, 0.08)}`,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(stat.color, 0.1), color: stat.color }}>
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>{stat.label}</Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, gap: 3 }}>

          {/* List Panel */}
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha(theme.palette.background.default, 0.4) }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Directory</Typography>
                <Typography variant="body2" color="text.secondary">Select a department to view details</Typography>
              </Box>
              <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ borderRadius: 2 }}>
                New Dept
              </Button>
            </Box>
            <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <TextField 
                size="small" 
                placeholder="Search name or code…" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                fullWidth 
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }} 
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
              <Stack spacing={1} sx={{ flex: 1, overflowY: 'auto', p: 0.5, maxHeight: 400 }}>
                {filtered.map((dep) => {
                  const isSel = dep.id === selected?.id;
                  return (
                    <Box
                      key={dep.id}
                      onClick={() => setSelectedId(dep.id)}
                      sx={{
                        borderRadius: 3,
                        border: '2px solid',
                        borderColor: isSel ? 'primary.main' : 'transparent',
                        p: 1.5,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        backgroundColor: isSel ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.background.default, 0.8),
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: isSel ? alpha(theme.palette.primary.main, 0.06) : alpha(theme.palette.primary.main, 0.04),
                          transform: isSel ? 'none' : 'scale(1.01)',
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          backgroundColor: isSel ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.08),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          color: isSel ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{dep.code}</Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isSel ? 'primary.main' : 'text.primary' }}>{dep.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }} noWrap>
                          {dep.doctorIds.length} affiliated doctor{dep.doctorIds.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      <Stack alignItems="flex-end" spacing={0.5}>
                         <Chip size="small" label={dep.active ? 'Active' : 'Inactive'} color={dep.active ? 'success' : 'default'} sx={{ fontWeight: 600, height: 20, fontSize: '0.65rem' }} />
                      </Stack>
                    </Box>
                  );
                })}
                {filtered.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No departments match your search.</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Card>

          {/* Details Panel */}
          <Stack spacing={2}>
            {/* Top Info Card */}
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', bgcolor: alpha(theme.palette.background.default, 0.4) }}>
                <Box>
                   <Typography variant="caption" color="primary.main" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                     Department Overview
                   </Typography>
                   <Typography variant="subtitle1" sx={{ fontWeight: 800, mt: 0.5 }}>{selected?.name ?? 'Details'}</Typography>
                </Box>
                <Tooltip title="Edit Department">
                  <IconButton size="small" onClick={handleOpenEdit} disabled={!selected} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ p: 2 }}>
                {selected ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                       <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>DEPARTMENT HEAD</Typography>
                       <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selected.head || 'Not Assigned'}</Typography>
                    </Box>
                    <Box>
                       <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>DEPARTMENT CODE</Typography>
                       <Chip size="small" label={selected.code} variant="outlined" sx={{ fontWeight: 700, height: 24 }} />
                    </Box>
                    <Box>
                       <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>OPERATIONAL STATUS</Typography>
                       <Stack direction="row" alignItems="center" spacing={1}>
                          <Switch size="small" checked={selected.active} color="success" onChange={(e) => handleToggleActive(selected.id)} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: selected.active ? 'success.main' : 'text.disabled' }}>
                             {selected.active ? 'Active & Running' : 'Suspended'}
                          </Typography>
                       </Stack>
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>Select a department from the directory to view details.</Alert>
                )}
              </Box>
            </Card>

            {/* Assigned Staff Card */}
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', flex: 1 }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Affiliated Clinicians</Typography>
                  <Typography variant="body2" color="text.secondary">{assignedDoctors.length} assigned</Typography>
                </Box>
                <Button size="small" variant="outlined" startIcon={<PersonAddIcon />} onClick={() => setAssignOpen(true)} disabled={!selected || unassignedDoctors.length === 0} sx={{ borderRadius: 2 }}>
                  Assign Doctor
                </Button>
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack spacing={1} sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {assignedDoctors.length === 0 && (
                    <Box sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                      <MedicalServicesIcon sx={{ fontSize: 32, color: 'text.disabled', opacity: 0.5, mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>No clinicians assigned</Typography>
                    </Box>
                  )}
                  {assignedDoctors.map((doc) => (
                    <Box key={doc.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, transition: 'all 0.2s', '&:hover': { bgcolor: alpha(theme.palette.background.default, 0.4), borderColor: theme.palette.primary.main, transform: 'translateY(-2px)' } }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                        {doc.name.charAt(4)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{doc.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{doc.specialty}</Typography>
                      </Box>
                      <Tooltip title="Remove Assignment">
                        <IconButton size="small" color="error" onClick={() => handleUnassignDoctor(doc.id)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Card>
          </Stack>
        </Box>
      </Stack>

      <CommonDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {editingId ? 'Edit Department' : 'New Department'}
          </Typography>
        }
        maxWidth="sm"
        content={
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size="small" label="Department Name" value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField size="small" label="Department Code" value={draft.code} onChange={(e) => setDraft((p) => ({ ...p, code: e.target.value.toUpperCase() }))} inputProps={{ maxLength: 8 }} helperText="A short, unique identifier (e.g. CARD, GYN)" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField size="small" label="Department Head (Optional)" value={draft.head} onChange={(e) => setDraft((p) => ({ ...p, head: e.target.value }))} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Stack>
        }
        actions={
          <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end', pt: 1 }}>
            <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button size="small" variant="contained" onClick={handleSave} sx={{ borderRadius: 2 }}>{editingId ? 'Save Changes' : 'Create Department'}</Button>
          </Box>
        }
      />

      <CommonDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title={
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Assign Clinician</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Select a doctor to assign to {selected?.name ?? ''}</Typography>
          </Box>
        }
        maxWidth="sm"
        content={
          <Stack spacing={1.5} sx={{ mt: 1, maxHeight: 300, overflowY: 'auto', p: 0.5 }}>
            {unassignedDoctors.length === 0 ? <Alert severity="info" sx={{ borderRadius: 2 }}>All available doctors are already assigned to this department.</Alert> :
              unassignedDoctors.map((doc) => (
                <Box key={doc.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, transition: 'all 0.2s', '&:hover': { bgcolor: alpha(theme.palette.background.default, 0.4), borderColor: theme.palette.primary.main } }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: alpha(theme.palette.text.primary, 0.05), color: 'text.primary', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                    {doc.name.charAt(4)}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{doc.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{doc.specialty}</Typography>
                  </Box>
                  <Button size="small" variant="contained" onClick={() => { handleAssignDoctor(doc.id); setAssignOpen(false); }} sx={{ borderRadius: 2, px: 2 }}>Assign</Button>
                </Box>
              ))
            }
          </Stack>
        }
        actions={<Button size="small" variant="outlined" onClick={() => setAssignOpen(false)} sx={{ borderRadius: 2 }}>Close</Button>}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((p) => ({ ...p, open: false }))} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>{snackbar.message}</Alert>
      </Snackbar>
    </PageTemplate>
  );
}
