'use client';

import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { FormikProps } from 'formik';
import { useState, type ReactNode } from 'react';
import { ua } from '@/i18n/ua';

export function fieldState<T>(formik: FormikProps<T>, name: keyof T & string) {
  const touched = formik.touched[name];
  const error = formik.errors[name];
  const message = touched && typeof error === 'string' ? error : undefined;
  return { error: Boolean(message), helperText: message };
}

type FieldProps = Omit<TextFieldProps, 'label'> & {
  label: string;
  icon?: ReactNode;
  hint?: ReactNode;
};

export function LabeledField({ label, icon, hint, id, slotProps, ...props }: FieldProps) {
  const inputId = id ?? `field-${props.name}`;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <Typography component="label" htmlFor={inputId} variant="subtitle2">
          {label}
        </Typography>
        {hint}
      </div>
      <TextField
        id={inputId}
        fullWidth
        {...props}
        slotProps={{
          ...slotProps,
          input: {
            startAdornment: icon ? (
              <InputAdornment position="start" sx={{ color: 'muted' }}>
                {icon}
              </InputAdornment>
            ) : undefined,
            ...(slotProps?.input as object),
          },
        }}
      />
    </div>
  );
}

export function PasswordField(props: FieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <LabeledField
      {...props}
      type={visible ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setVisible((v) => !v)}
                edge="end"
                aria-label={visible ? ua.auth.hidePassword : ua.auth.showPassword}
              >
                {visible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
