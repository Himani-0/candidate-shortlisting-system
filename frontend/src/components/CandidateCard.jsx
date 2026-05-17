// frontend/src/components/CandidateCard.jsx
import React, { useState } from "react";
import { candidateAPI, aiAPI } from "../services/api";
import toast from "react-hot-toast";

export default function CandidateCard({ candidate, onDelete, onEdit }) {
  const [loadingQ, setLoadingQ] = useState(false);
  const [questions, setQuestions] = useState(null);

  const handleDelete = async () => {
    if (!confirm(`Delete ${candidate.name}? This cannot be undone.`)) return;
    try {
      await candidateAPI.delete(candidate._id);
      toast.success(`${candidate.name} deleted`);
      onDelete?.(candidate._id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleGenerateQ = async () => {
    setLoadingQ(true);
    try {
      const res = await aiAPI.generateQuestions({ candidateId: candidate._id });
      setQuestions(res.data.questions);
      toast.success("Interview questions generated!");
    } catch (err) {
      toast.error(err.message || "Failed. Check OpenRouter API key.");
    } finally {
      setLoadingQ(false);
    }
  };

  const initials = candidate.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="card hover:border-brand-500/20 transition-all duration-200 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-display font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <h3 className="font-display font-semibold text-white text-base leading-tight">
              {candidate.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{candidate.email}</p>
          </div>
        </div>
        <span className="text-xs font-mono bg-surface px-2.5 py-1 rounded-md text-gray-400 border border-surface-border flex-shrink-0">
          {candidate.experience}y exp
        </span>
      </div>

      {candidate.bio && (
        <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{candidate.bio}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {candidate.skills.map((skill) => (
          <span key={skill} className="skill-pill">{skill}</span>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-surface-border">
        <button
          onClick={handleGenerateQ}
          disabled={loadingQ}
          className="btn-secondary text-xs px-3 py-1.5 flex-1"
        >
          {loadingQ ? (
            <><div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" /> Generating...</>
          ) : <>✦ Interview Qs</>}
        </button>
        <button onClick={() => onEdit?.(candidate)} className="btn-secondary text-xs px-3 py-1.5">✎</button>
        <button onClick={handleDelete} className="btn-danger text-xs px-3 py-1.5">✕</button>
      </div>

      {questions && (
        <div className="mt-4 pt-4 border-t border-surface-border animate-fade-in">
          <p className="text-xs font-medium text-brand-400 mb-3">✦ AI Interview Questions</p>
          {questions.technical && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Technical</p>
              <div className="space-y-1.5">
                {questions.technical.map((q, i) => (
                  <div key={i} className="text-xs text-gray-300 bg-surface rounded-lg p-2.5 border border-surface-border">
                    <span className="text-brand-500 font-mono mr-1.5">Q{i + 1}</span>{q.question}
                    {q.difficulty && (
                      <span className={`ml-2 ${q.difficulty === "Hard" ? "text-red-400" : q.difficulty === "Medium" ? "text-amber-400" : "text-emerald-400"}`}>
                        ({q.difficulty})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {questions.behavioral && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Behavioral</p>
              <div className="space-y-1.5">
                {questions.behavioral.map((q, i) => (
                  <div key={i} className="text-xs text-gray-300 bg-surface rounded-lg p-2.5 border border-surface-border">
                    <span className="text-purple-500 font-mono mr-1.5">B{i + 1}</span>{q.question}
                  </div>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => setQuestions(null)} className="mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors">
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
}
