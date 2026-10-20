let context: AudioContext | null = null;

export function playChime() {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return;
  try {
    context ??= new AudioContext();
    const now = context.currentTime;
    for (const [offset, frequency] of [
      [0, 880],
      [0.18, 1320],
    ] as const) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.3);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + offset);
      oscillator.stop(now + offset + 0.32);
    }
  } catch {}
}
