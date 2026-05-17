// backend/controllers/candidateController.js
const Candidate = require("../models/Candidate");

// POST /api/candidates
const addCandidate = async (req, res) => {
  try {
    const { name, email, skills, experience, bio } = req.body;

    const normalizedSkills = skills.map(
      (s) => s.trim().charAt(0).toUpperCase() + s.trim().slice(1)
    );

    const candidate = await Candidate.create({
      name, email, skills: normalizedSkills, experience, bio,
    });

    res.status(201).json({ success: true, message: "Candidate added", data: candidate });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/candidates
const getAllCandidates = async (req, res) => {
  try {
    const { search, skill } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }
    if (skill) {
      filter.skills = { $regex: skill, $options: "i" };
    }

    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/candidates/:id
const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
    res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/candidates/:id
const updateCandidate = async (req, res) => {
  try {
    if (req.body.skills) {
      req.body.skills = req.body.skills.map(
        (s) => s.trim().charAt(0).toUpperCase() + s.trim().slice(1)
      );
    }

    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
    res.status(200).json({ success: true, message: "Candidate updated", data: candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/candidates/:id
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
    res.status(200).json({ success: true, message: "Candidate deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/candidates/seed
const seedCandidates = async (req, res) => {
  try {
    await Candidate.deleteMany({});

    const dummyCandidates = [
      {
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        skills: ["React", "Node.js", "MongoDB", "JavaScript", "Express.js"],
        experience: 3,
        bio: "Full Stack MERN developer with experience in scalable web apps and e-commerce products.",
      },
      {
        name: "Priya Patel",
        email: "priya.patel@example.com",
        skills: ["Python", "Machine Learning", "TensorFlow", "Django", "SQL"],
        experience: 4,
        bio: "Data Scientist and ML Engineer with strong background in deep learning and NLP.",
      },
      {
        name: "Arjun Singh",
        email: "arjun.singh@example.com",
        skills: ["React", "TypeScript", "GraphQL", "Next.js", "Node.js"],
        experience: 2,
        bio: "Frontend-focused developer who loves building elegant UIs. Open-source contributor.",
      },
      {
        name: "Sneha Reddy",
        email: "sneha.reddy@example.com",
        skills: ["Java", "Spring Boot", "Microservices", "Docker", "Kubernetes"],
        experience: 5,
        bio: "Backend engineer specializing in microservices. AWS Certified Developer.",
      },
      {
        name: "Karan Mehta",
        email: "karan.mehta@example.com",
        skills: ["React", "Node.js", "PostgreSQL", "Redis", "AWS"],
        experience: 3,
        bio: "Full Stack Developer with expertise in cloud architecture. Built apps serving 100K+ users.",
      },
      {
        name: "Anjali Verma",
        email: "anjali.verma@example.com",
        skills: ["Vue.js", "Python", "Flask", "MySQL", "Docker"],
        experience: 2,
        bio: "Developer who bridges frontend and backend. Passionate about clean API design.",
      },
      {
        name: "Rohit Gupta",
        email: "rohit.gupta@example.com",
        skills: ["React", "Node.js", "MongoDB", "AWS", "Python"],
        experience: 6,
        bio: "Senior Full Stack Engineer. Led teams of 5+ developers at two startups.",
      },
      {
        name: "Nisha Kumar",
        email: "nisha.kumar@example.com",
        skills: ["Angular", "Java", "Spring Boot", "Oracle", "Jenkins"],
        experience: 4,
        bio: "Enterprise software developer experienced in large-scale banking systems and CI/CD.",
      },
    ];

    const inserted = await Candidate.insertMany(dummyCandidates);
    res.status(201).json({
      success: true,
      message: `${inserted.length} sample candidates added`,
      data: inserted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addCandidate, getAllCandidates, getCandidateById,
  updateCandidate, deleteCandidate, seedCandidates,
};
