import { User } from "../models/User.js";

export const getAllUsers = async (req, res) => {
  const currentUserId = req.user?._id;
  if (!currentUserId)
    return res.status(404).send({ success: false, message: "User not found" });
  try {
    const users = await User.find(
      { _id: { $ne: currentUserId } },
      "profilePic email username"
    );
    res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};
