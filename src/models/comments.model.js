import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const commentSchema = new Schema(
  {
  description: {
    type: String,
    required: [true, "comment is required"]
  },
  post: {
    type: Schema.Types.ObjectId,
    ref:"Blog"
  },
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
  },
},
{
  timestamps: true
}
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);
