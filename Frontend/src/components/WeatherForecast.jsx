import { useState, useEffect, useRef } from 'react';
import { fetchWeatherForecast } from '../services/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Area, ComposedChart
} from 'recharts';

const CONDITION_ICONS = { Sunny: '☀️', Cloudy: '☁️', Rainy: '🌧️', Stormy: '⛈️' };
const DISASTER_ICONS = { thunderstorm: '⛈️', windstorm: '🌪️', flood: '🌊', landslide: '🏔️' };

export default function WeatherForecast({ place, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [graphModal, setGraphModal] = useState({ isOpen: false, type: '', title: '', variable: '', color: '' });
  const [dataModal, setDataModal] = useState({ isOpen: false, type: '' });
  const [tipsModal, setTipsModal] = useState({ isOpen: false, disaster: '' });

  useEffect(() => {
    setLoading(true);
    fetchWeatherForecast(place).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [place]);

  const openGraph = (type) => {
    const configs = {
      landslide: { title: '16-Day Rainfall Trend', variable: 'precipitation', color: '#38bdf8', unit: 'mm' },
      flood: { title: '1-Day Rainfall Trend', variable: 'precipitation', color: '#0ea5e9', unit: 'mm' }, // Switched to 1-day for graph but table shows 3-day
      thunderstorm: { title: '16-Day CAPE Trend', variable: 'cape', color: '#f59e0b', unit: 'J/kg' },
      windstorm: { title: '16-Day Wind Speed Trend', variable: 'windSpeed', color: '#10b981', unit: 'km/h' }
    };
    // Special case for flood: if user wants 3-day, we use rain_3day
    if (type === 'flood') configs.flood.variable = 'rain_3day';

    setGraphModal({ ...configs[type], isOpen: true, type });
  };

  const getSafetyTips = (disaster) => {
    const tips = {
      landslide: ["Avoid areas near steep slopes.", "Stay alert for unusual sounds like trees cracking.", "Move to higher ground if you see signs of a slide."],
      flood: ["Move to high ground immediately.", "Avoid walking or driving through flood waters.", "Stay away from power lines and electrical wires."],
      thunderstorm: ["Stay indoors and away from windows.", "Avoid using corded phones and electrical appliances.", "If outside, find a low-lying area away from trees."],
      windstorm: ["Stay inside and away from windows.", "Secure loose outdoor items.", "Avoid traveling or being near large trees."]
    };
    return tips[disaster] || ["Stay safe and follow local authority guidelines."];
  };

  return (
    <section className="fade-in max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand-300 transition-colors mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            🛡️ 16-Day Disaster Forecast — <span className="text-brand-300">{place}</span>
          </h2>
          <p className="text-slate-400 mt-1 max-w-2xl">
            Integrated 16-day forecast. Use the global controls below to view detailed trends and data for each disaster.
          </p>
        </div>
      </div>

      {!loading && (
        <div className="mb-8 space-y-6 bg-slate-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Graph Controls */}
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="text-brand-500">📈</span> View Trends (Graphs)
              </h4>
              <div className="flex flex-wrap gap-3">
                {Object.entries(DISASTER_ICONS).map(([key, icon]) => (
                  <button
                    key={`graph-${key}`}
                    onClick={() => openGraph(key)}
                    className="px-4 py-2.5 bg-slate-800/50 hover:bg-brand-500/20 rounded-xl border border-white/5 transition-all text-sm flex items-center gap-2 text-slate-300 hover:text-white"
                  >
                    <span>{icon}</span>
                    <span className="capitalize">{key}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Data Controls */}
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="text-brand-500">📑</span> View Detailed Data
              </h4>
              <div className="flex flex-wrap gap-3">
                {Object.entries(DISASTER_ICONS).map(([key, icon]) => (
                  <button
                    key={`data-${key}`}
                    onClick={() => setDataModal({ isOpen: true, type: key })}
                    className="px-4 py-2.5 bg-slate-800/50 hover:bg-brand-500/20 rounded-xl border border-white/5 transition-all text-sm flex items-center gap-2 text-slate-300 hover:text-white"
                  >
                    <span>{icon}</span>
                    <span className="capitalize">{key}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-16 h-16 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-slate-400 animate-pulse">Running disaster models...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((day) => (
            <div
              key={day.day}
              className="glass-card p-5 border-surface-border/20 flex flex-col hover:border-brand-500/30 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-3">
                <div>
                  <span className="text-brand-400 font-medium text-sm">Day {day.day}</span>
                  <p className="text-lg font-bold text-white leading-none mt-1">{day.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl">{CONDITION_ICONS[day.weather.condition] || '⛅'}</span>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{day.weather.condition}</p>
                </div>
              </div>

              <div className="space-y-4 flex-grow">
                {Object.entries(DISASTER_ICONS).map(([key, icon]) => {
                  const risk = day.risks?.[key];
                  const isAvailable = risk !== null && risk !== undefined;

                  return (
                    <div key={key} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{icon}</span>
                          <span className="text-xs font-semibold text-slate-300 capitalize">{key}</span>
                        </div>
                        {isAvailable ? (
                          <div className="text-right">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${risk.level === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              risk.level === 'MODERATE' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                'bg-green-500/20 text-green-400 border-green-500/30'
                              }`}>
                              {risk.level}
                            </span>
                            <p className="text-[9px] text-slate-500 mt-0.5 font-mono">Prob: {risk.probability}</p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-600 italic">N/A</span>
                        )}
                      </div>

                      {isAvailable && (
                        <div className="mt-2">
                          <button
                            onClick={() => setTipsModal({ isOpen: true, disaster: key })}
                            className="w-full py-1.5 bg-slate-800/50 hover:bg-brand-500/20 rounded-md border border-white/5 transition-all text-[10px] flex items-center justify-center gap-2 text-slate-400 hover:text-brand-300"
                          >
                            🛡️ Safety Precautions
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500">
                <span className="flex items-center gap-1">🌡️ {Math.round(day.weather.tempMax)}°/{Math.round(day.weather.tempMin)}°</span>
                <span className="flex items-center gap-1">💧 {day.weather.precipitation}mm</span>
                <span className="flex items-center gap-1">💨 {Math.round(day.weather.windSpeed)}k</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Graph Modal */}
      {graphModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md fade-in">
          <div className="glass-card w-full max-w-4xl p-6 relative">
            <button
              onClick={() => setGraphModal({ ...graphModal, isOpen: false })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-white mb-6">
              {DISASTER_ICONS[graphModal.type]} {graphModal.title}
            </h3>
            <div className="h-80 w-full bg-slate-900/40 rounded-xl p-4 border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    label={{ value: graphModal.unit, position: 'insideLeft', fill: '#94a3b8', fontSize: 12, angle: -90, offset: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '13px' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area
                    type="monotone"
                    dataKey={(d) => d.weather[graphModal.variable]}
                    fill={graphModal.color}
                    fillOpacity={0.1}
                    stroke={graphModal.color}
                    strokeWidth={2}
                    name={graphModal.title}
                  />
                  <Bar
                    dataKey={(d) => d.weather[graphModal.variable]}
                    fill={graphModal.color}
                    opacity={0.4}
                    radius={[4, 4, 0, 0]}
                    name="Daily Measure"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Data View Modal */}
      {dataModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md fade-in">
          <div className="glass-card w-full max-w-5xl p-6 relative max-h-[90vh] overflow-hidden flex flex-col">
            <button
              onClick={() => setDataModal({ isOpen: false, type: '' })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-white mb-6">
              📑 Fetched API Data: <span className="capitalize">{dataModal.type}</span> Metrics
            </h3>

            <div className="overflow-x-auto flex-grow rounded-xl border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3 border-b border-white/5">Date</th>

                    {dataModal.type === 'landslide' && (
                      <>
                        <th className="px-4 py-3 border-b border-white/5">Rain</th>
                        <th className="px-4 py-3 border-b border-white/5">Landslide Risk</th>
                      </>
                    )}

                    {dataModal.type === 'flood' && (
                      <>
                        <th className="px-4 py-3 border-b border-white/5">Rain</th>
                        <th className="px-4 py-3 border-b border-white/5">3-Day</th>
                        <th className="px-4 py-3 border-b border-white/5">Temp</th>
                        <th className="px-4 py-3 border-b border-white/5">Humidity</th>
                        <th className="px-4 py-3 border-b border-white/5">Flood Risk</th>
                      </>
                    )}

                    {dataModal.type === 'thunderstorm' && (
                      <>
                        <th className="px-4 py-3 border-b border-white/5">CAPE</th>
                        <th className="px-4 py-3 border-b border-white/5">Rain</th>
                        <th className="px-4 py-3 border-b border-white/5">Temp</th>
                        <th className="px-4 py-3 border-b border-white/5">Dew Pt</th>
                        <th className="px-4 py-3 border-b border-white/5">Pressure</th>
                        <th className="px-4 py-3 border-b border-white/5">Wind</th>
                        <th className="px-4 py-3 border-b border-white/5">Prob</th>
                        <th className="px-4 py-3 border-b border-white/5">Risk</th>
                      </>
                    )}

                    {dataModal.type === 'windstorm' && (
                      <>
                        <th className="px-4 py-3 border-b border-white/5">Wind</th>
                        <th className="px-4 py-3 border-b border-white/5">3-Day</th>
                        <th className="px-4 py-3 border-b border-white/5">Temp</th>
                        <th className="px-4 py-3 border-b border-white/5">Humidity</th>
                        <th className="px-4 py-3 border-b border-white/5">Prob</th>
                        <th className="px-4 py-3 border-b border-white/5">Risk</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {data.map((day) => {
                    const risk = day.risks?.[dataModal.type];
                    if (!risk) return null;
                    return (
                      <tr key={day.day} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-2.5 text-slate-300 font-mono">{day.fullDate}</td>

                        {dataModal.type === 'landslide' && (
                          <>
                            <td className="px-4 py-2.5 text-white font-bold">Rain: {day.weather.precipitation} mm</td>
                            <td className={`px-4 py-2.5 font-bold ${risk.level === 'HIGH' ? 'text-red-400' : risk.level === 'MODERATE' ? 'text-yellow-400' : 'text-green-400'}`}>
                              {risk.level} ({risk.probability})
                            </td>
                          </>
                        )}

                        {dataModal.type === 'flood' && (
                          <>
                            <td className="px-4 py-2.5 text-slate-300 font-bold">Rain: {day.weather.precipitation} mm</td>
                            <td className="px-4 py-2.5 text-slate-300">3-Day: {day.weather.rain_3day} mm</td>
                            <td className="px-4 py-2.5 text-slate-300">Temp: {day.weather.tempMax} °C</td>
                            <td className="px-4 py-2.5 text-slate-300">Humidity: {day.weather.humidity} %</td>
                            <td className={`px-4 py-2.5 font-bold ${risk.level === 'HIGH' ? 'text-red-400' : risk.level === 'MODERATE' ? 'text-yellow-400' : 'text-green-400'}`}>
                              {risk.level} ({risk.probability})
                            </td>
                          </>
                        )}

                        {dataModal.type === 'thunderstorm' && (
                          <>
                            <td className="px-4 py-2.5 text-white font-bold">CAPE: {day.weather.cape}</td>
                            <td className="px-4 py-2.5 text-slate-300">Rain: {day.weather.precipitation}mm</td>
                            <td className="px-4 py-2.5 text-slate-300">Temp: {day.weather.tempMax}°C</td>
                            <td className="px-4 py-2.5 text-slate-300">Dew: {day.weather.dewpoint}°C</td>
                            <td className="px-4 py-2.5 text-slate-300">Press: {day.weather.pressure}(hPa)</td>
                            <td className="px-4 py-2.5 text-slate-300">Wind: {day.weather.windSpeed}(km/h)</td>
                            <td className="px-4 py-2.5 font-mono text-brand-300">Prob: {risk.probability}</td>
                            <td className={`px-4 py-2.5 font-bold ${risk.level === 'HIGH' ? 'text-red-400' : risk.level === 'MODERATE' ? 'text-yellow-400' : 'text-green-400'}`}>
                              Risk: {risk.level}
                            </td>
                          </>
                        )}

                        {dataModal.type === 'windstorm' && (
                          <>
                            <td className="px-4 py-2.5 text-white font-bold">Wind: {day.weather.windSpeed} km/h</td>
                            <td className="px-4 py-2.5 text-slate-300">3-Day: {day.weather.wind_3day || 'N/A'}</td>
                            <td className="px-4 py-2.5 text-slate-300">Temp: {day.weather.tempMax}°C</td>
                            <td className="px-4 py-2.5 text-slate-300">Hum: {day.weather.humidity}%</td>
                            <td className="px-4 py-2.5 font-mono text-brand-300">Prob: {risk.probability}</td>
                            <td className={`px-4 py-2.5 font-bold ${risk.level === 'HIGH' ? 'text-red-400' : risk.level === 'MODERATE' ? 'text-yellow-400' : 'text-green-400'}`}>
                              Risk: {risk.level}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-between items-center text-xs text-slate-400 italic">
              <p>Source: Open-Meteo Weather API (16-Day Forecast Model)</p>
              <button
                onClick={() => setDataModal({ isOpen: false, type: '' })}
                className="px-6 py-2 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-colors"
              >
                Close Data View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Tips Modal */}
      {tipsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="glass-card w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">{DISASTER_ICONS[tipsModal.disaster]}</span>
              Safety Precautions
            </h3>
            <div className="space-y-3 mb-6">
              {getSafetyTips(tipsModal.disaster).map((tip, i) => (
                <div key={i} className="flex gap-3 text-sm text-slate-300 bg-slate-800/40 p-3 rounded-lg border border-white/5">
                  <span className="text-brand-400 font-bold shrink-0">{i + 1}.</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setTipsModal({ isOpen: false, disaster: '' })}
              className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-500 transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}


    </section>
  );
}
