/**
 * @description Returns a prettified time format (`DD:HH:MM:SS`) from a count of seconds.
 * All fields will be double-digit, but it is possible that double-digit `DD` will in fact
 * be three-digit `DDD` if the day count is huge (i.e. over 99).
 */
export function prettifyTime(timeInSeconds: number): string {
  let days = Math.floor(timeInSeconds / 86400).toString();
  if (days.length === 1) days = `0` + days;

  let hours = Math.floor((timeInSeconds % 86400) / 3600).toString();
  if (hours.length === 1) hours = `0` + hours;

  let minutes = Math.floor((timeInSeconds % 3600) / 60).toString();
  if (minutes.length === 1) minutes = `0` + minutes;

  let seconds = Math.floor((timeInSeconds % 3600) % 60).toString();
  if (seconds.length === 1) seconds = `0` + seconds;

  return `${days}:${hours}:${minutes}:${seconds}`;
}
