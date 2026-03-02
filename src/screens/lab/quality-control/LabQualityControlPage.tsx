'use client';

import React from 'react';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Box, Chip, List, ListItem, ListItemText, Stack, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@/src/ui/components/atoms';
import { useTheme } from '@mui/material';
import { useAppSelector } from '@/src/store/hooks';
import { useLabTheme } from '../lab-theme';
import LabWorkspaceCard from '../components/LabWorkspaceCard';

function zScore(result: number, mean: number, sd: number): number {
  if (sd === 0) return 0;
  return (result - mean) / sd;
}

export default function LabQualityControlPage() {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const { qcRecords } = useAppSelector((state) => state.lims);
  const [tab, setTab] = React.useState(0);
  const passed = qcRecords.filter((q) => q.status === 'pass').length;
  const warnings = qcRecords.filter((q) => q.status === 'warn').length;
  const failed = qcRecords.filter((q) => q.status === 'fail').length;
  const materials = Array.from(new Set(qcRecords.map((q) => q.mat)));

  return (
    <PageTemplate title="Quality Control" subtitle="Monitor QC performance and Levey-Jennings charts" currentPageTitle="Quality Control">
      <LabWorkspaceCard current="quality-control">
        <Stack spacing={2}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(3, 1fr)', mb: 0.5 }}>
          <Box sx={lab.statCardSx('success')}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{passed}</Typography>
            <Typography variant="caption" color="text.secondary">QC PASSED</Typography>
          </Box>
          <Box sx={lab.statCardSx('warning')}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{warnings}</Typography>
            <Typography variant="caption" color="text.secondary">QC WARNINGS</Typography>
          </Box>
          <Box sx={lab.statCardSx('error')}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{failed}</Typography>
            <Typography variant="caption" color="text.secondary">QC FAILURES</Typography>
          </Box>
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
          <Tab label="QC Results" />
          <Tab label="QC Materials" />
          <Tab label="Levey-Jennings" />
        </Tabs>
        {tab === 0 && (
          <Box sx={lab.cardSx}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 1, display: 'block', p: 2, pb: 0 }}>QC Results</Typography>
            <TableContainer sx={lab.tableContainerSx}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>QC Material</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Test</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Level</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Mean</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>SD</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Result</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Z-Score</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {qcRecords.map((q, i) => {
                    const z = zScore(q.result, q.mean, q.sd);
                    return (
                      <TableRow key={i}>
                        <TableCell>{q.date}</TableCell>
                        <TableCell>{q.mat}</TableCell>
                        <TableCell>{q.test}</TableCell>
                        <TableCell>{q.level}</TableCell>
                        <TableCell>{q.mean}</TableCell>
                        <TableCell>{q.sd}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{q.result}</TableCell>
                        <TableCell sx={{ color: Math.abs(z) > 2 ? 'error.main' : 'success.main' }}>{z.toFixed(2)}</TableCell>
                        <TableCell><Chip size="small" label={q.status.toUpperCase()} color={q.status === 'pass' ? 'success' : q.status === 'warn' ? 'warning' : 'error'} /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
            </Table>
          </TableContainer>
        </Box>
        )}
        {tab === 1 && (
          <Box sx={{ ...lab.cardSx, p: 2 }}>
            <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 1.5, mb: 1.5, display: 'block' }}>QC Materials inventory</Typography>
            <List dense>
              {materials.map((mat) => (
                <ListItem key={mat}>
                  <ListItemText primary={mat} secondary={qcRecords.filter((q) => q.mat === mat).length + ' results'} />
                </ListItem>
            ))}
          </List>
        </Box>
        )}
        {tab === 2 && (
          <Box sx={{ ...lab.cardSx, p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Levey-Jennings chart (select test & material to view trend).</Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>Chart integration can be added here.</Typography>
        </Box>
        )}
        </Stack>
      </LabWorkspaceCard>
    </PageTemplate>
  );
}
