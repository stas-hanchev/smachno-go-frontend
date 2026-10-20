'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  approveApplication,
  getApplication,
  listApplications,
  rejectApplication,
} from '@/api/admin';
import { errorMessage } from '@/api/client';
import type { ApplicationStatus, PartnerApplication } from '@/api/types';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ReasonDialog } from '@/components/ui/ReasonDialog';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useDictionaries } from '@/hooks/useDictionaries';
import { ua } from '@/i18n/ua';
import { formatDateTime } from '@/lib/format';
import { notify } from '@/stores/notify';

const t = ua.admin.applications;
const STATUS_COLOR = { submitted: 'warning', approved: 'success', rejected: 'default' } as const;

function StatusChip({ status }: { status: ApplicationStatus }) {
  return <Chip size="small" color={STATUS_COLOR[status]} label={ua.forBusiness.status[status]} />;
}

function Field({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography>{value ?? '—'}</Typography>
    </div>
  );
}

function ApplicationDialog({ id, onClose }: { id: number | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const dictionaries = useDictionaries();
  const [categoryId, setCategoryId] = useState(0);
  const [cityId, setCityId] = useState(0);
  const [name, setName] = useState('');
  const [commission, setCommission] = useState('15');
  const [rejecting, setRejecting] = useState(false);

  const details = useQuery({
    queryKey: ['admin', 'application', id],
    queryFn: () => getApplication(id!),
    enabled: id !== null,
  });
  const done = (message: string) => {
    notify.success(message);
    void queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'application', id] });
    setRejecting(false);
    onClose();
  };
  const approve = useMutation({
    mutationFn: () =>
      approveApplication(id!, {
        categoryId,
        cityId,
        ...(name.trim() && { name: name.trim() }),
        commissionRate: Number(commission) / 100,
      }),
    onSuccess: () => done(t.approved),
  });
  const reject = useMutation({
    mutationFn: (reason: string) => rejectApplication(id!, reason),
    onSuccess: () => done(t.rejected),
  });

  const app = details.data;
  const commissionValid = Number(commission) >= 0 && Number(commission) <= 50;

  return (
    <Dialog open={id !== null} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{app ? `${app.businessName} · №${app.id}` : t.columns.business}</DialogTitle>
      <DialogContent>
        {details.isPending ? (
          <Skeleton variant="rounded" height={240} />
        ) : details.isError ? (
          <Alert severity="error">{errorMessage(details.error)}</Alert>
        ) : app ? (
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <StatusChip status={app.status} />
              <Typography variant="body2" color="text.secondary">
                {formatDateTime(app.createdAt)}
              </Typography>
            </Stack>
            {app.rejectReason && <Alert severity="info">{app.rejectReason}</Alert>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Typography variant="subtitle1">{t.applicant}</Typography>
                <Field
                  label={ua.forBusiness.contactName}
                  value={`${app.contactName} · ${app.contactPhone}`}
                />
                <Field label={ua.forBusiness.contactEmail} value={app.contactEmail} />
                <Field label={ua.profile.email} value={app.applicant.email} />
              </Stack>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Typography variant="subtitle1">{t.legal}</Typography>
                <Field label={ua.forBusiness.legalName} value={app.legalName} />
                <Field label={ua.forBusiness.taxId} value={app.taxId} />
                <Field label={ua.forBusiness.iban} value={app.iban} />
              </Stack>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Field label={ua.forBusiness.venueType} value={app.venueType} />
              <Field label={ua.forBusiness.address} value={app.address} />
              <Field label={ua.forBusiness.venuesCount} value={app.venuesCount} />
            </Stack>
            {app.venues.length > 0 && (
              <Field label={t.createdVenues} value={app.venues.map((v) => v.name).join(', ')} />
            )}
            {app.status === 'submitted' && (
              <Stack spacing={2}>
                <Typography variant="subtitle1">{t.approveTitle}</Typography>
                {approve.isError && <Alert severity="error">{errorMessage(approve.error)}</Alert>}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    select
                    label={t.category}
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    sx={{ flex: 1 }}
                  >
                    <MenuItem value={0} disabled>
                      —
                    </MenuItem>
                    {dictionaries.categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label={t.city}
                    value={cityId}
                    onChange={(e) => setCityId(Number(e.target.value))}
                    sx={{ flex: 1 }}
                  >
                    <MenuItem value={0} disabled>
                      —
                    </MenuItem>
                    {dictionaries.cities.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label={t.venueName}
                    placeholder={app.businessName}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    type="number"
                    label={t.commission}
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    error={!commissionValid}
                    slotProps={{ htmlInput: { min: 0, max: 50, step: 0.5 } }}
                    sx={{ width: 160 }}
                  />
                </Stack>
              </Stack>
            )}
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{ua.common.close}</Button>
        {app?.status === 'submitted' && (
          <>
            <Button color="error" onClick={() => setRejecting(true)}>
              {t.reject}
            </Button>
            <Button
              variant="contained"
              disabled={!categoryId || !cityId || !commissionValid || approve.isPending}
              onClick={() => approve.mutate()}
            >
              {t.approve}
            </Button>
          </>
        )}
      </DialogActions>
      <ReasonDialog
        open={rejecting}
        title={t.rejectTitle}
        confirmLabel={t.reject}
        reasonLabel={t.reason}
        pending={reject.isPending}
        error={reject.error ? errorMessage(reject.error) : null}
        onConfirm={(reason) => reject.mutate(reason)}
        onClose={() => setRejecting(false)}
      />
    </Dialog>
  );
}

export default function AdminApplicationsPage() {
  const [status, setStatus] = useState<ApplicationStatus | ''>('submitted');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selected, setSelected] = useState<number | null>(null);

  const applications = useQuery({
    queryKey: ['admin', 'applications', { status, page, limit }],
    queryFn: () => listApplications({ page, limit, status: status || undefined }),
    placeholderData: keepPreviousData,
  });

  const columns: Column<PartnerApplication>[] = [
    { key: 'id', label: t.columns.id, render: (a) => a.id },
    { key: 'business', label: t.columns.business, render: (a) => a.businessName },
    { key: 'type', label: t.columns.type, render: (a) => a.venueType },
    {
      key: 'contact',
      label: t.columns.contact,
      render: (a) => `${a.contactName} · ${a.contactPhone}`,
    },
    {
      key: 'date',
      label: t.columns.date,
      render: (a) => formatDateTime(a.createdAt),
      nowrap: true,
    },
    { key: 'status', label: t.columns.status, render: (a) => <StatusChip status={a.status} /> },
  ];

  return (
    <>
      <SectionHeading
        level="h1"
        size="medium"
        title={ua.admin.nav.applications}
        action={
          <TextField
            select
            size="small"
            label={ua.admin.status}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ApplicationStatus | '');
              setPage(1);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">{ua.admin.all}</MenuItem>
            {(['submitted', 'approved', 'rejected'] as const).map((s) => (
              <MenuItem key={s} value={s}>
                {ua.forBusiness.status[s]}
              </MenuItem>
            ))}
          </TextField>
        }
      />
      <DataTable
        columns={columns}
        rows={applications.data?.data}
        rowKey={(a) => a.id}
        loading={applications.isPending}
        error={applications.error}
        total={applications.data?.meta.total}
        page={page}
        limit={limit}
        onPage={setPage}
        onLimit={(next) => {
          setLimit(next);
          setPage(1);
        }}
        onRowClick={(a) => setSelected(a.id)}
      />
      <ApplicationDialog key={selected ?? 'none'} id={selected} onClose={() => setSelected(null)} />
    </>
  );
}
