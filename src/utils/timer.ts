/**
 * Utility for 24-Hour Battle Countdown Timers synchronized to GMT+1 (West Africa Time / UTC+1).
 * Resets every 24 hours at 00:00:00 GMT+1.
 */

export const GMT1_OFFSET_HOURS = 1;
export const GMT1_OFFSET_MS = GMT1_OFFSET_HOURS * 60 * 60 * 1000;

export function getGmt1CountdownSeconds(): number {
  const now = new Date();
  const nowUtc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const nowGmt1 = new Date(nowUtc + GMT1_OFFSET_MS);

  const endOfGmt1Day = new Date(nowGmt1);
  endOfGmt1Day.setHours(24, 0, 0, 0);

  const diffMs = endOfGmt1Day.getTime() - nowGmt1.getTime();
  return Math.max(0, Math.floor(diffMs / 1000));
}

export function formatCountdownTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
