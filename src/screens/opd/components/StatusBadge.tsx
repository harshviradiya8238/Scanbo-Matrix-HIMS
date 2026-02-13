'use client';

import * as React from 'react';
import { Chip } from '@/src/ui/components/atoms';
import { EncounterStatus } from '../opd-mock-data';
import { ENCOUNTER_STATUS_LABEL } from '../opd-encounter';

const STATUS_COLOR: Record<EncounterStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  BOOKED: 'default',
  ARRIVED: 'info',
  IN_QUEUE: 'warning',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

interface StatusBadgeProps {
  status: EncounterStatus;
  size?: 'small' | 'medium';
}

export default function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  return <Chip size={size} color={STATUS_COLOR[status]} label={ENCOUNTER_STATUS_LABEL[status]} />;
}
