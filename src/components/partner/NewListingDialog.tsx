'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import NextLink from 'next/link';
import * as yup from 'yup';
import { normalizeError } from '@/api/client';
import { createListing } from '@/api/partner';
import type { PartnerOffer } from '@/api/types';
import { fieldState } from '@/components/auth/FormFields';
import { ToggleChips } from '@/components/ui/FilterChips';
import { ua } from '@/i18n/ua';
import { kyivDateString } from '@/lib/format';
import { notify } from '@/stores/notify';

const t = ua.partner.newListing;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const schema = yup.object({
  offerId: yup
    .number()
    .min(1, ua.partner.offerForm.required)
    .required(ua.partner.offerForm.required),
  day: yup.string().oneOf(['today', 'tomorrow']).required(),
  pickupStart: yup.string().matches(TIME, ua.partner.offerForm.required).required(),
  pickupEnd: yup.string().matches(TIME, ua.partner.offerForm.required).required(),
  quantity: yup
    .number()
    .integer()
    .min(1, ua.partner.offerForm.positive)
    .max(500)
    .required(ua.partner.offerForm.required),
});

interface ListingFormValues {
  offerId: number;
  day: 'today' | 'tomorrow';
  pickupStart: string;
  pickupEnd: string;
  quantity: number;
}

export function NewListingDialog({
  open,
  venueId,
  offers,
  onClose,
}: {
  open: boolean;
  venueId: number;
  offers: PartnerOffer[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const active = offers.filter((o) => o.status === 'active');

  const create = useMutation({
    mutationFn: (values: ListingFormValues) =>
      createListing(venueId, {
        offerId: values.offerId,
        date: kyivDateString(values.day === 'today' ? 0 : 1),
        pickupStart: values.pickupStart,
        pickupEnd: values.pickupEnd,
        quantity: values.quantity,
      }),
    onSuccess: () => {
      notify.success(t.created);
      void queryClient.invalidateQueries({ queryKey: ['partner', venueId, 'listings'] });
      onClose();
    },
  });

  const formik = useFormik<ListingFormValues>({
    initialValues: {
      offerId: active[0]?.id ?? 0,
      day: 'today',
      pickupStart: '19:00',
      pickupEnd: '21:00',
      quantity: 5,
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: (values) => create.mutate(values),
  });

  const error = create.error ? normalizeError(create.error) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>{t.title}</DialogTitle>
        <DialogContent>
          {active.length === 0 ? (
            <Alert
              severity="info"
              action={
                <Button component={NextLink} href="/partner/offers" color="inherit" size="small">
                  {t.toOffers}
                </Button>
              }
            >
              {t.noOffers}
            </Alert>
          ) : (
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              {error && <Alert severity="error">{error.message}</Alert>}
              <TextField select label={t.offer} {...formik.getFieldProps('offerId')}>
                {active.map((offer) => (
                  <MenuItem key={offer.id} value={offer.id}>
                    {offer.title}
                  </MenuItem>
                ))}
              </TextField>
              <ToggleChips
                label={t.date}
                values={[formik.values.day]}
                options={[
                  { value: 'today', label: t.today },
                  { value: 'tomorrow', label: t.tomorrow },
                ]}
                onToggle={(day) => void formik.setFieldValue('day', day)}
              />
              <Stack direction="row" spacing={1.5}>
                <TextField
                  type="time"
                  label={t.from}
                  fullWidth
                  {...formik.getFieldProps('pickupStart')}
                  {...fieldState(formik, 'pickupStart')}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  type="time"
                  label={t.to}
                  fullWidth
                  {...formik.getFieldProps('pickupEnd')}
                  {...fieldState(formik, 'pickupEnd')}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Stack>
              <TextField
                type="number"
                label={t.quantity}
                {...formik.getFieldProps('quantity')}
                {...fieldState(formik, 'quantity')}
                slotProps={{ htmlInput: { min: 1, max: 500 } }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{ua.common.close}</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={active.length === 0 || create.isPending}
          >
            {t.create}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
