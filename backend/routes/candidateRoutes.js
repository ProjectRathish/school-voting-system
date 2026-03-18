const express = require("express");
const router = express.Router();

const candidateController = require("../controllers/candidateController");

const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

try {
  const upload = require("../middleware/uploadCandidate");
  
  router.post(
   "/create",
   requireAuth,
   requireRole("SCHOOL_ADMIN"),
   upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'symbol', maxCount: 1 }
   ]),
   candidateController.createCandidate
  );
} catch (err) {
  console.error("Error loading upload middleware:", err);
  
  router.post(
   "/create",
   requireAuth,
   requireRole("SCHOOL_ADMIN"),
   candidateController.createCandidate
  );
}

router.get(
 "/get-candidates",
 requireAuth,
 requireRole("SCHOOL_ADMIN"),
 candidateController.getCandidates
);

router.get(
 "/:candidate_id",
 requireAuth,
 requireRole("SCHOOL_ADMIN"),
 candidateController.getCandidate
);

router.put(
 "/:candidate_id",
 requireAuth,
 requireRole("SCHOOL_ADMIN"),
 candidateController.updateCandidate
);

router.delete(
 "/:candidate_id",
 requireAuth,
 requireRole("SCHOOL_ADMIN"),
 candidateController.deleteCandidate
);

module.exports = router;