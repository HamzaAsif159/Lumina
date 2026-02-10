import express from "express";
import {
  accessChat,
  sendMessage,
  fetchChats,
  getMessages,
  markAsRead,
  deleteMessage,
} from "../controllers/messageController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/get-chats", verifyToken, fetchChats);

router.post("/", verifyToken, accessChat);
router.post("/send", verifyToken, sendMessage);
router.get("/:chatId", verifyToken, getMessages);
router.put("/read/:chatId", verifyToken, markAsRead);
router.delete("/:messageId", verifyToken, deleteMessage);

export default router;
