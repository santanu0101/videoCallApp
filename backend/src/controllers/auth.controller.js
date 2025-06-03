import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwttoken from "../utils/jwtToken.js";

export const Signup = async (req, res) => {
  try {
    const { fullname, username, email, password, gender, profilepic } =
      req.body;
    if (
      [fullname, username, email, password, gender].some(
        (field) => field?.trim() === ""
      )
    )
      return res.status(400).send("All fields are required");

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (user)
      return res
        .status(409)
        .send({ success: false, message: "User already exist" });

    const hashPass = bcrypt.hashSync(password, 10);
    const boyPic = `https://avatar.iran.liara.run/public/boy?userName=${username}`;
    const girlPic = `https://avatar.iran.liara.run/public/girl?userName=${username}`;

    // console.log(boyPic);
    // console.log(girlPic);

    const newUser = await User.create({
      fullname,
      username,
      email,
      password: hashPass,
      gender,
      profilePic: profilepic || (gender === "male" ? boyPic : girlPic),
    });

    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    // if(newUser) await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if ([email, password].some((field) => field?.trim() === "")) {
      return res.status(400).send("All fields are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    const isMatch = bcrypt.compareSync(password, user.password || "");

    if (!isMatch) {
      return res
        .status(409)
        .send({ success: false, message: "Password does not match" });
    }

    const token = jwttoken(user._id, res);

    // 📌 Remove password before sending user data
    const userData = user.toObject();
    delete userData.password;

    return res.status(200).send({
      success: true,
      message: "User Logged In Successfully",
      user: userData,
      token,
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};


export const Logout = async (req, res) => {
    try {
        console.log(req.user)
        res.clearCookie('jwt',{ 
            path:'/',
            httpOnly:true,
            secure: true,
            sameSite: "None",
        })

        return res.status(200).send({ success: true, message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
}
