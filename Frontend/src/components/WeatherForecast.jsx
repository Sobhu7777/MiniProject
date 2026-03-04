import { useState, useEffect } from 'react';
import { fetchWeatherForecast } from '../services/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Area, ComposedChart
} from 'recharts';

const CONDITION_ICONS = { Sunny: '☀️', Cloudy: '☁️', Rainy: '🌧️', Stormy: '⛈️' };

export default function WeatherForecast({ place, onBack }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('composed'); // 'composed' | 'bar'

  useEffect(() => {
    setLoading(true);
    // TODO: Replace with real API call → fetch(`/api/weather/16day?place=${place}`)
    fetchWeatherForecast(place).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [place]);

  return (
    <section className="fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
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
            🌦️ 16-Day Weather Forecast — <span className="text-brand-300">{place}</span>
          </h2>
        </div>

        {/* Chart type toggle */}
        <div className="flex gap-2">
          {['composed', 'bar'].map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 ${chartType === type
                  ? 'bg-brand-600 border-brand-500 text-white'
                  : 'bg-surface-card border-surface-border text-slate-400 hover:text-white hover:border-slate-500'
                }`}
              id={`chart-toggle-${type}`}
            >
              {type === 'composed' ? '📈 Line + Area' : '📊 Bar Chart'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Chart */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Temperature & Precipitation</h3>
            <div className="h-72 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'composed' ? (
                  <ComposedChart data={data}>
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
                  <BarChart data={data}>
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

          {/* Day-by-day cards */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Daily Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {data.map((day) => (
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
    </section>
  );
}
