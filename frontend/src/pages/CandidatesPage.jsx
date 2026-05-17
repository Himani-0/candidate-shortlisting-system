// frontend/src/pages/CandidatesPage.jsx
import React, { useState, useEffect } from "react";
import { candidateAPI } from "../services/api";
import CandidateCard from "../components/CandidateCard";
import CandidateForm from "../components/CandidateForm";
import { LoadingSpinner, EmptyState } from "../components/ui.jsx";
import toast from "react-hot-toast";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  useEffect(() => { fetchCandidates(); }, []);

  const fetchCandidates = async (params = {}) => {
    setLoading(true);
    try {
      const res = await candidateAPI.getAll(params);
      setCandidates(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCandidates({ search: search || undefined, skill: skillFilter || undefined });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, skillFilter]);

  const handleDelete = (id) => setCandidates((p) => p.filter((c) => c._id !== id));

  const handleEdit = (candidate) => {
    setEditingCandidate(candidate);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCandidate(null);
    fetchCandidates();
  };

  const allSkills = [...new Set(candidates.flatMap((c) => c.skills))].sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Candidates</h1>
          <p className="text-sm text-gray-500 mt-1">{candidates.length} in database</p>
        </div>
        <button onClick={() => { setEditingCandidate(null); setShowForm(!showForm); }} className="btn-primary">
          {showForm && !editingCandidate ? "✕ Close" : "+ Add Candidate"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <CandidateForm
            existingCandidate={editingCandidate}
            onSuccess={handleFormSuccess}
            onCancel={() => { setShowForm(false); setEditingCandidate(null); }}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">⌕</span>
          <input type="text" placeholder="Search by name, skill..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-8" />
        </div>
        <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className="input sm:w-48">
          <option value="">All Skills</option>
          {allSkills.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || skillFilter) && (
          <button onClick={() => { setSearch(""); setSkillFilter(""); }} className="btn-secondary text-xs px-3">✕ Clear</button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : candidates.length === 0 ? (
        <EmptyState icon="◈" title="No candidates found"
          message={search || skillFilter ? "Try adjusting your search" : "Add your first candidate above"}
          action={!search && !skillFilter ? <button onClick={() => setShowForm(true)} className="btn-primary">+ Add Candidate</button> : null}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((c) => (
            <CandidateCard key={c._id} candidate={c} onDelete={handleDelete} onEdit={handleEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
