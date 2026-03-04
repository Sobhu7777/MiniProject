export default function ActionButtons({ place, onAction, onBack }) {
  const actions = [
    {
      id: 'prediction',
      icon: '📅',
      title: 'Disaster Prediction',
      description: 'Calendar-based risk analysis with pie charts',
      gradient: 'from-amber-500/20 to-orange-600/20',
      border: 'hover:border-amber-400/60',
    },
    {
      id: 'weather',
      icon: '🌦️',
      title: '16-Day Forecast',
      description: 'Weather trends, temperature & precipitation',
      gradient: 'from-sky-500/20 to-cyan-600/20',
      border: 'hover:border-sky-400/60',
    },
    {
      id: 'placeInfo',
      icon: 'ℹ️',
      title: 'Place Info',
      description: 'Top spots, highlights & travel tips',
      gradient: 'from-emerald-500/20 to-teal-600/20',
      border: 'hover:border-emerald-400/60',
    },
  ];

  return (
    <section className="fade-in">
      <div className="text-center mb-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand-300 transition-colors mb-4"
          id="back-to-places"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Places
        </button>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
          📍 {place}
        </h2>
        <p className="text-slate-400 mt-2 text-sm">What would you like to explore?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {actions.map((action, idx) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className={`btn-action bg-gradient-to-br ${action.gradient} ${action.border} slide-up`}
            style={{ animationDelay: `${idx * 120}ms` }}
            id={`action-${action.id}`}
          >
            <span className="text-5xl">{action.icon}</span>
            <span className="text-lg font-bold text-white">{action.title}</span>
            <span className="text-xs text-slate-400 text-center leading-relaxed">{action.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
