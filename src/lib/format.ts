import { ua } from '@/i18n/ua';

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

const dateTimeFormat = new Intl.DateTimeFormat('uk-UA', {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

const weekdayFormat = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short' });

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function formatPrice(amount: string) {
  const [whole = '0', cents = '00'] = amount.split('.');
  return cents === '00' ? `${whole} ₴` : `${whole},${cents} ₴`;
}

export function formatDistance(meters: number | null) {
  if (meters === null) return null;
  if (meters < 1000) return ua.units.meters(Math.round(meters));
  return ua.units.kilometers((meters / 1000).toFixed(1).replace('.', ','));
}

export function formatTime(iso: string) {
  return timeFormat.format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return dateTimeFormat.format(new Date(iso));
}

export function dayLabel(iso: string, now = new Date()) {
  const day = dayFormat.format(new Date(iso));
  if (day === dayFormat.format(now)) return ua.common.today;
  if (day === dayFormat.format(new Date(now.getTime() + 86_400_000))) return ua.common.tomorrow;
  const [, month, date] = day.split('-');
  return `${date}.${month}`;
}

export function formatPickupWindow(startIso: string, endIso: string, now = new Date()) {
  return `${dayLabel(startIso, now)} ${formatTime(startIso)}–${formatTime(endIso)}`;
}

export function kyivWeekday(now = new Date()) {
  return WEEKDAYS.indexOf(weekdayFormat.format(now)) + 1;
}

export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function directionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
