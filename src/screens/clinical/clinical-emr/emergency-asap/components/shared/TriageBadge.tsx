import React from 'react';
import { Chip } from '@mui/material';
import { TriageLevel } from '../../types';
import { TRIAGE_META } from '../constants';

interface TriageBadgeProps {
  level: TriageLevel;
}

export function TriageBadge({ level }: TriageBadgeProps) {
  return <Chip size="small" label={level} color={TRIAGE_META[level].color} />;
}