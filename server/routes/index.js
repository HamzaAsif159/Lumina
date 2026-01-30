import { Router } from "express";
import authRoutes from "./AuthRoutes.js";
import userRoutes from "./UserRoutes.js";
import chatRoutes from "./chatRoutes.js";
import mfaRoutes from "./mfaRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/auth/mfa", mfaRoutes);
router.use("/user", userRoutes);
router.use("/chat", chatRoutes);

export default router;
