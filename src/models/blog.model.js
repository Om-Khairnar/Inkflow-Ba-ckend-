import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    blogcoverimage: {
      type: String,
      required: true,
    },
    blogimage: {
      type: String, //cloudinary topic
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required:true,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment", // Reference to Comment model
      },
    ],
  },
  {
    timestamps: true,
  }
);

blogSchema.plugin(mongooseAggregatePaginate);

export const Blog = mongoose.model("Blog", blogSchema);
