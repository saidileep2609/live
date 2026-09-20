import React, { useState, useEffect } from 'react';
import { ClockTab, ClockFormat, ThemeMode } from './types';
import { Header } from './components/Header';
import { ClockView } from './components/ClockView';
import { WorldClockView } from './components/WorldClockView';
import { StopwatchView } from './components/StopwatchView';
import { TimerView } from './components/TimerView';
import { ZenModeModal } from './components/ZenModeModal';
import { formatTime, getTimezoneOffsetString } from './utils/time';
import { playTickSound } from './utils/audio';

export default function App() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<ClockTab>('clock');
  const [format, setFormat] = useState<ClockFormat>(() => {
    return (localStorage.getItem('time_clock_format') as ClockFormat) || '12h';
  });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('time_theme_mode') as ThemeMode) || 'dark';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('time_sound_enabled') === 'true';
  });
  const [isZenModeOpen, setIsZenModeOpen] = useState<boolean>(false);

  // Master Clock precision loop with requestAnimationFrame
  useEffect(() => {
    let animationId: number;
    let lastSecond = -1;

    const tick = () => {
      const now = new Date();
      setCurrentDate(now);

      // Trigger soft sound tick on second boundary if enabled
      if (soundEnabled && now.getSeconds() !== lastSecond) {
        lastSecond = now.getSeconds();
        playTickSound(0.04);
      }

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [soundEnabled]);

  const handleToggleFormat = () => {
    const nextFormat = format === '12h' ? '24h' : '12h';
    setFormat(nextFormat);
    localStorage.setItem('time_clock_format', nextFormat);
  };

  const handleToggleTheme = () => {
    const modes: ThemeMode[] = ['dark', 'midnight', 'light'];
    const nextIndex = (modes.indexOf(theme) + 1) % modes.length;
    const nextTheme = modes[nextIndex];
    setTheme(nextTheme);
    localStorage.setItem('time_theme_mode', nextTheme);
  };

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem('time_sound_enabled', String(nextState));
  };

  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const utcOffset = getTimezoneOffsetString(localTimezone, currentDate);

  // Styling based on theme
  const isLight = theme === 'light';
  const pageBgClass = isLight
    ? 'bg-stone-100 text-stone-900'
    : theme === 'midnight'
    ? 'bg-black text-neutral-100'
    : 'bg-stone-950 text-stone-100';

  return (
    <div id="app-root-wrapper" className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${pageBgClass}`}>
      {/* Header bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        format={format}
        onToggleFormat={handleToggleFormat}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenZenMode={() => setIsZenModeOpen(true)}
        currentTimezone={localTimezone}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'clock' && (
          <ClockView
            currentDate={currentDate}
            format={format}
            theme={theme}
          />
        )}

        {activeTab === 'world' && (
          <WorldClockView
            currentDate={currentDate}
            format={format}
            theme={theme}
          />
        )}

        {activeTab === 'stopwatch' && (
          <StopwatchView
            theme={theme}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'timer' && (
          <TimerView
            theme={theme}
            soundEnabled={soundEnabled}
          />
        )}
      </main>

      {/* Footer with UTC ticker and synchronization status */}
      <footer
        id="app-footer"
        className={`border-t py-4 text-xs font-mono transition-colors ${
          isLight
            ? 'bg-stone-50 border-stone-200 text-stone-500'
            : theme === 'midnight'
            ? 'bg-neutral-950 border-neutral-900 text-neutral-500'
            : 'bg-stone-900/40 border-stone-800/80 text-stone-400'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Universal Coordinated Time (UTC):</span>
            </span>
            <span className="font-bold text-amber-500 font-mono-tabular">
              {currentDate.toISOString().substring(11, 19)} UTC
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Local Offset: {utcOffset}</span>
            <span>•</span>
            <span>Epoch: {Math.floor(currentDate.getTime() / 1000)}s</span>
            <span>•</span>
            <button
              onClick={() => setIsZenModeOpen(true)}
              className="text-amber-500 hover:underline cursor-pointer"
            >
              Desk Clock (Zen)
            </button>
          </div>
        </div>
      </footer>

      {/* Zen / Desk Clock Modal */}
      <ZenModeModal
        isOpen={isZenModeOpen}
        onClose={() => setIsZenModeOpen(false)}
        currentDate={currentDate}
        format={format}
        theme={theme}
        soundEnabled={soundEnabled}
      />
    </div>
  );
}
