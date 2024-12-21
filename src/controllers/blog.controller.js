import { Blog } from "../models/blog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const addPost = asyncHandler(async (req, res) => {

  const { title, description } = req.body;

  // Validation
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Title and Description should not be empty");
  }

  const blogcoverimageLocalPath = req.files?.blogcoverimage?.[0]?.path;  //required 
  
  let blogimageLocalPath;
  if(
    req.files &&
    Array.isArray(req.files.blogImage)&&
    req.files.blogImage.length > 0
  ){
    blogimageLocalPath = req.files.blogImage[0].path;
  }

  let videoFileLocalPath;
  if(
    req.files &&
    Array.isArray(req.files.videoFile)&&
    req.files.videoFile.length > 0
  ){
    videoFileLocalPath = req.files.videoFile[0].path;
  }

  if (!blogcoverimageLocalPath) {
    throw new ApiError(400, "Blog Cover file is required");
  }


  // Upload to Cloudinary
  const blogcoverImage = await uploadOnCloudinary(blogcoverimageLocalPath);
  const blogImage = await uploadOnCloudinary(blogimageLocalPath);
  const VideoFile = await uploadOnCloudinary(videoFileLocalPath);


  if (!blogcoverImage) {
    throw new ApiError(400, "Blog Cover upload failed");
  }

  // Save blog to database
  const blog = await Blog.create({
    title,
    description,
    blogcoverimage: blogcoverImage.url, // Fixed naming
    blogimage: blogImage?.url || "",
    videoFile: VideoFile?.url || "",

  });

  // Send success response
  res.status(201).json({
    message: "Blog created successfully",
    blog,
  });
});

export { addPost };
