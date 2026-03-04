import { useState, useEffect } from 'react';
import { fetchPlaces } from '../services/api';


export default function PlaceSelector({ state, onSelect, onBack }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // TODO: Replace with real API call → fetch(`/api/places?state=${encodeURIComponent(state)}`)
    fetchPlaces(state).then((data) => {
      setPlaces(data);
      setLoading(false);
    });
  }, [state]);

  return (
    <section className="fade-in">
      <div className="text-center mb-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand-300 transition-colors mb-4"
          id="back-to-states"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to States
        </button>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
          {state}
        </h2>
        <p className="text-slate-400 mt-2 text-sm">Choose a tourist destination</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {places.map((place, idx) => (
            <button
              key={place}
              onClick={() => onSelect(place)}
              className="selector-card group slide-up"
              style={{ animationDelay: `${idx * 60}ms` }}
              id={`place-${place.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">📍</span>
                <span className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                  {place}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
