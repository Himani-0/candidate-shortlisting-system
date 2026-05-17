// frontend/src/pages/MatchPage.jsx
import React, { useState } from "react";
import { matchAPI } from "../services/api";
import { MatchBadge, ScoreBar, LoadingSpinner, EmptyState } from "../components/ui.jsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-lg p-3 text-xs shadow-xl">
        <p className="font-medium text-white mb-1">{label}</p>
        <p className="text-brand-400">Score: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function MatchPage() {
  const [form, setForm] = useState({ requiredSkills: "", preferredSkills: "", minExperience: "0", jobTitle: "Software Developer" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredSkills = form.requiredSkills.split(",").map((s) => s.trim()).filter((s) => s);
    if (requiredSkills.length === 0) { toast.error("Enter at least one required skill"); return; }

    setLoading(true);
    try {
      const res = await matchAPI.match({
        requiredSkills,
        preferredSkills: form.preferredSkills.split(",").map((s) => s.trim()).filter((s) => s),
        minExperience: Number(form.minExperience),
      });
      setResults(res.data);
      toast.success(`Matched ${res.data.data.length} candidates!`);
    } catch (err) {
      toast.error(err.message || "Matching failed");
    } finally {
      setLoading(false);
    }
  };

  const chartData = results?.data?.slice(0, 8).map((c) => ({ name: c.name.split(" ")[0], score: c.matchScore }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-white text-2xl mb-1">Skill Matching</h1>
        <p className="text-sm text-gray-500">Enter job requirements to rank candidates</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2"><span className="text-brand-400">◎</span> Job Requirements</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Job Title</label>
                <input type="text" value={form.jobTitle} onChange={(e) => setForm((p) => ({ ...p, jobTitle: e.target.value }))} placeholder="Full Stack Developer" className="input" />
              </div>
              <div>
                <label className="label">Required Skills *</label>
                <input type="text" value={form.requiredSkills} onChange={(e) => setForm((p) => ({ ...p, requiredSkills: e.target.value }))} placeholder="React, Node.js, MongoDB" className="input" />
                <p className="text-xs text-gray-600 mt-1">Comma-separated · 70pts weight</p>
                {form.requiredSkills && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.requiredSkills.split(",").map((s, i) => s.trim() ? <span key={i} className="skill-pill">{s.trim()}</span> : null)}
                  </div>
                )}
              </div>
              <div>
                <label className="label">Preferred Skills</label>
                <input type="text" value={form.preferredSkills} onChange={(e) => setForm((p) => ({ ...p, preferredSkills: e.target.value }))} placeholder="TypeScript, Docker" className="input" />
                <p className="text-xs text-gray-600 mt-1">Bonus points · 20pts weight</p>
              </div>
              <div>
                <label className="label">Min Experience (Years)</label>
                <input type="number" value={form.minExperience} onChange={(e) => setForm((p) => ({ ...p, minExperience: e.target.value }))} min="0" className="input" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? <><div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />Matching...</> : "◎ Run Match"}
              </button>
            </form>
            <div className="mt-5 pt-4 border-t border-surface-border">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Score Breakdown</p>
              {[["Required Skills", "70 pts"], ["Preferred Skills", "20 pts"], ["Experience", "10 pts"]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>{k}</span><span className="font-mono text-gray-300">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {loading ? <LoadingSpinner text="Analyzing candidates..." /> : !results ? (
            <EmptyState icon="◎" title="No results yet" message="Fill in requirements and click 'Run Match'" />
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="card bg-gradient-to-r from-brand-500/10 to-purple-500/10 border-brand-500/20">
                <div className="flex flex-wrap gap-6">
                  {[["Total", results.summary.totalCandidates, "text-white"], ["High Match", results.summary.highMatch, "text-emerald-400"], ["Medium", results.summary.mediumMatch, "text-amber-400"], ["Low", results.summary.lowMatch, "text-red-400"]].map(([label, val, color]) => (
                    <div key={label}><div className={`text-2xl font-display font-bold ${color}`}>{val}</div><div className="text-xs text-gray-400">{label}</div></div>
                  ))}
                </div>
              </div>

              {chartData && chartData.length > 0 && (
                <div className="card">
                  <h3 className="font-display font-semibold text-white text-sm mb-4">Score Chart (Top 8)</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                      <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="score" fill="#4f63ff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="space-y-3">
                {results.data.map((c, i) => (
                  <div key={c._id} className="card animate-slide-up">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface flex items-center justify-center font-mono text-xs font-bold text-gray-500 border border-surface-border">#{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-display font-semibold text-white">{c.name}</h3>
                            <p className="text-xs text-gray-500">{c.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-surface px-2 py-1 rounded-md text-gray-400 border border-surface-border">{c.experience}y</span>
                            <MatchBadge tier={c.matchTier} />
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Match Score</span>
                            <span className={c.matchScore >= 75 ? "text-emerald-400" : c.matchScore >= 45 ? "text-amber-400" : "text-red-400"}>{c.matchScore}%</span>
                          </div>
                          <ScoreBar score={c.matchScore} showLabel={false} />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {c.matchedRequired.map((s) => <span key={s} className="skill-pill-match">✓ {s}</span>)}
                          {c.skills.filter((s) => !c.matchedRequired.map((r) => r.toLowerCase()).includes(s.toLowerCase())).slice(0, 2).map((s) => <span key={s} className="skill-pill opacity-50">{s}</span>)}
                        </div>
                        <div className="mt-2 text-xs">
                          {c.meetsExperience ? (
                            <span className="text-emerald-400">✓ Meets experience requirement</span>
                          ) : (
                            <span className="text-amber-400">⚠ {c.experience}y exp (needs {results.summary.jobRequirements.minExperience}y)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
