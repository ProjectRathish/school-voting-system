const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/election/:id", authMiddleware.requireAuth, reportController.generateElectionReport);

module.exports = router;
