import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Blog } from "../models/blog.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addPost = asyncHandler(async (req, res) => {
  const { title, description, type } = req.body;
  // Validation
  if ([title, description, type].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Title and Description should not be empty");
  }
  const blogcoverimageLocalPath = req.files?.blogcoverImage?.[0]?.path; //required
  let blogimageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.blogImage) &&
    req.files.blogImage.length > 0
  ) {
    blogimageLocalPath = req.files.blogImage[0].path;
  }

  if (!blogcoverimageLocalPath) {
    throw new ApiError(400, "Blog Cover file is required");
  }
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "Unauthorized: User information missing");
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
    type,
    blogcoverimage: blogcoverImage.url,
    blogimage: blogImage?.url || "",
    owner: req.user._id,
  });
  // Send success response
  res.status(201).json({
    message: "Blog created successfully",
    blog,
  });
});

const updatePost = asyncHandler(async (req, res) => {
  const { title, description, type } = req.body;
  const { blogId } = req.params;

  if (!title || !description || !type) {
    throw new ApiError(400, "Title and Description and Type required");
  }

  const blog = await Blog.findByIdAndUpdate(
    blogId,
    {
      $set: {
        title,
        description,
        type,
      },
    },
    { new: true }
  );

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Account details updated successfully "));
});

const getPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const limitValue = parseInt(limit, 10);

  const postsAggregate = Blog.aggregate([
    {
      $lookup: {
        from: "users", // Lookup the user collection for the blog owner
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner", // Unwind the owner array so that it is an object
    },
    {
      $lookup: {
        from: "comments", // Lookup the comments collection
        localField: "_id",
        foreignField: "blog", // Assuming the comments have a 'blog' field referencing the blog
        as: "comments",
      },
    },
    {
      $unwind: {
        path: "$comments", // Unwind the comments array so each comment is a separate document
        preserveNullAndEmptyArrays: true, // Ensure that posts without comments are included
      },
    },
    {
      $lookup: {
        from: "users", // Lookup the user who made the comment
        localField: "comments.user",
        foreignField: "_id",
        as: "comments.user", // Store the user who commented inside the comment
      },
    },
    {
      $unwind: "$comments.user", // Unwind the user field inside comments to get user info
    },
    {
      $skip: skip, // Skip posts based on pagination
    },
    {
      $limit: limitValue, // Limit the number of posts to the page limit
    },
    {
      $project: {
        title: 1,
        description: 1,
        blogcoverimage: 1,
        blogimage: 1,
        type: 1,
        owner: {
          name: 1,
          email: 1,
        },
        comments: {
          comment: 1,
          "user.name": 1,
          "user.email": 1,
        },
      },
    },
  ]);

  // Send the response with the posts and pagination info
  res.status(200).json({
    message: "Posts fetched successfully",
    posts: postsAggregate,
    pagination: {
      currentPage: page,
      totalPosts: postsAggregate.length,
      totalPages: Math.ceil(postsAggregate.length / limitValue),
    },
  });
});

const getPost = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  const blogAggregate = await Blog.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(blogId), // Match the specific blog ID
      },
    },
    {
      $lookup: {
        from: "users", // Lookup the user collection for the blog owner
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner", // Unwind the owner array so that it is an object
    },
    {
      $lookup: {
        from: "comments", // Lookup the comments collection
        localField: "_id",
        foreignField: "blog", // Assuming the comments have a 'blog' field referencing the blog
        as: "comments",
      },
    },
    {
      $unwind: {
        path: "$comments", // Unwind the comments array so each comment is a separate document
        preserveNullAndEmptyArrays: true, // Ensure that blogs without comments are included
      },
    },
    {
      $lookup: {
        from: "users", // Lookup the user who made the comment
        localField: "comments.user",
        foreignField: "_id",
        as: "comments.user", // Store the user who commented inside the comment
      },
    },
    {
      $unwind: {
        path: "$comments.user", // Unwind the user field inside comments to get user info
        preserveNullAndEmptyArrays: true, // Ensure comments without users are included
      },
    },
    {
      $group: {
        _id: "$_id", // Group back to the original blog structure
        title: { $first: "$title" },
        description: { $first: "$description" },
        blogcoverimage: { $first: "$blogcoverimage" },
        blogimage: { $first: "$blogimage" },
        type: { $first: "$type" },
        owner: { $first: "$owner" },
        comments: {
          $push: {
            comment: "$comments.comment",
            user: {
              name: "$comments.user.name",
              email: "$comments.user.email",
            },
          },
        },
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        blogcoverimage: 1,
        blogimage: 1,
        type: 1,
        owner: {
          name: 1,
          email: 1,
        },
        comments: {
          comment: 1,
          user: {
            name: 1,
            email: 1,
          },
        },
      },
    },
  ]);

  // If no blog is found, return a 404 error
  if (!blogAggregate || blogAggregate.length === 0) {
    return res.status(404).json({ message: "Blog not found" });
  }

  // Send the response with the single blog post
  res.status(200).json({
    message: "Blog fetched successfully",
    blog: blogAggregate[0],
  });
});

const updatePostcoverImage = asyncHandler(async (req, res) => {
  const { blogcoverImage } = req.file?.path;

  if (!blogcoverImage) {
    throw new ApiError(400, "Blog cover image not found");
  }
  const blog = await Blog.findById(req.blog?._id);

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  if (blog.blogcoverimage) {
    const parts = blog.blogcoverImage.split("/");
    const filename = parts[parts.length - 1];
    const oldBlogcoverimagePublicId = filename.split(".")[0];

    if (oldBlogcoverimagePublicId) {
      try {
        await cloudinary.uploader.destroy(oldBlogcoverimagePublicId);
      } catch (error) {
        console.error(
          "Error deleting the old coverImage from Cloudinary:",
          error
        );
        throw new ApiError(
          500,
          "Failed to delete old Coverimage from Cloudinary"
        );
      }
    }
  }

  const blogcoverimage = await uploadOnCloudinary(blogcoverimageLocalPath);

  if (!blogcoverimage.url) {
    throw new ApiError(400, "Error while uploading the blogcoverimage");
  }
  const updateCoverimage = await Blog.findOneAndUpdate(
    req.blog?._id,
    {
      $set: {
        blogcoverimage: blogcoverimage.url,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const updatePostImage = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  // Step 1: Find the blog by its ID
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  // Step 2: Check if the logged-in user is the owner of the blog
  if (blog.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized: You can only delete your own blog");
  }

  // Step 3: Delete the images from Cloudinary if they exist
  const deleteImageFromCloudinary = async (imageUrl) => {
    if (imageUrl) {
      try {
        const imageParts = imageUrl.split("/");
        const imageFilename = imageParts[imageParts.length - 1];
        const imagePublicId = imageFilename.split(".")[0];

        console.log(
          `Attempting to delete image with public ID: ${imagePublicId}`
        );

        // Delete image from Cloudinary
        const response = await cloudinary.uploader.destroy(imagePublicId);

        console.log("Cloudinary delete response:", response);

        if (response.result !== "ok") {
          throw new Error(
            `Failed to delete image with public ID: ${imagePublicId}`
          );
        }
      } catch (error) {
        console.error(`Error deleting image from Cloudinary: ${error.message}`);
        throw new ApiError(500, "Failed to delete image from Cloudinary");
      }
    }
  };

  // Delete cover and regular blog images
  await deleteImageFromCloudinary(blog.blogcoverimage);
  await deleteImageFromCloudinary(blog.blogimage);

  // Step 4: Delete the blog from the database
  await Blog.findByIdAndDelete(blogId);

  // Step 5: Send success response
  res.status(200).json({
    message: "Blog deleted successfully",
  });
});

export {
  addPost,
  updatePost,
  updatePostcoverImage,
  getPosts,
  getPost,
  deletePost,
};
