// backend/routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const { aiShortlist, generateInterviewQuestions } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.post("/shortlist", protect, aiShortlist);
router.post("/questions", protect, generateInterviewQuestions);

module.exports = router;
