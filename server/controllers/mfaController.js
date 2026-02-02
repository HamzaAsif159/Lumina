import User from "../models/UserModal.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";
import { generateTokens } from "../utils/token.js";

export const setupMFA = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const secret = speakeasy.generateSecret({
      name: `ByteBot (${user.email})`,
    });

    user.mfa.secret = secret.base32;
    await user.save();

    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);
    res.status(200).json({ qrCode: qrCodeDataURL, secret: secret.base32 });
  } catch (error) {
    res.status(500).json({ message: "MFA Setup failed" });
  }
};

export const verifyAndEnableMFA = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.userId);

    const verified = speakeasy.totp.verify({
      secret: user.mfa.secret,
      encoding: "base32",
      token: code,
    });

    if (verified) {
      user.mfa.enabled = true;
      user.mfa.primaryMethod = "totp";
      await user.save();

      const {
        password: _,
        refreshToken: __,
        ...userResponse
      } = user.toObject();
      res
        .status(200)
        .json({ message: "MFA enabled successfully", user: userResponse });
    } else {
      res.status(400).json({ message: "Invalid code" });
    }
  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
};

export const verifyLoginMFA = async (req, res) => {
  try {
    const { code, mfaSessionToken } = req.body;

    const decoded = jwt.verify(mfaSessionToken, process.env.JWT_ACCESS_SECRET);
    if (!decoded.mfaPending) {
      return res.status(403).json({ message: "Invalid MFA session" });
    }

    const user = await User.findById(decoded.userId);

    const verified = speakeasy.totp.verify({
      secret: user.mfa.secret,
      encoding: "base32",
      token: code,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid code" });
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
    res.status(403).json({ message: "MFA Session expired" });
  }
};

export const disableMFA = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.mfa = { enabled: false, secret: null };
    await user.save();

    const { password: _, refreshToken: __, ...userResponse } = user.toObject();
    return res.status(200).json({
      message: "MFA disabled successfully",
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
