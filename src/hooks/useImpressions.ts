'use client';

import { useCallback, useEffect, useRef } from 'react';
import { interactions, type InteractionSource } from '@/lib/interactions';

const VISIBLE_RATIO = 0.5;

export function useImpressions(source: InteractionSource) {
  const observer = useRef<IntersectionObserver | null>(null);
  const meta = useRef(new WeakMap<Element, { offerId: number; position: number }>());

  const getObserver = useCallback(() => {
    if (observer.current || typeof IntersectionObserver === 'undefined') return observer.current;
    const instance = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const info = meta.current.get(entry.target);
          if (!info) continue;
          interactions().track({ type: 'impression', source, ...info });
          instance.unobserve(entry.target);
        }
      },
      { threshold: VISIBLE_RATIO },
    );
    observer.current = instance;
    return instance;
  }, [source]);

  useEffect(
    () => () => {
      observer.current?.disconnect();
      observer.current = null;
    },
    [source],
  );

  return useCallback(
    (offerId: number, position: number) => (element: Element | null) => {
      if (!element) return;
      meta.current.set(element, { offerId, position });
      getObserver()?.observe(element);
    },
    [getObserver],
  );
}
