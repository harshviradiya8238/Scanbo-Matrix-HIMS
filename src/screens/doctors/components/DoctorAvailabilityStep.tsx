'use client';

import * as React from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@/src/ui/components/atoms';
import { useTheme, alpha } from '@/src/ui/theme';
import { FormikProps } from 'formik';
import { DoctorRegistrationFormData, DaySchedule, TimeSlot } from '../types/doctor-registration.types';

interface DoctorAvailabilityStepProps extends FormikProps<DoctorRegistrationFormData> {}

const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { on: true,  hol: false, work: [{ s: '09:00', e: '18:00' }], breaks: [{ s: '13:00', e: '13:30' }] },
  { on: true,  hol: false, work: [{ s: '09:00', e: '18:00' }], breaks: [{ s: '13:00', e: '13:30' }] },
  { on: true,  hol: false, work: [{ s: '09:00', e: '18:00' }], breaks: [{ s: '13:00', e: '13:30' }] },
  { on: true,  hol: false, work: [{ s: '09:00', e: '18:00' }], breaks: [{ s: '13:00', e: '13:30' }] },
  { on: true,  hol: false, work: [{ s: '09:00', e: '17:00' }], breaks: [] },
  { on: true,  hol: false, work: [{ s: '10:00', e: '14:00' }], breaks: [] },
  { on: false, hol: false, work: [], breaks: [] },
];

// Build time options 06:00 – 22:00 every 30 min
const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 22; h++) {
  TIME_OPTIONS.push(String(h).padStart(2, '0') + ':00');
  if (h < 22) TIME_OPTIONS.push(String(h).padStart(2, '0') + ':30');
}

function calcDuration(s: string, e: string): string {
  const [sh, sm] = s.split(':').map(Number);
  const [eh, em] = e.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

type ModalMode = 'work' | 'break' | 'holiday' | null;

interface ModalState {
  mode: ModalMode;
  dayIdx: number;
  startTime: string;
  endTime: string;
}

export default function DoctorAvailabilityStep({ values, setFieldValue }: DoctorAvailabilityStepProps) {
  const theme = useTheme();

  // Use local state so the grid always has data regardless of Formik internals.
  // Seed from values if present and non-empty, otherwise use defaults.
  const [schedule, setSchedule] = React.useState<DaySchedule[]>(() => {
    const v = values.weeklySchedule;
    return Array.isArray(v) && v.length === 7 ? v : DEFAULT_SCHEDULE;
  });

  const [modal, setModal] = React.useState<ModalState>({
    mode: null,
    dayIdx: 0,
    startTime: '09:00',
    endTime: '17:00',
  });

  const updateSchedule = (newSchedule: DaySchedule[]) => {
    setSchedule(newSchedule);
    setFieldValue('weeklySchedule', newSchedule);
  };

  const toggleDay = (di: number) => {
    if (schedule[di].hol) return;
    const next = schedule.map((d, i) => i === di ? { ...d, on: !d.on } : d);
    updateSchedule(next);
  };

  const markHoliday = (di: number) => {
    const next = schedule.map((d, i) =>
      i === di ? { ...d, hol: true, on: false } : d
    );
    updateSchedule(next);
    setModal({ ...modal, mode: null });
  };

  const removeHoliday = (di: number) => {
    const next = schedule.map((d, i) =>
      i === di ? { ...d, hol: false, on: true } : d
    );
    updateSchedule(next);
  };

  const addWorkSlot = () => {
    const { dayIdx, startTime, endTime } = modal;
    if (startTime >= endTime) return;
    const next = schedule.map((d, i) =>
      i === dayIdx ? { ...d, work: [...d.work, { s: startTime, e: endTime }] } : d
    );
    updateSchedule(next);
    setModal({ ...modal, mode: null });
  };

  const addBreakSlot = () => {
    const { dayIdx, startTime, endTime } = modal;
    if (startTime >= endTime) return;
    const next = schedule.map((d, i) =>
      i === dayIdx ? { ...d, breaks: [...d.breaks, { s: startTime, e: endTime }] } : d
    );
    updateSchedule(next);
    setModal({ ...modal, mode: null });
  };

  const removeWork = (di: number, idx: number) => {
    const next = schedule.map((d, i) =>
      i === di ? { ...d, work: d.work.filter((_, j) => j !== idx) } : d
    );
    updateSchedule(next);
  };

  const removeBreak = (di: number, idx: number) => {
    const next = schedule.map((d, i) =>
      i === di ? { ...d, breaks: d.breaks.filter((_, j) => j !== idx) } : d
    );
    updateSchedule(next);
  };

  const openWorkModal = (di: number) => {
    setModal({ mode: 'work', dayIdx: di, startTime: '09:00', endTime: '17:00' });
  };
  const openBreakModal = (di: number) => {
    setModal({ mode: 'break', dayIdx: di, startTime: '12:00', endTime: '12:30' });
  };
  const openHolModal = (di: number) => {
    setModal({ mode: 'holiday', dayIdx: di, startTime: '', endTime: '' });
  };

  const availCount = schedule.filter(d => d.on && !d.hol).length;
  const holCount   = schedule.filter(d => d.hol).length;
  const offCount   = schedule.filter(d => !d.on && !d.hol).length;

  // colours
  const green      = '#059669';
  const greenLight = '#ECFDF5';
  const greenMid   = '#A7F3D0';
  const amber      = '#D97706';
  const amberLight = '#FFFBEB';
  const amberMid   = '#FDE68A';
  const red        = '#DC2626';
  const redLight   = '#FEF2F2';
  const redMid     = '#FECACA';
  const blue       = theme.palette.primary.main;
  const blueLight  = alpha(blue, 0.08);
  const blueMid    = alpha(blue, 0.25);

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      {/* Hint bar */}
      <Box
        sx={{
          px: 2, py: 1,
          borderRadius: 1.5,
          background: blueLight,
          border: `1px solid ${blueMid}`,
          display: 'flex', alignItems: 'center', gap: 1,
          flexShrink: 0,
        }}
      >
        <Box sx={{ color: blue, fontSize: 14, lineHeight: 1, flexShrink: 0 }}>ℹ</Box>
        <Typography variant="caption" sx={{ color: blue, fontWeight: 500 }}>
          Toggle each day on/off · Add multiple working hours &amp; breaks · Mark holidays · Scroll right if needed
        </Typography>
      </Box>

      {/* 7-column grid */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowX: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { borderRadius: 4, background: alpha('#000', 0.18) },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(148px, 1fr))',
            minWidth: 1036,
            height: '100%',
          }}
        >
          {schedule.map((day, di) => {
            const isHol = day.hol;
            const isOn  = day.on && !day.hol;
            const isOff = !day.on && !day.hol;

            const headBg = isHol
              ? `linear-gradient(180deg, ${redLight} 0%, #fff 100%)`
              : isOn
              ? `linear-gradient(180deg, ${greenLight} 0%, #fff 100%)`
              : alpha('#000', 0.02);

            const bodyBg = isHol ? '#FFFAFA' : isOff ? alpha('#000', 0.015) : '#fff';

            const pillBg    = isHol ? redLight    : isOn ? greenLight : alpha('#000', 0.04);
            const pillColor = isHol ? red         : isOn ? green      : '#6B7280';
            const pillBorder= isHol ? redMid      : isOn ? greenMid   : '#CDD3DC';
            const dotColor  = isHol ? red         : isOn ? green      : '#9CA3AF';
            const pillLabel = isHol ? '🏖 Holiday' : isOn ? 'Available' : 'Off';

            return (
              <Box
                key={di}
                sx={{
                  borderRight: di < 6 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                {/* Column header */}
                <Box
                  sx={{
                    px: 1.25, pt: 1.75, pb: 1.5,
                    textAlign: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    background: headBg,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 14, fontWeight: 700,
                      color: isHol ? red : isOff ? '#9CA3AF' : 'text.primary',
                    }}
                  >
                    {DAY_SHORT[di]}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: 'text.secondary', mt: '2px' }}>
                    {DAY_FULL[di]}
                  </Typography>

                  {/* Toggle pill */}
                  <Box
                    component="button"
                    type="button"
                    onClick={() => toggleDay(di)}
                    sx={{
                      mt: 1, display: 'inline-flex', alignItems: 'center',
                      gap: '5px', px: 1.25, py: '4px', borderRadius: 999,
                      border: `1px solid ${pillBorder}`,
                      background: pillBg, color: pillColor,
                      fontSize: 10, fontWeight: 700,
                      cursor: isHol ? 'default' : 'pointer',
                      transition: 'all .15s',
                      fontFamily: 'inherit',
                      '&:hover': !isHol ? { background: isOn ? greenMid : '#E5E7EB' } : {},
                    }}
                  >
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                    {pillLabel}
                  </Box>
                </Box>

                {/* Slot cards */}
                <Box
                  sx={{
                    p: '8px 8px 4px',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    background: bodyBg,
                    '&::-webkit-scrollbar': { width: 3 },
                    '&::-webkit-scrollbar-thumb': { background: '#CDD3DC', borderRadius: 4 },
                  }}
                >
                  {isHol && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '5px', py: 3 }}>
                      <Typography sx={{ fontSize: 22, opacity: 0.5 }}>🏖️</Typography>
                      <Typography sx={{ fontSize: 12, color: red, fontWeight: 700, textAlign: 'center' }}>Holiday</Typography>
                    </Box>
                  )}

                  {isOff && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '5px', py: 3 }}>
                      <Typography sx={{ fontSize: 18, opacity: 0.25 }}>—</Typography>
                      <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, textAlign: 'center' }}>Day off</Typography>
                    </Box>
                  )}

                  {isOn && day.work.length === 0 && day.breaks.length === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '5px', py: 3 }}>
                      <Typography sx={{ fontSize: 20, opacity: 0.4 }}>📅</Typography>
                      <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, textAlign: 'center' }}>No slots yet<br />Add hours below</Typography>
                    </Box>
                  )}

                  {isOn && day.work.map((slot, idx) => (
                    <SlotCard
                      key={`w-${idx}`}
                      type="work"
                      slot={slot}
                      onRemove={() => removeWork(di, idx)}
                      green={green} greenLight={greenLight} greenMid={greenMid}
                      amber={amber} amberLight={amberLight} amberMid={amberMid}
                      red={red}
                    />
                  ))}

                  {isOn && day.breaks.map((slot, idx) => (
                    <SlotCard
                      key={`b-${idx}`}
                      type="break"
                      slot={slot}
                      onRemove={() => removeBreak(di, idx)}
                      green={green} greenLight={greenLight} greenMid={greenMid}
                      amber={amber} amberLight={amberLight} amberMid={amberMid}
                      red={red}
                    />
                  ))}
                </Box>

                {/* Action buttons */}
                <Box sx={{ px: 1, pb: 1.25, display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
                  {isHol ? (
                    <DashedBtn
                      label="↩ Remove holiday"
                      borderColor={greenMid} color={green}
                      hoverBg={greenLight} solid
                      onClick={() => removeHoliday(di)}
                    />
                  ) : isOn ? (
                    <>
                      <DashedBtn label="+ Add working hours" borderColor={greenMid} color={green} hoverBg={greenLight} onClick={() => openWorkModal(di)} />
                      <DashedBtn label="+ Add break" borderColor={amberMid} color={amber} hoverBg={amberLight} onClick={() => openBreakModal(di)} />
                      <DashedBtn label="🏖 Mark holiday" borderColor={redMid} color={red} hoverBg={redLight} onClick={() => openHolModal(di)} />
                    </>
                  ) : null}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Summary footer */}
      <Box
        sx={{
          px: 2, py: 1.25,
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          background: alpha('#000', 0.02),
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1,
          flexShrink: 0,
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          <strong style={{ color: 'inherit' }}>{availCount}</strong> day{availCount !== 1 ? 's' : ''} available
          {holCount > 0 && <> &nbsp;·&nbsp; <strong>{holCount}</strong> holiday</>}
          {offCount > 0 && <> &nbsp;·&nbsp; <strong>{offCount}</strong> day off</>}
        </Typography>
      </Box>

      {/* Add working hours modal */}
      <Dialog
        open={modal.mode === 'work'}
        onClose={() => setModal({ ...modal, mode: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5 } }}
      >
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700, py: 1.75, background: alpha('#000', 0.02), borderBottom: '1px solid', borderColor: 'divider' }}>
          Add working hours — {DAY_SHORT[modal.dayIdx]}
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, pb: 1 }}>
          <TimeSelectField
            label="Start time"
            value={modal.startTime}
            onChange={(v) => setModal({ ...modal, startTime: v })}
          />
          <TimeSelectField
            label="End time"
            value={modal.endTime}
            onChange={(v) => setModal({ ...modal, endTime: v })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2.25, py: 1.5, borderTop: '1px solid', borderColor: 'divider', background: alpha('#000', 0.02) }}>
          <Button size="small" variant="outlined" onClick={() => setModal({ ...modal, mode: null })}>Cancel</Button>
          <Button size="small" variant="contained" onClick={addWorkSlot} disabled={modal.startTime >= modal.endTime}>Add hours</Button>
        </DialogActions>
      </Dialog>

      {/* Add break modal */}
      <Dialog
        open={modal.mode === 'break'}
        onClose={() => setModal({ ...modal, mode: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5 } }}
      >
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700, py: 1.75, background: alpha('#000', 0.02), borderBottom: '1px solid', borderColor: 'divider' }}>
          Add break — {DAY_SHORT[modal.dayIdx]}
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, pb: 1 }}>
          <TimeSelectField
            label="Break start"
            value={modal.startTime}
            onChange={(v) => setModal({ ...modal, startTime: v })}
          />
          <TimeSelectField
            label="Break end"
            value={modal.endTime}
            onChange={(v) => setModal({ ...modal, endTime: v })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2.25, py: 1.5, borderTop: '1px solid', borderColor: 'divider', background: alpha('#000', 0.02) }}>
          <Button size="small" variant="outlined" onClick={() => setModal({ ...modal, mode: null })}>Cancel</Button>
          <Button size="small" variant="contained" onClick={addBreakSlot} disabled={modal.startTime >= modal.endTime}>Add break</Button>
        </DialogActions>
      </Dialog>

      {/* Mark holiday modal */}
      <Dialog
        open={modal.mode === 'holiday'}
        onClose={() => setModal({ ...modal, mode: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5 } }}
      >
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700, py: 1.75, background: alpha('#000', 0.02), borderBottom: '1px solid', borderColor: 'divider' }}>
          Mark holiday — {DAY_FULL[modal.dayIdx]}
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, pb: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            Marking <strong style={{ color: 'inherit' }}>{DAY_FULL[modal.dayIdx]}</strong> as a holiday will disable all appointments for this day. You can undo this anytime.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.25, py: 1.5, borderTop: '1px solid', borderColor: 'divider', background: alpha('#000', 0.02) }}>
          <Button size="small" variant="outlined" onClick={() => setModal({ ...modal, mode: null })}>Cancel</Button>
          <Button size="small" variant="contained" color="error" onClick={() => markHoliday(modal.dayIdx)}>Mark as holiday</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

/* ── Sub-components ── */

interface SlotCardProps {
  type: 'work' | 'break';
  slot: TimeSlot;
  onRemove: () => void;
  green: string; greenLight: string; greenMid: string;
  amber: string; amberLight: string; amberMid: string;
  red: string;
}

function SlotCard({ type, slot, onRemove, green, greenLight, greenMid, amber, amberLight, amberMid, red }: SlotCardProps) {
  const isWork = type === 'work';
  const bg     = isWork ? greenLight : amberLight;
  const border = isWork ? greenMid  : amberMid;
  const label  = isWork ? 'Working hours' : 'Break';
  const color  = isWork ? green          : amber;
  const dur    = calcDuration(slot.s, slot.e);

  return (
    <Box
      sx={{
        borderRadius: '6px',
        p: '8px 10px',
        position: 'relative',
        border: `1px solid ${border}`,
        background: bg,
        flexShrink: 0,
        transition: 'box-shadow .15s',
        '&:hover': { boxShadow: '0 1px 3px rgba(0,0,0,.06)' },
      }}
    >
      <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color, mb: '3px' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary', lineHeight: 1.4 }}>
        {slot.s} – {slot.e}
      </Typography>
      {dur && (
        <Typography sx={{ fontSize: 10, color: 'text.secondary', mt: '2px' }}>{dur}</Typography>
      )}
      <Box
        component="button"
        type="button"
        onClick={onRemove}
        sx={{
          position: 'absolute', top: 6, right: 7,
          background: 'none', border: 'none', p: 0,
          cursor: 'pointer', fontSize: 14, color: '#9CA3AF',
          lineHeight: 1, transition: 'color .12s', fontFamily: 'inherit',
          '&:hover': { color: red },
        }}
        title="Remove"
      >
        ×
      </Box>
    </Box>
  );
}

interface DashedBtnProps {
  label: string;
  borderColor: string;
  color: string;
  hoverBg: string;
  solid?: boolean;
  onClick: () => void;
}

function DashedBtn({ label, borderColor, color, hoverBg, solid, onClick }: DashedBtnProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        width: '100%', py: '6px',
        textAlign: 'center',
        fontSize: 11, fontWeight: 600,
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all .15s',
        border: `1px ${solid ? 'solid' : 'dashed'} ${borderColor}`,
        color,
        background: 'transparent',
        fontFamily: 'inherit',
        '&:hover': { background: hoverBg },
      }}
    >
      {label}
    </Box>
  );
}

interface TimeSelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

function TimeSelectField({ label, value, onChange }: TimeSelectFieldProps) {
  return (
    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>
        {label}
      </InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value as string)}
        sx={{ fontSize: 13 }}
      >
        {TIME_OPTIONS.map((t) => (
          <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
