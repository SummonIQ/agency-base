import { sub } from 'date-fns';

/**
 * Converts a relative time string like "5 days ago" into a Date object.
 * @param relativeTime - The relative time string (e.g., "5 days ago").
 * @returns A Date object representing the calculated time.
 */
export function parseRelativeTimeToDate(relativeTime: string): Date | null {
  const regex =
    /(\d+)\s*(seconds?|minutes?|hours?|days?|weeks?|months?|years?)\s*ago/i;
  const match = relativeTime.match(regex);

  if (!match) {
    console.error(`Invalid relative time format: ${relativeTime}`);
    return null;
  }

  const value = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 'second':
    case 'seconds':
      return sub(new Date(), { seconds: value });
    case 'minute':
    case 'minutes':
      return sub(new Date(), { minutes: value });
    case 'hour':
    case 'hours':
      return sub(new Date(), { hours: value });
    case 'day':
    case 'days':
      return sub(new Date(), { days: value });
    case 'week':
    case 'weeks':
      return sub(new Date(), { weeks: value });
    case 'month':
    case 'months':
      return sub(new Date(), { months: value });
    case 'year':
    case 'years':
      return sub(new Date(), { years: value });
    default:
      console.error(`Unhandled time unit: ${unit}`);
      return null;
  }
}
