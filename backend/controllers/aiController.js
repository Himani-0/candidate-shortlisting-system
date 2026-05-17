// backend/controllers/aiController.js
const Candidate = require("../models/Candidate");

const callOpenRouter = async (prompt) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const AI_MODEL = process.env.AI_MODEL || "mistralai/mistral-7b-instruct";

  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes("your-openrouter")) {
    throw new Error(
      "OpenRouter API key not configured. Add OPENROUTER_API_KEY to your .env file."
    );
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
      "X-Title": "TalentLens",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert HR recruiter. Analyze candidates and respond ONLY in valid JSON. No extra text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter error: ${response.status} — ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content from AI model");
  return content;
};

// POST /api/ai/shortlist
const aiShortlist = async (req, res) => {
  try {
    const { requiredSkills, preferredSkills = [], minExperience = 0, jobTitle = "Software Developer" } = req.body;

    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({ success: false, message: "Required skills needed" });
    }

    const candidates = await Candidate.find({});
    if (candidates.length === 0) {
      return res.status(400).json({ success: false, message: "No candidates in database" });
    }

    const candidatesText = candidates
      .map((c, i) =>
        `${i + 1}. Name: ${c.name} | Email: ${c.email} | Skills: ${c.skills.join(", ")} | Experience: ${c.experience} years | Bio: ${c.bio}`
      )
      .join("\n");

    const prompt = `
Evaluate candidates for: ${jobTitle}

JOB REQUIREMENTS:
- Required Skills: ${requiredSkills.join(", ")}
- Preferred Skills: ${preferredSkills.join(", ") || "None"}
- Minimum Experience: ${minExperience} years

CANDIDATES:
${candidatesText}

Return ONLY this JSON (no extra text):
{
  "shortlisted": [
    {
      "name": "candidate name",
      "email": "candidate email",
      "aiScore": 85,
      "recommendation": "Short recommendation text",
      "strengths": ["strength 1", "strength 2"],
      "concerns": ["concern 1"],
      "suitability": "Detailed explanation of suitability",
      "interviewQuestions": ["Question 1?", "Question 2?", "Question 3?"]
    }
  ],
  "summary": "Overall analysis summary",
  "topPick": "Name and brief reason for top pick"
}

Include ALL candidates, ranked best to worst. Scores 0-100.`;

    const aiResponse = await callOpenRouter(prompt);

    let parsed;
    try {
      const clean = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return res.status(500).json({
        success: false,
        message: "AI returned unexpected format. Please try again.",
      });
    }

    res.status(200).json({ success: true, model: process.env.AI_MODEL, data: parsed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/ai/questions
const generateInterviewQuestions = async (req, res) => {
  try {
    const { candidateId, jobTitle = "Software Developer", requiredSkills = [] } = req.body;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    const prompt = `
Generate 8 interview questions for: ${candidate.name}
Role: ${jobTitle}
Skills: ${candidate.skills.join(", ")}
Experience: ${candidate.experience} years
Bio: ${candidate.bio}
Required skills for role: ${requiredSkills.join(", ") || "Not specified"}

Return ONLY this JSON:
{
  "technical": [
    {"question": "Question?", "purpose": "What this tests", "difficulty": "Easy/Medium/Hard"}
  ],
  "behavioral": [
    {"question": "Question?", "purpose": "What this tests"}
  ],
  "cultureFit": [
    {"question": "Question?", "purpose": "What this tests"}
  ]
}`;

    const aiResponse = await callOpenRouter(prompt);

    let parsed;
    try {
      const clean = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return res.status(500).json({ success: false, message: "Failed to parse AI response" });
    }

    res.status(200).json({
      success: true,
      candidate: { name: candidate.name, skills: candidate.skills },
      questions: parsed,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { aiShortlist, generateInterviewQuestions };
