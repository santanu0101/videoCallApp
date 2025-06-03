import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const isLogin = async (req, res, next) => {
  try {
    const token =
      req.cookies?.jwt ||
      req.header("Authorization")?.replace("Bearer ", "");

    if(!token) return res.status(401).send({success: false, message: "Unauthorized request"});

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodeToken?.userId).select("-password");

    if(!user) return res.status(401).send({success: false, message: "Invalid Token"});
    req.user = user

    next()

  } catch (error) {}
};

export default isLogin
