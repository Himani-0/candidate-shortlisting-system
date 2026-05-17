// frontend/src/components/ui.jsx
export function LoadingSpinner({ size = "md", text = "Loading..." }) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${sizes[size]} border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin`} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}

export function MatchBadge({ tier }) {
  const styles = {
    "High Match": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    "Medium Match": "bg-amber-500/15 text-amber-400 border-amber-500/30",
    "Low Match": "bg-red-500/15 text-red-400 border-red-500/30",
  };
  const icons = { "High Match": "▲", "Medium Match": "◆", "Low Match": "▼" };
  return (
    <span className={`badge border ${styles[tier] || styles["Low Match"]}`}>
      {icons[tier]} {tier}
    </span>
  );
}

export function ScoreBar({ score, showLabel = true }) {
  const color =
    score >= 75 ? "from-emerald-500 to-emerald-400"
    : score >= 45 ? "from-amber-500 to-amber-400"
    : "from-red-500 to-red-400";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-mono font-medium text-gray-300 w-10 text-right">{score}%</span>
      )}
    </div>
  );
}

export function EmptyState({ icon = "◎", title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4 text-gray-700">{icon}</div>
      <h3 className="text-lg font-display font-semibold text-gray-400 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 max-w-sm mb-6">{message}</p>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon, color = "brand" }) {
  const colors = {
    brand:   "from-brand-500/20 to-brand-600/10 border-brand-500/20 text-brand-400",
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400",
    amber:   "from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400",
    purple:  "from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400",
  };
  return (
    <div className={`card bg-gradient-to-br ${colors[color]} border animate-slide-up`}>
      <div className="text-2xl mb-3">{icon}</div>
      <div className="text-3xl font-display font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}
