const express = require("express");
const router = express.Router();

const classController = require("../controllers/classController");

const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.post(
  "/create",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  classController.createClass
);

router.get(
  "/get-classes",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  classController.getClasses
);

router.get(
  "/:class_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  classController.getClass
);

router.put(
  "/:class_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  classController.updateClass
);

router.delete(
  "/:class_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  classController.deleteClass
);

module.exports = router;