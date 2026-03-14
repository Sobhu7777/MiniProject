import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Bar, XAxis, YAxis, CartesianGrid, Area, ComposedChart, Legend } from 'recharts';
import { fetchWeatherForecast, fetchDisasterGraph } from '../services/api';

const DISASTER_ICONS = { thunderstorm: '⛈️', windstorm: '🌪️', flood: '🌊', landslide: '🏔️' };
const DISASTER_LABELS = { thunderstorm: 'Thunderstorm', windstorm: 'Windstorm', flood: 'Flood', landslide: 'Landslide' };
const RISK_COLORS = { LOW: '#22c55e', MODERATE: '#eab308', HIGH: '#ef4444' };

function RiskBadge({ level }) {
  const styles = {
    LOW: 'bg-green-500/20 text-green-400 border-green-500/40',
    MODERATE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/40',
  };
  const displayLevel = level.charAt(0) + level.slice(1).toLowerCase();
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${styles[level]}`}>
      {displayLevel}
    </span>
  );
}

function DailyRiskPieChart({ risks }) {
  const chartData = Object.entries(risks)
    .map(([key, val]) => ({
      name: DISASTER_LABELS[key],
      value: Math.round(val.probability * 100),
      color: RISK_COLORS[val.level],
    }))
    .filter(item => item.value > 0);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#94a3b8"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-[9px] font-medium"
      >
        {`${name}: ${value}%`}
      </text>
    );
  };

  return (
    <div className="h-40 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={18}
            outerRadius={35}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
            label={renderCustomLabel}
            labelLine={{ stroke: '#475569', strokeWidth: 1 }}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '9px' }}
            itemStyle={{ color: '#e2e8f0', padding: '0px' }}
            formatter={(value) => [`${value}%`]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function WeatherForecast({ place, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [graphModal, setGraphModal] = useState({
    isOpen: false, type: '', title: '', variable: '', color: '',
    isProbability: true, matplotlibImage: null, loadingImage: false
  });
  const [dataModal, setDataModal] = useState({ isOpen: false, type: '' });
  const [dayTipsModal, setDayTipsModal] = useState({ isOpen: false, dayData: null });

  useEffect(() => {
    setLoading(true);
    fetchWeatherForecast(place).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [place]);

  const openGraph = async (type, forceProbability = true) => {
    const configs = {
      landslide: { title: '16-Day Rainfall Trend', variable: 'precipitation', color: '#38bdf8', unit: 'mm' },
      flood: { title: '3-Day Rainfall Trend', variable: 'rain_3day', color: '#0ea5e9', unit: 'mm' },
      thunderstorm: { title: '16-Day CAPE Trend', variable: 'cape', color: '#f59e0b', unit: 'J/kg' },
      windstorm: { title: '16-Day Wind Speed Trend', variable: 'windSpeed', color: '#10b981', unit: 'km/h' }
    };

    const config = configs[type];
    setGraphModal({
      ...config,
      isOpen: true,
      type,
      isProbability: forceProbability,
      matplotlibImage: null,
      loadingImage: forceProbability
    });

    if (forceProbability) {
      try {
        const image = await fetchDisasterGraph(place, type);
        setGraphModal(prev => ({ ...prev, matplotlibImage: image, loadingImage: false }));
      } catch (err) {
        console.error("Failed to load disaster graph", err);
        setGraphModal(prev => ({ ...prev, loadingImage: false }));
      }
    }
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
    <section className="fade-in max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
          <p className="text-slate-400 mt-1 max-w-2xl text-sm">
            Integrated 16-day forecast with horizontal risk overview and per-day safety precautions.
          </p>
        </div>
      </div>

      {!loading && (
        <div className="mb-8 space-y-6 bg-slate-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="text-brand-500">📈</span> View Trends (Graphs)
              </h4>
              <div className="flex flex-wrap gap-3">
                {Object.entries(DISASTER_ICONS).map(([key, icon]) => (
                  <button
                    key={`graph-${key}`}
                    onClick={() => openGraph(key)}
                    className="px-4 py-2 bg-slate-800/50 hover:bg-brand-500/20 rounded-xl border border-white/5 transition-all text-xs flex items-center gap-2 text-slate-300 hover:text-white"
                  >
                    <span>{icon}</span>
                    <span className="capitalize">{key}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="text-brand-500">📑</span> View Detailed Data
              </h4>
              <div className="flex flex-wrap gap-3">
                {Object.entries(DISASTER_ICONS).map(([key, icon]) => (
                  <button
                    key={`data-${key}`}
                    onClick={() => setDataModal({ isOpen: true, type: key })}
                    className="px-4 py-2 bg-slate-800/50 hover:bg-brand-500/20 rounded-xl border border-white/5 transition-all text-xs flex items-center gap-2 text-slate-300 hover:text-white"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {data.map((day) => (
            <div
              key={day.day}
              className="glass-card p-4 border-surface-border/20 flex flex-col hover:border-brand-500/30 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-2">
                <div>
                  <span className="text-brand-400 font-medium text-[10px]">Day {day.day}</span>
                  <p className="text-sm font-bold text-white leading-none mt-1">{day.date}</p>
                </div>
              </div>

              {/* Horizontal Disaster Risk Layout - Forced single row */}
              <div className="flex flex-nowrap gap-1 mb-4 justify-between overflow-x-auto no-scrollbar">
                {Object.entries(day.risks).map(([key, risk]) => (
                  <div key={key} className="flex flex-col items-center p-1 rounded-lg bg-slate-800/30 border border-white/5 flex-1 min-w-[55px]">
                    <span className="text-[10px] mb-1">{DISASTER_ICONS[key]}</span>
                    <RiskBadge level={risk.level} />
                  </div>
                ))}
              </div>

              <div className="mt-auto space-y-3">
                <button
                  onClick={() => setDayTipsModal({ isOpen: true, dayData: day })}
                  className="w-full py-2 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-xl text-[10px] font-bold text-brand-300 transition-colors flex items-center justify-center gap-2"
                >
                  🛡️ View Precaution
                </button>

                <div className="border-t border-white/5 pt-2">
                  <DailyRiskPieChart risks={day.risks} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Day Precautions Modal */}
      {dayTipsModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md fade-in">
          <div className="glass-card w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setDayTipsModal({ isOpen: false, dayData: null })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-white mb-2">
              🛡️ Precautions - Day {dayTipsModal.dayData?.day}
            </h3>
            <p className="text-slate-400 text-xs mb-6">{dayTipsModal.dayData?.date}</p>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(dayTipsModal.dayData?.risks || {}).map(([type, risk]) => (
                (risk.level === 'MODERATE' || risk.level === 'HIGH') && (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <span className="text-xl">{DISASTER_ICONS[type]}</span>
                      <h4 className="text-sm font-bold text-white capitalize">{type} Precautions</h4>
                      <RiskBadge level={risk.level} />
                    </div>
                    {getSafetyTips(type).map((tip, i) => (
                      <div key={i} className="flex gap-3 text-xs text-slate-300 bg-slate-800/40 p-3 rounded-lg border border-white/5">
                        <span className="text-brand-400 font-bold shrink-0">{i + 1}.</span>
                        <p>{tip}</p>
                      </div>
                    ))}
                  </div>
                )
              ))}
              {Object.values(dayTipsModal.dayData?.risks || {}).every(r => r.level === 'LOW') && (
                <div className="text-center py-8">
                  <span className="text-4xl mb-3 block">✅</span>
                  <p className="text-sm text-slate-400">All disaster risks are LOW. Regular safety protocols apply.</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setDayTipsModal({ isOpen: false, dayData: null })}
              className="w-full mt-8 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-500 transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
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
              {DISASTER_ICONS[graphModal.type]} {graphModal.isProbability ? `${graphModal.type.charAt(0).toUpperCase() + graphModal.type.slice(1)} Risk Probability (Matplotlib)` : graphModal.title}
            </h3>

            <div className="min-h-[320px] w-full bg-slate-900/40 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center">
              {graphModal.isProbability ? (
                graphModal.loadingImage ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                    <p className="text-xs text-slate-500">Generating Matplotlib Plot...</p>
                  </div>
                ) : graphModal.matplotlibImage ? (
                  <img
                    src={`data:image/png;base64,${graphModal.matplotlibImage}`}
                    alt="Disaster Plot"
                    className="max-w-full h-auto rounded-lg shadow-2xl border border-white/10"
                  />
                ) : (
                  <p className="text-slate-400">Failed to load matplotlib plot.</p>
                )
              ) : (
                <div className="h-80 w-full">
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
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => openGraph(graphModal.type, true)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${graphModal.isProbability
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-slate-800 text-slate-400 border-white/5 hover:bg-slate-700'
                  }`}
              >
                📊 Risk Probability
              </button>

              <button
                onClick={() => openGraph(graphModal.type, false)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${!graphModal.isProbability
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-slate-800 text-slate-400 border-white/5 hover:bg-slate-700'
                  }`}
              >
                {graphModal.type === 'thunderstorm' && '⚡ View CAPE Trend'}
                {graphModal.type === 'windstorm' && '💨 View Wind Speed Trend'}
                {graphModal.type === 'flood' && '🌊 View 3-Day Rainfall Trend'}
                {graphModal.type === 'landslide' && '🌧️ View 16-Day Rainfall Trend'}
              </button>
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
                  <tr className="bg-slate-800/80 text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3 border-b border-white/5">Date</th>
                    <th className="px-4 py-3 border-b border-white/5">Prob</th>
                    <th className="px-4 py-3 border-b border-white/5">Risk</th>
                    {dataModal.type === 'landslide' && (
                      <th className="px-4 py-3 border-b border-white/5">Precip (mm)</th>
                    )}
                    {dataModal.type === 'flood' && (
                      <>
                        <th className="px-4 py-3 border-b border-white/5">Precip (mm)</th>
                        <th className="px-4 py-3 border-b border-white/5">3-Day Rain (mm)</th>
                        <th className="px-4 py-3 border-b border-white/5">Temp (°C)</th>
                        <th className="px-4 py-3 border-b border-white/5">Humidity (%)</th>
                      </>
                    )}
                    {dataModal.type === 'thunderstorm' && (
                      <>
                        <th className="px-4 py-3 border-b border-white/5">Temp (°C)</th>
                        <th className="px-4 py-3 border-b border-white/5">Dewpt (°C)</th>
                        <th className="px-4 py-3 border-b border-white/5">Pressure (hPa)</th>
                        <th className="px-4 py-3 border-b border-white/5">Wind (km/h)</th>
                        <th className="px-4 py-3 border-b border-white/5">Precip (mm)</th>
                        <th className="px-4 py-3 border-b border-white/5">CAPE (J/kg)</th>
                      </>
                    )}
                    {dataModal.type === 'windstorm' && (
                      <>
                        <th className="px-4 py-3 border-b border-white/5">Wind Max (km/h)</th>
                        <th className="px-4 py-3 border-b border-white/5">3-Day Wind (km/h)</th>
                        <th className="px-4 py-3 border-b border-white/5">Temp (°C)</th>
                        <th className="px-4 py-3 border-b border-white/5">Humidity (%)</th>
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
                        <td className="px-4 py-2.5 text-slate-300 font-mono whitespace-nowrap">{day.fullDate}</td>
                        <td className="px-4 py-2.5 font-mono text-brand-300">{risk.probability}</td>
                        <td className="px-4 py-2.5">
                          <RiskBadge level={risk.level} />
                        </td>
                        {dataModal.type === 'landslide' && (
                          <td className="px-4 py-2.5 text-slate-300">{day.weather.precipitation}</td>
                        )}
                        {dataModal.type === 'flood' && (
                          <>
                            <td className="px-4 py-2.5 text-slate-300">{day.weather.precipitation}</td>
                            <td className="px-4 py-2.5 text-slate-300">{day.weather.rain_3day}</td>
                            <td className="px-4 py-2.5 text-slate-300">{day.weather.tempMax}</td>
                            <td className="px-4 py-2.5 text-slate-300">{day.weather.humidity}</td>
                          </>
                        )}
                        {dataModal.type === 'thunderstorm' && (
                          <>
                            <td className="px-4 py-2.5 text-slate-300">{day.weather.tempMax}</td>
                            <td className="px-4 py-2.5 text-slate-300">{day.weather.dewpoint}</td>
                            <td className="px-4 py-2.5 text-slate-300">{day.weather.pressure}</td>
                            <td className="px-4 py-2.5 text-slate-300">{day.weather.windSpeed}</td>
                            <td className="px-4 py-2.5 text-slate-300">{day.weather.precipitation}</td>
                            <td className="px-4 py-2.5 text-slate-300">{day.weather.cape}</td>
                          </>
                        )}
                        {dataModal.type === 'windstorm' && (
                          <>
                            <td className="px-4 py-2.5 text-slate-300">{day.weather.windSpeed}</td>
                            <td className="px-4 py-2.5 text-slate-300">{day.weather.wind_3day}</td>
                            <td className="px-4 py-2.5 text-slate-300">{day.weather.tempMax}</td>
                            <td className="px-4 py-2.5 text-slate-300">{day.weather.humidity}</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-between items-center text-[10px] text-slate-400 italic">
              <p>Model Source: AEDP-16 Forecast</p>
              <button
                onClick={() => setDataModal({ isOpen: false, type: '' })}
                className="px-6 py-2 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
