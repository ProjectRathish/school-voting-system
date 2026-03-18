const express = require("express");
const router = express.Router();

const sectionController = require("../controllers/sectionController");

const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.post(
  "/create",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  sectionController.createSection
);

router.get(
  "/get-sections",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  sectionController.getSections
);

router.get(
  "/:section_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  sectionController.getSection
);

router.put(
  "/:section_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  sectionController.updateSection
);

router.delete(
  "/:section_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  sectionController.deleteSection
);

module.exports = router;