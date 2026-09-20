import React, { useState, useEffect, useRef } from 'react';
import { ThemeMode, TimerPreset } from '../types';
import { formatSecondsToDisplay } from '../utils/time';
import { playChimeSound } from '../utils/audio';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Coffee, 
  Flame, 
  Brain, 
  Bell, 
  CheckCircle2,
  Clock
} from 'lucide-react';

interface TimerViewProps {
  theme: ThemeMode;
  soundEnabled: boolean;
}

const PRESETS: TimerPreset[] = [
  { id: '1m', label: '1 Min', seconds: 60 },
  { id: '3m', label: '3 Min Tea', seconds: 180 },
  { id: '5m', label: '5 Min Break', seconds: 300 },
  { id: '10m', label: '10 Min', seconds: 600 },
  { id: '15m', label: '15 Min', seconds: 900 },
  { id: '25m', label: '25m Pomodoro', seconds: 1500 },
  { id: '45m', label: '45m Deep Work', seconds: 2700 },
  { id: '60m', label: '60m Hour', seconds: 3600 },
];

export const TimerView: React.FC<TimerViewProps> = ({ theme, soundEnabled }) => {
  const [totalSeconds, setTotalSeconds] = useState<number>(1500); // default 25m Pomodoro
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1500);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Custom inputs
  const [customHours, setCustomHours] = useState<string>('0');
  const [customMins, setCustomMins] = useState<string>('25');
  const [customSecs, setCustomSecs] = useState<string>('0');

  const intervalRef = useRef<number | null>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setIsCompleted(true);
            if (soundEnabled) {
              playChimeSound();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remainingSeconds, soundEnabled]);

  const handleStartPause = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(totalSeconds);
      setIsCompleted(false);
    }
    setIsRunning(!isRunning);
    setIsCompleted(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setRemainingSeconds(totalSeconds);
  };

  const handleSelectPreset = (seconds: number) => {
    setIsRunning(false);
    setIsCompleted(false);
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
  };

  const handleAddMinute = () => {
    setRemainingSeconds((prev) => prev + 60);
    setTotalSeconds((prev) => prev + 60);
    setIsCompleted(false);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const h = Math.max(0, parseInt(customHours) || 0);
    const m = Math.max(0, parseInt(customMins) || 0);
    const s = Math.max(0, parseInt(customSecs) || 0);
    const calculated = h * 3600 + m * 60 + s;

    if (calculated > 0) {
      setIsRunning(false);
      setIsCompleted(false);
      setTotalSeconds(calculated);
      setRemainingSeconds(calculated);
    }
  };

  // Progress percentage
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;
  const strokeDashoffset = 880 - (880 * progressPercent) / 100;

  return (
    <div id="timer-view" className="space-y-6 max-w-4xl mx-auto">
      {/* Main Timer Display with Circular Ring */}
      <div
        id="timer-main-card"
        className={`rounded-2xl p-8 sm:p-12 text-center border transition-all ${
          isLight
            ? 'bg-white border-stone-200 shadow-sm'
            : theme === 'midnight'
            ? 'bg-neutral-950 border-neutral-900'
            : 'bg-stone-900/70 border-stone-800/80 shadow-md'
        }`}
      >
        <div className="relative inline-flex items-center justify-center">
          {/* Circular SVG Ring */}
          <svg className="w-64 h-64 sm:w-76 sm:h-76 -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="140"
              fill="none"
              stroke={isLight ? '#f5f5f4' : '#292524'}
              strokeWidth="10"
            />
            <circle
              cx="50%"
              cy="50%"
              r="140"
              fill="none"
              stroke={isCompleted ? '#10b981' : '#f59e0b'}
              strokeWidth="10"
              strokeDasharray="880"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time digits inside ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            {isCompleted ? (
              <div className="flex flex-col items-center animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-1" />
                <span className="text-xl font-bold text-emerald-400">Time's Up!</span>
              </div>
            ) : (
              <>
                <span className="text-xs uppercase tracking-widest font-mono text-stone-400 mb-1">
                  Remaining
                </span>
                <span className="font-mono-tabular text-5xl sm:text-6xl font-bold tracking-tight text-stone-100">
                  {formatSecondsToDisplay(remainingSeconds)}
                </span>
                <span className="text-xs font-mono text-amber-500/80 mt-1">
                  Total: {formatSecondsToDisplay(totalSeconds)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
          <button
            id="timer-toggle-btn"
            onClick={handleStartPause}
            className={`flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-base shadow-md transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-stone-950'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{remainingSeconds < totalSeconds && remainingSeconds > 0 ? 'Resume' : 'Start'}</span>
              </>
            )}
          </button>

          {/* Add 1 Minute quick button */}
          <button
            id="timer-add-min-btn"
            onClick={handleAddMinute}
            className="flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl font-medium text-sm border border-stone-700 bg-stone-800/80 text-stone-200 hover:bg-stone-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+1 Min</span>
          </button>

          {/* Reset Button */}
          <button
            id="timer-reset-btn"
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl font-medium text-sm border border-stone-700 bg-stone-800/80 text-stone-300 hover:bg-stone-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Selectors & Custom Time Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Quick Presets */}
        <div
          id="timer-presets-card"
          className={`rounded-2xl p-5 border transition-all ${
            isLight
              ? 'bg-white border-stone-200 shadow-sm'
              : 'bg-stone-900/60 border-stone-800'
          }`}
        >
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-800/40">
            <Flame className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-sm">Quick Presets</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESETS.map((preset) => {
              const isActive = totalSeconds === preset.seconds;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.seconds)}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 font-bold border-amber-500 shadow-sm'
                      : isLight
                      ? 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-800'
                      : 'bg-stone-800/60 hover:bg-stone-800 border-stone-700/60 text-stone-300'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Duration Form */}
        <div
          id="custom-timer-card"
          className={`rounded-2xl p-5 border transition-all ${
            isLight
              ? 'bg-white border-stone-200 shadow-sm'
              : 'bg-stone-900/60 border-stone-800'
          }`}
        >
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-800/40">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-sm">Set Custom Duration</h3>
          </div>

          <form onSubmit={handleApplyCustom} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  className="w-full text-center text-base font-mono-tabular py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customMins}
                  onChange={(e) => setCustomMins(e.target.value)}
                  className="w-full text-center text-base font-mono-tabular py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customSecs}
                  onChange={(e) => setCustomSecs(e.target.value)}
                  className="w-full text-center text-base font-mono-tabular py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700 transition-colors cursor-pointer"
            >
              Set Custom Timer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
