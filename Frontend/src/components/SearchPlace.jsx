import { useState, useEffect, useRef } from 'react';
import { searchPlace } from '../services/api';

export default function SearchPlace({ onSelectPlace }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setIsSearching(true);
                const searchResults = await searchPlace(query);
                setResults(searchResults);
                setIsSearching(false);
                setShowDropdown(true);
            } else {
                setResults([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (result) => {
        onSelectPlace(result);
        setQuery('');
        setShowDropdown(false);
    };

    return (
        <div className="relative w-full max-w-xl mx-auto mb-12 z-[60]" ref={dropdownRef}>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    className="w-full bg-surface-card/80 backdrop-blur-xl border border-surface-border/30 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all shadow-2xl"
                    placeholder="Search for a place (e.g. Munnar, Manali, Mumbai)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
                />
                {isSearching && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <div className="w-4 h-4 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {showDropdown && (
                <div className="absolute w-full mt-3 bg-surface-card/95 backdrop-blur-2xl border border-surface-border/50 rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-[70] slide-down">
                    {results.length > 0 ? (
                        <div className="p-2">
                            {results.map((result, idx) => (
                                <button
                                    key={`${result.place}-${idx}`}
                                    onClick={() => handleSelect(result)}
                                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group flex items-start gap-3"
                                >
                                    <span className="text-xl mt-0.5">📍</span>
                                    <div>
                                        <div className="font-semibold text-white group-hover:text-brand-300 transition-colors">{result.place}</div>
                                        <div className="text-xs text-slate-500">{result.state} • {result.region.name}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : query.trim().length >= 2 && !isSearching ? (
                        <div className="p-6 text-center">
                            <span className="text-3xl block mb-2">🚧</span>
                            <p className="text-slate-300 font-medium">Place currently not available</p>
                            <p className="text-xs text-slate-500 mt-1">Will be added in future, thank you for your patience!</p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
