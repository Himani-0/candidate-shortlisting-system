// backend/controllers/matchController.js
const Candidate = require("../models/Candidate");

// POST /api/match
const matchCandidates = async (req, res) => {
  try {
    const { requiredSkills, preferredSkills = [], minExperience = 0 } = req.body;

    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one required skill must be specified",
      });
    }

    const allCandidates = await Candidate.find({});

    if (allCandidates.length === 0) {
      return res.status(200).json({ success: true, message: "No candidates found", data: [] });
    }

    const scoredCandidates = allCandidates.map((candidate) => {
      const candidateSkillsLower = candidate.skills.map((s) => s.toLowerCase());
      const requiredSkillsLower = requiredSkills.map((s) => s.toLowerCase());
      const preferredSkillsLower = preferredSkills.map((s) => s.toLowerCase());

      const matchedRequired = requiredSkillsLower.filter((s) => candidateSkillsLower.includes(s));
      const matchedPreferred = preferredSkillsLower.filter((s) => candidateSkillsLower.includes(s));

      const requiredScore = requiredSkills.length > 0
        ? (matchedRequired.length / requiredSkills.length) * 70 : 0;

      const preferredScore = preferredSkills.length > 0
        ? (matchedPreferred.length / preferredSkills.length) * 20 : 0;

      let experienceScore = 0;
      if (candidate.experience >= minExperience) {
        experienceScore = 10;
      } else if (candidate.experience > 0 && minExperience > 0) {
        experienceScore = (candidate.experience / minExperience) * 10;
      }

      const experienceBonus = candidate.experience > minExperience * 1.5 ? 5 : 0;
      const totalScore = Math.min(
        Math.round(requiredScore + preferredScore + experienceScore + experienceBonus), 100
      );

      let matchTier;
      if (totalScore >= 75) matchTier = "High Match";
      else if (totalScore >= 45) matchTier = "Medium Match";
      else matchTier = "Low Match";

      return {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        skills: candidate.skills,
        experience: candidate.experience,
        bio: candidate.bio,
        createdAt: candidate.createdAt,
        matchScore: totalScore,
        matchTier,
        matchedRequired: matchedRequired.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
        matchedPreferred: matchedPreferred.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
        meetsExperience: candidate.experience >= minExperience,
      };
    });

    scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      summary: {
        totalCandidates: scoredCandidates.length,
        highMatch: scoredCandidates.filter((c) => c.matchTier === "High Match").length,
        mediumMatch: scoredCandidates.filter((c) => c.matchTier === "Medium Match").length,
        lowMatch: scoredCandidates.filter((c) => c.matchTier === "Low Match").length,
        jobRequirements: { requiredSkills, preferredSkills, minExperience },
      },
      data: scoredCandidates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { matchCandidates };
