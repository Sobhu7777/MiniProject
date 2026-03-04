import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Area, ComposedChart
} from 'recharts';
import { fetchWeatherForecast, fetchForecastRiskData } from '../services/api';

// ── Constants ───────────────────────────────────────────────
const CONDITION_ICONS = { Sunny: '☀️', Cloudy: '☁️', Rainy: '🌧️', Stormy: '⛈️' };

const DISASTER_META = {
  thunderstorm: { icon: '⛈️', label: 'Thunderstorm' },
  flood:        { icon: '🌊', label: 'Flood' },
  windstorm:    { icon: '🌪️', label: 'Windstorm' },
  landslide:    { icon: '🏔️', label: 'Landslide' },
};

const LEVEL_STYLES = {
  NOT_APPLICABLE: { bg: 'bg-green-50',  text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', display: 'N/A' },
  VERY_LOW:       { bg: 'bg-green-50',  text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', display: 'Very Low' },
  LOW:            { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500', display: 'Low' },
  MEDIUM:         { bg: 'bg-yellow-50', text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500',  display: 'Medium' },
  HIGH:           { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500',    display: 'High' },
  SEVERE:         { bg: 'bg-red-50',    text: 'text-red-800',    border: 'border-red-300',    dot: 'bg-red-600',    display: 'Severe' },
};

const TREND_CHARTS = [
  { key: 'cape',          label: 'Thunderstorm — CAPE',           unit: 'J/kg',  color: '#f59e0b', icon: '⛈️' },
  { key: 'precipitation', label: 'Flood — Precipitation',         unit: 'mm',    color: '#3b82f6', icon: '🌊' },
  { key: 'windGust',      label: 'Windstorm — Max Wind Gusts',    unit: 'km/h',  color: '#8b5cf6', icon: '🌪️' },
  { key: 'soilMoisture',  label: 'Landslide — Soil Moisture Index', unit: 'idx', color: '#10b981', icon: '🏔️' },
];

// ── Risk Badge Component ────────────────────────────────────
function RiskBadge({ level, probability }) {
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.LOW;
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${style.bg} ${style.text} ${style.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {style.display}
      </span>
      <span className="text-gray-400 text-sm">({probability})</span>
    </div>
  );
}

// ── Feature 1: Day-by-Day Disaster Risk Cards ───────────────
function DailyRiskCards({ riskData }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-lg font-bold text-white">Day-by-Day Risk Assessment</h3>
        <span className="text-xs text-slate-500 bg-slate-800/60 px-2.5 py-1 rounded-lg">16 days</span>
      </div>

      <div className="space-y-3">
        {riskData.map((day, idx) => {
          // Determine worst risk for the day
          const worstLevel = Object.values(day.risks).reduce((worst, r) => {
            const order = ['NOT_APPLICABLE', 'VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'SEVERE'];
            return order.indexOf(r.level) > order.indexOf(worst) ? r.level : worst;
          }, 'NOT_APPLICABLE');

          const worstStyle = LEVEL_STYLES[worstLevel];
          const borderAccent =
            worstLevel === 'HIGH' || worstLevel === 'SEVERE' ? 'border-l-red-500'
            : worstLevel === 'MEDIUM' || worstLevel === 'LOW' ? 'border-l-yellow-500'
            : 'border-l-green-500';

          return (
            <div
              key={day.day}
              className={`glass-card border-l-4 ${borderAccent} p-4 md:p-5 slide-up`}
              style={{ animationDelay: `${idx * 30}ms` }}
              id={`risk-day-${day.day}`}
            >
              {/* Day header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-bold text-white">📅 Day {day.day}</span>
                <span className="text-xs text-slate-400">({day.date})</span>
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${worstStyle.bg} ${worstStyle.text} ${worstStyle.border}`}>
                  Peak: {worstStyle.display}
                </span>
              </div>

              {/* 4 disaster risks — responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(day.risks).map(([key, risk]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2.5 bg-slate-800/40 rounded-lg px-3 py-2.5"
                  >
                    <span className="text-lg shrink-0">{DISASTER_META[key].icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400 mb-0.5">{DISASTER_META[key].label}</p>
                      <RiskBadge level={risk.level} probability={risk.probability} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Feature 2: 4 Feature-Trend Line Charts ──────────────────
function TrendCharts({ riskData }) {
  const chartData = riskData.map((d) => ({
    date: d.dateFmt,
    ...d.trends,
  }));

  const tooltipStyle = {
    contentStyle: { background: '#1e293b', border: '1px solid #475569', borderRadius: '10px', fontSize: '12px' },
    itemStyle: { color: '#e2e8f0' },
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">Significant Feature Trends</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TREND_CHARTS.map((chart) => (
          <div key={chart.key} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{chart.icon}</span>
              <h4 className="text-sm font-semibold text-white">{chart.label}</h4>
              <span className="ml-auto text-[10px] text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-md">{chart.unit}</span>
            </div>
            <div className="h-48 md:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={2} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} width={45} />
                  <Tooltip {...tooltipStyle} formatter={(value) => [`${value} ${chart.unit}`, chart.label]} />
                  <Line
                    type="monotone"
                    dataKey={chart.key}
                    stroke={chart.color}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: chart.color }}
                    activeDot={{ r: 5, stroke: chart.color, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Feature 3: Raw Weather Data (demoted, toggle) ───────────
function RawWeatherToggle({ weatherData }) {
  const [showRawData, setShowRawData] = useState(false);
  const [chartType, setChartType] = useState('composed');

  if (!weatherData || weatherData.length === 0) return null;

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowRawData(!showRawData)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-400
                   bg-slate-800/60 border border-surface-border/30 rounded-xl
                   hover:text-white hover:border-slate-500 transition-all duration-200"
        id="toggle-raw-weather"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${showRawData ? 'rotate-90' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {showRawData ? 'Hide' : 'View'} Raw API Weather Data
      </button>

      {showRawData && (
        <div className="space-y-6 fade-in">
          {/* Chart type toggle */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300">Temperature & Precipitation</h3>
              <div className="flex gap-2">
                {['composed', 'bar'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                      chartType === type
                        ? 'bg-brand-600 border-brand-500 text-white'
                        : 'bg-surface-card border-surface-border text-slate-400 hover:text-white hover:border-slate-500'
                    }`}
                    id={`raw-chart-toggle-${type}`}
                  >
                    {type === 'composed' ? '📈 Line' : '📊 Bar'}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-72 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'composed' ? (
                  <ComposedChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="temp" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '°C', position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis yAxisId="precip" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'mm', position: 'insideRight', fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '10px', fontSize: '12px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area yAxisId="precip" type="monotone" dataKey="precipitation" fill="#38bdf8" fillOpacity={0.15} stroke="#38bdf8" strokeWidth={0} name="Precipitation (mm)" />
                    <Line yAxisId="temp" type="monotone" dataKey="tempMax" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3, fill: '#f97316' }} name="Max Temp (°C)" />
                    <Line yAxisId="temp" type="monotone" dataKey="tempMin" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 3, fill: '#818cf8' }} name="Min Temp (°C)" />
                  </ComposedChart>
                ) : (
                  <BarChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '10px', fontSize: '12px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="tempMax" fill="#f97316" radius={[4, 4, 0, 0]} name="Max Temp (°C)" />
                    <Bar dataKey="tempMin" fill="#818cf8" radius={[4, 4, 0, 0]} name="Min Temp (°C)" />
                    <Bar dataKey="precipitation" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Precip (mm)" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Day-by-day weather cards */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Daily Weather Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {weatherData.map((day) => (
                <div
                  key={day.day}
                  className="bg-slate-800/60 border border-surface-border/20 rounded-xl p-3 text-center
                             hover:border-brand-500/40 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <p className="text-xs text-slate-400 mb-1">{day.date}</p>
                  <p className="text-xl mb-1">{CONDITION_ICONS[day.condition]}</p>
                  <p className="text-xs font-bold text-white">{day.tempMax}° / {day.tempMin}°</p>
                  <p className="text-[10px] text-slate-500 mt-1">💧 {day.precipitation}mm</p>
                  <p className="text-[10px] text-slate-500">💨 {day.windSpeed} km/h</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab definitions ─────────────────────────────────────────
const TABS = [
  {
    id: 'risks',
    icon: '🛡️',
    title: 'Daily Risk Assessment',
    subtitle: 'Day-by-day disaster predictions for 16 days',
    accent: 'from-amber-500/20 to-orange-600/20',
    activeBorder: 'border-amber-400',
    activeGlow: 'shadow-amber-500/15',
  },
  {
    id: 'trends',
    icon: '📊',
    title: 'Feature Trend Charts',
    subtitle: 'CAPE, precipitation, wind & soil moisture graphs',
    accent: 'from-sky-500/20 to-cyan-600/20',
    activeBorder: 'border-sky-400',
    activeGlow: 'shadow-sky-500/15',
  },
];

// ── Main Component ──────────────────────────────────────────
export default function WeatherForecast({ place, onBack }) {
  const [riskData, setRiskData] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('risks');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      // TODO: Replace with real API call → fetch(`/api/forecast-risk?place=${place}`)
      fetchForecastRiskData(place),
      // TODO: Replace with real API call → fetch(`/api/weather/16day?place=${place}`)
      fetchWeatherForecast(place).catch(() => []),
    ]).then(([risk, weather]) => {
      setRiskData(risk);
      setWeatherData(weather);
      setLoading(false);
    });
  }, [place]);

  return (
    <section className="fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand-300 transition-colors mb-2"
          id="back-from-weather"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h2 className="text-2xl font-bold text-white">
          🛡️ 16-Day Disaster Risk Dashboard — <span className="text-brand-300">{place}</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">Enterprise-grade risk assessment for your travel safety</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── Tab Navigation Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 text-left
                    transition-all duration-300 ease-out cursor-pointer
                    bg-gradient-to-br ${tab.accent}
                    ${isActive
                      ? `${tab.activeBorder} shadow-xl ${tab.activeGlow} scale-[1.02]`
                      : 'border-surface-border/30 hover:border-slate-500 hover:-translate-y-0.5 hover:shadow-lg'
                    }`}
                  id={`tab-${tab.id}`}
                >
                  {isActive && (
                    <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500" />
                    </span>
                  )}

                  <span className="text-3xl shrink-0">{tab.icon}</span>
                  <div>
                    <h3 className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-300'} transition-colors`}>
                      {tab.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{tab.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Active Tab Content ── */}
          <div className="fade-in" key={activeTab}>
            {activeTab === 'risks' && <DailyRiskCards riskData={riskData} />}
            {activeTab === 'trends' && <TrendCharts riskData={riskData} />}
          </div>

          {/* ── Raw Weather Data (demoted, collapsed) ── */}
          <RawWeatherToggle weatherData={weatherData} />
        </div>
      )}
    </section>
  );
}
