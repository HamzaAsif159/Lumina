import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  signup,
  login,
  logout,
  refreshToken,
} from "../controllers/AuthController.js";
import { generateTokens } from "../utils/token.js";

const authRoutes = Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/refresh", refreshToken);

authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  }),
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/auth",
  }),
  async (req, res) => {
    try {
      const user = req.user;

      if (user.mfa?.enabled) {
        const mfaSessionToken = jwt.sign(
          { userId: user._id, mfaPending: true },
          process.env.JWT_ACCESS_SECRET,
          { expiresIn: "5m" },
        );
        return res.redirect(
          `http://localhost:5173/auth?mfaRequired=true&mfaToken=${mfaSessionToken}`,
        );
      }

      const { accessToken, refreshToken } = await generateTokens(user);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`http://localhost:5173/auth?token=${accessToken}`);
    } catch (error) {
      res.redirect("http://localhost:5173/auth");
    }
  },
);

export default authRoutes;
