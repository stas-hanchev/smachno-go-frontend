import { useSessionStore } from '@/stores/session';

export type InteractionType = 'impression' | 'view';
export type InteractionSource =
  'home' | 'search' | 'map' | 'recommendation' | 'venue' | 'favorite' | 'direct';

export interface InteractionEvent {
  offerId: number;
  type: InteractionType;
  source?: InteractionSource;
  position?: number;
}

const ORDER_SOURCE: Record<InteractionSource, OrderSource> = {
  home: 'search',
  search: 'search',
  map: 'map',
  recommendation: 'recommendation',
  venue: 'direct',
  favorite: 'favorite',
  direct: 'direct',
};

export type OrderSource = 'search' | 'map' | 'recommendation' | 'favorite' | 'direct';

export function isInteractionSource(value: unknown): value is InteractionSource {
  return typeof value === 'string' && value in ORDER_SOURCE;
}

export function orderSourceOf(source: InteractionSource | undefined): OrderSource {
  return source ? ORDER_SOURCE[source] : 'direct';
}

export function listingHref(listingId: number, source?: InteractionSource) {
  return source ? `/listings/${listingId}?from=${source}` : `/listings/${listingId}`;
}

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ANON_KEY = 'sg-anon-id';
const MAX_BATCH = 50;
const FLUSH_DELAY_MS = 4000;

export function createAnonId(now = Date.now(), random: () => number = Math.random): string {
  let time = '';
  let value = now;
  for (let i = 0; i < 10; i += 1) {
    time = CROCKFORD[value % 32] + time;
    value = Math.floor(value / 32);
  }
  let rest = '';
  for (let i = 0; i < 16; i += 1) rest += CROCKFORD[Math.floor(random() * 32)];
  return time + rest;
}

export function anonId(): string {
  try {
    const stored = localStorage.getItem(ANON_KEY);
    if (stored && /^[0-9A-HJKMNP-TV-Z]{26}$/.test(stored)) return stored;
    const fresh = createAnonId();
    localStorage.setItem(ANON_KEY, fresh);
    return fresh;
  } catch {
    return createAnonId();
  }
}

export class InteractionQueue {
  private queue: InteractionEvent[] = [];
  private seen = new Set<string>();
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly send: (events: InteractionEvent[], keepalive: boolean) => Promise<void>,
    private readonly delayMs = FLUSH_DELAY_MS,
  ) {}

  track(event: InteractionEvent) {
    const key = `${event.type}:${event.offerId}:${event.source ?? ''}`;
    if (event.type === 'impression' && this.seen.has(key)) return;
    this.seen.add(key);
    this.queue.push(event);
    if (this.queue.length >= MAX_BATCH) {
      void this.flush();
      return;
    }
    this.timer ??= setTimeout(() => void this.flush(), this.delayMs);
  }

  async flush(keepalive = false) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    while (this.queue.length) {
      const batch = this.queue.splice(0, MAX_BATCH);
      try {
        await this.send(batch, keepalive);
      } catch {}
    }
  }

  get pending() {
    return this.queue.length;
  }
}

async function sendInteractions(events: InteractionEvent[], keepalive: boolean) {
  const token = useSessionStore.getState().accessToken;
  await fetch('/api/v1/interactions', {
    method: 'POST',
    keepalive,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(token ? { events } : { anonId: anonId(), events }),
  });
}

let shared: InteractionQueue | null = null;

export function interactions(): InteractionQueue {
  if (!shared) {
    shared = new InteractionQueue(sendInteractions);
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', () => void shared?.flush(true));
    }
  }
  return shared;
}
