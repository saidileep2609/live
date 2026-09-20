import React, { useState } from 'react';
import { ClockFormat, ThemeMode } from '../types';
import { AnalogClock } from './AnalogClock';
import { 
  formatTime, 
  getISOWeekNumber, 
  getDayOfYear, 
  getDayProgress, 
  calculateSolarInfo,
  getTimezoneOffsetString,
  getTimezoneAbbreviation
} from '../utils/time';
import { 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  Calendar, 
  Compass, 
  Copy, 
  Check, 
  RotateCw,
  Eye,
  Sliders
} from 'lucide-react';

interface ClockViewProps {
  currentDate: Date;
  format: ClockFormat;
  theme: ThemeMode;
}

export const ClockView: React.FC<ClockViewProps> = ({
  currentDate,
  format,
  theme,
}) => {
  const [displayMode, setDisplayMode] = useState<'both' | 'digital' | 'analog'>('both');
  const [showMillis, setShowMillis] = useState<boolean>(true);
  const [copiedEpoch, setCopiedEpoch] = useState<boolean>(false);
  const [epochInput, setEpochInput] = useState<string>('');
  const [epochConvertedResult, setEpochConvertedResult] = useState<string | null>(null);

  const isLight = theme === 'light';
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzOffset = getTimezoneOffsetString(timeZone, currentDate);
  const tzAbbr = getTimezoneAbbreviation(timeZone, currentDate);

  const { hours, minutes, seconds, ampm } = formatTime(currentDate, format, { showSeconds: true });
  const ms = Math.floor(currentDate.getMilliseconds() / 10).toString().padStart(2, '0');

  // Date metrics
  const weekNumber = getISOWeekNumber(currentDate);
  const { day: dayOfYear, totalDays, percent: yearPercent } = getDayOfYear(currentDate);
  const dayPercent = getDayProgress(currentDate);
  const solar = calculateSolarInfo(currentDate);

  const fullDateString = currentDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const epochSeconds = Math.floor(currentDate.getTime() / 1000);
  const epochMillis = currentDate.getTime();

  const handleCopyEpoch = () => {
    navigator.clipboard.writeText(epochSeconds.toString());
    setCopiedEpoch(true);
    setTimeout(() => setCopiedEpoch(false), 2000);
  };

  const handleConvertEpoch = (val: string) => {
    setEpochInput(val);
    if (!val.trim()) {
      setEpochConvertedResult(null);
      return;
    }
    const num = Number(val.trim());
    if (isNaN(num)) {
      setEpochConvertedResult('Invalid epoch number');
      return;
    }
    // Determine whether seconds or milliseconds
    const dateObj = new Date(num > 1e11 ? num : num * 1000);
    if (isNaN(dateObj.getTime())) {
      setEpochConvertedResult('Invalid date range');
    } else {
      setEpochConvertedResult(dateObj.toUTCString() + ` (${dateObj.toLocaleString()})`);
    }
  };

  return (
    <div id="clock-view-container" className="space-y-6">
      {/* View layout controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-stone-800/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
            View Style:
          </span>
          <div className="inline-flex rounded-lg p-1 bg-stone-900/50 border border-stone-800/80 text-xs">
            <button
              onClick={() => setDisplayMode('both')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                displayMode === 'both' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Hybrid
            </button>
            <button
              onClick={() => setDisplayMode('digital')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                displayMode === 'digital' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Digital
            </button>
            <button
              onClick={() => setDisplayMode('analog')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                displayMode === 'analog' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Analog Dial
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMillis(!showMillis)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors border cursor-pointer ${
              showMillis
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Millis: {showMillis ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Clock Card */}
      <div
        id="master-clock-hero"
        className={`rounded-2xl p-6 sm:p-8 transition-all border ${
          isLight
            ? 'bg-white border-stone-200/90 shadow-sm'
            : theme === 'midnight'
            ? 'bg-neutral-950 border-neutral-900'
            : 'bg-stone-900/70 border-stone-800/80 shadow-md'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-center justify-around gap-8">
          {/* Analog Dial (if visible) */}
          {(displayMode === 'both' || displayMode === 'analog') && (
            <div className="flex flex-col items-center justify-center p-2">
              <AnalogClock
                date={currentDate}
                size={270}
                smoothSeconds={true}
                theme={theme}
              />
              <span className="mt-3 text-xs font-mono tracking-widest text-amber-500/80 uppercase">
                CONTINUOUS SWEEP
              </span>
            </div>
          )}

          {/* Digital Clock Display (if visible) */}
          {(displayMode === 'both' || displayMode === 'digital') && (
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-500">
                  Local Standard Time
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-500/10 text-stone-400 font-mono">
                  {tzAbbr} ({tzOffset})
                </span>
              </div>

              {/* Big Digital Numbers */}
              <div className="flex items-baseline gap-1 sm:gap-2 select-all">
                <div className="font-mono-tabular font-bold tracking-tight text-5xl sm:text-7xl md:text-8xl text-stone-100">
                  <span>{hours}</span>
                  <span className="text-amber-500 animate-pulse mx-0.5 sm:mx-1">:</span>
                  <span>{minutes}</span>
                  <span className="text-amber-500 animate-pulse mx-0.5 sm:mx-1">:</span>
                  <span className="text-amber-400">{seconds}</span>
                </div>

                {/* Milliseconds & AM/PM Column */}
                <div className="flex flex-col justify-end self-center sm:self-auto mb-1 sm:mb-3 font-mono-tabular">
                  {format === '12h' && (
                    <span className="text-lg sm:text-2xl font-bold tracking-wide text-amber-500">
                      {ampm}
                    </span>
                  )}
                  {showMillis && (
                    <span className="text-sm sm:text-lg font-semibold text-stone-500">
                      .{ms}
                    </span>
                  )}
                </div>
              </div>

              {/* Date string */}
              <div className="flex items-center gap-2 text-base sm:text-lg text-stone-300 font-medium">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>{fullDateString}</span>
              </div>

              {/* Timezone label */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
                <span className="font-mono">{timeZone}</span>
                <span>•</span>
                <span>{currentDate.toLocaleTimeString(undefined, { timeZoneName: 'long' }).split(' ').slice(2).join(' ')}</span>
              </div>

              {/* Day & Year Progress Bars */}
              <div className="w-full max-w-md pt-3 space-y-3">
                {/* Today's progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-stone-400">Day Elapsed</span>
                    <span className="text-amber-400 font-bold">{dayPercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
                      style={{ width: `${dayPercent}%` }}
                    />
                  </div>
                </div>

                {/* Year's progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-stone-400">
                      Year {currentDate.getFullYear()} (Day {dayOfYear}/{totalDays})
                    </span>
                    <span className="text-amber-400 font-bold">{yearPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500/80 transition-all duration-300"
                      style={{ width: `${yearPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Secondary Modules: Solar Ephemeris, Calendar Breakdown, and Unix Epoch */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Solar & Day Cycle */}
        <div
          id="solar-module"
          className={`rounded-xl p-5 border transition-all ${
            isLight
              ? 'bg-white border-stone-200 shadow-sm'
              : 'bg-stone-900/60 border-stone-800/80'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {solar.isDaytime ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
              <h3 className="font-semibold text-sm tracking-wide">Solar Cycle</h3>
            </div>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                solar.isDaytime
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}
            >
              {solar.isDaytime ? 'Daylight' : 'Night'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-stone-800/30">
              <span className="flex items-center gap-1.5 text-stone-400">
                <Sunrise className="w-3.5 h-3.5 text-amber-400" />
                Sunrise
              </span>
              <span className="font-mono font-medium">{solar.sunriseTime}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-stone-800/30">
              <span className="flex items-center gap-1.5 text-stone-400">
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                Solar Noon
              </span>
              <span className="font-mono font-medium">{solar.solarNoonTime}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-stone-800/30">
              <span className="flex items-center gap-1.5 text-stone-400">
                <Sunset className="w-3.5 h-3.5 text-orange-400" />
                Sunset
              </span>
              <span className="font-mono font-medium">{solar.sunsetTime}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-stone-400">Daylight Length</span>
              <span className="font-mono font-semibold text-amber-400">{solar.daylightDuration}</span>
            </div>
          </div>
        </div>

        {/* Calendar & Chronological Metrics */}
        <div
          id="calendar-metrics-module"
          className={`rounded-xl p-5 border transition-all ${
            isLight
              ? 'bg-white border-stone-200 shadow-sm'
              : 'bg-stone-900/60 border-stone-800/80'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-sm tracking-wide">Calendar Breakdown</h3>
            </div>
            <span className="text-[11px] font-mono text-stone-400">ISO 8601</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-stone-800/30">
              <span className="text-stone-400">ISO Week</span>
              <span className="font-mono font-semibold text-stone-200">
                Week {weekNumber}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-stone-800/30">
              <span className="text-stone-400">Day of Year</span>
              <span className="font-mono font-semibold text-stone-200">
                {dayOfYear} / {totalDays}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-stone-800/30">
              <span className="text-stone-400">Days Remaining</span>
              <span className="font-mono font-semibold text-stone-200">
                {totalDays - dayOfYear} days
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-stone-400">Leap Year</span>
              <span className="font-mono font-semibold text-amber-400">
                {totalDays === 366 ? 'Yes (366 days)' : 'No (365 days)'}
              </span>
            </div>
          </div>
        </div>

        {/* Unix Timestamp & Epoch */}
        <div
          id="unix-epoch-module"
          className={`rounded-xl p-5 border transition-all ${
            isLight
              ? 'bg-white border-stone-200 shadow-sm'
              : 'bg-stone-900/60 border-stone-800/80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-sm tracking-wide">Unix Epoch Time</h3>
            </div>
            <button
              onClick={handleCopyEpoch}
              className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 cursor-pointer"
              title="Copy current epoch seconds"
            >
              {copiedEpoch ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedEpoch ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-2 mt-3">
            <div className="bg-stone-950/70 rounded-lg p-2.5 border border-stone-800/80">
              <div className="text-[10px] uppercase font-mono text-stone-500 mb-0.5">
                Seconds since Jan 01 1970 (UTC)
              </div>
              <div className="font-mono-tabular text-lg font-bold text-amber-400 tracking-wide">
                {epochSeconds}
              </div>
            </div>

            {/* Quick converter input */}
            <div className="pt-1">
              <div className="text-[11px] text-stone-400 mb-1">Convert Epoch:</div>
              <input
                type="text"
                placeholder="e.g. 1726840000"
                value={epochInput}
                onChange={(e) => handleConvertEpoch(e.target.value)}
                className="w-full text-xs font-mono px-2.5 py-1.5 rounded bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-amber-500"
              />
              {epochConvertedResult && (
                <div className="mt-1.5 text-[10px] font-mono text-amber-300/90 truncate bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
                  {epochConvertedResult}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
