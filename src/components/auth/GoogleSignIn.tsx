'use client';

import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import { loginWithGoogle } from '@/api/auth';
import { errorMessage } from '@/api/client';
import type { Session } from '@/api/types';
import { ua } from '@/i18n/ua';
import { publicEnv } from '@/lib/env';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    ux_mode?: 'popup' | 'redirect';
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: {
      theme?: string;
      size?: string;
      width?: number;
      text?: string;
      shape?: string;
      locale?: string;
    },
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

let credentialHandler: ((response: GoogleCredentialResponse) => void) | null = null;
let initialized = false;

export function GoogleSignIn({
  onSession,
  onError,
  text = 'signin_with',
}: {
  onSession: (session: Session) => void;
  onError: (message: string) => void;
  text?: 'signin_with' | 'signup_with';
}) {
  const container = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(
    () => typeof window !== 'undefined' && Boolean(window.google?.accounts),
  );

  const handleCredential = useCallback(
    async ({ credential }: GoogleCredentialResponse) => {
      try {
        onSession(await loginWithGoogle(credential));
      } catch (error) {
        onError(errorMessage(error) || ua.auth.googleFailed);
      }
    },
    [onSession, onError],
  );

  useEffect(() => {
    const google = window.google;
    if (!loaded || !google || !container.current || !publicEnv.googleClientId) return;
    credentialHandler = (response) => void handleCredential(response);
    if (!initialized) {
      google.accounts.id.initialize({
        client_id: publicEnv.googleClientId,
        callback: (response) => credentialHandler?.(response),
        ux_mode: 'popup',
      });
      initialized = true;
    }
    google.accounts.id.renderButton(container.current, {
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      text,
      locale: 'uk',
      width: Math.min(container.current.offsetWidth || 320, 400),
    });
  }, [loaded, handleCredential, text]);

  if (!publicEnv.googleClientId) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
      />
      <div ref={container} style={{ minHeight: 44, display: 'flex', justifyContent: 'center' }} />
      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" sx={{ color: 'muted' }}>
          {ua.auth.or}
        </Typography>
      </Divider>
    </>
  );
}
