const express = require("express");
const router = express.Router();

const platformController = require("../controllers/platformController");

const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/test", (req, res) => {
  res.json({ message: "Platform route working" });
});

/* GET PLATFORM STATS */
router.get(
  "/stats",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  platformController.getPlatformStats
);

/* GET SUGGESTED SCHOOL CODE */
router.get(
  "/next-school-code",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  platformController.getSuggestedSchoolCode
);


/* GET ALL ENQUIRIES */
router.get(
 "/enquiries",
 requireAuth,
 requireRole("SUPER_ADMIN"),
 platformController.getEnquiries
);


/* CREATE SCHOOL ENQUIRY */
router.post(
 "/school-enquiry",
 platformController.createSchoolEnquiry
);


/* APPROVE SCHOOL */
router.post(
 "/approve-school",
 requireAuth,
 requireRole("SUPER_ADMIN"),
 platformController.approveSchool
);


/* LIST APPROVED SCHOOLS */
router.get(
 "/schools",
 requireAuth,
 requireRole("SUPER_ADMIN"),
 platformController.getSchools
);

/* CREATE SCHOOL MANUALLY */
router.post(
 "/schools",
 requireAuth,
 requireRole("SUPER_ADMIN"),
 platformController.createSchool
);

/* GET SINGLE SCHOOL */
router.get(
 "/schools/:school_id",
 requireAuth,
 requireRole("SUPER_ADMIN"),
 platformController.getSchool
);

/* UPDATE SCHOOL */
router.put(
 "/schools/:school_id",
 requireAuth,
 requireRole("SUPER_ADMIN"),
 platformController.updateSchool
);

/* DELETE SCHOOL */
router.delete(
 "/schools/:school_id",
 requireAuth,
 requireRole("SUPER_ADMIN"),
 platformController.deleteSchool
);

/* GET SINGLE ENQUIRY */
router.get(
 "/enquiries/:enquiry_id",
 requireAuth,
 requireRole("SUPER_ADMIN"),
 platformController.getEnquiry
);

/* REJECT ENQUIRY */
router.put(
 "/enquiries/:enquiry_id/reject",
 requireAuth,
 requireRole("SUPER_ADMIN"),
 platformController.rejectEnquiry
);

/* RESET SCHOOL PASSWORD */
router.put(
  "/schools/:school_id/reset-password",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  platformController.resetSchoolPassword
);

/* RESEND SCHOOL WELCOME EMAIL */
router.post(
  "/schools/:school_id/resend-welcome",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  platformController.resendSchoolWelcomeEmail
);

module.exports = router;