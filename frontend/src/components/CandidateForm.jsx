// frontend/src/components/CandidateForm.jsx
import React, { useState, useEffect } from "react";
import { candidateAPI } from "../services/api";
import toast from "react-hot-toast";

export default function CandidateForm({ existingCandidate, onSuccess, onCancel }) {
  const [form, setForm] = useState({ name: "", email: "", skills: "", experience: "", bio: "" });
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(existingCandidate);

  useEffect(() => {
    if (existingCandidate) {
      setForm({
        name: existingCandidate.name || "",
        email: existingCandidate.email || "",
        skills: existingCandidate.skills?.join(", ") || "",
        experience: existingCandidate.experience?.toString() || "",
        bio: existingCandidate.bio || "",
      });
    }
  }, [existingCandidate]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const skillsArray = form.skills.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    if (skillsArray.length === 0) { toast.error("Please enter at least one skill"); return; }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      skills: skillsArray,
      experience: Number(form.experience),
      bio: form.bio.trim(),
    };

    setLoading(true);
    try {
      if (isEditing) {
        await candidateAPI.update(existingCandidate._id, payload);
        toast.success("Candidate updated!");
      } else {
        await candidateAPI.create(payload);
        toast.success("Candidate added!");
        setForm({ name: "", email: "", skills: "", experience: "", bio: "" });
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || "Failed to save candidate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-white text-lg">
            {isEditing ? "Edit Candidate" : "Add New Candidate"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEditing ? "Update candidate profile" : "Fill in candidate details"}
          </p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-300 text-xl">✕</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full Name *</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" className="input" required />
        </div>
        <div>
          <label className="label">Email Address *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="rahul@example.com" className="input" required />
        </div>
        <div>
          <label className="label">Skills * (comma-separated)</label>
          <input type="text" name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB" className="input" required />
          {form.skills && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.skills.split(",").map((s) => s.trim()).filter((s) => s).map((skill, i) => (
                <span key={i} className="skill-pill text-xs">{skill}</span>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="label">Years of Experience *</label>
          <input type="number" name="experience" value={form.experience} onChange={handleChange} placeholder="3" min="0" max="50" className="input" required />
        </div>
        <div>
          <label className="label">Bio / Description</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Brief background..." rows={3} className="input resize-none" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? (
              <><div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />{isEditing ? "Updating..." : "Adding..."}</>
            ) : (
              isEditing ? "✓ Update" : "+ Add Candidate"
            )}
          </button>
          {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
        </div>
      </form>
    </div>
  );
}
