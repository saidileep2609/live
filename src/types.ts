export type ClockTab = 'clock' | 'world' | 'stopwatch' | 'timer';

export type ClockFormat = '12h' | '24h';

export type ThemeMode = 'dark' | 'midnight' | 'light';

export interface WorldCity {
  id: string;
  city: string;
  country: string;
  timezone: string;
  pinned: boolean;
  latitude?: number;
  longitude?: number;
}

export interface LapItem {
  lapNumber: number;
  lapDurationMs: number;
  totalElapsedMs: number;
}

export interface TimerPreset {
  id: string;
  label: string;
  seconds: number;
  iconName?: string;
}

export interface SolarInfo {
  sunriseTime: string;
  solarNoonTime: string;
  sunsetTime: string;
  daylightDuration: string;
  isDaytime: boolean;
  sunAltitudePercent: number; // 0 to 100 for visual arc
}
