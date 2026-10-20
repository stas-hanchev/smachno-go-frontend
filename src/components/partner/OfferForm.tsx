'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { useState } from 'react';
import * as yup from 'yup';
import { errorMessage, normalizeError } from '@/api/client';
import { createOffer, removeOfferPhoto, updateOffer, uploadOfferPhoto } from '@/api/partner';
import type { PartnerOffer } from '@/api/types';
import { fieldState } from '@/components/auth/FormFields';
import { ToggleChips } from '@/components/ui/FilterChips';
import { useDictionaries } from '@/hooks/useDictionaries';
import { ua } from '@/i18n/ua';
import { formatPrice } from '@/lib/format';
import { discountPercent, minimumPrice } from '@/lib/partner-stats';
import { notify } from '@/stores/notify';
import { ImageUploader } from './ImageUploader';

const t = ua.partner.offerForm;
export const MIN_PRICE_RATIO = 0.1;

const Two = styled('div', { name: 'SgOfferForm', slot: 'Two' })(({ theme }) => ({
  display: 'grid',
  gap: 16,
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('sm')]: { gridTemplateColumns: '1fr 1fr' },
}));

export interface OfferFormValues {
  title: string;
  description: string;
  categoryId: number;
  originalPrice: string;
  price: string;
  estWeightKg: string;
  maxPerOrder: number;
  tagIds: number[];
  allergenIds: number[];
}

const schema = yup.object({
  title: yup.string().trim().min(3, ua.forBusiness.validation.min(3)).max(120).required(t.required),
  description: yup.string().max(2000),
  categoryId: yup.number().min(1, t.required).required(t.required),
  originalPrice: yup.number().typeError(t.required).positive(t.positive).required(t.required),
  price: yup
    .number()
    .typeError(t.required)
    .positive(t.positive)
    .required(t.required)
    .test('lower', t.priceLower, function (value) {
      const original = Number(this.parent.originalPrice);
      return !value || !original || value < original;
    }),
  estWeightKg: yup.number().typeError(t.required).positive(t.positive).max(50).required(t.required),
  maxPerOrder: yup.number().integer().min(1).max(5).required(),
});

function toValues(offer: PartnerOffer | null): OfferFormValues {
  return {
    title: offer?.title ?? '',
    description: offer?.description ?? '',
    categoryId: offer?.category.id ?? 0,
    originalPrice: offer ? String(Number(offer.originalPrice)) : '',
    price: offer ? String(Number(offer.price)) : '',
    estWeightKg: offer ? String(offer.estWeightKg) : '0.8',
    maxPerOrder: offer?.maxPerOrder ?? 2,
    tagIds: offer?.tags.map((tag) => tag.id) ?? [],
    allergenIds: offer?.allergens.map((a) => a.id) ?? [],
  };
}

function toggle(list: number[], id: number) {
  return list.includes(id) ? list.filter((v) => v !== id) : [...list, id];
}

export function OfferForm({
  venueId,
  offer: initial,
  onSaved,
  submitLabel = t.save,
}: {
  venueId: number;
  offer: PartnerOffer | null;
  onSaved?: (offer: PartnerOffer) => void;
  submitLabel?: string;
}) {
  const queryClient = useQueryClient();
  const dictionaries = useDictionaries();
  const [offer, setOffer] = useState(initial);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['partner', venueId, 'offers'] });

  const save = useMutation({
    mutationFn: (values: OfferFormValues) => {
      const input = {
        title: values.title.trim(),
        description: values.description.trim() || null,
        categoryId: values.categoryId,
        originalPrice: Number(values.originalPrice),
        price: Number(values.price),
        estWeightKg: Number(values.estWeightKg),
        maxPerOrder: values.maxPerOrder,
        tagIds: values.tagIds,
        allergenIds: values.allergenIds,
      };
      return offer ? updateOffer(venueId, offer.id, input) : createOffer(venueId, input);
    },
    onSuccess: (saved) => {
      setOffer(saved);
      notify.success(ua.partner.offers.saved);
      void refresh();
      onSaved?.(saved);
    },
  });

  const photo = useMutation({
    mutationFn: async (file: File | null) => {
      if (!offer) return null;
      if (file) return (await uploadOfferPhoto(venueId, offer.id, file)).url;
      await removeOfferPhoto(venueId, offer.id);
      return null;
    },
    onSuccess: (url) => {
      if (offer) setOffer({ ...offer, photoUrl: url });
      notify.success(url ? ua.partner.photo.uploaded : ua.partner.photo.removed);
      void refresh();
    },
    onError: (error) => notify.error(errorMessage(error)),
  });

  const formik = useFormik<OfferFormValues>({
    initialValues: toValues(initial),
    validationSchema: schema,
    onSubmit: (values, helpers) =>
      save.mutateAsync(values).catch((error: unknown) => {
        normalizeError(error).details.forEach((d) => helpers.setFieldError(d.field, d.message));
      }),
  });

  const original = Number(formik.values.originalPrice);
  const price = Number(formik.values.price);
  const percent = discountPercent(price, original);
  const minimum = original > 0 ? minimumPrice(original, MIN_PRICE_RATIO) : null;
  const saveError = save.error ? normalizeError(save.error) : null;

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <Stack spacing={2.5}>
        {saveError && <Alert severity="error">{saveError.message}</Alert>}
        <TextField
          label={t.title}
          {...formik.getFieldProps('title')}
          {...fieldState(formik, 'title')}
          slotProps={{ htmlInput: { maxLength: 120 } }}
        />
        <TextField
          label={t.description}
          multiline
          minRows={3}
          {...formik.getFieldProps('description')}
          {...fieldState(formik, 'description')}
        />
        <TextField
          select
          label={t.category}
          {...formik.getFieldProps('categoryId')}
          {...fieldState(formik, 'categoryId')}
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
        <Two>
          <TextField
            type="number"
            label={t.originalPrice}
            {...formik.getFieldProps('originalPrice')}
            {...fieldState(formik, 'originalPrice')}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          />
          <TextField
            type="number"
            label={t.price}
            {...formik.getFieldProps('price')}
            {...fieldState(formik, 'price')}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          />
        </Two>
        {(percent > 0 || minimum !== null) && (
          <Typography variant="body2" color="text.secondary">
            {[
              percent > 0 ? t.discount(percent) : null,
              minimum ? t.minPrice(formatPrice(minimum.toFixed(2))) : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        )}
        <Two>
          <TextField
            type="number"
            label={t.weight}
            {...formik.getFieldProps('estWeightKg')}
            {...fieldState(formik, 'estWeightKg')}
            slotProps={{ htmlInput: { min: 0, step: '0.1' } }}
          />
          <TextField select label={t.maxPerOrder} {...formik.getFieldProps('maxPerOrder')}>
            {[1, 2, 3, 4, 5].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </TextField>
        </Two>
        <div>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t.tags}
          </Typography>
          <ToggleChips
            label={t.tags}
            values={formik.values.tagIds}
            options={dictionaries.tags.map((tag) => ({ value: tag.id, label: tag.name }))}
            onToggle={(id) => void formik.setFieldValue('tagIds', toggle(formik.values.tagIds, id))}
          />
        </div>
        <div>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t.allergens}
          </Typography>
          <ToggleChips
            label={t.allergens}
            values={formik.values.allergenIds}
            options={dictionaries.allergens.map((a) => ({ value: a.id, label: a.name }))}
            onToggle={(id) =>
              void formik.setFieldValue('allergenIds', toggle(formik.values.allergenIds, id))
            }
          />
        </div>
        <div>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t.photo}
          </Typography>
          {offer ? (
            <ImageUploader
              url={offer.photoUrl}
              alt={offer.title}
              ratio={4 / 3}
              width={280}
              pending={photo.isPending}
              onSelect={(file) => photo.mutate(file)}
              onRemove={() => photo.mutate(null)}
            />
          ) : (
            <Typography variant="body2" sx={{ color: 'muted' }}>
              {t.photoAfterSave}
            </Typography>
          )}
        </div>
        <div>
          <Button type="submit" variant="contained" size="large" disabled={formik.isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </Stack>
    </form>
  );
}
