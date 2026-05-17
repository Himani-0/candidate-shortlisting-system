// backend/routes/candidateRoutes.js
const express = require("express");
const router = express.Router();
const {
  addCandidate, getAllCandidates, getCandidateById,
  updateCandidate, deleteCandidate, seedCandidates,
} = require("../controllers/candidateController");
const { protect } = require("../middleware/authMiddleware");

router.post("/seed", protect, seedCandidates);
router.get("/", protect, getAllCandidates);
router.post("/", protect, addCandidate);
router.get("/:id", protect, getCandidateById);
router.put("/:id", protect, updateCandidate);
router.delete("/:id", protect, deleteCandidate);

module.exports = router;
