const express = require("express");
const router = express.Router();

const electionController = require("../controllers/electionController");

const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.post(
  "/create",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  electionController.createElection
);

router.get(
  "/get-elections",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  electionController.getElections
);

router.get(
  "/:id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  electionController.getElection
);

router.put(
  "/:id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  electionController.updateElection
);

router.put(
  "/:id/status",

  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  electionController.updateElectionStatus
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  electionController.deleteElection
);

router.get(
  "/:id/turnout",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  electionController.getTurnout
);

// Get Election Results
router.get(
  "/:id/results",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  electionController.getResults
);

// Get Detailed Analytics
router.get(
  "/:id/detailed-results",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  electionController.getDetailedResults
);

// Export Results to Excel
router.get(
  "/:id/export",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  electionController.exportResults
);

// Booth Officer Assignments
router.get(
  "/:id/assignments",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  electionController.getAssignments
);

router.post(
  "/:id/assign-officer",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  electionController.assignOfficer
);

router.delete(
  "/:id/unassign-officer/:user_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  electionController.unassignOfficer
);

module.exports = router;