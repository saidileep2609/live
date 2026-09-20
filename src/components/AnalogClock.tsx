import React from 'react';

interface AnalogClockProps {
  date: Date;
  size?: number;
  smoothSeconds?: boolean;
  className?: string;
  theme?: 'dark' | 'midnight' | 'light';
}

export const AnalogClock: React.FC<AnalogClockProps> = ({
  date,
  size = 280,
  smoothSeconds = true,
  className = '',
  theme = 'dark',
}) => {
  const ms = date.getMilliseconds();
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours() % 12;
  const dayOfMonth = date.getDate();

  // Angular calculations
  const secondFraction = smoothSeconds ? (seconds + ms / 1000) / 60 : seconds / 60;
  const minuteFraction = (minutes + secondFraction) / 60;
  const hourFraction = (hours + minuteFraction) / 12;

  const secondAngle = secondFraction * 360;
  const minuteAngle = minuteFraction * 360;
  const hourAngle = hourFraction * 360;

  const isLight = theme === 'light';
  const dialBg = isLight ? '#f8f8f6' : '#141312';
  const dialBorder = isLight ? '#e2e0dc' : '#292724';
  const majorTick = isLight ? '#2a2826' : '#f0ece1';
  const minorTick = isLight ? '#a8a29e' : '#57534e';
  const hourHandColor = isLight ? '#1c1917' : '#fafaf9';
  const minuteHandColor = isLight ? '#44403c' : '#d6d3d1';
  const secondHandColor = '#f59e0b'; // warm amber second hand
  const centerPivotColor = isLight ? '#1c1917' : '#f59e0b';
  const dateBg = isLight ? '#ebe8e1' : '#22201d';
  const dateText = isLight ? '#292524' : '#e7e5e4';

  return (
    <div
      id="analog-clock-wrapper"
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 300 300"
        className="drop-shadow-sm transition-colors duration-300"
      >
        {/* Outer Dial & Bezel */}
        <circle
          cx="150"
          cy="150"
          r="144"
          fill={dialBg}
          stroke={dialBorder}
          strokeWidth="3"
        />
        <circle
          cx="150"
          cy="150"
          r="140"
          fill="none"
          stroke={isLight ? '#f0ede6' : '#1e1c19'}
          strokeWidth="1"
        />

        {/* 60 Minute/Second Tick Marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const isMajor = i % 5 === 0;
          const angle = (i * 6 * Math.PI) / 180;
          const outerR = 138;
          const innerR = isMajor ? 122 : 130;

          const x1 = 150 + Math.sin(angle) * outerR;
          const y1 = 150 - Math.cos(angle) * outerR;
          const x2 = 150 + Math.sin(angle) * innerR;
          const y2 = 150 - Math.cos(angle) * innerR;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isMajor ? majorTick : minorTick}
              strokeWidth={isMajor ? 2.5 : 1}
              strokeLinecap="round"
            />
          );
        })}

        {/* Hour Numbers (12, 3, 6, 9) */}
        <text
          x="150"
          y="46"
          textAnchor="middle"
          dominantBaseline="central"
          fill={majorTick}
          className="font-mono text-sm font-semibold tracking-wider"
        >
          12
        </text>
        <text
          x="254"
          y="150"
          textAnchor="middle"
          dominantBaseline="central"
          fill={majorTick}
          className="font-mono text-sm font-semibold tracking-wider"
        >
          3
        </text>
        <text
          x="150"
          y="254"
          textAnchor="middle"
          dominantBaseline="central"
          fill={majorTick}
          className="font-mono text-sm font-semibold tracking-wider"
        >
          6
        </text>
        <text
          x="46"
          y="150"
          textAnchor="middle"
          dominantBaseline="central"
          fill={majorTick}
          className="font-mono text-sm font-semibold tracking-wider"
        >
          9
        </text>

        {/* Date Window at 3:00 / offset */}
        <g transform="translate(182, 140)">
          <rect
            x="0"
            y="0"
            width="28"
            height="20"
            rx="3"
            fill={dateBg}
            stroke={dialBorder}
            strokeWidth="1"
          />
          <text
            x="14"
            y="11"
            textAnchor="middle"
            dominantBaseline="central"
            fill={dateText}
            className="font-mono-tabular text-[11px] font-bold"
          >
            {dayOfMonth}
          </text>
        </g>

        {/* Hour Hand */}
        <g transform={`rotate(${hourAngle} 150 150)`}>
          <line
            x1="150"
            y1="162"
            x2="150"
            y2="76"
            stroke={hourHandColor}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>

        {/* Minute Hand */}
        <g transform={`rotate(${minuteAngle} 150 150)`}>
          <line
            x1="150"
            y1="168"
            x2="150"
            y2="42"
            stroke={minuteHandColor}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </g>

        {/* Second Hand (Smooth Sweeping with Counterbalance) */}
        <g transform={`rotate(${secondAngle} 150 150)`}>
          <line
            x1="150"
            y1="180"
            x2="150"
            y2="28"
            stroke={secondHandColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="150" cy="180" r="3.5" fill={secondHandColor} />
        </g>

        {/* Center Cap & Jewel */}
        <circle cx="150" cy="150" r="5" fill={centerPivotColor} />
        <circle cx="150" cy="150" r="2.2" fill={isLight ? '#ffffff' : '#141312'} />
      </svg>
    </div>
  );
};
