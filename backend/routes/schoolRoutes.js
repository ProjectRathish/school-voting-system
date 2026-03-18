const express = require("express");
const router = express.Router();
const schoolController = require("../controllers/schoolController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/school-logo/");
  },
  filename: function (req, file, cb) {
    // We use the school_code from the token (req.user)
    const identifier = req.user.school_code || `school_${req.user.school_id}`;
    // We force the extension to be .png as per user request
    cb(null, identifier + ".png");
  },
});

const upload = multer({ storage: storage });

router.get("/me", authMiddleware.requireAuth, schoolController.getSchoolInfo);
router.post("/logo", authMiddleware.requireAuth, upload.single("logo"), schoolController.updateLogo);
router.put("/update-profile", authMiddleware.requireAuth, schoolController.updateProfile);

module.exports = router;
