import { WorldCity, SolarInfo } from '../types';

export const INITIAL_CITIES: WorldCity[] = [
  { id: 'utc', city: 'UTC / GMT', country: 'Universal Time', timezone: 'UTC', pinned: true },
  { id: 'london', city: 'London', country: 'United Kingdom', timezone: 'Europe/London', pinned: true, latitude: 51.5, longitude: -0.1 },
  { id: 'new_york', city: 'New York', country: 'United States', timezone: 'America/New_York', pinned: true, latitude: 40.7, longitude: -74.0 },
  { id: 'san_francisco', city: 'San Francisco', country: 'United States', timezone: 'America/Los_Angeles', pinned: true, latitude: 37.7, longitude: -122.4 },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', pinned: true, latitude: 35.6, longitude: 139.6 },
  { id: 'paris', city: 'Paris', country: 'France', timezone: 'Europe/Paris', pinned: true, latitude: 48.8, longitude: 2.3 },
  { id: 'dubai', city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', pinned: true, latitude: 25.2, longitude: 55.3 },
  { id: 'singapore', city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', pinned: true, latitude: 1.3, longitude: 103.8 },
  { id: 'sydney', city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', pinned: true, latitude: -33.8, longitude: 151.2 },
  { id: 'mumbai', city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', pinned: false, latitude: 19.0, longitude: 72.8 },
  { id: 'sao_paulo', city: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', pinned: false, latitude: -23.5, longitude: -46.6 },
  { id: 'cairo', city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', pinned: false, latitude: 30.0, longitude: 31.2 },
  { id: 'berlin', city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', pinned: false, latitude: 52.5, longitude: 13.4 },
  { id: 'seoul', city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', pinned: false, latitude: 37.5, longitude: 126.9 },
  { id: 'toronto', city: 'Toronto', country: 'Canada', timezone: 'America/Toronto', pinned: false, latitude: 43.6, longitude: -79.3 },
  { id: 'auckland', city: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland', pinned: false, latitude: -36.8, longitude: 174.7 },
  { id: 'zurich', city: 'Zurich', country: 'Switzerland', timezone: 'Europe/Zurich', pinned: false, latitude: 47.3, longitude: 8.5 },
  { id: 'hong_kong', city: 'Hong Kong', country: 'China', timezone: 'Asia/Hong_Kong', pinned: false, latitude: 22.3, longitude: 114.1 },
  { id: 'bangkok', city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok', pinned: false, latitude: 13.7, longitude: 100.5 },
  { id: 'honolulu', city: 'Honolulu', country: 'United States', timezone: 'Pacific/Honolulu', pinned: false, latitude: 21.3, longitude: -157.8 },
];

export function getZonedDate(date: Date, timeZone: string): Date {
  try {
    const invDate = new Date(date.toLocaleString('en-US', { timeZone }));
    return invDate;
  } catch {
    return date;
  }
}

export function getTimezoneOffsetString(timeZone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : 'UTC';
  } catch {
    return 'UTC';
  }
}

export function getTimezoneAbbreviation(timeZone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : timeZone;
  } catch {
    return timeZone;
  }
}

export function getTimeDifference(targetTimezone: string, baseDate: Date = new Date()): string {
  try {
    const targetDate = getZonedDate(baseDate, targetTimezone);
    const localZoned = baseDate;
    const diffMs = targetDate.getTime() - localZoned.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60) * 2) / 2; // precision to half hour
    
    if (diffHours === 0) return 'Same time';
    const sign = diffHours > 0 ? '+' : '';
    return `${sign}${diffHours}h`;
  } catch {
    return '0h';
  }
}

export function formatTime(
  date: Date,
  format: '12h' | '24h',
  options: { showSeconds?: boolean; timeZone?: string } = {}
): { timeString: string; ampm: string; seconds: string; hours: string; minutes: string } {
  const { showSeconds = true, timeZone } = options;

  let targetDate = date;
  if (timeZone) {
    targetDate = getZonedDate(date, timeZone);
  }

  let hoursNum = targetDate.getHours();
  const minutesNum = targetDate.getMinutes();
  const secondsNum = targetDate.getSeconds();

  let ampm = '';
  if (format === '12h') {
    ampm = hoursNum >= 12 ? 'PM' : 'AM';
    hoursNum = hoursNum % 12 || 12;
  }

  const hours = hoursNum.toString().padStart(2, '0');
  const minutes = minutesNum.toString().padStart(2, '0');
  const seconds = secondsNum.toString().padStart(2, '0');

  const timeString = showSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;

  return { timeString, ampm, seconds, hours, minutes };
}

export function getISOWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getDayOfYear(now: Date): { day: number; totalDays: number; percent: number } {
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime() + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  const isLeap = (now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || now.getFullYear() % 400 === 0;
  const totalDays = isLeap ? 366 : 365;
  const percent = Math.min(100, Math.max(0, (day / totalDays) * 100));
  return { day, totalDays, percent: parseFloat(percent.toFixed(1)) };
}

export function getDayProgress(now: Date): number {
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const msPassed = now.getTime() - midnight.getTime();
  const totalDayMs = 24 * 60 * 60 * 1000;
  return Math.min(100, Math.max(0, (msPassed / totalDayMs) * 100));
}

export function calculateSolarInfo(date: Date): SolarInfo {
  // Approximate solar times for observer's current day
  const hours = date.getHours() + date.getMinutes() / 60;
  
  // Approximate standard sunrise around 06:15 and sunset around 18:30 adjusted for season
  const dayOfYear = getDayOfYear(date).day;
  const seasonalOffset = Math.sin(((dayOfYear - 81) / 365) * 2 * Math.PI) * 0.75;
  
  const sunriseHour = 6.2 - seasonalOffset;
  const sunsetHour = 18.5 + seasonalOffset;
  const solarNoonHour = (sunriseHour + sunsetHour) / 2;

  const formatHourMin = (decimalHour: number) => {
    const h = Math.floor(decimalHour);
    const m = Math.floor((decimalHour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const daylightHours = sunsetHour - sunriseHour;
  const dlH = Math.floor(daylightHours);
  const dlM = Math.floor((daylightHours - dlH) * 60);

  const isDaytime = hours >= sunriseHour && hours <= sunsetHour;

  // Sun altitude visual arc: 0% at sunrise, 100% at noon, 0% at sunset
  let altitude = 0;
  if (isDaytime) {
    const progress = (hours - sunriseHour) / daylightHours;
    altitude = Math.sin(progress * Math.PI) * 100;
  }

  return {
    sunriseTime: formatHourMin(sunriseHour),
    solarNoonTime: formatHourMin(solarNoonHour),
    sunsetTime: formatHourMin(sunsetHour),
    daylightDuration: `${dlH}h ${dlM}m`,
    isDaytime,
    sunAltitudePercent: Math.round(altitude),
  };
}

export function formatStopwatchTime(ms: number): { main: string; milliseconds: string } {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);

  const mStr = minutes.toString().padStart(2, '0');
  const sStr = seconds.toString().padStart(2, '0');
  const msStr = hundredths.toString().padStart(2, '0');

  if (hours > 0) {
    const hStr = hours.toString().padStart(2, '0');
    return {
      main: `${hStr}:${mStr}:${sStr}`,
      milliseconds: msStr,
    };
  }

  return {
    main: `${mStr}:${sStr}`,
    milliseconds: msStr,
  };
}

export function formatSecondsToDisplay(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function getHourActivityCategory(hour24: number): 'sleep' | 'wake' | 'work' | 'evening' {
  if (hour24 >= 22 || hour24 < 6) return 'sleep';
  if (hour24 >= 6 && hour24 < 9) return 'wake';
  if (hour24 >= 9 && hour24 < 17) return 'work';
  return 'evening';
}
