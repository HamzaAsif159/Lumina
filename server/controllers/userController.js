import bcrypt from "bcrypt";
import User from "../models/UserModel.js";
import { RedisKeys } from "../utils/redisKeys.js";
import redis from "../config/redis.js";

export const getUserInfo = async (req, res) => {
  try {
    const key = RedisKeys.userProfile(req.userId);
    const cachedUser = await redis.get(key);

    if (cachedUser) {
      return res.status(200).json({ user: JSON.parse(cachedUser) });
    }

    const userData = await User.findById(req.userId).select("-password");

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    await redis.setex(key, 3600, JSON.stringify(userData));

    return res.status(200).json({ user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserInfo = async (req, res) => {
  try {
    const { firstName, lastName, email, password, image } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (image) user.image = image;
    if (password) user.password = password;

    await user.save();
    await redis.del(RedisKeys.userProfile(req.userId));

    const { password: _, ...userResponse } = user.toObject();
    res.status(200).json({ message: "Profile updated", user: userResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.userId;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        {
          $or: [
            { firstName: { $regex: query, $options: "i" } },
            { lastName: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
      ],
    }).select("firstName lastName image isOnline email");

    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
