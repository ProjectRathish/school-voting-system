const express = require("express");
const router = express.Router();

const candidateController = require("../controllers/candidateController");

const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

try {
  const upload = require("../middleware/uploadCandidate");
  
  router.post(
   "/register",
   requireAuth,
   requireRole("SCHOOL_ADMIN"),
   upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'symbol', maxCount: 1 }
   ]),
   candidateController.createCandidate
  );

  router.put(
   "/:candidate_id",
   requireAuth,
   requireRole("SCHOOL_ADMIN"),
   upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'symbol', maxCount: 1 }
   ]),
   candidateController.updateCandidate
  );
} catch (err) {
  console.error("Error loading upload middleware:", err);
  
  router.post(
   "/register",
   requireAuth,
   requireRole("SCHOOL_ADMIN"),
   candidateController.createCandidate
  );

  router.put(
   "/:candidate_id",
   requireAuth,
   requireRole("SCHOOL_ADMIN"),
   candidateController.updateCandidate
  );
}

router.get(
 "/get-nominations",
 requireAuth,
 requireRole("SCHOOL_ADMIN"),
 candidateController.getNominations
);

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

router.delete(
 "/:candidate_id",
 requireAuth,
 requireRole("SCHOOL_ADMIN"),
 candidateController.deleteCandidate
);

router.patch(
 "/:candidate_id/status",
 requireAuth,
 requireRole("SCHOOL_ADMIN"),
 candidateController.updateCandidateStatus
);



module.exports = router;