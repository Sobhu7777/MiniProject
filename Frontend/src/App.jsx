import { useState } from 'react';
import RegionSelector from './components/RegionSelector';
import StateSelector from './components/StateSelector';
import PlaceSelector from './components/PlaceSelector';
import ActionButtons from './components/ActionButtons';
import PredictionDashboard from './components/PredictionDashboard';
import WeatherForecast from './components/WeatherForecast';
import PlaceInfo from './components/PlaceInfo';

export default function App() {
  // Selection state
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // View state: 'selection' | 'prediction' | 'weather' | 'placeInfo'
  const [activeView, setActiveView] = useState('selection');

  // ── Breadcrumb helpers ──
  const breadcrumbs = [
    selectedRegion && selectedRegion.name,
    selectedState,
    selectedPlace,
  ].filter(Boolean);

  // ── Navigation handlers ──
  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    setSelectedState(null);
    setSelectedPlace(null);
    setActiveView('selection');
  };

  const handleSelectState = (state) => {
    setSelectedState(state);
    setSelectedPlace(null);
    setActiveView('selection');
  };

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    setActiveView('selection');
  };

  const handleAction = (view) => {
    setActiveView(view);
  };

  const handleBackToRegions = () => {
    setSelectedRegion(null);
    setSelectedState(null);
    setSelectedPlace(null);
    setActiveView('selection');
  };

  const handleBackToStates = () => {
    setSelectedState(null);
    setSelectedPlace(null);
    setActiveView('selection');
  };

  const handleBackToPlaces = () => {
    setSelectedPlace(null);
    setActiveView('selection');
  };

  const handleBackToActions = () => {
    setActiveView('selection');
  };

  const handleReset = () => {
    setSelectedRegion(null);
    setSelectedState(null);
    setSelectedPlace(null);
    setActiveView('selection');
  };

  // ── Determine which selection step to show ──
  const selectionStep = !selectedRegion
    ? 'region'
    : !selectedState
      ? 'state'
      : !selectedPlace
        ? 'place'
        : 'actions';

  return (
    <div className="min-h-screen bg-surface text-slate-200">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-surface-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-600/20">
              <span className="text-lg">🛡️</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">TravelSafe</h1>
              <p className="text-[10px] text-slate-500 -mt-0.5">Multi-Disaster Risk Prediction</p>
            </div>
          </div>

          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && (
                    <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  <span className={i === breadcrumbs.length - 1 ? 'text-brand-300 font-semibold' : ''}>
                    {crumb}
                  </span>
                </span>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Dashboard views */}
        {activeView === 'prediction' && selectedPlace && (
          <PredictionDashboard place={selectedPlace} onBack={handleBackToActions} />
        )}
        {activeView === 'weather' && selectedPlace && (
          <WeatherForecast place={selectedPlace} onBack={handleBackToActions} />
        )}
        {activeView === 'placeInfo' && selectedPlace && (
          <PlaceInfo place={selectedPlace} onBack={handleBackToActions} />
        )}

        {/* Selection flow */}
        {activeView === 'selection' && (
          <>
            {selectionStep === 'region' && (
              <RegionSelector onSelect={handleSelectRegion} />
            )}
            {selectionStep === 'state' && (
              <StateSelector region={selectedRegion} onSelect={handleSelectState} onBack={handleBackToRegions} />
            )}
            {selectionStep === 'place' && (
              <PlaceSelector state={selectedState} onSelect={handleSelectPlace} onBack={handleBackToStates} />
            )}
            {selectionStep === 'actions' && (
              <ActionButtons place={selectedPlace} onAction={handleAction} onBack={handleBackToPlaces} />
            )}
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-surface-border/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} TravelSafe — Multi-Disaster Risk Prediction System
          </p>
          <p className="text-[10px] text-slate-700">
            Data is for educational purposes only. Always consult official sources before travelling.
          </p>
        </div>
      </footer>
    </div>
  );
}
