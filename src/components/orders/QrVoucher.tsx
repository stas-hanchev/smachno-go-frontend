'use client';

import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { QRCodeSVG } from 'qrcode.react';
import type { Voucher } from '@/api/types';
import { ua } from '@/i18n/ua';
import { formatTime } from '@/lib/format';

const Wrapper = styled('div', { name: 'SgQrVoucher', slot: 'Wrapper' })(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
  padding: 20,
  borderRadius: 24,
  backgroundColor: theme.palette.background.paper,
  border: `2px dashed ${theme.palette.secondary.main}`,
}));

const QrBox = styled('div', { name: 'SgQrVoucher', slot: 'QrBox' })({
  padding: 12,
  borderRadius: 16,
  backgroundColor: '#FFFFFF',
  lineHeight: 0,
});

const Code = styled('output', { name: 'SgQrVoucher', slot: 'Code' })(({ theme }) => ({
  fontSize: 32,
  lineHeight: '40px',
  fontWeight: 800,
  letterSpacing: 6,
  color: theme.palette.primary.dark,
  fontVariantNumeric: 'tabular-nums',
}));

export function QrVoucher({ voucher, size = 200 }: { voucher: Voucher; size?: number }) {
  return (
    <Wrapper>
      <QrBox>
        <QRCodeSVG
          value={voucher.qrToken}
          size={size}
          level="M"
          fgColor="#0D1F1C"
          title={ua.orders.qrTitle}
        />
      </QrBox>
      <Typography variant="body2" color="text.secondary">
        {ua.success.code}
      </Typography>
      <Code aria-label={ua.success.code}>{voucher.code}</Code>
      <Typography variant="caption" sx={{ color: 'muted' }}>
        {ua.success.validUntil(formatTime(voucher.validUntil))}
      </Typography>
    </Wrapper>
  );
}
