import { useState, useEffect, useRef } from 'react';
import { fetchWeatherForecast } from '../services/api';

const DISASTER_CONFIG = {
  landslide: {
    label: 'Landslide',
    icon: '⛰️',
    color: { High: '#ef4444', Medium: '#f97316', Low: '#22c55e' },
    bg: { High: 'rgba(239,68,68,0.15)', Medium: 'rgba(249,115,22,0.15)', Low: 'rgba(34,197,94,0.12)' },
    accent: '#a16207',
  },
  flood: {
    label: 'Flood',
    icon: '🌊',
    color: { High: '#3b82f6', Medium: '#60a5fa', Low: '#22c55e' },
    bg: { High: 'rgba(59,130,246,0.18)', Medium: 'rgba(96,165,250,0.14)', Low: 'rgba(34,197,94,0.12)' },
    accent: '#1d4ed8',
  },
  thunderstorm: {
    label: 'Thunderstorm',
    icon: '⚡',
    color: { High: '#eab308', Medium: '#facc15', Low: '#22c55e' },
    bg: { High: 'rgba(234,179,8,0.15)', Medium: 'rgba(250,204,21,0.12)', Low: 'rgba(34,197,94,0.12)' },
    accent: '#a16207',
  },
  windstorm: {
    label: 'Windstorm',
    icon: '🌪️',
    color: { High: '#a855f7', Medium: '#c084fc', Low: '#22c55e' },
    bg: { High: 'rgba(168,85,247,0.15)', Medium: 'rgba(192,132,252,0.12)', Low: 'rgba(34,197,94,0.12)' },
    accent: '#7c3aed',
  },
};

function RiskBadge({ level, probability }) {
  const normalizedLevel = level
    ? level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()
    : 'Low';
  const colors = {
    High: { text: '#ef4444', bg: 'rgba(239,68,68,0.14)', border: 'rgba(239,68,68,0.35)' },
    Medium: { text: '#f97316', bg: 'rgba(249,115,22,0.14)', border: 'rgba(249,115,22,0.35)' },
    Low: { text: '#4ade80', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' },
  };
  const c = colors[normalizedLevel] || colors.Low;
  return (
    <span
      style={{ color: c.text, background: c.bg, border: `1px solid ${c.border}` }}
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
    >
      {normalizedLevel}
      {probability != null && (
        <span style={{ opacity: 0.75 }}>· {(probability * 100).toFixed(0)}%</span>
      )}
    </span>
  );
}

function ProbBar({ probability, level }) {
  const normalizedLevel = level
    ? level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()
    : 'Low';
  const colors = { High: '#ef4444', Medium: '#f97316', Low: '#4ade80' };
  const barColor = colors[normalizedLevel] || '#4ade80';
  const pct = probability != null ? Math.min(100, Math.round(probability * 100)) : 0;
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 6px ${barColor}80` }}
        />
      </div>
      <span className="text-[10px] font-mono" style={{ color: barColor, minWidth: '28px', textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  );
}

function DayCard({ day, idx, isSelected, onClick }) {
  const date = new Date(day.date);
  const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
  const dayNum = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  // Determine overall severity
  const levels = Object.values(day.disasters).map(d => d?.level?.toLowerCase() || 'low');
  const hasHigh = levels.some(l => l === 'high');
  const hasMedium = levels.some(l => l === 'medium' || l === 'moderate');
  const borderColor = hasHigh
    ? 'rgba(239,68,68,0.6)'
    : hasMedium
      ? 'rgba(249,115,22,0.5)'
      : 'rgba(34,197,94,0.4)';

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer"
      style={{
        width: '72px',
        background: isSelected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
        border: isSelected ? `2px solid rgba(99,102,241,0.7)` : `1px solid ${borderColor}`,
        boxShadow: isSelected ? '0 0 16px rgba(99,102,241,0.25)' : 'none',
      }}
    >
      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{dayName}</span>
      <span className="text-xs font-semibold text-white">{dayNum}</span>
      <div className="flex flex-wrap justify-center gap-0.5 mt-1">
        {Object.entries(day.disasters).map(([type, risk]) => {
          const cfg = DISASTER_CONFIG[type];
          const lvl = risk?.level?.charAt(0).toUpperCase() + risk?.level?.slice(1).toLowerCase() || 'Low';
          return (
            <span
              key={type}
              title={`${cfg?.label}: ${lvl}`}
              style={{ fontSize: '13px' }}
            >
              {cfg?.icon}
            </span>
          );
        })}
      </div>
      <div
        className="w-6 h-1 rounded-full mt-1"
        style={{
          background: hasHigh ? '#ef4444' : hasMedium ? '#f97316' : '#22c55e',
          boxShadow: hasHigh
            ? '0 0 6px #ef444488'
            : hasMedium
              ? '0 0 6px #f9731688'
              : '0 0 6px #22c55e88',
        }}
      />
    </button>
  );
}

export default function WeatherForecast({ place, onBack }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeDisaster, setActiveDisaster] = useState(null);
  const [showPlot, setShowPlot] = useState(false);
  const [rawData, setRawData] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetchWeatherForecast(place)
      .then((result) => {
        setForecast(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [place]);

  const handleViewPlot = (disaster) => {
    setActiveDisaster(disaster);
    setShowPlot(true);
  };

  const handleRawData = (disaster) => {
    setActiveDisaster(disaster);
    const data = forecast.data.map(day => ({
      date: day.date,
      ...day.disasters[disaster],
    }));
    setRawData(data);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-blue-400/20 border-t-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
        </div>
        <p className="text-slate-400 text-sm">Loading 16-day forecast…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8 glass-card text-center">
        <p className="text-red-400 text-lg mb-4">⚠️ {error}</p>
        <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 underline text-sm transition-colors">← Back</button>
      </div>
    );
  }

  const days = forecast?.data || [];
  const currentDay = days[selectedDay];

  return (
    <section className="fade-in max-w-5xl mx-auto pb-16 px-2">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 transition-colors mb-5 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Place Info
        </button>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-indigo-400 uppercase tracking-widest font-semibold mb-1">16-Day Forecast</p>
            <h2 className="text-3xl font-bold text-white">
              {place}
            </h2>
          </div>
          <div className="flex gap-2">
            {Object.entries(DISASTER_CONFIG).map(([type, cfg]) => (
              <div key={type} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500 uppercase">{cfg.label}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleViewPlot(type)}
                    className="px-2 py-1 text-[10px] rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                  >
                    📈 Plot
                  </button>
                  <button
                    onClick={() => handleRawData(type)}
                    className="px-2 py-1 text-[10px] rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                  >
                    📋 Data
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Day Selector Strip */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {days.map((day, idx) => (
          <DayCard
            key={day.date}
            day={day}
            idx={idx}
            isSelected={selectedDay === idx}
            onClick={() => setSelectedDay(idx)}
          />
        ))}
      </div>

      {/* Detail Panel */}
      {currentDay && (
        <div
          key={selectedDay}
          className="glass-card p-6 animate-fade"
          style={{ animation: 'fadeIn 0.35s ease forwards' }}
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                Day {selectedDay + 1} of 16
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {new Date(currentDay.date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
                disabled={selectedDay === 0}
                className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-all"
              >
                ← Prev
              </button>
              <button
                onClick={() => setSelectedDay(Math.min(days.length - 1, selectedDay + 1))}
                disabled={selectedDay === days.length - 1}
                className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-all"
              >
                Next →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(currentDay.disasters).map(([type, risk]) => {
              const cfg = DISASTER_CONFIG[type] || {};
              const lvl = risk?.level
                ? risk.level.charAt(0).toUpperCase() + risk.level.slice(1).toLowerCase()
                : 'Low';
              const prob = risk?.probability ?? 0;
              const bgCol = cfg.bg?.[lvl] || 'rgba(255,255,255,0.04)';
              const borderCol = cfg.color?.[lvl]
                ? cfg.color[lvl] + '40'
                : 'rgba(255,255,255,0.08)';

              return (
                <div
                  key={type}
                  className="rounded-xl p-4 flex flex-col gap-3 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: bgCol,
                    border: `1px solid ${borderCol}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{cfg.icon}</span>
                      <span className="text-sm font-semibold text-white">{cfg.label}</span>
                    </div>
                    <RiskBadge level={lvl} probability={prob} />
                  </div>
                  {risk ? (
                    <ProbBar probability={prob} level={lvl} />
                  ) : (
                    <p className="text-xs text-slate-500">No data available</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline Summary */}
      <div className="mt-8">
        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">All 16 Days at a Glance</h4>
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] text-[11px] text-slate-500 uppercase tracking-wider font-semibold px-4 py-2 border-b border-white/5">
            <span>Date</span>
            {Object.values(DISASTER_CONFIG).map(c => (
              <span key={c.label} className="text-center">{c.icon} {c.label}</span>
            ))}
          </div>
          <div className="divide-y divide-white/5">
            {days.map((day, idx) => (
              <button
                key={day.date}
                onClick={() => setSelectedDay(idx)}
                className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] w-full px-4 py-2.5 text-left text-xs items-center transition-colors hover:bg-white/[0.04]"
                style={{ background: idx === selectedDay ? 'rgba(99,102,241,0.08)' : undefined }}
              >
                <span className="text-slate-400 font-mono">
                  {new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
                {Object.entries(day.disasters).map(([type, risk]) => {
                  const lvl = risk?.level
                    ? risk.level.charAt(0).toUpperCase() + risk.level.slice(1).toLowerCase()
                    : 'Low';
                  return (
                    <div key={type} className="flex justify-center">
                      <RiskBadge level={lvl} probability={risk?.probability} />
                    </div>
                  );
                })}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plot Modal */}
      {showPlot && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowPlot(false)}
        >
          <div
            className="glass-card max-w-3xl w-full p-6 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wide">
                {DISASTER_CONFIG[activeDisaster]?.icon} {DISASTER_CONFIG[activeDisaster]?.label} — 16-Day Plot
              </h3>
              <button
                onClick={() => setShowPlot(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <img
                src={`http://localhost:8000/api/forecast/plot/${activeDisaster}?place=${encodeURIComponent(place)}`}
                alt={`${activeDisaster} forecast plot`}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* Raw Data Modal */}
      {rawData && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setRawData(null)}
        >
          <div
            className="glass-card max-w-2xl w-full p-6 animate-scale-in max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wide">
                {DISASTER_CONFIG[activeDisaster]?.icon} {DISASTER_CONFIG[activeDisaster]?.label} — Daily Logs
              </h3>
              <button
                onClick={() => setRawData(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 rounded-xl border border-slate-800 bg-slate-950/80 divide-y divide-slate-900">
              {rawData.map((entry, i) => {
                const lvl = entry.level
                  ? entry.level.charAt(0).toUpperCase() + entry.level.slice(1).toLowerCase()
                  : 'Low';
                return (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 text-xs">
                    <span className="text-indigo-400 font-mono">{entry.date}</span>
                    <RiskBadge level={lvl} probability={entry.probability} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
