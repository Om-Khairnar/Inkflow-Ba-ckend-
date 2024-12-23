import { Router } from "express";
import { addPost } from "../controllers/blog.controller.js";
const router = Router();
import { upload } from "../middlewares/multer.middleware.js";


router.route("/write").post(
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

export default router;