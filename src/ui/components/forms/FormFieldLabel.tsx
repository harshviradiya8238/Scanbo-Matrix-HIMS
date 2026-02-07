'use client';

import { Box } from '@/src/ui/components/atoms';
import Text from '@/src/ui/components/atoms/Text';

interface FormFieldLabelProps {
  label: string;
  required?: boolean;
}

const shouldAppendColon = (label: string) => {
  const trimmedLabel = label.trim();
  return trimmedLabel.length > 0 && !/[:?.!]$/.test(trimmedLabel);
};

export default function FormFieldLabel({ label, required }: FormFieldLabelProps) {
  const cleanedLabel = label.trim();
  const normalizedLabel = shouldAppendColon(cleanedLabel)
    ? `${cleanedLabel}:`
    : cleanedLabel;

  return (
    <Text
      variant="body2"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        mb: 0.75,
        color: 'text.secondary',
        fontWeight: 600,
        lineHeight: 1.2,
      }}
    >
      {required ? <Box component="span" sx={{ color: 'error.main' }}>*</Box> : null}
      <Box component="span">{normalizedLabel}</Box>
    </Text>
  );
}
