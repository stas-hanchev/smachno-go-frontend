'use client';

import { useEffect, useState } from 'react';

export function useCountdown(untilIso: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!untilIso) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [untilIso]);

  if (!untilIso) return { remainingMs: 0, expired: true };
  const remainingMs = Math.max(0, new Date(untilIso).getTime() - now);
  return { remainingMs, expired: remainingMs === 0 };
}
