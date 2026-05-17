// frontend/src/pages/AIPage.jsx
import React, { useState } from "react";
import { aiAPI } from "../services/api";
import { LoadingSpinner, EmptyState, ScoreBar } from "../components/ui.jsx";
import toast from "react-hot-toast";

export default function AIPage() {
  const [form, setForm] = useState({ jobTitle: "", requiredSkills: "", preferredSkills: "", minExperience: "0" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredSkills = form.requiredSkills.split(",").map((s) => s.trim()).filter((s) => s);
    if (requiredSkills.length === 0) { toast.error("Enter required skills"); return; }

    setLoading(true);
    setResults(null);
    try {
      const res = await aiAPI.shortlist({
        jobTitle: form.jobTitle || "Software Developer",
        requiredSkills,
        preferredSkills: form.preferredSkills.split(",").map((s) => s.trim()).filter((s) => s),
        minExperience: Number(form.minExperience),
      });
      setResults(res.data.data);
      toast.success("AI analysis complete!");
    } catch (err) {
      toast.error(err.message.includes("API key") ? "OpenRouter API key not set in backend .env" : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">✦</span>
          <h1 className="font-display font-bold text-white text-2xl">AI Shortlisting</h1>
        </div>
        <p className="text-sm text-gray-500">Powered by OpenRouter — contextual analysis beyond keyword matching</p>
      </div>

      <div className="card bg-amber-500/10 border-amber-500/20 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-amber-400 text-lg">⚠</span>
          <div>
            <p className="text-sm font-medium text-amber-300">OpenRouter API Key Required</p>
            <p className="text-xs text-gray-400 mt-1">
              Add <span className="font-mono text-amber-400">OPENROUTER_API_KEY</span> to <span className="font-mono text-gray-300">backend/.env</span>.
              Free key at <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">openrouter.ai/keys</a>
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2"><span className="text-purple-400">✦</span> Job Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Job Title</label>
                <input type="text" value={form.jobTitle} onChange={(e) => setForm((p) => ({ ...p, jobTitle: e.target.value }))} placeholder="Senior Full Stack Engineer" className="input" />
              </div>
              <div>
                <label className="label">Required Skills *</label>
                <input type="text" value={form.requiredSkills} onChange={(e) => setForm((p) => ({ ...p, requiredSkills: e.target.value }))} placeholder="React, Node.js, MongoDB" className="input" />
              </div>
              <div>
                <label className="label">Preferred Skills</label>
                <input type="text" value={form.preferredSkills} onChange={(e) => setForm((p) => ({ ...p, preferredSkills: e.target.value }))} placeholder="Docker, AWS" className="input" />
              </div>
              <div>
                <label className="label">Min Experience (Years)</label>
                <input type="number" value={form.minExperience} onChange={(e) => setForm((p) => ({ ...p, minExperience: e.target.value }))} min="0" className="input" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center bg-gradient-to-r from-brand-500 to-purple-600">
                {loading ? <><div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />AI Analyzing...</> : "✦ Run AI Analysis"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="card text-center py-16">
              <div className="text-4xl mb-4">✦</div>
              <p className="text-gray-400 font-medium mb-2">AI is analyzing candidates...</p>
              <p className="text-sm text-gray-600">This may take 15-30 seconds</p>
            </div>
          ) : !results ? (
            <EmptyState icon="✦" title="AI Analysis Ready" message="Enter job requirements and click 'Run AI Analysis'" />
          ) : (
            <div className="space-y-4 animate-fade-in">
              {results.summary && (
                <div className="card bg-gradient-to-r from-purple-500/10 to-brand-500/10 border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✦</span>
                    <div>
                      <p className="text-xs text-purple-400 uppercase tracking-wider mb-1">AI Summary</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{results.summary}</p>
                      {results.topPick && <p className="text-sm text-white font-medium mt-2">🏆 Top Pick: {results.topPick}</p>}
                    </div>
                  </div>
                </div>
              )}

              {results.shortlisted?.map((c, i) => (
                <div key={c.email} className="card cursor-pointer hover:border-brand-500/30 transition-all animate-slide-up" onClick={() => setExpanded(expanded === i ? null : i)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-display font-bold flex-shrink-0 ${i === 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : i === 1 ? "bg-gray-400/20 text-gray-300 border border-gray-400/30" : i === 2 ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-surface text-gray-500 border border-surface-border"}`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-white">{c.name}</h3>
                        <p className="text-xs text-gray-500">{c.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-lg font-display font-bold text-white">{c.aiScore}<span className="text-xs text-gray-500 font-normal">/100</span></div>
                        <div className="text-xs text-purple-400">AI Score</div>
                      </div>
                      <span className="text-gray-600 text-xs">{expanded === i ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  <div className="mt-3 mb-3"><ScoreBar score={c.aiScore} showLabel={false} /></div>
                  <p className="text-sm text-gray-300 font-medium">{c.recommendation}</p>

                  {expanded === i && (
                    <div className="mt-4 pt-4 border-t border-surface-border space-y-4 animate-fade-in">
                      {c.suitability && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Why this candidate?</p>
                          <p className="text-sm text-gray-300 leading-relaxed">{c.suitability}</p>
                        </div>
                      )}
                      <div className="grid sm:grid-cols-2 gap-4">
                        {c.strengths?.length > 0 && (
                          <div>
                            <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2">✓ Strengths</p>
                            {c.strengths.map((s, j) => <p key={j} className="text-xs text-gray-300 flex items-start gap-1.5 mb-1"><span className="text-emerald-500 mt-0.5">+</span>{s}</p>)}
                          </div>
                        )}
                        {c.concerns?.length > 0 && (
                          <div>
                            <p className="text-xs text-amber-400 uppercase tracking-wider mb-2">⚠ Concerns</p>
                            {c.concerns.map((s, j) => <p key={j} className="text-xs text-gray-300 flex items-start gap-1.5 mb-1"><span className="text-amber-500 mt-0.5">–</span>{s}</p>)}
                          </div>
                        )}
                      </div>
                      {c.interviewQuestions?.length > 0 && (
                        <div>
                          <p className="text-xs text-brand-400 uppercase tracking-wider mb-2">✦ Interview Questions</p>
                          <div className="space-y-1.5">
                            {c.interviewQuestions.map((q, j) => (
                              <div key={j} className="text-xs text-gray-300 bg-surface rounded-lg p-2.5 border border-surface-border">
                                <span className="text-brand-500 font-mono mr-1.5">Q{j + 1}</span>{q}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
