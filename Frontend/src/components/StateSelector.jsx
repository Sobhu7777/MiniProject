import { useState, useEffect } from 'react';
import { fetchStates } from '../services/api';

export default function StateSelector({ region, onSelect, onBack }) {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // TODO: Replace with real API call → fetch(`/api/states?region=${region.id}`)
    fetchStates(region.id).then((data) => {
      setStates(data);
      setLoading(false);
    });
  }, [region.id]);

  return (
    <section className="fade-in">
      <div className="text-center mb-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand-300 transition-colors mb-4"
          id="back-to-regions"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Regions
        </button>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
          {region.icon} {region.name}
        </h2>
        <p className="text-slate-400 mt-2 text-sm">Select a state to continue</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {states.map((state, idx) => (
            <button
              key={state}
              onClick={() => onSelect(state)}
              className="selector-card group slide-up"
              style={{ animationDelay: `${idx * 60}ms` }}
              id={`state-${state.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <span className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                {state}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
