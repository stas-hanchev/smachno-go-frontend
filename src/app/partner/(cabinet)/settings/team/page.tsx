'use client';

import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { errorMessage } from '@/api/client';
import { inviteMember, listTeam, removeMember, revokeInvite, setMemberStatus } from '@/api/partner';
import type { TeamMember } from '@/api/types';
import { usePartnerVenue } from '@/components/partner/PartnerContext';
import { SectionPanel } from '@/components/partner/VenueSections';
import { AccessDenied } from '@/components/ui/AccessDenied';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ua } from '@/i18n/ua';
import { formatDateTime } from '@/lib/format';
import { fullName } from '@/lib/user';
import { notify } from '@/stores/notify';
import { useSessionStore } from '@/stores/session';

const t = ua.partner.team;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Row = styled('div', { name: 'SgPartnerTeam', slot: 'Row' })(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 12,
  padding: '12px 0',
  borderBottom: `1px solid ${theme.palette.mint.light}`,
}));

export default function TeamPage() {
  const { venue, isOwner } = usePartnerVenue();
  const me = useSessionStore((s) => s.user);
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [removing, setRemoving] = useState<TeamMember | null>(null);

  const team = useQuery({
    queryKey: ['partner', venue.id, 'team'],
    queryFn: () => listTeam(venue.id),
    enabled: isOwner,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['partner', venue.id, 'team'] });
  const onError = (error: unknown) => notify.error(errorMessage(error));

  const invite = useMutation({
    mutationFn: () => inviteMember(venue.id, email.trim().toLowerCase()),
    onSuccess: () => {
      notify.success(t.invited);
      setEmail('');
      void refresh();
    },
    onError,
  });
  const revoke = useMutation({
    mutationFn: (inviteId: number) => revokeInvite(venue.id, inviteId),
    onSuccess: () => void refresh(),
    onError,
  });
  const status = useMutation({
    mutationFn: ({ userId, value }: { userId: number; value: 'active' | 'disabled' }) =>
      setMemberStatus(venue.id, userId, value),
    onSuccess: () => void refresh(),
    onError,
  });
  const remove = useMutation({
    mutationFn: (userId: number) => removeMember(venue.id, userId),
    onSuccess: () => {
      setRemoving(null);
      void refresh();
    },
    onError,
  });

  if (!isOwner) return <AccessDenied text={ua.partner.ownerOnly} />;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (EMAIL.test(email.trim())) invite.mutate();
  }

  return (
    <>
      <SectionHeading level="h1" size="medium" title={t.title} subtitle={t.subtitle} />
      {team.isError && <Alert severity="error">{errorMessage(team.error)}</Alert>}
      <Stack spacing={3}>
        <SectionPanel title={t.invite}>
          <form onSubmit={submit} noValidate>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                type="email"
                label={t.inviteEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<MailOutlineIcon />}
                disabled={invite.isPending || !EMAIL.test(email.trim())}
              >
                {t.invite}
              </Button>
            </Stack>
          </form>
        </SectionPanel>
        <SectionPanel title={t.title}>
          {team.isPending ? (
            <Skeleton variant="rounded" height={160} />
          ) : (
            team.data?.members.map((member) => {
              const isMe = member.userId === me?.id;
              return (
                <Row key={member.userId}>
                  <div style={{ flex: '1 1 220px' }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {fullName(member.firstName, member.lastName)}
                      {isMe && ` (${t.you})`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.email} · {ua.partner.roles[member.role]} · {t.status[member.status]}
                    </Typography>
                  </div>
                  {!isMe && member.role === 'staff' && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        disabled={status.isPending}
                        onClick={() =>
                          status.mutate({
                            userId: member.userId,
                            value: member.status === 'active' ? 'disabled' : 'active',
                          })
                        }
                      >
                        {member.status === 'active' ? t.disable : t.enable}
                      </Button>
                      <Button size="small" color="error" onClick={() => setRemoving(member)}>
                        {t.remove}
                      </Button>
                    </Stack>
                  )}
                </Row>
              );
            })
          )}
          {team.data && team.data.invites.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 3 }}>
                {t.pending}
              </Typography>
              {team.data.invites.map((item) => (
                <Row key={item.id}>
                  <div style={{ flex: '1 1 220px' }}>
                    <Typography sx={{ fontWeight: 700 }}>{item.email}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t.expires(formatDateTime(item.expiresAt))}
                    </Typography>
                  </div>
                  <Button
                    size="small"
                    color="error"
                    disabled={revoke.isPending}
                    onClick={() => revoke.mutate(item.id)}
                  >
                    {t.revoke}
                  </Button>
                </Row>
              ))}
            </>
          )}
        </SectionPanel>
      </Stack>
      <ConfirmDialog
        open={removing !== null}
        title={t.removeTitle}
        text={
          removing ? `${fullName(removing.firstName, removing.lastName)} · ${removing.email}` : ''
        }
        confirmLabel={t.remove}
        pending={remove.isPending}
        onConfirm={() => removing && remove.mutate(removing.userId)}
        onClose={() => setRemoving(null)}
      />
    </>
  );
}
