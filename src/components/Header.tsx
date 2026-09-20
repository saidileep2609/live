import React from 'react';
import { ClockTab, ClockFormat, ThemeMode } from '../types';
import { 
  Clock, 
  Globe, 
  Timer, 
  Hourglass, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Sparkles 
} from 'lucide-react';

interface HeaderProps {
  activeTab: ClockTab;
  onTabChange: (tab: ClockTab) => void;
  format: ClockFormat;
  onToggleFormat: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenZenMode: () => void;
  currentTimezone: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  format,
  onToggleFormat,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  onOpenZenMode,
  currentTimezone,
}) => {
  const isLight = theme === 'light';

  const tabs: { id: ClockTab; label: string; icon: React.ReactNode }[] = [
    { id: 'clock', label: 'Master Clock', icon: <Clock className="w-4 h-4" /> },
    { id: 'world', label: 'World Time', icon: <Globe className="w-4 h-4" /> },
    { id: 'stopwatch', label: 'Stopwatch', icon: <Timer className="w-4 h-4" /> },
    { id: 'timer', label: 'Countdown', icon: <Hourglass className="w-4 h-4" /> },
  ];

  return (
    <header
      id="app-header"
      className={`border-b sticky top-0 z-30 transition-colors duration-200 ${
        isLight
          ? 'bg-stone-50/90 border-stone-200 backdrop-blur-md text-stone-800'
          : theme === 'midnight'
          ? 'bg-black/90 border-neutral-900 backdrop-blur-md text-neutral-200'
          : 'bg-stone-900/90 border-stone-800/80 backdrop-blur-md text-stone-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Sync indicator */}
        <div className="flex items-center gap-3">
          <button
            id="brand-button"
            onClick={() => onTabChange('clock')}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wider text-base uppercase">TIME</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono-tabular px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SYNCED
                </span>
              </div>
              <span className="text-[11px] opacity-60 truncate max-w-[150px] sm:max-w-[200px]">
                {currentTimezone.replace('_', ' ')}
              </span>
            </div>
          </button>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-stone-950/20 dark:bg-stone-900/40 border border-stone-700/20">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? isLight
                      ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80 font-semibold'
                      : 'bg-stone-800 text-amber-400 shadow-sm border border-stone-700/80 font-semibold'
                    : 'opacity-70 hover:opacity-100 hover:bg-stone-500/10'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 12h / 24h toggle */}
          <button
            id="format-toggle-btn"
            onClick={onToggleFormat}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors border cursor-pointer ${
              isLight
                ? 'bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-700'
                : 'bg-stone-800/80 border-stone-700 hover:bg-stone-700 text-stone-300'
            }`}
            title="Toggle 12-hour or 24-hour format"
          >
            {format.toUpperCase()}
          </button>

          {/* Sound Mute/Unmute */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            className={`p-2 rounded-lg text-xs transition-colors border cursor-pointer ${
              soundEnabled
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                : isLight
                ? 'bg-stone-100 border-stone-200 text-stone-500 hover:bg-stone-200'
                : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:bg-stone-700'
            }`}
            title={soundEnabled ? 'Mute audio' : 'Enable audio ticks & chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Theme Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className={`p-2 rounded-lg text-xs transition-colors border cursor-pointer ${
              isLight
                ? 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
            }`}
            title={`Current: ${theme}. Click to switch theme`}
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : theme === 'midnight' ? (
              <Sparkles className="w-4 h-4 text-indigo-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-300" />
            )}
          </button>

          {/* Zen / Desk Clock Mode */}
          <button
            id="zen-mode-btn"
            onClick={onOpenZenMode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold shadow-sm transition-all cursor-pointer"
            title="Open Fullscreen Zen Desk Clock"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desk Clock</span>
          </button>
        </div>
      </div>
    </header>
  );
};
