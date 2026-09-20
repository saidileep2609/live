import React, { useState, useEffect, useRef } from 'react';
import { LapItem, ThemeMode } from '../types';
import { formatStopwatchTime } from '../utils/time';
import { playLapSound } from '../utils/audio';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flag, 
  Copy, 
  Check, 
  TrendingUp, 
  TrendingDown,
  Keyboard
} from 'lucide-react';

interface StopwatchViewProps {
  theme: ThemeMode;
  soundEnabled: boolean;
}

export const StopwatchView: React.FC<StopwatchViewProps> = ({ theme, soundEnabled }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [laps, setLaps] = useState<LapItem[]>([]);
  const [copiedLaps, setCopiedLaps] = useState<boolean>(false);

  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - accumulatedTimeRef.current;

      const updateTimer = () => {
        const currentNow = performance.now();
        const currentElapsed = currentNow - startTimeRef.current;
        accumulatedTimeRef.current = currentElapsed;
        setElapsedMs(currentElapsed);
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      };

      animationFrameRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  // Keyboard controls: Space to start/pause, L for lap, R for reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsRunning((prev) => !prev);
      } else if (e.key === 'l' || e.key === 'L') {
        if (isRunning) handleLap();
      } else if (e.key === 'r' || e.key === 'R') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, elapsedMs, laps]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    accumulatedTimeRef.current = 0;
    setElapsedMs(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (soundEnabled) playLapSound();

    const currentTotal = accumulatedTimeRef.current;
    const previousTotal = laps.length > 0 ? laps[0].totalElapsedMs : 0;
    const lapDuration = currentTotal - previousTotal;

    const newLap: LapItem = {
      lapNumber: laps.length + 1,
      lapDurationMs: lapDuration,
      totalElapsedMs: currentTotal,
    };

    setLaps([newLap, ...laps]);
  };

  const handleCopyLaps = () => {
    if (laps.length === 0) return;
    const text = laps
      .map(
        (l) =>
          `Lap ${l.lapNumber}: Split ${formatStopwatchTime(l.lapDurationMs).main}.${
            formatStopwatchTime(l.lapDurationMs).milliseconds
          } | Total: ${formatStopwatchTime(l.totalElapsedMs).main}.${
            formatStopwatchTime(l.totalElapsedMs).milliseconds
          }`
      )
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopiedLaps(true);
    setTimeout(() => setCopiedLaps(false), 2000);
  };

  // Find fastest and slowest lap for visual highlight
  let fastestLapIndex = -1;
  let slowestLapIndex = -1;
  if (laps.length > 1) {
    let minDuration = Infinity;
    let maxDuration = -Infinity;
    laps.forEach((l, idx) => {
      if (l.lapDurationMs < minDuration) {
        minDuration = l.lapDurationMs;
        fastestLapIndex = idx;
      }
      if (l.lapDurationMs > maxDuration) {
        maxDuration = l.lapDurationMs;
        slowestLapIndex = idx;
      }
    });
  }

  const { main, milliseconds } = formatStopwatchTime(elapsedMs);

  return (
    <div id="stopwatch-view" className="space-y-6 max-w-4xl mx-auto">
      {/* Timer Main Panel */}
      <div
        id="stopwatch-timer-card"
        className={`rounded-2xl p-8 sm:p-12 text-center border transition-all ${
          isLight
            ? 'bg-white border-stone-200 shadow-sm'
            : theme === 'midnight'
            ? 'bg-neutral-950 border-neutral-900'
            : 'bg-stone-900/70 border-stone-800/80 shadow-md'
        }`}
      >
        <div className="text-xs uppercase tracking-widest font-semibold text-amber-500 mb-2">
          High Precision Chronometer
        </div>

        {/* Stopwatch Big Display */}
        <div className="flex items-baseline justify-center font-mono-tabular select-none my-6">
          <span className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-tight text-stone-100">
            {main}
          </span>
          <span className="text-2xl sm:text-4xl md:text-5xl font-semibold text-amber-400 ml-1 sm:ml-2">
            .{milliseconds}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            id="stopwatch-toggle-btn"
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
                <span>{elapsedMs > 0 ? 'Resume' : 'Start'}</span>
              </>
            )}
          </button>

          {/* Lap Button */}
          <button
            id="stopwatch-lap-btn"
            onClick={handleLap}
            disabled={!isRunning}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm border transition-all cursor-pointer ${
              isRunning
                ? 'bg-stone-800/80 border-stone-700 text-stone-200 hover:bg-stone-700'
                : 'opacity-40 cursor-not-allowed border-stone-800 text-stone-500'
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>Lap</span>
          </button>

          {/* Reset Button */}
          <button
            id="stopwatch-reset-btn"
            onClick={handleReset}
            disabled={elapsedMs === 0}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm border transition-all cursor-pointer ${
              elapsedMs > 0
                ? 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
                : 'opacity-40 cursor-not-allowed border-stone-800 text-stone-500'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="flex items-center justify-center gap-4 text-xs font-mono text-stone-500 mt-6">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-[10px] text-stone-300">Space</kbd> Start/Stop
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-[10px] text-stone-300">L</kbd> Lap
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-[10px] text-stone-300">R</kbd> Reset
          </span>
        </div>
      </div>

      {/* Lap Times History */}
      {laps.length > 0 && (
        <div
          id="stopwatch-laps-table"
          className={`rounded-2xl p-6 border transition-all ${
            isLight
              ? 'bg-white border-stone-200 shadow-sm'
              : 'bg-stone-900/60 border-stone-800'
          }`}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-800/40">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-sm">Recorded Laps ({laps.length})</h3>
            </div>

            <button
              onClick={handleCopyLaps}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors cursor-pointer"
            >
              {copiedLaps ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLaps ? 'Copied' : 'Export Laps'}</span>
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-800/30 font-mono-tabular text-xs sm:text-sm">
            {laps.map((lap, idx) => {
              const isFastest = idx === fastestLapIndex;
              const isSlowest = idx === slowestLapIndex;
              const { main: lapMain, milliseconds: lapMs } = formatStopwatchTime(lap.lapDurationMs);
              const { main: totalMain, milliseconds: totalMs } = formatStopwatchTime(lap.totalElapsedMs);

              return (
                <div
                  key={lap.lapNumber}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors ${
                    isFastest
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : isSlowest
                      ? 'bg-amber-500/10 text-amber-300'
                      : 'hover:bg-stone-800/30 text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2 w-24">
                    <span className="font-bold">Lap {lap.lapNumber}</span>
                    {isFastest && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <TrendingUp className="w-2.5 h-2.5" /> Best
                      </span>
                    )}
                    {isSlowest && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <TrendingDown className="w-2.5 h-2.5" /> Slow
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="font-bold">+{lapMain}.{lapMs}</span>
                  </div>

                  <div className="text-right text-stone-500 text-xs">
                    Overall: {totalMain}.{totalMs}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
