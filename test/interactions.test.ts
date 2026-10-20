import {
  createAnonId,
  InteractionQueue,
  isInteractionSource,
  listingHref,
  orderSourceOf,
  type InteractionEvent,
} from '@/lib/interactions';
import { isCabinetPath } from '@/lib/nav';

describe('createAnonId', () => {
  it('builds a 26-character ULID the API accepts', () => {
    const id = createAnonId(Date.UTC(2026, 9, 20), () => 0.5);
    expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    expect(createAnonId(1)).not.toBe(createAnonId(2));
  });
});

describe('InteractionQueue', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('batches events, skips repeated impressions and flushes after a delay', async () => {
    const sent: InteractionEvent[][] = [];
    const queue = new InteractionQueue(async (events) => {
      sent.push(events);
    }, 1000);

    queue.track({ offerId: 1, type: 'impression', source: 'home', position: 0 });
    queue.track({ offerId: 1, type: 'impression', source: 'home', position: 0 });
    queue.track({ offerId: 1, type: 'view', source: 'home' });
    queue.track({ offerId: 1, type: 'view', source: 'home' });
    expect(queue.pending).toBe(3);

    await vi.advanceTimersByTimeAsync(1000);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toHaveLength(3);
    expect(queue.pending).toBe(0);
  });

  it('sends immediately when a batch is full and keeps going after a failed request', async () => {
    let calls = 0;
    const queue = new InteractionQueue(async () => {
      calls += 1;
      if (calls === 1) throw new Error('offline');
    }, 60_000);
    for (let i = 0; i < 50; i += 1) queue.track({ offerId: i, type: 'impression' });
    await vi.runAllTimersAsync();
    expect(calls).toBe(1);
    queue.track({ offerId: 99, type: 'view' });
    await queue.flush();
    expect(calls).toBe(2);
  });
});

describe('sources and paths', () => {
  it('maps interaction sources to order sources and links', () => {
    expect(orderSourceOf('recommendation')).toBe('recommendation');
    expect(orderSourceOf('home')).toBe('search');
    expect(orderSourceOf(undefined)).toBe('direct');
    expect(isInteractionSource('map')).toBe(true);
    expect(isInteractionSource('evil')).toBe(false);
    expect(listingHref(5, 'search')).toBe('/listings/5?from=search');
    expect(listingHref(5)).toBe('/listings/5');
  });

  it('detects cabinet pages but keeps the invite page public', () => {
    expect(isCabinetPath('/partner')).toBe(true);
    expect(isCabinetPath('/partner/offers')).toBe(true);
    expect(isCabinetPath('/admin/users')).toBe(true);
    expect(isCabinetPath('/partner/invite')).toBe(false);
    expect(isCabinetPath('/partnerships')).toBe(false);
  });
});
