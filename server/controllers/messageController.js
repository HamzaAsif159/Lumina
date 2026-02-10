import SocialChat from "../models/socialChatModel.js";
import SocialMessage from "../models/socialMessageModel.js";
import User from "../models/UserModel.js";
import { publish } from "../config/natsClient.js";

export const accessChat = async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.userId;

  if (!userId) return res.status(400).json({ message: "UserId not provided" });

  try {
    let chat = await SocialChat.findOne({
      chatType: "private",
      $and: [
        { participants: { $elemMatch: { $eq: currentUserId } } },
        { participants: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("participants", "firstName lastName image isOnline")
      .populate("lastMessage");

    if (chat) return res.status(200).json(chat);

    const newChat = await SocialChat.create({
      chatType: "private",
      participants: [currentUserId, userId],
    });

    const fullChat = await SocialChat.findById(newChat._id).populate(
      "participants",
      "firstName lastName image isOnline",
    );

    res.status(201).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const sendMessage = async (req, res) => {
  const { chatId, content } = req.body;
  const senderId = req.userId;

  if (!chatId || !content)
    return res.status(400).json({ message: "Invalid data" });

  try {
    const newMessage = await SocialMessage.create({
      chatId,
      sender: senderId,
      content,
      readBy: [senderId],
    });

    const fullMessage = await SocialMessage.findById(newMessage._id)
      .populate("sender", "firstName lastName image")
      .populate({
        path: "chatId",
        populate: { path: "participants", select: "firstName lastName image" },
      });

    await SocialChat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });

    if (fullMessage.chatId?.participants) {
      fullMessage.chatId.participants.forEach((participant) => {
        if (participant._id.toString() === senderId.toString()) return;
        publish(`user.${participant._id}.chat`, {
          type: "NEW_MESSAGE",
          message: fullMessage,
        });
      });
    }

    res.status(201).json(fullMessage);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const fetchChats = async (req, res) => {
  try {
    const chats = await SocialChat.find({
      participants: { $elemMatch: { $eq: req.userId } },
    })
      .populate("participants", "firstName lastName image isOnline")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    const results = await User.populate(chats, {
      path: "lastMessage.sender",
      select: "firstName lastName image email",
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    await SocialMessage.updateMany(
      { chatId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } },
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await SocialMessage.find({ chatId: req.params.chatId })
      .populate("sender", "firstName lastName image")
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;
    const message = await SocialMessage.findById(messageId);

    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await message.deleteOne();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
