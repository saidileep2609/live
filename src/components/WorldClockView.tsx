import React, { useState } from 'react';
import { WorldCity, ClockFormat, ThemeMode } from '../types';
import { 
  INITIAL_CITIES, 
  getZonedDate, 
  formatTime, 
  getTimeDifference,
  getTimezoneOffsetString,
  getHourActivityCategory
} from '../utils/time';
import { 
  Search, 
  Plus, 
  Trash2, 
  Sun, 
  Moon, 
  RotateCcw, 
  Clock, 
  Calendar,
  Users,
  Check
} from 'lucide-react';

interface WorldClockViewProps {
  currentDate: Date;
  format: ClockFormat;
  theme: ThemeMode;
}

export const WorldClockView: React.FC<WorldClockViewProps> = ({
  currentDate,
  format,
  theme,
}) => {
  const [cities, setCities] = useState<WorldCity[]>(() => {
    return INITIAL_CITIES.filter((c) => c.pinned);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [scrubberOffsetMinutes, setScrubberOffsetMinutes] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const isLight = theme === 'light';

  // Base date modified by scrubber
  const displayDate = new Date(currentDate.getTime() + scrubberOffsetMinutes * 60 * 1000);

  const handleResetScrubber = () => {
    setScrubberOffsetMinutes(0);
    setIsScrubbing(false);
  };

  const handleRemoveCity = (id: string) => {
    setCities((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddCity = (city: WorldCity) => {
    if (!cities.some((c) => c.id === city.id)) {
      setCities((prev) => [...prev, { ...city, pinned: true }]);
    }
    setSearchQuery('');
  };

  const filteredSearchList = INITIAL_CITIES.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.timezone.toLowerCase().includes(q)) &&
      !cities.some((existing) => existing.id === c.id)
    );
  });

  return (
    <div id="world-clock-view" className="space-y-6">
      {/* Meeting Planner & Interactive Time Scrubber */}
      <div
        id="scrubber-card"
        className={`rounded-2xl p-5 sm:p-6 border transition-all ${
          isLight
            ? 'bg-white border-stone-200 shadow-sm'
            : theme === 'midnight'
            ? 'bg-neutral-950 border-neutral-900'
            : 'bg-stone-900/80 border-stone-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800/40">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-base sm:text-lg tracking-wide">
                Time Zone Meeting Planner
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Drag the 24-hour timeline to cross-reference business, waking, and sleeping hours across all cities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {scrubberOffsetMinutes !== 0 && (
              <button
                id="reset-scrubber-btn"
                onClick={handleResetScrubber}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-600 text-stone-950 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Now</span>
              </button>
            )}
            <div className="flex items-center gap-3 text-[11px] font-mono text-stone-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Work (9-17)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Awake
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-stone-700" /> Sleep
              </span>
            </div>
          </div>
        </div>

        {/* 24-Hour Slider */}
        <div className="pt-4">
          <div className="flex justify-between items-center text-xs font-mono text-stone-400 mb-1.5">
            <span>00:00 (Midnight)</span>
            <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              Scrubbed Time: {formatTime(displayDate, format).timeString} {format === '12h' ? formatTime(displayDate, format).ampm : ''}
              {scrubberOffsetMinutes !== 0 && ` (${scrubberOffsetMinutes > 0 ? '+' : ''}${Math.round(scrubberOffsetMinutes / 60)}h)`}
            </span>
            <span>23:59</span>
          </div>

          <input
            id="time-scrubber-slider"
            type="range"
            min="-720"
            max="720"
            step="15"
            value={scrubberOffsetMinutes}
            onChange={(e) => {
              setScrubberOffsetMinutes(Number(e.target.value));
              setIsScrubbing(true);
            }}
            className="w-full h-2.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          <div className="flex justify-between text-[10px] font-mono text-stone-500 mt-1">
            <span>-12 hrs</span>
            <span>-6 hrs</span>
            <span className="text-amber-500 font-semibold">• Live (0)</span>
            <span>+6 hrs</span>
            <span>+12 hrs</span>
          </div>
        </div>
      </div>

      {/* Add City Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="search-city-input"
            placeholder="Search world cities (e.g. Sydney, Cairo, Mumbai)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-stone-900 border border-stone-800 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
          />

          {/* Search Dropdown */}
          {searchQuery && (
            <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-1">
              {filteredSearchList.length === 0 ? (
                <div className="p-3 text-xs text-stone-400 text-center">
                  No matching cities found
                </div>
              ) : (
                filteredSearchList.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleAddCity(c)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-800 text-left text-xs transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-stone-100">{c.city}</span>
                      <span className="text-stone-400 ml-1.5 font-normal">({c.country})</span>
                    </div>
                    <span className="text-amber-500 font-mono text-[11px] flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="text-xs text-stone-400 font-mono flex items-center gap-2 self-end sm:self-center">
          <span>{cities.length} time zones tracked</span>
        </div>
      </div>

      {/* Grid of City Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((city) => {
          const cityDate = getZonedDate(displayDate, city.timezone);
          const { hours, minutes, seconds, ampm } = formatTime(cityDate, format, {
            showSeconds: true,
          });

          const diff = getTimeDifference(city.timezone, displayDate);
          const offsetStr = getTimezoneOffsetString(city.timezone, displayDate);
          const hourNum = cityDate.getHours();
          const activity = getHourActivityCategory(hourNum);
          const isDay = hourNum >= 6 && hourNum < 19;

          return (
            <div
              key={city.id}
              id={`city-card-${city.id}`}
              className={`rounded-xl p-4 sm:p-5 border transition-all relative overflow-hidden group ${
                isLight
                  ? 'bg-white border-stone-200 shadow-sm'
                  : 'bg-stone-900/60 border-stone-800/80 hover:border-stone-700'
              }`}
            >
              {/* Top Row: City info & delete button */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-stone-100">{city.city}</h3>
                    <span className="text-xs text-stone-400 font-normal">
                      {city.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-stone-400 mt-0.5">
                    <span>{offsetStr}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-medium">{diff}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <div
                    className={`p-1.5 rounded-lg text-xs ${
                      isDay
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-indigo-400 bg-indigo-500/10'
                    }`}
                    title={isDay ? 'Daytime' : 'Nighttime'}
                  >
                    {isDay ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </div>

                  {cities.length > 1 && (
                    <button
                      onClick={() => handleRemoveCity(city.id)}
                      className="opacity-40 group-hover:opacity-100 hover:text-red-400 p-1.5 rounded transition-opacity cursor-pointer"
                      title="Remove city"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Time Display */}
              <div className="flex items-baseline gap-1.5 mb-3 font-mono-tabular">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-100">
                  {hours}:{minutes}
                </span>
                <span className="text-sm font-semibold text-stone-400">
                  :{seconds}
                </span>
                {format === '12h' && (
                  <span className="text-xs font-bold text-amber-500 ml-1">
                    {ampm}
                  </span>
                )}
              </div>

              {/* Date in this city */}
              <div className="text-xs text-stone-400 mb-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>
                  {cityDate.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* 24-Hour Visual Timeline Bar */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="capitalize text-stone-400 flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activity === 'work'
                          ? 'bg-emerald-500'
                          : activity === 'wake' || activity === 'evening'
                          ? 'bg-amber-500'
                          : 'bg-stone-600'
                      }`}
                    />
                    {activity === 'work' ? 'Working Hours' : activity === 'sleep' ? 'Sleeping' : 'Waking / Leisure'}
                  </span>
                  <span className="text-stone-500">{hourNum}:00</span>
                </div>

                {/* Micro blocks for 24 hours */}
                <div className="grid grid-cols-24 gap-0.5 h-2 w-full rounded overflow-hidden bg-stone-950 p-0.5">
                  {Array.from({ length: 24 }).map((_, h) => {
                    const blockCategory = getHourActivityCategory(h);
                    const isCurrentH = h === hourNum;

                    let bg = 'bg-stone-800';
                    if (blockCategory === 'work') bg = 'bg-emerald-600/70';
                    if (blockCategory === 'wake' || blockCategory === 'evening') bg = 'bg-amber-600/50';

                    return (
                      <div
                        key={h}
                        className={`h-full rounded-xs transition-opacity ${bg} ${
                          isCurrentH ? 'ring-1 ring-amber-300 ring-offset-1 z-10' : ''
                        }`}
                        title={`${h}:00 - ${blockCategory}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
