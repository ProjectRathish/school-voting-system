const express = require("express");
const router = express.Router();

const postController = require("../controllers/postController");

const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");


/* CREATE POST */

router.post(
  "/create",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  postController.createPost
);

router.get(
  "/get-posts",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  postController.getPosts
);

router.get(
  "/:post_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  postController.getPost
);

router.put(
  "/:post_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  postController.updatePost
);

router.delete(
  "/:post_id",
  requireAuth,
  requireRole("SCHOOL_ADMIN"),
  postController.deletePost
);

module.exports = router;