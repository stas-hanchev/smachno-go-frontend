const TIME_ZONE = 'Europe/Kyiv';

const timeFormat = new Intl.DateTimeFormat('uk-UA', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});

const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatPrice(amount: string) {
  const [whole = '0', cents = '00'] = amount.split('.');
  return cents === '00' ? `${whole} ₴` : `${whole},${cents} ₴`;
}

export function formatDistance(meters: number | null) {
  if (meters === null) return null;
  if (meters < 1000) return `${Math.round(meters)} м`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} км`;
}

export function formatPickupWindow(startIso: string, endIso: string, now = new Date()) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const range = `${timeFormat.format(start)}–${timeFormat.format(end)}`;
  const day = dayFormat.format(start);
  if (day === dayFormat.format(now)) return `сьогодні ${range}`;
  if (day === dayFormat.format(new Date(now.getTime() + 86_400_000))) return `завтра ${range}`;
  const [, month, date] = day.split('-');
  return `${date}.${month} ${range}`;
}
