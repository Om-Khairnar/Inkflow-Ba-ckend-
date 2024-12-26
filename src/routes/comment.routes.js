import { Router } from "express";
import {
  addComment,
  getPostComments,
  updateComment,
} from "../controllers/comment.controller.js";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/:blogId").get(verifyJWT, getPostComments);
router.route("/:blogId").post(verifyJWT, addComment);
router.route("/:commentId").put(verifyJWT, updateComment)
export default router;
