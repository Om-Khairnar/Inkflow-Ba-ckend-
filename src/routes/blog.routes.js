import { Router } from "express";
import {
  addPost,
  updatePost,
  updatePostcoverImage,
  getPosts,
  getPost,
  deletePost,
} from "../controllers/blog.controller.js";
const router = Router();
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/write").post(
  verifyJWT,
  upload.fields([
    {
      name: "blogcoverImage",
      maxCount: 1,
    },
    {
      name: "blogImage",
      maxCount: 1,
    },
  ]),
  addPost
);
router.route("/:blogId").put(verifyJWT, updatePost);
router.route("/Allblogs").get(getPosts);
router.route("/:blogId").get(getPost);


//This routing is not tetes yet so 
router.route("/:blogId").put(verifyJWT,updatePostcoverImage);
router.route("/:blogId").delete(verifyJWT, deletePost);

export default router;
