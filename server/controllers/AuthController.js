import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import redis from "../config/redis.js";
import { RedisKeys } from "../utils/redisKeys.js";
import { generateTokens } from "../utils/token.js";
import { updateUserStatus } from "../services/presenceService.js";

export const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const user = await User.create({ email, password, firstName, lastName });
    const { accessToken, refreshToken } = await generateTokens(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, refreshToken: __, ...userResponse } = user.toObject();
    res.status(201).json({ success: true, user: userResponse, accessToken });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if MFA is enabled
    if (user.mfa && user.mfa.enabled) {
      const mfaSessionToken = jwt.sign(
        { userId: user._id, mfaPending: true },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "5m" },
      );
      return res
        .status(200)
        .json({ success: true, mfaRequired: true, mfaSessionToken });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, refreshToken: __, ...userResponse } = user.toObject();
    res.status(200).json({ success: true, user: userResponse, accessToken });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.split(" ")[1];

    const userId =
      req.userId || (accessToken ? jwt.decode(accessToken)?.userId : null);

    if (accessToken) {
      const decoded = jwt.decode(accessToken);
      if (decoded && decoded.jti) {
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = decoded.exp - now;
        if (timeLeft > 0) {
          await redis.setex(
            RedisKeys.tokenBlacklist(decoded.jti),
            timeLeft,
            "revoked",
          );
        }
      }
    }

    if (refreshToken) {
      await User.updateOne(
        { "refreshToken.token": refreshToken },
        { $pull: { refreshToken: { token: refreshToken } } },
      );
    }

    if (userId) {
      await updateUserStatus(userId, "offline");
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
export const refreshToken = async (req, res) => {
  try {
    const tokenFromCookie = req.cookies.refreshToken;
    if (!tokenFromCookie)
      return res.status(401).json({ message: "No refresh token" });

    const user = await User.findOne({ "refreshToken.token": tokenFromCookie });
    if (!user) return res.status(403).json({ message: "Invalid session" });

    jwt.verify(
      tokenFromCookie,
      process.env.JWT_REFRESH_SECRET,
      (err, decoded) => {
        if (err)
          return res.status(403).json({ message: "Token expired or invalid" });

        const accessToken = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_ACCESS_SECRET,
          { expiresIn: "15m" },
        );

        const {
          password: _,
          refreshToken: __,
          ...userResponse
        } = user.toObject();
        res.status(200).json({ accessToken, user: userResponse });
      },
    );
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
