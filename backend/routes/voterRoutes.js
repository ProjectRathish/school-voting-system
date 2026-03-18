const express = require("express");
const router = express.Router();

const voterController = require("../controllers/voterController");

const upload = require("../middleware/uploadExcel");

const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.get(
 "/download-template",
 requireAuth,
 requireRole("SCHOOL_ADMIN"),
 voterController.downloadTemplate
);

router.post(
 "/upload",
 requireAuth,
 requireRole("SCHOOL_ADMIN"),
 upload.single("file"),
 voterController.uploadVoters
);

router.post(
 "/create",
 requireAuth,
 requireRole("SCHOOL_ADMIN"),
 voterController.createVoter
);

router.get(
 "/get-voters",
 requireAuth,
 requireRole("SCHOOL_ADMIN"),
 voterController.getVoters
);

router.get(
 "/:voter_id",
 requireAuth,
 requireRole("SCHOOL_ADMIN"),
 voterController.getVoter
);

router.put(
 "/:voter_id",
 requireAuth,
 requireRole("SCHOOL_ADMIN"),
 voterController.updateVoter
);

router.delete(
 "/:voter_id",
 requireAuth,
 requireRole("SCHOOL_ADMIN"),
 voterController.deleteVoter
);

module.exports = router;