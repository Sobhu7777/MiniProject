import { useState, useEffect } from 'react';
import { fetchPlaceInfo } from '../services/api';
import { TOURIST_SPOTS } from '../data/touristSpots';

export default function PlaceInfo({ place, onBack }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPlaceInfo(place).then((result) => {
      setInfo(result);
      setLoading(false);
    });
  }, [place]);

  const spots = TOURIST_SPOTS[place] || [];

  return (
    <section className="fade-in max-w-4xl mx-auto px-4">
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
        <h2 className="text-3xl font-bold text-white tracking-tight">
          ℹ️ About — <span className="text-brand-300">{place}</span>
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-16 h-16 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-slate-400 animate-pulse">Gathering local details...</p>
        </div>
      ) : (
        <div className="space-y-8 pb-12">
          {/* Overview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-8 border-none bg-slate-900/60 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-400">📍</span> Overview
              </h3>
              <p className="text-base text-slate-300 leading-relaxed italic">
                "{info.description}"
              </p>

              <div className="mt-8">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Highlights</h4>
                <div className="flex flex-wrap gap-2">
                  {info.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 px-4 py-2 rounded-xl"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { icon: '🗓️', label: 'Best Time to Visit', value: info.bestTime, color: 'text-orange-400' },
                { icon: '⛰️', label: 'Elevation', value: info.elevation, color: 'text-blue-400' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-6 border-none bg-slate-900/40">
                  <span className="text-3xl block mb-2">{stat.icon}</span>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Tourist Spots Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-yellow-500 animate-pulse">🏆</span> Top Tourist Attractions
              </h3>
              <span className="text-sm text-slate-500 font-medium">Recommended for your visit</span>
            </div>

<<<<<<< HEAD
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
=======
            {spots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spots.map((spot, idx) => (
                  <div
                    key={idx}
                    className="glass-card flex flex-col border-none bg-slate-900/40 hover:bg-slate-800/60 transition-all duration-300 group overflow-hidden"
                  >
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-500/20 text-brand-300 font-black text-sm border border-brand-500/30">
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                          <span className="text-yellow-400 text-xs">⭐</span>
                          <span className="text-yellow-400 text-xs font-bold">{spot.rating}</span>
                        </div>
                      </div>

                      <h4 className="text-lg font-bold text-white mb-4 group-hover:text-brand-300 transition-colors">
                        {spot.name}
                      </h4>

                      <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 flex items-center gap-2 uppercase tracking-tighter">
                            <span className="text-green-500">🕐</span> Opening Time
                          </span>
                          <span className="text-slate-200 font-bold">{spot.open}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 flex items-center gap-2 uppercase tracking-tighter">
                            <span className="text-red-500">🕓</span> Closing Time
                          </span>
                          <span className="text-slate-200 font-bold">{spot.close}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={spot.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-brand-600/10 hover:bg-brand-600 text-brand-300 hover:text-white 
                                 text-xs font-bold uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 border-t border-white/5"
                    >
                      <span>View on Google Maps</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center bg-slate-900/40 border-dashed border-slate-700">
                <p className="text-slate-500">No tourist attraction data found for this location.</p>
              </div>
            )}
>>>>>>> 159e84c (done monthly , daily api  place info)
          </div>
        </div>
      )}
    </section>
  );
}
