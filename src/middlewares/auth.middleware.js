import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// if there is no use of the responce insuch case you can just skin and add the _ in that place
export const verifyJWT = asyncHandler(async (req, _, next) => {
  // get token access
try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, " Unauthorized Request");
    }
  
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
  
    if (!user) {
      throw new ApiError(401, "Invalid Acess Token");
    }
  
    req.user = user;
    next()
  
} catch (error) {
  throw new ApiError(401, error?.message || "Invalid access token")
}
  
});
