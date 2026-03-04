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
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              🏆 Top Tourist Spots
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {info.topSpots.map((spot, idx) => (
                <a
                  key={idx}
                  href={spot.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800/40 border border-surface-border/20 rounded-2xl p-5 hover:border-brand-500/40 transition-all duration-300 group block"
                  id={`spot-${idx}`}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600/20 text-brand-300 font-bold text-lg shrink-0">
                      {idx + 1}
                    </div>

                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h4 className="text-white font-bold group-hover:text-brand-300 transition-colors">
                          {spot.name}
                        </h4>
                        <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-lg text-xs font-bold border border-yellow-500/20">
                          ⭐ {spot.rating}
                        </div>
                      </div>

                      <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                        {spot.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="text-brand-400">🕒</span>
                          <span>Opens: {spot.openingTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-brand-400">🚪</span>
                          <span>Closes: {spot.closingTime}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-1 text-brand-400 group-hover:text-brand-300 font-semibold transition-colors">
                          View on Maps
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
