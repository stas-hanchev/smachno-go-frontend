'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { ua } from '@/i18n/ua';

const MIN_REASON = 3;

export function ReasonDialog({
  open,
  title,
  text,
  confirmLabel,
  reasonLabel = ua.partner.today.reason,
  pending,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  text?: string;
  confirmLabel: string;
  reasonLabel?: string;
  pending: boolean;
  error?: string | null;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const invalid = reason.trim().length < MIN_REASON;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        transition: {
          onExited: () => {
            setReason('');
            setTouched(false);
          },
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {text && <DialogContentText sx={{ mb: 2 }}>{text}</DialogContentText>}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={2}
          label={reasonLabel}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onBlur={() => setTouched(true)}
          error={touched && invalid}
          helperText={touched && invalid ? ua.partner.today.reasonMin : undefined}
          slotProps={{ htmlInput: { maxLength: 255 } }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{ua.common.close}</Button>
        <Button
          color="error"
          variant="contained"
          disabled={pending || invalid}
          onClick={() => onConfirm(reason.trim())}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
