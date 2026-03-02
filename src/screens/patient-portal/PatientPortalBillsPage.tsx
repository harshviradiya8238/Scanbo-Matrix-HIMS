'use client';

import * as React from 'react';
import {
  Box, Button, Chip, Divider, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import {
  AccountBalance as AccountBalanceIcon,
  CheckCircle as CheckCircleIcon,
  CreditCard as CreditCardIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  Shield as ShieldIcon,
  TaskAlt as TaskAltIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { BILLS } from './patient-portal-mock-data';
import type { BillRecord } from './patient-portal-types';
import { ppSectionCard, ppSectionHeader, ppHeadCell } from './patient-portal-styles';

type PayStep = 'method' | 'confirm' | 'processing' | 'success';

export default function PatientPortalBillsPage() {
  const theme = useTheme();
  const [bills, setBills] = React.useState(BILLS);
  const [payTarget, setPayTarget] = React.useState<BillRecord | null>(null);
  const [payStep, setPayStep] = React.useState<PayStep>('method');
  const [payMethod, setPayMethod] = React.useState<string>('card');
  const [payProgress, setPayProgress] = React.useState(0);
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; severity: 'success' | 'info' | 'error' }>({ open: false, msg: '', severity: 'success' });

  const sectionCard = ppSectionCard(theme);
  const sectionHeader = ppSectionHeader(theme);
  const headCell = ppHeadCell(theme);

  const STATUS_COLOR: Record<string, string> = {
    Paid: theme.palette.success.main,
    Pending: theme.palette.warning.dark,
    Overdue: theme.palette.error.main,
  };

  const totalDue = bills.filter((b) => b.status === 'Pending' || b.status === 'Overdue').length;
  const totalPaid = bills.filter((b) => b.status === 'Paid').length;

  const openPayDialog = (bill: BillRecord) => {
    setPayTarget(bill);
    setPayStep('method');
    setPayMethod('card');
    setPayProgress(0);
  };

  const closePayDialog = () => {
    setPayTarget(null);
    setPayStep('method');
    setPayProgress(0);
  };

  const handleProcessPayment = () => {
    setPayStep('processing');
    setPayProgress(0);
    const timer = setInterval(() => {
      setPayProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setPayStep('success');
          if (payTarget) {
            setBills((prev) => prev.map((b) => b.id === payTarget.id ? { ...b, status: 'Paid' as const } : b));
          }
          return 100;
        }
        return p + 25;
      });
    }, 400);
  };

  const handleDownloadReceipt = (bill: BillRecord) => {
    setSnack({ open: true, msg: `Receipt downloaded: ${bill.invoiceNo}`, severity: 'success' });
  };

  const pendingDueAmount = bills.filter((b) => b.status === 'Pending').map((b) => b.amount).join(', ');

  return (
    <PatientPortalWorkspaceCard current="bills">
      <Stack spacing={2}>

        {/* ── Stat Tiles ── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
          <StatTile
            label="Total Due"
            value={bills.filter((b) => b.status === 'Pending').reduce(() => '₹2,450', '₹0')}
            subtitle={`${totalDue} pending invoice${totalDue !== 1 ? 's' : ''}`}
            tone="warning" variant="soft" icon={<WarningAmberIcon fontSize="small" />}
          />
          <StatTile
            label="Total Paid"
            value="₹5,500"
            subtitle={`${totalPaid} invoices settled`}
            tone="success" variant="soft" icon={<TaskAltIcon fontSize="small" />}
          />
          <StatTile
            label="Insurance Claims"
            value="₹0"
            subtitle="No active claims"
            tone="info" variant="soft" icon={<ShieldIcon fontSize="small" />}
          />
        </Box>

        {/* ── Billing History ── */}
        <Card elevation={0} sx={sectionCard}>
          <Box sx={{ ...sectionHeader, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ReceiptIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Billing History</Typography>
            </Stack>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
              onClick={() => setSnack({ open: true, msg: 'Billing statement downloaded!', severity: 'success' })}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}>
              Download Statement
            </Button>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headCell}>Invoice No.</TableCell>
                  <TableCell sx={headCell}>Date</TableCell>
                  <TableCell sx={headCell}>Description</TableCell>
                  <TableCell sx={headCell}>Amount</TableCell>
                  <TableCell sx={headCell}>Status</TableCell>
                  <TableCell sx={headCell}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bills.map((bill) => {
                  const statusColor = STATUS_COLOR[bill.status] ?? theme.palette.text.secondary;
                  return (
                    <TableRow key={bill.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>{bill.invoiceNo}</TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{bill.date}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{bill.description}</Typography></TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{bill.amount}</TableCell>
                      <TableCell>
                        <Chip size="small" label={bill.status}
                          sx={{ fontWeight: 700, fontSize: 11, bgcolor: alpha(statusColor, 0.12), color: statusColor }} />
                      </TableCell>
                      <TableCell>
                        {bill.status === 'Pending' || bill.status === 'Overdue' ? (
                          <Button size="small" variant="contained" disableElevation
                            onClick={() => openPayDialog(bill)}
                            startIcon={<CreditCardIcon sx={{ fontSize: 13 }} />}
                            sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}>
                            Pay Now
                          </Button>
                        ) : (
                          <Button size="small" variant="outlined"
                            onClick={() => handleDownloadReceipt(bill)}
                            startIcon={<DownloadIcon sx={{ fontSize: 13 }} />}
                            sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}>
                            Receipt
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* ── Quick Actions + Payment Breakdown ── */}
        <Card elevation={0} sx={sectionCard}>
          <Box sx={sectionHeader}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CreditCardIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Payment Summary &amp; Actions</Typography>
            </Stack>
          </Box>
          <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>

            {/* Left — breakdown bar */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Billing Breakdown
              </Typography>
              <Stack spacing={1.25} sx={{ mt: 1.25 }}>
                {[
                  { label: 'Total Billed',  value: '₹7,950', color: theme.palette.primary.main,  pct: 100 },
                  { label: 'Paid',          value: '₹5,500', color: theme.palette.success.main,  pct: 69 },
                  { label: 'Pending',       value: '₹2,450', color: theme.palette.warning.dark,  pct: 31 },
                ].map((item) => (
                  <Box key={item.label}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.4 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{item.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: item.color }}>{item.value}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={item.pct}
                      sx={{ borderRadius: 99, height: 6, bgcolor: alpha(item.color, 0.12), '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 99 } }} />
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Right — quick actions */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Quick Actions
              </Typography>
              <Stack spacing={1} sx={{ mt: 1.25 }}>
                {[
                  { label: 'Submit Insurance Claim', icon: <ShieldIcon sx={{ fontSize: 15 }} />, color: 'primary', onClick: () => setSnack({ open: true, msg: 'Insurance claim form opened!', severity: 'info' }) },
                  { label: 'Download Full Statement', icon: <DownloadIcon sx={{ fontSize: 15 }} />, color: 'primary', onClick: () => setSnack({ open: true, msg: 'Statement downloaded!', severity: 'success' }) },
                  { label: 'Pay All Pending (₹2,450)', icon: <CreditCardIcon sx={{ fontSize: 15 }} />, color: 'success', onClick: () => { const pending = bills.find((b) => b.status === 'Pending'); if (pending) openPayDialog(pending); } },
                ].map((action) => (
                  <Button key={action.label} variant="outlined" size="small" fullWidth
                    startIcon={action.icon} onClick={action.onClick}
                    color={action.color as 'primary' | 'success'}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12.5, justifyContent: 'flex-start', px: 1.75 }}>
                    {action.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Box>
        </Card>

      </Stack>

      {/* ── Pay Now Dialog ── */}
      <Dialog open={!!payTarget && payStep !== 'success'} onClose={closePayDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>
          {payStep === 'method' && 'Choose Payment Method'}
          {payStep === 'confirm' && 'Confirm Payment'}
          {payStep === 'processing' && 'Processing Payment…'}
        </DialogTitle>
        <DialogContent>
          {payTarget && payStep === 'method' && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.06), border: '1px solid', borderColor: alpha(theme.palette.warning.main, 0.25) }}>
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{payTarget.invoiceNo}</Typography>
                    <Typography variant="caption" color="text.secondary">{payTarget.description}</Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{payTarget.amount}</Typography>
                </Stack>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Payment Method</Typography>
                <RadioGroup value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                  {[
                    { value: 'card', label: 'Credit / Debit Card', icon: <CreditCardIcon sx={{ fontSize: 18, color: 'primary.main' }} /> },
                    { value: 'upi', label: 'UPI', icon: <AccountBalanceIcon sx={{ fontSize: 18, color: 'success.main' }} /> },
                    { value: 'netbanking', label: 'Net Banking', icon: <AccountBalanceIcon sx={{ fontSize: 18, color: 'info.main' }} /> },
                  ].map((opt) => (
                    <FormControlLabel key={opt.value} value={opt.value}
                      control={<Radio size="small" />}
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          {opt.icon}
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{opt.label}</Typography>
                        </Stack>
                      }
                      sx={{ mb: 0.5, border: '1px solid', borderColor: payMethod === opt.value ? 'primary.main' : 'divider', borderRadius: 2, px: 1.5, py: 0.5, mx: 0, bgcolor: payMethod === opt.value ? alpha(theme.palette.primary.main, 0.04) : 'transparent' }}
                    />
                  ))}
                </RadioGroup>
              </Box>
              {payMethod === 'card' && (
                <Stack spacing={1.5}>
                  <TextField size="small" label="Card Number" placeholder="1234 5678 9012 3456" fullWidth />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <TextField size="small" label="Expiry (MM/YY)" placeholder="12/26" />
                    <TextField size="small" label="CVV" placeholder="•••" type="password" />
                  </Box>
                  <TextField size="small" label="Cardholder Name" placeholder="Ravi Patel" fullWidth />
                </Stack>
              )}
              {payMethod === 'upi' && (
                <TextField size="small" label="UPI ID" placeholder="ravi@upi" fullWidth />
              )}
            </Stack>
          )}

          {payStep === 'confirm' && payTarget && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                {[
                  { label: 'Invoice', value: payTarget.invoiceNo },
                  { label: 'Amount', value: payTarget.amount },
                  { label: 'Method', value: payMethod === 'card' ? 'Credit/Debit Card' : payMethod === 'upi' ? 'UPI' : 'Net Banking' },
                  { label: 'Date', value: new Date().toLocaleDateString() },
                ].map((item, i, arr) => (
                  <Stack key={item.label} direction="row" justifyContent="space-between" sx={{ py: 0.75, borderBottom: i < arr.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                  </Stack>
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary">
                By confirming, you authorize this payment. A receipt will be sent to your registered email.
              </Typography>
            </Stack>
          )}

          {payStep === 'processing' && (
            <Stack spacing={2} sx={{ pt: 1, alignItems: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">Processing your payment…</Typography>
              <Box sx={{ width: '100%' }}>
                <LinearProgress variant="determinate" value={payProgress} sx={{ borderRadius: 99, height: 8 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>{payProgress}%</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
          {payStep === 'method' && (
            <>
              <Button onClick={closePayDialog} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
              <Button variant="contained" disableElevation onClick={() => setPayStep('confirm')}
                sx={{ textTransform: 'none', fontWeight: 600 }}>Review Payment</Button>
            </>
          )}
          {payStep === 'confirm' && (
            <>
              <Button onClick={() => setPayStep('method')} sx={{ textTransform: 'none', fontWeight: 600 }}>Back</Button>
              <Button variant="contained" disableElevation onClick={handleProcessPayment}
                sx={{ textTransform: 'none', fontWeight: 600 }}>Confirm &amp; Pay {payTarget?.amount}</Button>
            </>
          )}
          {payStep === 'processing' && (
            <Button disabled sx={{ textTransform: 'none', fontWeight: 600 }}>Please wait…</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Payment Success Dialog ── */}
      <Dialog open={payStep === 'success'} onClose={closePayDialog} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.75 }}>Payment Successful!</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your payment of <strong>{payTarget?.amount}</strong> has been processed successfully.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" color="text.secondary">
            A receipt has been sent to your registered email. Invoice: {payTarget?.invoiceNo}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 1 }}>
          <Button variant="outlined" startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
            onClick={() => { handleDownloadReceipt(payTarget!); closePayDialog(); }}
            sx={{ textTransform: 'none', fontWeight: 600 }}>Download Receipt</Button>
          <Button variant="contained" disableElevation onClick={closePayDialog}
            sx={{ textTransform: 'none', fontWeight: 600 }}>Done</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled" sx={{ fontWeight: 600 }} onClose={() => setSnack((p) => ({ ...p, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </PatientPortalWorkspaceCard>
  );
}
