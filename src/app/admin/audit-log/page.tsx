'use client';

import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listAuditLog } from '@/api/admin';
import type { AuditEntry } from '@/api/types';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { FilterBar } from '@/components/admin/Filters';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ua } from '@/i18n/ua';
import { formatDateTime } from '@/lib/format';

const t = ua.admin.audit;

const Diff = styled('pre', { name: 'SgAdminAudit', slot: 'Diff' })(({ theme }) => ({
  margin: 0,
  maxWidth: 420,
  maxHeight: 160,
  overflow: 'auto',
  fontSize: 12,
  lineHeight: '16px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  color: theme.palette.text.secondary,
}));

export default function AdminAuditPage() {
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const log = useQuery({
    queryKey: ['admin', 'audit', { entityType, action, page, limit }],
    queryFn: () =>
      listAuditLog({
        page,
        limit,
        entityType: entityType.trim() || undefined,
        action: action.trim() || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const columns: Column<AuditEntry>[] = [
    {
      key: 'date',
      label: t.columns.date,
      nowrap: true,
      render: (e) => formatDateTime(e.createdAt),
    },
    { key: 'actor', label: t.columns.actor, render: (e) => e.actorEmail ?? t.system },
    { key: 'action', label: t.columns.action, render: (e) => e.action },
    {
      key: 'entity',
      label: t.columns.entity,
      render: (e) => `${e.entityType}${e.entityId ? ` #${e.entityId}` : ''}`,
    },
    {
      key: 'diff',
      label: t.columns.diff,
      render: (e) => (e.diff ? <Diff>{JSON.stringify(e.diff, null, 1)}</Diff> : '—'),
    },
  ];

  return (
    <>
      <SectionHeading level="h1" size="medium" title={ua.admin.nav.audit} />
      <FilterBar>
        <TextField
          size="small"
          label={t.entityType}
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value);
            setPage(1);
          }}
        />
        <TextField
          size="small"
          label={t.action}
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
        />
      </FilterBar>
      <DataTable
        columns={columns}
        rows={log.data?.data}
        rowKey={(e) => e.id}
        loading={log.isPending}
        error={log.error}
        total={log.data?.meta.total}
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
