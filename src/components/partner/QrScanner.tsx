'use client';

import { styled } from '@mui/material/styles';
import { useEffect, useRef } from 'react';

const Video = styled('video', { name: 'SgQrScanner', slot: 'Video' })({
  width: '100%',
  maxHeight: '60vh',
  borderRadius: 20,
  backgroundColor: '#0D1F1C',
  objectFit: 'cover',
});

export function QrScanner({
  onResult,
  onError,
}: {
  onResult: (text: string) => void;
  onError: (error: unknown) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const handlers = useRef({ onResult, onError });

  useEffect(() => {
    handlers.current = { onResult, onError };
  }, [onResult, onError]);

  useEffect(() => {
    let controls: { stop: () => void } | undefined;
    let finished = false;
    const finish = () => {
      finished = true;
      controls?.stop();
    };
    void (async () => {
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser');
        if (finished || !video.current) return;
        const reader = new BrowserQRCodeReader();
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          video.current,
          (result) => {
            if (!result || finished) return;
            finish();
            handlers.current.onResult(result.getText());
          },
        );
        if (finished) controls.stop();
      } catch (error) {
        if (!finished) handlers.current.onError(error);
      }
    })();
    return finish;
  }, []);

  return <Video ref={video} muted playsInline />;
}
