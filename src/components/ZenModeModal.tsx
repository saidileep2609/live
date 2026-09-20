import React, { useState, useEffect } from 'react';
import { AnalogClock } from './AnalogClock';
import { formatTime } from '../utils/time';
import { ClockFormat, ThemeMode } from '../types';
import { playTickSound } from '../utils/audio';
import { Minimize2, Volume2, VolumeX, Eye, Sparkles } from 'lucide-react';

interface ZenModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  format: ClockFormat;
  theme: ThemeMode;
  soundEnabled: boolean;
}

export const ZenModeModal: React.FC<ZenModeModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  format,
  theme,
  soundEnabled,
}) => {
  const [zenView, setZenView] = useState<'analog' | 'digital'>('digital');
  const [localSound, setLocalSound] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Tick sound every second if local sound enabled
  useEffect(() => {
    if (isOpen && localSound) {
      playTickSound(0.06);
    }
  }, [currentDate.getSeconds(), isOpen, localSound]);

  if (!isOpen) return null;

  const { hours, minutes, seconds, ampm } = formatTime(currentDate, format, { showSeconds: true });
  const fullDateString = currentDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      id="zen-desk-clock-overlay"
      className="fixed inset-0 z-50 bg-black text-stone-100 flex flex-col justify-between p-6 sm:p-12 select-none overflow-hidden animate-in fade-in duration-300"
    >
      {/* Top bar controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-900/80 border border-stone-800 text-xs">
            <button
              onClick={() => setZenView('digital')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                zenView === 'digital' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Digital
            </button>
            <button
              onClick={() => setZenView('analog')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                zenView === 'analog' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Analog Dial
            </button>
          </div>

          <button
            onClick={() => setLocalSound(!localSound)}
            className={`p-2 rounded-xl text-xs border transition-colors cursor-pointer ${
              localSound
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-stone-900 border-stone-800 text-stone-500 hover:text-stone-300'
            }`}
            title="Tick sound"
          >
            {localSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-stone-300 transition-colors cursor-pointer"
          title="Exit Zen Mode (Esc)"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Exit (ESC)</span>
        </button>
      </div>

      {/* Center Clock Visual */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto">
        {zenView === 'analog' ? (
          <div className="scale-110 sm:scale-125 md:scale-150 transition-transform">
            <AnalogClock
              date={currentDate}
              size={280}
              smoothSeconds={true}
              theme="midnight"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="font-mono-tabular font-bold tracking-tight text-7xl sm:text-9xl md:text-[14rem] text-stone-100 leading-none">
              <span>{hours}</span>
              <span className="text-amber-500 animate-pulse">:</span>
              <span>{minutes}</span>
              <span className="text-amber-500 animate-pulse">:</span>
              <span className="text-amber-400">{seconds}</span>
            </div>

            {format === '12h' && (
              <div className="text-2xl sm:text-4xl font-mono font-bold text-amber-500 tracking-widest uppercase">
                {ampm}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar Details */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-stone-500 text-xs font-mono gap-2 border-t border-stone-900 pt-4">
        <span>{fullDateString}</span>
        <span className="flex items-center gap-2">
          <span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
          <span>•</span>
          <span className="text-amber-500">ZEN DESK MODE</span>
        </span>
      </div>
    </div>
  );
};
