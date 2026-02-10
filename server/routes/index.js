import { Router } from "express";
import authRoutes from "./AuthRoutes.js";
import userRoutes from "./UserRoutes.js";
import chatRoutes from "./chatRoutes.js";
import mfaRoutes from "./mfaRoutes.js";
import friendRoutes from "./FriendRoutes.js";
import messageRoutes from "./MessageRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/auth/mfa", mfaRoutes);
router.use("/user", userRoutes);
router.use("/chat", chatRoutes);
router.use("/friends", friendRoutes);
router.use("/messages", messageRoutes);

export default router;
