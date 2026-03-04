import { useState } from 'react';
import { REGIONS } from '../services/api';

export default function RegionSelector({ onSelect }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section className="fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
          Select Your Region
        </h2>
        <p className="text-slate-400 mt-2 text-sm">Choose a region to explore safe tourist destinations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {REGIONS.map((region, idx) => (
          <button
            key={region.id}
            onClick={() => onSelect(region)}
            onMouseEnter={() => setHoveredId(region.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="selector-card group"
            style={{ animationDelay: `${idx * 80}ms` }}
            id={`region-${region.id}`}
          >
            <span className={`text-4xl block mb-2 transition-transform duration-300 ${hoveredId === region.id ? 'scale-125' : ''}`}>
              {region.icon}
            </span>
            <span className="font-semibold text-white group-hover:text-brand-300 transition-colors">
              {region.name}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">{region.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
