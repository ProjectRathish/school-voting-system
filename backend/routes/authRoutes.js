const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/test", (req, res) => {
  res.json({ message: "Auth route working" });
});


const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/login", authLimiter, authController.login);
router.post("/booth-login", authLimiter, authController.boothLogin);
router.get("/me", requireAuth, authController.getProfile);

// Add endpoint to create booth officers.
// Must be authenticated and must be a SCHOOL_ADMIN
router.post(
  "/create-booth-officer",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  authController.createBoothOfficer
);
// Get all booth officers for the school
router.get(
  "/booth-officers",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  authController.getBoothOfficers
);

// Update a booth officer (username)
router.put(
  "/booth-officers/:id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  authController.updateBoothOfficer
);

// Delete a booth officer
router.delete(
  "/booth-officers/:id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  authController.deleteBoothOfficer
);

// Reset a booth officer's password
router.put(
  "/booth-officers/:id/reset-password",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  authController.resetBoothOfficerPassword
);

// Assign a booth officer to a polling booth
router.put(
  "/booth-officers/:id/assign-booth",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  authController.assignBooth
);

// Manage election access for a booth officer
router.put(
  "/booth-officers/:id/election-access",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  authController.setElectionAccess
);

// Change self password
router.put(
  "/change-password",
  requireAuth,
  authController.changePassword
);

module.exports = router;