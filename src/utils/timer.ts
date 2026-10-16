/**
 * Utility for 24-Hour Battle Countdown Timers synchronized to GMT+1 (West Africa Time / UTC+1).
 * Resets every 24 hours at 00:00:00 GMT+1.
 */

export const GMT1_OFFSET_HOURS = 1;
export const GMT1_OFFSET_MS = GMT1_OFFSET_HOURS * 60 * 60 * 1000;

/**
 * Returns remaining seconds until the next 00:00:00 GMT+1.
 * Automatically wraps / resets every 24 hours.
 */
export function getGmt1CountdownSeconds(): number {
  const now = Date.now();
  // Current time in GMT+1
  const gmt1Date = new Date(now + GMT1_OFFSET_MS);

  // Midnight of next day in GMT+1
  const nextMidnightUtc = Date.UTC(
    gmt1Date.getUTCFullYear(),
    gmt1Date.getUTCMonth(),
    gmt1Date.getUTCDate() + 1,
    0,
    0,
    0,
    0
  );

  const diffMs = nextMidnightUtc - (now + GMT1_OFFSET_MS);
  const remainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
  return remainingSeconds > 0 ? remainingSeconds : 86400;
}

/**
 * Formats total seconds into standard HH:MM:SS format
 */
export function formatCountdownTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}
