'use client';

import { styled } from '@mui/material/styles';

const Group = styled('div', { name: 'SgFilterChips', slot: 'Group' })(({ theme }) => ({
  display: 'inline-flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  padding: 4,
  gap: 2,
  borderRadius: 9999,
  backgroundColor: theme.palette.mint.light,
}));

const Option = styled('button', { name: 'SgFilterChips', slot: 'Option' })<{ $active: boolean }>(
  ({ theme, $active }) => ({
    border: 0,
    cursor: 'pointer',
    font: 'inherit',
    padding: '6px 16px',
    borderRadius: 9999,
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 700,
    color: $active ? theme.palette.text.primary : theme.palette.text.secondary,
    backgroundColor: $active ? theme.palette.background.paper : 'transparent',
    boxShadow: $active ? '0px 1px 1px rgba(0, 0, 0, 0.05)' : 'none',
    transition: 'background-color 150ms',
    '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
  }),
);

export function FilterChips<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <Group role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <Option
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          $active={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Option>
      ))}
    </Group>
  );
}

const ToggleChip = styled('button', { name: 'SgFilterChips', slot: 'ToggleChip' })<{
  $active: boolean;
}>(({ theme, $active }) => ({
  border: `1px solid ${$active ? theme.palette.success.main : theme.palette.divider}`,
  cursor: 'pointer',
  font: 'inherit',
  padding: '6px 14px',
  borderRadius: 9999,
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 700,
  color: $active ? theme.palette.secondary.contrastText : theme.palette.text.secondary,
  backgroundColor: $active ? theme.palette.secondary.main : theme.palette.background.paper,
  '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
}));

export function ToggleChips<T extends string | number>({
  values,
  options,
  onToggle,
  label,
}: {
  values: T[];
  options: { value: T; label: string }[];
  onToggle: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((option) => {
        const active = values.includes(option.value);
        return (
          <ToggleChip
            key={String(option.value)}
            type="button"
            aria-pressed={active}
            $active={active}
            onClick={() => onToggle(option.value)}
          >
            {option.label}
          </ToggleChip>
        );
      })}
    </div>
  );
}
