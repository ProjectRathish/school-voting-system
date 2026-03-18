const express = require("express");
const router = express.Router();

const pollingBoothController = require("../controllers/pollingBoothController");

const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// Create a new polling booth
router.post(
  "/create",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  pollingBoothController.createPollingBooth
);

// Get all polling booths
router.get(
  "/",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  pollingBoothController.getAllPollingBooths
);

// Get a specific polling booth
router.get(
  "/:booth_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  pollingBoothController.getPollingBoothById
);

// Update a polling booth
router.put(
  "/:booth_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  pollingBoothController.updatePollingBooth
);

// Delete a polling booth
router.delete(
  "/:booth_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  pollingBoothController.deletePollingBooth
);

// Assign a voter to a booth's machine
router.post(
  "/assign-voter",
  requireAuth,
  requireRole("BOOTH_OFFICER", "SCHOOL_ADMIN"), // Allowing both roles
  pollingBoothController.assignVoter
);

module.exports = router;
