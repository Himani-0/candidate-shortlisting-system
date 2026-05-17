// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { candidateAPI } from "../services/api";
import { StatCard, LoadingSpinner } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => { fetchCandidates(); }, []);

  const fetchCandidates = async () => {
    try {
      const res = await candidateAPI.getAll();
      setCandidates(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm("This will replace all existing candidates with 8 sample profiles. Continue?")) return;
    setSeeding(true);
    try {
      await candidateAPI.seed();
      toast.success("8 sample candidates loaded!");
      fetchCandidates();
    } catch (err) {
      toast.error("Failed to seed data");
    } finally {
      setSeeding(false);
    }
  };

  const totalExp = candidates.reduce((sum, c) => sum + c.experience, 0);
  const avgExp = candidates.length ? (totalExp / candidates.length).toFixed(1) : 0;
  const uniqueSkills = new Set(candidates.flatMap((c) => c.skills)).size;

  const quickActions = [
    { title: "Manage Candidates", description: "Add, edit and browse candidate profiles", icon: "◈", path: "/candidates", color: "from-brand-500/20 to-brand-600/5", border: "border-brand-500/20" },
    { title: "Skill Matching", description: "Run weighted matching against job requirements", icon: "◎", path: "/match", color: "from-emerald-500/20 to-emerald-600/5", border: "border-emerald-500/20" },
    { title: "AI Shortlist", description: "Use AI to intelligently analyze and rank candidates", icon: "✦", path: "/ai", color: "from-purple-500/20 to-purple-600/5", border: "border-purple-500/20" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display font-bold text-white text-3xl mb-1">
          Hello, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-400 text-sm">Here's your TalentLens overview</p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Candidates" value={candidates.length} icon="◈" color="brand" />
          <StatCard label="Unique Skills" value={uniqueSkills} icon="⊞" color="emerald" />
          <StatCard label="Avg Experience" value={`${avgExp}y`} icon="◆" color="amber" />
          <StatCard label="AI Enabled" value="✓" icon="✦" color="purple" />
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-display font-semibold text-white text-lg mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map((a) => (
            <Link key={a.path} to={a.path} className={`card bg-gradient-to-br ${a.color} border ${a.border} hover:scale-[1.02] transition-all duration-200 group`}>
              <div className="text-3xl mb-3">{a.icon}</div>
              <h3 className="font-display font-semibold text-white mb-1.5">{a.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{a.description}</p>
              <div className="mt-4 text-xs text-gray-500 group-hover:text-gray-300 transition-colors">Go →</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-white text-lg">Recent Candidates</h2>
        <div className="flex gap-2">
          {candidates.length === 0 && (
            <button onClick={handleSeed} disabled={seeding} className="btn-secondary text-xs">
              {seeding ? "Loading..." : "Load Sample Data"}
            </button>
          )}
          <Link to="/candidates" className="btn-primary text-xs">View All</Link>
        </div>
      </div>

      {loading ? null : candidates.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3 text-gray-700">◈</div>
          <p className="text-gray-400 font-medium mb-2">No candidates yet</p>
          <p className="text-sm text-gray-600 mb-6">Load sample data or add candidates manually</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleSeed} disabled={seeding} className="btn-primary">
              {seeding ? "Loading..." : "✦ Load Sample Data"}
            </button>
            <Link to="/candidates" className="btn-secondary">+ Add Manually</Link>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {["Candidate", "Skills", "Exp", "Added"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-wider text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {candidates.slice(0, 6).map((c) => (
                  <tr key={c._id} className="hover:bg-surface-hover transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.skills.slice(0, 3).map((s) => <span key={s} className="skill-pill">{s}</span>)}
                        {c.skills.length > 3 && <span className="text-xs text-gray-600">+{c.skills.length - 3}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className="font-mono text-xs text-gray-400">{c.experience}y</span></td>
                    <td className="py-3 px-4 text-xs text-gray-600">{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {candidates.length > 6 && (
            <div className="px-4 py-3 border-t border-surface-border text-center">
              <Link to="/candidates" className="text-xs text-brand-400 hover:text-brand-300">View all {candidates.length} →</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
