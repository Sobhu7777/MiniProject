import { useState, useEffect } from 'react';
import { fetchPlaceInfo } from '../services/api';

export default function PlaceInfo({ place, onBack }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // TODO: Replace with real API call → fetch(`/api/place-info?place=${place}`)
    fetchPlaceInfo(place).then((result) => {
      setInfo(result);
      setLoading(false);
    });
  }, [place]);

  return (
    <section className="fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand-300 transition-colors mb-2"
          id="back-from-placeinfo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h2 className="text-2xl font-bold text-white">
          ℹ️ About — <span className="text-brand-300">{place}</span>
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-3">Overview</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{info.description}</p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-4 mt-5">
              {[
                { icon: '🗓️', label: 'Best Time', value: info.bestTime },
                { icon: '⛰️', label: 'Elevation', value: info.elevation },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 bg-slate-800/60 border border-surface-border/20 rounded-xl px-4 py-2">
                  <span className="text-lg">{stat.icon}</span>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-sm font-semibold text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-3">Highlights</h3>
            <div className="flex flex-wrap gap-2">
              {info.highlights.map((h) => (
                <span
                  key={h}
                  className="text-xs font-medium bg-brand-600/20 text-brand-300 border border-brand-500/30 px-3 py-1.5 rounded-full"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Top Tourist Spots */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">🏆 Top Tourist Spots</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {info.topSpots.map((spot, idx) => (
                <a
                  key={idx}
                  href={spot.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-slate-800/60 border border-surface-border/20 rounded-xl p-4
                             hover:border-brand-500/40 hover:bg-surface-hover/30 transition-all duration-200 group"
                  id={`spot-${idx}`}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600/20 text-brand-300 font-bold text-sm shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors">
                    {spot.name}
                  </span>
                  <svg className="w-4 h-4 text-slate-500 ml-auto group-hover:text-brand-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
