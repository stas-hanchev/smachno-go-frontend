'use client';

import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ua } from '@/i18n/ua';

const Form = styled('form', { name: 'SgHeaderSearch', slot: 'Form' })(({ theme }) => ({
  position: 'relative',
  flex: '1 1 auto',
  maxWidth: 320,
  minWidth: 160,
  '& .MuiInputBase-root': {
    width: '100%',
    borderRadius: 9999,
    backgroundColor: theme.palette.mint.light,
    padding: '6px 16px 6px 40px',
    fontSize: 14,
  },
}));

const Icon = styled(SearchIcon, { name: 'SgHeaderSearch', slot: 'Icon' })(({ theme }) => ({
  position: 'absolute',
  left: 14,
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: 18,
  color: theme.palette.muted,
  zIndex: 1,
}));

export function HeaderSearch() {
  const router = useRouter();
  const [value, setValue] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  return (
    <Form role="search" onSubmit={submit}>
      <Icon aria-hidden />
      <InputBase
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={ua.nav.headerSearch}
        inputProps={{ 'aria-label': ua.nav.headerSearch }}
      />
    </Form>
  );
}
