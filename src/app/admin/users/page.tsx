'use client';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { listUsers, updateUser } from '@/api/admin';
import { errorMessage } from '@/api/client';
import type { AdminUserRow, UserRole } from '@/api/types';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { FilterBar, SearchInput, SelectFilter } from '@/components/admin/Filters';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ua } from '@/i18n/ua';
import { formatDateTime } from '@/lib/format';
import { fullName } from '@/lib/user';
import { notify } from '@/stores/notify';
import { useSessionStore } from '@/stores/session';

const t = ua.admin.users;
const ROLES: UserRole[] = ['customer', 'admin', 'super_admin'];
const STATUSES = ['active', 'blocked', 'deleted'] as const;
const STATUS_COLOR = { active: 'success', blocked: 'error', deleted: 'default' } as const;

export default function AdminUsersPage() {
  const me = useSessionStore((s) => s.user);
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [status, setStatus] = useState<AdminUserRow['status'] | ''>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const users = useQuery({
    queryKey: ['admin', 'users', { q, role, status, page, limit }],
    queryFn: () =>
      listUsers({ page, limit, q, role: role || undefined, status: status || undefined }),
    placeholderData: keepPreviousData,
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Parameters<typeof updateUser>[1] }) =>
      updateUser(id, patch),
    onSuccess: () => {
      notify.success(t.updated);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error) => notify.error(errorMessage(error)),
  });

  const isSuper = me?.role === 'super_admin';

  const columns: Column<AdminUserRow>[] = [
    { key: 'id', label: t.columns.id, render: (u) => u.id },
    { key: 'name', label: t.columns.name, render: (u) => fullName(u.firstName, u.lastName) },
    { key: 'email', label: t.columns.email, render: (u) => u.email },
    {
      key: 'role',
      label: t.columns.role,
      render: (u) =>
        u.id === me?.id ? (
          t.roles[u.role]
        ) : (
          <TextField
            select
            size="small"
            value={u.role}
            disabled={update.isPending || (!isSuper && u.role !== 'customer')}
            onChange={(e) =>
              update.mutate({ id: u.id, patch: { role: e.target.value as UserRole } })
            }
            slotProps={{ htmlInput: { 'aria-label': t.role } }}
            sx={{ minWidth: 170 }}
          >
            {ROLES.map((r) => (
              <MenuItem key={r} value={r} disabled={!isSuper && r !== 'customer'}>
                {t.roles[r]}
              </MenuItem>
            ))}
          </TextField>
        ),
    },
    {
      key: 'status',
      label: t.columns.status,
      render: (u) => (
        <Chip size="small" color={STATUS_COLOR[u.status]} label={t.statuses[u.status]} />
      ),
    },
    {
      key: 'lastLogin',
      label: t.columns.lastLogin,
      nowrap: true,
      render: (u) => (u.lastLoginAt ? formatDateTime(u.lastLoginAt) : '—'),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (u) =>
        u.id !== me?.id && u.status !== 'deleted' ? (
          <Button
            size="small"
            color={u.status === 'active' ? 'error' : 'primary'}
            disabled={update.isPending}
            onClick={() =>
              update.mutate({
                id: u.id,
                patch: { status: u.status === 'active' ? 'blocked' : 'active' },
              })
            }
          >
            {u.status === 'active' ? t.block : t.unblock}
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <SectionHeading level="h1" size="medium" title={ua.admin.nav.users} />
      <FilterBar>
        <SearchInput
          value={q}
          onChange={(value) => {
            setQ(value);
            setPage(1);
          }}
        />
        <SelectFilter
          label={t.role}
          value={role}
          options={ROLES.map((r) => ({ value: r, label: t.roles[r] }))}
          onChange={(value) => {
            setRole(value);
            setPage(1);
          }}
        />
        <SelectFilter
          label={ua.admin.status}
          value={status}
          options={STATUSES.map((s) => ({ value: s, label: t.statuses[s] }))}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      </FilterBar>
      <DataTable
        columns={columns}
        rows={users.data?.data}
        rowKey={(u) => u.id}
        loading={users.isPending}
        error={users.error}
        total={users.data?.meta.total}
        page={page}
        limit={limit}
        onPage={setPage}
        onLimit={(next) => {
          setLimit(next);
          setPage(1);
        }}
      />
    </>
  );
}
