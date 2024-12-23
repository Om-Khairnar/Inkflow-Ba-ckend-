import mongoose, { Schema } from "mongoose";

const commentsSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref:""
  },
});
