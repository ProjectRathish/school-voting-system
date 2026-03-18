const express = require("express");
const router = express.Router();

const votingMachineController = require("../controllers/votingMachineController");

const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// Register a new voting machine (Admin only)
router.post(
  "/register",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  votingMachineController.registerMachine
);

// Verify voting machine (No auth - uses machine token)
router.get(
  "/verify",
  votingMachineController.verifyMachine
);

// Get all machines in a specific booth (Admin only)
router.get(
  "/booth/:booth_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  votingMachineController.getMachinesInBooth
);

// Get specific machine details (Admin only)
router.get(
  "/:machine_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  votingMachineController.getMachineById
);

// Update machine status (Admin only)
router.put(
  "/:machine_id/status",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  votingMachineController.updateMachineStatus
);

// Delete a voting machine (Admin only)
router.delete(
  "/:machine_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  votingMachineController.deleteMachine
);

// Fetch ballot for the currently assigned voter on a machine
router.get(
  "/ballot/fetch",
  votingMachineController.fetchBallot
);

// Cast vote from the machine
router.post(
  "/vote/cast",
  votingMachineController.castVote
);

module.exports = router;
