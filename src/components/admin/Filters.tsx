'use client';

import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { ua } from '@/i18n/ua';

export const FilterBar = styled('div', { name: 'SgAdminFilters', slot: 'Bar' })({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 12,
  marginBottom: 16,
});

export function SearchInput({
  value,
  onChange,
  placeholder = ua.admin.search,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text.trim() !== value) onChange(text.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [text, value, onChange]);

  return (
    <TextField
      size="small"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder={placeholder}
      sx={{ flex: '1 1 240px' }}
      slotProps={{
        htmlInput: { 'aria-label': placeholder },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export function SelectFilter<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | '';
  options: { value: T; label: string }[];
  onChange: (value: T | '') => void;
}) {
  return (
    <TextField
      select
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as T | '')}
      sx={{ minWidth: 180 }}
    >
      <MenuItem value="">{ua.admin.all}</MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
