import { Router } from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  searchUsers,
  getPendingRequests,
  unfriend,
} from "../controllers/friendController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const router = Router();

router.get("/list", verifyToken, getFriends);
router.get("/search", verifyToken, searchUsers);
router.get("/pending", verifyToken, getPendingRequests);

router.post("/request", verifyToken, sendFriendRequest);
router.post("/accept", verifyToken, acceptFriendRequest);
router.post("/decline", verifyToken, declineFriendRequest);
router.post("/unfriend", verifyToken, unfriend);

export default router;
