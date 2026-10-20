'use client';

import AddIcon from '@mui/icons-material/Add';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Skeleton from '@mui/material/Skeleton';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { errorMessage } from '@/api/client';
import { archiveOffer, listOffers, updateOffer } from '@/api/partner';
import type { OfferStatus, PartnerOffer } from '@/api/types';
import { OfferForm } from '@/components/partner/OfferForm';
import { usePartnerVenue } from '@/components/partner/PartnerContext';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListingPhoto } from '@/components/ui/PhotoPlaceholder';
import { PriceTag } from '@/components/ui/PriceTag';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ua } from '@/i18n/ua';
import { notify } from '@/stores/notify';
import { shadows } from '@/theme/theme';

const t = ua.partner.offers;

const STATUS_TONES: Record<OfferStatus, { bg: string; fg: string }> = {
  active: { bg: '#94F5D4', fg: '#002118' },
  paused: { bg: '#FFF4D6', fg: '#7A5200' },
  archived: { bg: '#ECEFEE', fg: '#3F4947' },
};

const Grid = styled('div', { name: 'SgPartnerOffers', slot: 'Grid' })(({ theme }) => ({
  display: 'grid',
  gap: 20,
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('sm')]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  [theme.breakpoints.up('lg')]: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
}));

const Card = styled('article', { name: 'SgPartnerOffers', slot: 'Card' })(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: 20,
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadows.card,
}));

const Media = styled('div', { name: 'SgPartnerOffers', slot: 'Media' })({
  position: 'relative',
  height: 150,
  backgroundColor: '#DEF2EE',
});

const Status = styled('span', { name: 'SgPartnerOffers', slot: 'Status' })<{
  $bg: string;
  $fg: string;
}>(({ $bg, $fg }) => ({
  position: 'absolute',
  top: 12,
  left: 12,
  zIndex: 1,
  padding: '2px 10px',
  borderRadius: 9999,
  fontSize: 12,
  lineHeight: '18px',
  fontWeight: 700,
  backgroundColor: $bg,
  color: $fg,
}));

const Body = styled('div', { name: 'SgPartnerOffers', slot: 'Body' })({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 18,
  flex: 1,
});

export default function PartnerOffersPage() {
  const { venue, isOwner } = usePartnerVenue();
  const queryClient = useQueryClient();
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<PartnerOffer | 'new' | null>(null);
  const [archiving, setArchiving] = useState<PartnerOffer | null>(null);

  const offers = useQuery({
    queryKey: ['partner', venue.id, 'offers', showArchived ? 'archived' : 'current'],
    queryFn: () => listOffers(venue.id, showArchived ? 'archived' : undefined),
  });
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['partner', venue.id, 'offers'] });

  const setStatus = useMutation({
    mutationFn: ({ offer, status }: { offer: PartnerOffer; status: 'active' | 'paused' }) =>
      updateOffer(venue.id, offer.id, { status }),
    onSuccess: () => void refresh(),
    onError: (error) => notify.error(errorMessage(error)),
  });
  const archive = useMutation({
    mutationFn: (offer: PartnerOffer) => archiveOffer(venue.id, offer.id),
    onSuccess: () => {
      notify.success(t.archived);
      setArchiving(null);
      void refresh();
    },
    onError: (error) => notify.error(errorMessage(error)),
  });

  const items = (offers.data ?? []).filter((o) => showArchived || o.status !== 'archived');

  return (
    <>
      <SectionHeading
        level="h1"
        size="medium"
        title={t.title}
        subtitle={t.subtitle}
        action={
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                />
              }
              label={t.showArchived}
            />
            {isOwner && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing('new')}>
                {t.create}
              </Button>
            )}
          </div>
        }
      />
      {!isOwner && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {ua.partner.ownerOnly}
        </Alert>
      )}
      {offers.isError && <Alert severity="error">{errorMessage(offers.error)}</Alert>}
      {offers.isPending ? (
        <Grid>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} variant="rounded" height={300} sx={{ borderRadius: '20px' }} />
          ))}
        </Grid>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Inventory2OutlinedIcon />}
          title={t.empty}
          action={
            isOwner ? (
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing('new')}>
                {t.create}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Grid>
          {items.map((offer) => {
            const tone = STATUS_TONES[offer.status];
            return (
              <Card key={offer.id}>
                <Media>
                  <ListingPhoto
                    src={offer.photoUrl}
                    alt={offer.title}
                    categoryName={offer.category.name}
                  />
                  <Status $bg={tone.bg} $fg={tone.fg}>
                    {t.status[offer.status]}
                  </Status>
                </Media>
                <Body>
                  <Typography variant="h6" component="h3">
                    {offer.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {offer.category.name} · {ua.units.kilograms(offer.estWeightKg)}
                  </Typography>
                  <PriceTag price={offer.price} originalPrice={offer.originalPrice} inline />
                  {isOwner && offer.status !== 'archived' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                      <Button size="small" variant="outlined" onClick={() => setEditing(offer)}>
                        {t.edit}
                      </Button>
                      <Button
                        size="small"
                        disabled={setStatus.isPending}
                        onClick={() =>
                          setStatus.mutate({
                            offer,
                            status: offer.status === 'active' ? 'paused' : 'active',
                          })
                        }
                      >
                        {offer.status === 'active' ? t.pause : t.resume}
                      </Button>
                      <Button size="small" color="error" onClick={() => setArchiving(offer)}>
                        {t.archive}
                      </Button>
                    </div>
                  )}
                </Body>
              </Card>
            );
          })}
        </Grid>
      )}

      <Dialog open={editing !== null} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editing === 'new' ? ua.partner.offerForm.createTitle : ua.partner.offerForm.editTitle}
        </DialogTitle>
        <DialogContent>
          {editing !== null && (
            <div style={{ paddingTop: 8 }}>
              <OfferForm
                key={editing === 'new' ? 'new' : editing.id}
                venueId={venue.id}
                offer={editing === 'new' ? null : editing}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={archiving !== null}
        title={t.archiveTitle}
        text={t.archiveText}
        confirmLabel={t.archive}
        pending={archive.isPending}
        onConfirm={() => archiving && archive.mutate(archiving)}
        onClose={() => setArchiving(null)}
      />
    </>
  );
}
