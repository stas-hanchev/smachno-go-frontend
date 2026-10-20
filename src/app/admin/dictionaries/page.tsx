'use client';

import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  createDictionaryItem,
  deleteDictionaryItem,
  listDictionary,
  updateDictionaryItem,
} from '@/api/admin';
import { errorMessage, normalizeError } from '@/api/client';
import type { DictionaryItem, DictionaryName } from '@/api/types';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ua } from '@/i18n/ua';
import { notify } from '@/stores/notify';

const t = ua.admin.dictionaries;
const NAMES: DictionaryName[] = ['categories', 'tags', 'allergens', 'cities'];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

interface Draft {
  name: string;
  slug: string;
  icon: string;
  sortOrder: string;
  isActive: boolean;
  centerLat: string;
  centerLng: string;
}

function toDraft(item: DictionaryItem | null): Draft {
  return {
    name: item?.name ?? '',
    slug: item?.slug ?? '',
    icon: item?.icon ?? '',
    sortOrder: String(item?.sortOrder ?? 0),
    isActive: item?.isActive ?? true,
    centerLat: item?.centerLat !== undefined ? String(item.centerLat) : '',
    centerLng: item?.centerLng !== undefined ? String(item.centerLng) : '',
  };
}

function toInput(name: DictionaryName, draft: Draft): Partial<DictionaryItem> {
  const base = { name: draft.name.trim(), slug: draft.slug.trim() };
  if (name === 'categories') {
    return {
      ...base,
      icon: draft.icon.trim() || null,
      sortOrder: Number(draft.sortOrder) || 0,
      isActive: draft.isActive,
    };
  }
  if (name === 'cities') {
    return {
      ...base,
      centerLat: Number(draft.centerLat),
      centerLng: Number(draft.centerLng),
      isActive: draft.isActive,
    };
  }
  return base;
}

function ItemDialog({
  name,
  item,
  open,
  onClose,
}: {
  name: DictionaryName;
  item: DictionaryItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(() => toDraft(item));
  const save = useMutation({
    mutationFn: () =>
      item
        ? updateDictionaryItem(name, item.id, toInput(name, draft))
        : createDictionaryItem(name, toInput(name, draft)),
    onSuccess: () => {
      notify.success(ua.admin.saved);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dictionary', name] });
      void queryClient.invalidateQueries({ queryKey: [name] });
      onClose();
    },
  });
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const valid =
    draft.name.trim().length >= 2 &&
    SLUG.test(draft.slug.trim()) &&
    (name !== 'cities' || (draft.centerLat !== '' && draft.centerLng !== ''));
  const error = save.error ? normalizeError(save.error) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{item ? t.edit : t.add}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error.message}</Alert>}
          <TextField
            label={t.name}
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
          />
          <TextField
            label={t.slug}
            value={draft.slug}
            onChange={(e) => set({ slug: e.target.value.toLowerCase() })}
            error={draft.slug !== '' && !SLUG.test(draft.slug)}
          />
          {name === 'categories' && (
            <>
              <TextField
                label={t.icon}
                value={draft.icon}
                onChange={(e) => set({ icon: e.target.value })}
              />
              <TextField
                type="number"
                label={t.sortOrder}
                value={draft.sortOrder}
                onChange={(e) => set({ sortOrder: e.target.value })}
              />
            </>
          )}
          {name === 'cities' && (
            <Stack direction="row" spacing={1.5}>
              <TextField
                type="number"
                label={t.lat}
                value={draft.centerLat}
                onChange={(e) => set({ centerLat: e.target.value })}
              />
              <TextField
                type="number"
                label={t.lng}
                value={draft.centerLng}
                onChange={(e) => set({ centerLng: e.target.value })}
              />
            </Stack>
          )}
          {(name === 'categories' || name === 'cities') && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={draft.isActive}
                  onChange={(e) => set({ isActive: e.target.checked })}
                />
              }
              label={t.active}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{ua.common.close}</Button>
        <Button
          variant="contained"
          disabled={!valid || save.isPending}
          onClick={() => save.mutate()}
        >
          {ua.admin.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminDictionariesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState<DictionaryName>('categories');
  const [editing, setEditing] = useState<DictionaryItem | 'new' | null>(null);
  const [deleting, setDeleting] = useState<DictionaryItem | null>(null);

  const items = useQuery({
    queryKey: ['admin', 'dictionary', name],
    queryFn: () => listDictionary(name),
  });
  const remove = useMutation({
    mutationFn: (item: DictionaryItem) => deleteDictionaryItem(name, item.id),
    onSuccess: () => {
      notify.success(t.deleted);
      setDeleting(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dictionary', name] });
    },
    onError: (error) => {
      setDeleting(null);
      notify.error(errorMessage(error));
    },
  });

  const columns: Column<DictionaryItem>[] = [
    { key: 'name', label: t.name, render: (i) => i.name },
    { key: 'slug', label: 'slug', render: (i) => i.slug },
    ...(name === 'categories'
      ? [
          { key: 'icon', label: t.icon, render: (i: DictionaryItem) => i.icon ?? '—' },
          { key: 'sort', label: t.sortOrder, render: (i: DictionaryItem) => i.sortOrder ?? 0 },
        ]
      : []),
    ...(name === 'cities'
      ? [
          {
            key: 'center',
            label: `${t.lat}, ${t.lng}`,
            render: (i: DictionaryItem) => `${i.centerLat}, ${i.centerLng}`,
          },
        ]
      : []),
    ...(name === 'categories' || name === 'cities'
      ? [
          {
            key: 'active',
            label: t.active,
            render: (i: DictionaryItem) => (i.isActive ? '✓' : '—'),
          },
        ]
      : []),
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (i) => (
        <>
          <Button size="small" onClick={() => setEditing(i)}>
            {t.edit}
          </Button>
          <Button size="small" color="error" onClick={() => setDeleting(i)}>
            {ua.partner.photo.remove}
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <SectionHeading
        level="h1"
        size="medium"
        title={ua.admin.nav.dictionaries}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing('new')}>
            {t.add}
          </Button>
        }
      />
      <Tabs
        value={name}
        onChange={(_e, value: DictionaryName) => setName(value)}
        sx={{ mb: 2 }}
        variant="scrollable"
      >
        {NAMES.map((n) => (
          <Tab key={n} value={n} label={t.tabs[n]} />
        ))}
      </Tabs>
      <DataTable
        columns={columns}
        rows={items.data}
        rowKey={(i) => i.id}
        loading={items.isPending}
        error={items.error}
      />
      {editing !== null && (
        <ItemDialog
          key={`${name}-${editing === 'new' ? 'new' : editing.id}`}
          name={name}
          item={editing === 'new' ? null : editing}
          open
          onClose={() => setEditing(null)}
        />
      )}
      <ConfirmDialog
        open={deleting !== null}
        title={t.deleteTitle}
        text={deleting?.name}
        confirmLabel={ua.partner.photo.remove}
        pending={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
