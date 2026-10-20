'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  getRecommendationWeights,
  getSettings,
  updateRecommendationWeights,
  updateSettings,
} from '@/api/admin';
import { errorMessage } from '@/api/client';
import type { BusinessSettings, RecommendationWeights } from '@/api/types';
import { SectionPanel } from '@/components/partner/VenueSections';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ua } from '@/i18n/ua';
import { notify } from '@/stores/notify';

const t = ua.admin.settings;

const Grid = styled('div', { name: 'SgAdminSettings', slot: 'Grid' })(({ theme }) => ({
  display: 'grid',
  gap: 16,
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('sm')]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
}));

function NumberForm<T extends Record<string, number>>({
  initial,
  labels,
  step,
  onSave,
  pending,
  footer,
}: {
  initial: T;
  labels: Record<keyof T, string>;
  step: string;
  onSave: (values: Partial<T>) => void;
  pending: boolean;
  footer?: (values: Record<keyof T, string>) => string;
}) {
  const [values, setValues] = useState(
    () =>
      Object.fromEntries(Object.entries(initial).map(([k, v]) => [k, String(v)])) as Record<
        keyof T,
        string
      >,
  );
  const changed = Object.fromEntries(
    Object.entries(values)
      .filter(([k, v]) => v !== '' && Number(v) !== initial[k])
      .map(([k, v]) => [k, Number(v)]),
  ) as Partial<T>;
  const invalid = Object.values(values).some((v) => v === '' || !Number.isFinite(Number(v)));

  return (
    <Stack spacing={2}>
      <Grid>
        {(Object.keys(labels) as (keyof T & string)[]).map((key) => (
          <TextField
            key={key}
            type="number"
            label={labels[key]}
            value={values[key]}
            onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            slotProps={{ htmlInput: { step } }}
          />
        ))}
      </Grid>
      {footer && (
        <Typography variant="body2" color="text.secondary">
          {footer(values)}
        </Typography>
      )}
      <div>
        <Button
          variant="contained"
          disabled={invalid || pending || Object.keys(changed).length === 0}
          onClick={() => onSave(changed)}
        >
          {ua.admin.save}
        </Button>
      </div>
    </Stack>
  );
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ['admin', 'settings'], queryFn: getSettings });
  const weights = useQuery({ queryKey: ['admin', 'weights'], queryFn: getRecommendationWeights });

  const saveSettings = useMutation({
    mutationFn: (patch: Partial<BusinessSettings>) => updateSettings(patch),
    onSuccess: (data) => {
      queryClient.setQueryData(['admin', 'settings'], data);
      notify.success(ua.admin.saved);
    },
  });
  const saveWeights = useMutation({
    mutationFn: (patch: Partial<RecommendationWeights>) => updateRecommendationWeights(patch),
    onSuccess: (data) => {
      queryClient.setQueryData(['admin', 'weights'], data);
      notify.success(ua.admin.saved);
    },
  });

  return (
    <>
      <SectionHeading level="h1" size="medium" title={ua.admin.nav.settings} />
      <Stack spacing={3}>
        <SectionPanel title={t.business}>
          {saveSettings.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage(saveSettings.error)}
            </Alert>
          )}
          {settings.data ? (
            <NumberForm
              key={JSON.stringify(settings.data)}
              initial={settings.data as unknown as Record<string, number>}
              labels={t.fields}
              step="any"
              pending={saveSettings.isPending}
              onSave={(patch) => saveSettings.mutate(patch as Partial<BusinessSettings>)}
            />
          ) : settings.isError ? (
            <Alert severity="error">{errorMessage(settings.error)}</Alert>
          ) : (
            <Skeleton variant="rounded" height={240} />
          )}
        </SectionPanel>
        <SectionPanel title={t.weights}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t.weightsHint}
          </Typography>
          {saveWeights.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage(saveWeights.error)}
            </Alert>
          )}
          {weights.data ? (
            <NumberForm
              key={JSON.stringify(weights.data)}
              initial={weights.data as unknown as Record<string, number>}
              labels={t.weightFields}
              step="0.05"
              pending={saveWeights.isPending}
              onSave={(patch) => saveWeights.mutate(patch as Partial<RecommendationWeights>)}
              footer={(values) =>
                t.weightsSum(
                  Object.values(values)
                    .reduce((sum, v) => sum + (Number(v) || 0), 0)
                    .toFixed(2),
                )
              }
            />
          ) : weights.isError ? (
            <Alert severity="error">{errorMessage(weights.error)}</Alert>
          ) : (
            <Skeleton variant="rounded" height={200} />
          )}
        </SectionPanel>
      </Stack>
    </>
  );
}
