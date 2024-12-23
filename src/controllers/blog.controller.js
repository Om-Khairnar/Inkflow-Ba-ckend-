import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Blog } from "../models/blog.model.js";



const addPost = asyncHandler(async (req, res) => {

  const { title, description } = req.body;

  // Validation
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Title and Description should not be empty");
  }

  const blogcoverimageLocalPath = req.files?.blogcoverImage?.[0]?.path;  //required 
  
  let blogimageLocalPath;
  if(
    req.files &&
    Array.isArray(req.files.blogImage)&&
    req.files.blogImage.length > 0
  ){
    blogimageLocalPath = req.files.blogImage[0].path;
  }


  if (!blogcoverimageLocalPath) {
    throw new ApiError(400, "Blog Cover file is required");
  }


  // Upload to Cloudinary
  const blogcoverImage = await uploadOnCloudinary(blogcoverimageLocalPath);

  const blogImage = await uploadOnCloudinary(blogimageLocalPath);
  
  if (!blogcoverImage) {
    throw new ApiError(400, "Blog Cover upload failed");
  }

  // Save blog to database
  const blog = await Blog.create({
    title,
    description,
    blogcoverimage: blogcoverImage.url,
    blogimage: blogImage?.url || "",
  });

  // Send success response
  res.status(201).json({
    message: "Blog created successfully",
    blog,
  });
});

export { addPost };
