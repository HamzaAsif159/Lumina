import { Router } from "express";
import {
  setupMFA,
  verifyAndEnableMFA,
  verifyLoginMFA,
  disableMFA,
} from "../controllers/mfaController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const router = Router();

router.post("/setup", verifyToken, setupMFA);
router.post("/verify", verifyToken, verifyAndEnableMFA);
router.post("/login-verify", verifyLoginMFA);
router.post("/disable", verifyToken, disableMFA);

export default router;
