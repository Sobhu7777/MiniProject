import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { fetchPredictions, MONTHS } from '../data/mockData';

const RISK_COLORS = { Low: '#22c55e', Medium: '#eab308', High: '#ef4444' };
const DISASTER_ICONS = { thunderstorm: '⛈️', windstorm: '🌪️', flood: '🌊', landslide: '🏔️' };
const DISASTER_LABELS = { thunderstorm: 'Thunderstorm', windstorm: 'Windstorm', flood: 'Flood', landslide: 'Landslide' };

function RiskBadge({ level }) {
  const styles = {
    Low:    'bg-green-500/20 text-green-400 border-green-500/40',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    High:   'bg-red-500/20 text-red-400 border-red-500/40',
  };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${styles[level]}`}>
      {level} Risk
    </span>
  );
}

function MiniPieChart({ title, icon, probability, level }) {
  const data = [
    { name: 'Risk',  value: Math.round(probability * 100) },
    { name: 'Safe',  value: Math.round((1 - probability) * 100) },
  ];

  return (
    <div className="glass-card p-4 flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="font-semibold text-sm text-white">{title}</span>
      </div>
      <div className="w-full h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={RISK_COLORS[level]} />
              <Cell fill="#334155" />
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(value) => [`${value}%`]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <RiskBadge level={level} />
      <span className="text-xs text-slate-400">{Math.round(probability * 100)}% probability</span>
    </div>
  );
}

export default function PredictionDashboard({ place, onBack }) {
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // TODO: Replace with real API call → fetch(`/api/predict?place=${place}&month=${selectedMonth}`)
    fetchPredictions(place, selectedMonth).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [place, selectedMonth]);

  const isLive = selectedMonth === currentMonth;

  // Cumulative pie data
  const cumulativeData = data
    ? Object.entries(data.risks)
        .filter(([key]) => key !== 'cumulative')
        .map(([key, val]) => ({
          name: DISASTER_LABELS[key],
          value: Math.round(val.probability * 100),
          color: RISK_COLORS[val.level],
        }))
    : [];

  return (
    <section className="fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand-300 transition-colors mb-2"
            id="back-from-prediction"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            📅 Disaster Prediction — <span className="text-brand-300">{place}</span>
            {isLive && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-1 rounded-full pulse-glow">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                LIVE DATA
              </span>
            )}
          </h2>
        </div>

        {/* Month selector */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors cursor-pointer"
          id="month-selector"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i}>{m}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Cumulative Risk Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-1">Cumulative Risk Overview</h3>
            <p className="text-xs text-slate-400 mb-4">
              Combined risk for {MONTHS[selectedMonth]} — Overall: <RiskBadge level={data.risks.cumulative.level} />
            </p>
            <div className="h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cumulativeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  >
                    {cumulativeData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '10px', fontSize: '13px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    formatter={(value) => [`${value}%`, 'Risk']}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Individual disaster charts */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(data.risks)
              .filter(([key]) => key !== 'cumulative')
              .map(([key, val]) => (
                <MiniPieChart
                  key={key}
                  title={DISASTER_LABELS[key]}
                  icon={DISASTER_ICONS[key]}
                  probability={val.probability}
                  level={val.level}
                />
              ))}
          </div>

          {/* Safety Panel */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              🛡️ Safety Precautions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.safety).map(([key, measures]) => {
                const level = data.risks[key].level;
                const borderColor = level === 'High' ? 'border-red-500/40' : level === 'Medium' ? 'border-yellow-500/40' : 'border-green-500/40';
                return (
                  <div key={key} className={`border-l-4 ${borderColor} bg-slate-800/50 rounded-r-xl p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{DISASTER_ICONS[key]}</span>
                      <span className="font-semibold text-sm text-white">{DISASTER_LABELS[key]}</span>
                      <RiskBadge level={level} />
                    </div>
                    <ul className="space-y-1.5">
                      {measures.map((m, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-brand-400 mt-0.5">•</span>
                          {m}
                        </li>
                      ))}
                    </ul>
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
