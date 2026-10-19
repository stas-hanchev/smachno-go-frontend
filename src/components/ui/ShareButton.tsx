'use client';

import IosShareIcon from '@mui/icons-material/IosShare';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { ua } from '@/i18n/ua';
import { notify } from '@/stores/notify';

async function share(title: string) {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;
    } catch {
      return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    notify.success(ua.common.linkCopied);
  } catch {
    notify.error(ua.common.genericError);
  }
}

export function ShareIconButton({ title }: { title: string }) {
  return (
    <IconButton
      onClick={() => void share(title)}
      aria-label={ua.common.share}
      sx={{
        width: 40,
        height: 40,
        bgcolor: 'background.paper',
        '&:hover': { bgcolor: 'mint.light' },
      }}
    >
      <IosShareIcon fontSize="small" />
    </IconButton>
  );
}

export function ShareTextButton({ title }: { title: string }) {
  return (
    <Button
      variant="outlined"
      onClick={() => void share(title)}
      startIcon={<IosShareIcon />}
      sx={{ flex: 1, borderColor: 'divider', color: 'text.primary' }}
    >
      {ua.common.share}
    </Button>
  );
}
