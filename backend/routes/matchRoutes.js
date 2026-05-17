// backend/routes/matchRoutes.js
const express = require("express");
const router = express.Router();
const { matchCandidates } = require("../controllers/matchController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, matchCandidates);

module.exports = router;
