'use client';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useNotifyStore } from '@/stores/notify';

export function GlobalSnackbar() {
  const current = useNotifyStore((s) => s.current);
  const next = useNotifyStore((s) => s.next);

  return (
    <Snackbar
      key={current?.id}
      open={current !== null}
      autoHideDuration={4000}
      onClose={(_event, reason) => {
        if (reason !== 'clickaway') next();
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 88, md: 24 } }}
    >
      <Alert
        onClose={next}
        severity={current?.severity ?? 'info'}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {current?.text}
      </Alert>
    </Snackbar>
  );
}
