'use client';

import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useRef } from 'react';
import { ua } from '@/i18n/ua';
import { notify } from '@/stores/notify';

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const Frame = styled('div', { name: 'SgImageUploader', slot: 'Frame' })<{
  $ratio: number;
  $width: number;
}>(({ theme, $ratio, $width }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: $width,
  aspectRatio: String($ratio),
  borderRadius: 16,
  overflow: 'hidden',
  backgroundColor: theme.palette.mint.light,
  border: `1px dashed ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.muted,
  '& svg': { fontSize: 36 },
}));

const Img = styled('img', { name: 'SgImageUploader', slot: 'Img' })({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const Overlay = styled('div', { name: 'SgImageUploader', slot: 'Overlay' })({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
});

export function validateImage(file: File): string | null {
  if (!TYPES.includes(file.type)) return ua.partner.photo.wrongType;
  if (file.size > MAX_BYTES) return ua.partner.photo.tooBig;
  return null;
}

export function ImageUploader({
  url,
  alt,
  ratio = 1,
  width = 160,
  pending,
  disabled = false,
  onSelect,
  onRemove,
}: {
  url: string | null;
  alt: string;
  ratio?: number;
  width?: number;
  pending: boolean;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onRemove?: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);

  function pick(files: FileList | null) {
    const file = files?.[0];
    if (input.current) input.current.value = '';
    if (!file) return;
    const error = validateImage(file);
    if (error) {
      notify.error(error);
      return;
    }
    onSelect(file);
  }

  return (
    <div>
      <Frame $ratio={ratio} $width={width}>
        {url ? <Img src={url} alt={alt} /> : <AddPhotoAlternateOutlinedIcon aria-hidden />}
        {pending && (
          <Overlay>
            <CircularProgress size={28} />
          </Overlay>
        )}
      </Frame>
      <input
        ref={input}
        type="file"
        accept={TYPES.join(',')}
        hidden
        onChange={(e) => pick(e.target.files)}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant="outlined"
          disabled={pending || disabled}
          onClick={() => input.current?.click()}
        >
          {url ? ua.partner.photo.change : ua.partner.photo.upload}
        </Button>
        {url && onRemove && (
          <Button size="small" color="error" disabled={pending || disabled} onClick={onRemove}>
            {ua.partner.photo.remove}
          </Button>
        )}
      </div>
      <Typography variant="caption" sx={{ color: 'muted' }}>
        {ua.partner.photo.hint}
      </Typography>
    </div>
  );
}
