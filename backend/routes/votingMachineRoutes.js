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

// Get all machines for an election (Admin only)
router.get(
  "/get-machines",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  votingMachineController.getAllMachines
);

// Verify voting machine (No auth - uses machine token)
router.get(
  "/verify",
  votingMachineController.verifyMachine
);

// Get all machines in a specific booth (Admin and Booth Officer)
router.get(
  "/booth/:booth_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN", "BOOTH_OFFICER"),
  votingMachineController.getMachinesInBooth
);

// Get specific machine details (Admin only)
router.get(
  "/:machine_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  votingMachineController.getMachineById
);

// Update machine details (Admin only)
router.put(
  "/:machine_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  votingMachineController.updateMachine
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

// Reset hardware binding (Admin only)
router.post(
  "/:machine_id/reset-binding",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  votingMachineController.resetBinding
);

// Bulk delete all machines (Admin only)
router.delete(
  "/bulk-delete",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  votingMachineController.bulkDeleteMachines
);

// Release a busy machine (Admin and Booth Officer)
router.post(
  "/:machine_id/release",
  requireAuth,
  requireRole("SCHOOL_ADMIN", "BOOTH_OFFICER"),
  votingMachineController.releaseMachine
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

// Ping from machine to update last_ping
router.post(
  "/ping",
  votingMachineController.pingMachine
);

module.exports = router;
