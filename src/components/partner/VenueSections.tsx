'use client';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { useState, type ReactNode } from 'react';
import * as yup from 'yup';
import { errorMessage, normalizeError } from '@/api/client';
import {
  addClosure,
  addVenuePhoto,
  deleteClosure,
  deleteVenuePhoto,
  removeVenueImage,
  setVenueHours,
  updateVenueProfile,
  uploadVenueImage,
  type VenueImageKind,
  type VenueProfilePatch,
} from '@/api/partner';
import type { VenueProfile } from '@/api/types';
import { fieldState } from '@/components/auth/FormFields';
import { AddressAutocomplete } from '@/components/maps/AddressAutocomplete';
import { PointPicker } from '@/components/maps/LazyMaps';
import { useDictionaries } from '@/hooks/useDictionaries';
import { ua } from '@/i18n/ua';
import { mapsEnabled } from '@/lib/env';
import { formatDate, kyivDateString } from '@/lib/format';
import { notify } from '@/stores/notify';
import { shadows } from '@/theme/theme';
import { ImageUploader } from './ImageUploader';

const t = ua.partner.venueSettings;
const v = ua.forBusiness.validation;
const PHONE = /^\+[1-9]\d{7,14}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export const venueProfileKey = (venueId: number) => ['partner', venueId, 'profile'] as const;

const Panel = styled('section', { name: 'SgVenueSections', slot: 'Panel' })(({ theme }) => ({
  padding: 24,
  borderRadius: 24,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
}));

const Two = styled('div', { name: 'SgVenueSections', slot: 'Two' })(({ theme }) => ({
  display: 'grid',
  gap: 16,
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('sm')]: { gridTemplateColumns: '1fr 1fr' },
}));

const HoursRow = styled('div', { name: 'SgVenueSections', slot: 'HoursRow' })(({ theme }) => ({
  display: 'grid',
  alignItems: 'center',
  gap: 12,
  gridTemplateColumns: '40px 1fr 1fr',
  [theme.breakpoints.up('sm')]: { gridTemplateColumns: '48px 140px 1fr 1fr' },
}));

export function SectionPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Panel>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Panel>
  );
}

function useProfileUpdate(venueId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: VenueProfilePatch) => updateVenueProfile(venueId, patch),
    onSuccess: (profile) => {
      queryClient.setQueryData(venueProfileKey(venueId), profile);
      void queryClient.invalidateQueries({ queryKey: ['partner', 'venues'] });
      notify.success(t.saved);
    },
  });
}

export function ProfileSection({
  profile,
  submitLabel = ua.common.save,
  onSaved,
}: {
  profile: VenueProfile;
  submitLabel?: string;
  onSaved?: () => void;
}) {
  const dictionaries = useDictionaries();
  const update = useProfileUpdate(profile.id);
  const formik = useFormik({
    initialValues: {
      name: profile.name,
      description: profile.description ?? '',
      categoryId: profile.category.id,
      cityId: profile.city.id,
      phone: profile.phone ?? '',
    },
    validationSchema: yup.object({
      name: yup.string().trim().min(2, v.min(2)).max(255).required(v.required),
      description: yup.string().max(2000),
      phone: yup.string().trim().matches(PHONE, ua.auth.validation.phone),
    }),
    onSubmit: (values, helpers) =>
      update
        .mutateAsync({
          name: values.name.trim(),
          description: values.description.trim() || null,
          categoryId: values.categoryId,
          cityId: values.cityId,
          phone: values.phone.trim() || null,
        })
        .then(() => onSaved?.())
        .catch((error: unknown) =>
          normalizeError(error).details.forEach((d) => helpers.setFieldError(d.field, d.message)),
        ),
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <Stack spacing={2.5}>
        {update.isError && <Alert severity="error">{errorMessage(update.error)}</Alert>}
        <TextField
          label={t.name}
          {...formik.getFieldProps('name')}
          {...fieldState(formik, 'name')}
        />
        <TextField
          label={t.description}
          multiline
          minRows={3}
          {...formik.getFieldProps('description')}
          {...fieldState(formik, 'description')}
        />
        <Two>
          <TextField select label={t.category} {...formik.getFieldProps('categoryId')}>
            {dictionaries.categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label={t.city} {...formik.getFieldProps('cityId')}>
            {dictionaries.cities.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
        </Two>
        <TextField
          label={t.phone}
          type="tel"
          placeholder="+380XXXXXXXXX"
          {...formik.getFieldProps('phone')}
          {...fieldState(formik, 'phone')}
        />
        <div>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </Stack>
    </form>
  );
}

export function LocationSection({
  profile,
  submitLabel = ua.common.save,
  onSaved,
}: {
  profile: VenueProfile;
  submitLabel?: string;
  onSaved?: () => void;
}) {
  const update = useProfileUpdate(profile.id);
  const [address, setAddress] = useState(profile.address);
  const [point, setPoint] = useState({ lat: profile.lat, lng: profile.lng });
  const invalid = address.trim().length < 5;

  function save() {
    update.mutate(
      { address: address.trim(), lat: point.lat, lng: point.lng },
      { onSuccess: () => onSaved?.() },
    );
  }

  return (
    <Stack spacing={2.5}>
      {update.isError && <Alert severity="error">{errorMessage(update.error)}</Alert>}
      {mapsEnabled && (
        <AddressAutocomplete
          near={point}
          onSelect={(place) => {
            setAddress(place.address);
            setPoint(place.point);
          }}
        />
      )}
      <TextField
        label={t.address}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        error={invalid}
        helperText={invalid ? v.min(5) : undefined}
      />
      {mapsEnabled ? (
        <>
          <Typography variant="body2" color="text.secondary">
            {t.mapHint}
          </Typography>
          <PointPicker point={point} onPick={setPoint} height={300} />
        </>
      ) : (
        <Two>
          <TextField
            type="number"
            label="lat"
            value={point.lat}
            onChange={(e) => setPoint({ ...point, lat: Number(e.target.value) })}
          />
          <TextField
            type="number"
            label="lng"
            value={point.lng}
            onChange={(e) => setPoint({ ...point, lng: Number(e.target.value) })}
          />
        </Two>
      )}
      <Typography variant="caption" sx={{ color: 'muted' }}>
        {t.coordinates(point.lat, point.lng)}
      </Typography>
      <div>
        <Button variant="contained" disabled={invalid || update.isPending} onClick={save}>
          {submitLabel}
        </Button>
      </div>
    </Stack>
  );
}

export function LegalSection({ profile }: { profile: VenueProfile }) {
  const update = useProfileUpdate(profile.id);
  const formik = useFormik({
    initialValues: { legalName: profile.legalName, taxId: '', iban: '' },
    validationSchema: yup.object({
      legalName: yup.string().trim().min(2, v.min(2)).max(255).required(v.required),
      taxId: yup
        .string()
        .trim()
        .matches(/^(\d{8}|\d{10})$/, v.taxId),
      iban: yup
        .string()
        .transform((value: string) => value.replace(/\s+/g, '').toUpperCase())
        .matches(/^UA\d{27}$/, v.iban),
    }),
    onSubmit: (values, helpers) =>
      update
        .mutateAsync({
          legalName: values.legalName.trim(),
          ...(values.taxId.trim() && { taxId: values.taxId.trim() }),
          ...(values.iban.trim() && { iban: values.iban.replace(/\s+/g, '').toUpperCase() }),
        })
        .then(() => helpers.resetForm({ values: { ...values, taxId: '', iban: '' } }))
        .catch((error: unknown) =>
          normalizeError(error).details.forEach((d) => helpers.setFieldError(d.field, d.message)),
        ),
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <Stack spacing={2.5}>
        {update.isError && <Alert severity="error">{errorMessage(update.error)}</Alert>}
        <TextField
          label={t.legalName}
          {...formik.getFieldProps('legalName')}
          {...fieldState(formik, 'legalName')}
        />
        <Two>
          <TextField
            label={t.taxId}
            {...formik.getFieldProps('taxId')}
            {...fieldState(formik, 'taxId')}
            helperText={fieldState(formik, 'taxId').helperText ?? t.secretHint(profile.taxId)}
          />
          <TextField
            label={t.iban}
            {...formik.getFieldProps('iban')}
            {...fieldState(formik, 'iban')}
            helperText={fieldState(formik, 'iban').helperText ?? t.secretHint(profile.iban)}
          />
        </Two>
        <div>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {ua.common.save}
          </Button>
        </div>
      </Stack>
    </form>
  );
}

export function ImagesSection({ profile }: { profile: VenueProfile }) {
  const queryClient = useQueryClient();
  const key = venueProfileKey(profile.id);
  const patch = (data: Partial<VenueProfile>) =>
    queryClient.setQueryData<VenueProfile>(key, (old) => (old ? { ...old, ...data } : old));
  const onError = (error: unknown) => notify.error(errorMessage(error));

  const image = useMutation({
    mutationFn: async ({ kind, file }: { kind: VenueImageKind; file: File | null }) => {
      if (file) return { kind, url: (await uploadVenueImage(profile.id, kind, file)).url };
      await removeVenueImage(profile.id, kind);
      return { kind, url: null };
    },
    onSuccess: ({ kind, url }) => {
      patch(kind === 'logo' ? { logoUrl: url } : { coverUrl: url });
      notify.success(url ? ua.partner.photo.uploaded : ua.partner.photo.removed);
    },
    onError,
  });
  const gallery = useMutation({
    mutationFn: ({ file, photoId }: { file?: File; photoId?: number }) =>
      file ? addVenuePhoto(profile.id, file) : deleteVenuePhoto(profile.id, photoId!),
    onSuccess: (photos) => patch({ photos }),
    onError,
  });

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <div>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t.logo}
          </Typography>
          <ImageUploader
            url={profile.logoUrl}
            alt={t.logo}
            ratio={1}
            width={140}
            pending={image.isPending && image.variables?.kind === 'logo'}
            onSelect={(file) => image.mutate({ kind: 'logo', file })}
            onRemove={() => image.mutate({ kind: 'logo', file: null })}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t.cover}
          </Typography>
          <ImageUploader
            url={profile.coverUrl}
            alt={t.cover}
            ratio={16 / 9}
            width={420}
            pending={image.isPending && image.variables?.kind === 'cover'}
            onSelect={(file) => image.mutate({ kind: 'cover', file })}
            onRemove={() => image.mutate({ kind: 'cover', file: null })}
          />
        </div>
      </Stack>
      <div>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {t.gallery}
        </Typography>
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {profile.photos.map((photo) => (
            <div key={photo.id} style={{ position: 'relative' }}>
              <ImageUploader
                url={photo.url}
                alt={t.gallery}
                ratio={4 / 3}
                width={160}
                pending={gallery.isPending && gallery.variables?.photoId === photo.id}
                disabled
                onSelect={() => undefined}
              />
              <IconButton
                aria-label={ua.partner.photo.remove}
                onClick={() => gallery.mutate({ photoId: photo.id })}
                sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'background.paper' }}
                size="small"
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </div>
          ))}
          {profile.photos.length < 10 && (
            <ImageUploader
              url={null}
              alt={t.gallery}
              ratio={4 / 3}
              width={160}
              pending={gallery.isPending && Boolean(gallery.variables?.file)}
              onSelect={(file) => gallery.mutate({ file })}
            />
          )}
        </Stack>
      </div>
    </Stack>
  );
}

interface HoursValue {
  weekday: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}

export function HoursSection({
  profile,
  submitLabel = t.saveHours,
  onSaved,
}: {
  profile: VenueProfile;
  submitLabel?: string;
  onSaved?: () => void;
}) {
  const queryClient = useQueryClient();
  const [hours, setHours] = useState<HoursValue[]>(() =>
    [1, 2, 3, 4, 5, 6, 7].map((weekday) => {
      const h = profile.hours.find((x) => x.weekday === weekday);
      return {
        weekday,
        opensAt: h?.opensAt.slice(0, 5) ?? '09:00',
        closesAt: h?.closesAt.slice(0, 5) ?? '21:00',
        isClosed: h?.isClosed ?? false,
      };
    }),
  );
  const save = useMutation({
    mutationFn: () =>
      setVenueHours(
        profile.id,
        hours.map((h) =>
          h.isClosed
            ? { weekday: h.weekday, isClosed: true }
            : { weekday: h.weekday, opensAt: h.opensAt, closesAt: h.closesAt, isClosed: false },
        ),
      ),
    onSuccess: (updated) => {
      queryClient.setQueryData(venueProfileKey(profile.id), updated);
      notify.success(t.saved);
      onSaved?.();
    },
  });

  const update = (weekday: number, patch: Partial<HoursValue>) =>
    setHours((list) => list.map((h) => (h.weekday === weekday ? { ...h, ...patch } : h)));
  const invalid = hours.some(
    (h) => !h.isClosed && (!TIME.test(h.opensAt) || !TIME.test(h.closesAt)),
  );

  return (
    <Stack spacing={1.5}>
      {save.isError && <Alert severity="error">{errorMessage(save.error)}</Alert>}
      {hours.map((h) => (
        <HoursRow key={h.weekday}>
          <Typography sx={{ fontWeight: 700 }}>{ua.venue.weekdays[h.weekday - 1]}</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={h.isClosed}
                onChange={(e) => update(h.weekday, { isClosed: e.target.checked })}
              />
            }
            label={t.closedDay}
          />
          <TextField
            type="time"
            size="small"
            label={t.opensAt}
            value={h.opensAt}
            disabled={h.isClosed}
            onChange={(e) => update(h.weekday, { opensAt: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="time"
            size="small"
            label={t.closesAt}
            value={h.closesAt}
            disabled={h.isClosed}
            onChange={(e) => update(h.weekday, { closesAt: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </HoursRow>
      ))}
      <div>
        <Button
          variant="contained"
          disabled={invalid || save.isPending}
          onClick={() => save.mutate()}
        >
          {submitLabel}
        </Button>
      </div>
    </Stack>
  );
}

export function ClosuresSection({ profile }: { profile: VenueProfile }) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(kyivDateString(1));
  const [reason, setReason] = useState('');
  const refresh = () => queryClient.invalidateQueries({ queryKey: venueProfileKey(profile.id) });
  const onError = (error: unknown) => notify.error(errorMessage(error));

  const add = useMutation({
    mutationFn: () => addClosure(profile.id, date, reason.trim() || undefined),
    onSuccess: () => {
      setReason('');
      void refresh();
    },
    onError,
  });
  const remove = useMutation({
    mutationFn: (closureId: number) => deleteClosure(profile.id, closureId),
    onSuccess: () => void refresh(),
    onError,
  });

  return (
    <Stack spacing={2}>
      {profile.closures.length === 0 ? (
        <Typography color="text.secondary">{t.noClosures}</Typography>
      ) : (
        profile.closures.map((c) => (
          <Stack key={c.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 700, minWidth: 100 }}>{formatDate(c.date)}</Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              {c.reason}
            </Typography>
            <IconButton
              aria-label={ua.partner.photo.remove}
              onClick={() => remove.mutate(c.id)}
              disabled={remove.isPending}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Stack>
        ))
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          type="date"
          size="small"
          label={t.closureDate}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: kyivDateString() } }}
        />
        <TextField
          size="small"
          label={t.closureReason}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button variant="outlined" disabled={!date || add.isPending} onClick={() => add.mutate()}>
          {t.addClosure}
        </Button>
      </Stack>
    </Stack>
  );
}
