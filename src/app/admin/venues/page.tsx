'use client';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import NextLink from 'next/link';
import { useState } from 'react';
import { listVenues, updateVenue } from '@/api/admin';
import { errorMessage } from '@/api/client';
import type { AdminVenueRow, VenueStatus } from '@/api/types';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { FilterBar, SearchInput, SelectFilter } from '@/components/admin/Filters';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ua } from '@/i18n/ua';
import { formatDateTime } from '@/lib/format';
import { notify } from '@/stores/notify';

const t = ua.admin.venues;
const STATUSES: VenueStatus[] = ['draft', 'active', 'paused', 'blocked'];
const STATUS_COLOR = {
  draft: 'default',
  active: 'success',
  paused: 'warning',
  blocked: 'error',
} as const;

function EditDialog({ venue, onClose }: { venue: AdminVenueRow | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<VenueStatus>(venue?.status ?? 'active');
  const [commission, setCommission] = useState(
    venue ? String(Math.round(venue.commissionRate * 10000) / 100) : '15',
  );
  const save = useMutation({
    mutationFn: () =>
      updateVenue(venue!.id, {
        ...(status !== venue!.status && status !== 'draft' && { status }),
        commissionRate: Number(commission) / 100,
      }),
    onSuccess: () => {
      notify.success(ua.admin.saved);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'venues'] });
      onClose();
    },
  });
  const valid = Number(commission) >= 0 && Number(commission) <= 50;

  return (
    <Dialog open={venue !== null} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{venue?.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {save.isError && <Alert severity="error">{errorMessage(save.error)}</Alert>}
          <TextField
            select
            label={t.status}
            value={status}
            onChange={(e) => setStatus(e.target.value as VenueStatus)}
          >
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s} disabled={s === 'draft'}>
                {ua.partner.status[s]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="number"
            label={t.commission}
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            error={!valid}
            slotProps={{ htmlInput: { min: 0, max: 50, step: 0.5 } }}
          />
          {venue?.status === 'active' && (
            <Button
              component={NextLink}
              href={`/venues/${venue.slug}`}
              target="_blank"
              endIcon={<OpenInNewIcon />}
            >
              {t.open}
            </Button>
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

export default function AdminVenuesPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<VenueStatus | ''>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [editing, setEditing] = useState<AdminVenueRow | null>(null);

  const venues = useQuery({
    queryKey: ['admin', 'venues', { q, status, page, limit }],
    queryFn: () => listVenues({ page, limit, q, status: status || undefined }),
    placeholderData: keepPreviousData,
  });

  const columns: Column<AdminVenueRow>[] = [
    { key: 'name', label: t.columns.name, render: (v) => v.name },
    { key: 'city', label: t.columns.city, render: (v) => `${v.city} · ${v.address}` },
    {
      key: 'status',
      label: t.columns.status,
      render: (v) => (
        <Chip size="small" color={STATUS_COLOR[v.status]} label={ua.partner.status[v.status]} />
      ),
    },
    {
      key: 'commission',
      label: t.columns.commission,
      align: 'right',
      render: (v) => `${Math.round(v.commissionRate * 10000) / 100}%`,
    },
    {
      key: 'rating',
      label: t.columns.rating,
      align: 'right',
      render: (v) => (v.ratingAvg ? `${Number(v.ratingAvg).toFixed(1)} (${v.ratingCount})` : '—'),
    },
    {
      key: 'created',
      label: t.columns.created,
      render: (v) => formatDateTime(v.createdAt),
      nowrap: true,
    },
  ];

  return (
    <>
      <SectionHeading level="h1" size="medium" title={ua.admin.nav.venues} />
      <FilterBar>
        <SearchInput
          value={q}
          onChange={(value) => {
            setQ(value);
            setPage(1);
          }}
        />
        <SelectFilter
          label={ua.admin.status}
          value={status}
          options={STATUSES.map((s) => ({ value: s, label: ua.partner.status[s] }))}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      </FilterBar>
      <DataTable
        columns={columns}
        rows={venues.data?.data}
        rowKey={(v) => v.id}
        loading={venues.isPending}
        error={venues.error}
        total={venues.data?.meta.total}
        page={page}
        limit={limit}
        onPage={setPage}
        onLimit={(next) => {
          setLimit(next);
          setPage(1);
        }}
        onRowClick={setEditing}
      />
      <EditDialog key={editing?.id ?? 'none'} venue={editing} onClose={() => setEditing(null)} />
    </>
  );
}
