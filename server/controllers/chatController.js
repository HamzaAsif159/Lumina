import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Chat from "../models/ChatModel.js";

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Check your .env file.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
};

const generateChatTitle = (firstMessage) => {
  const lower = firstMessage.toLowerCase().trim();
  if (lower.includes("react")) return "React Questions";
  if (lower.includes("javascript") || lower.includes("js")) return "JavaScript";
  if (lower.includes("node")) return "Node.js";
  if (lower.includes("python")) return "Python";
  if (lower.includes("poem") || lower.includes("write")) return "Creative";
  if (lower.includes("help")) return "Help Needed";
  if (lower.includes("explain")) return "Explanation";
  return (
    firstMessage.slice(0, 30).trim() + (firstMessage.length > 30 ? "..." : "")
  );
};

const getByteBotPrompt = (context) => {
  return `You are Luminabot, a helpful AI assistant. Respond conversationally and helpfully.

${context}
Assistant:`;
};

export const sendMessage = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", process.env.ORIGIN);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "*");

  res.flushHeaders();

  try {
    const { chatId, message } = req.query;
    const userId = new mongoose.Types.ObjectId(req.userId);

    let chat = await Chat.findOne({ _id: chatId, user: userId });
    if (!chat) {
      res.write(`data: ${JSON.stringify({ error: "Chat not found" })}\n\n`);
      res.end();
      return;
    }

    const userMessages = chat.messages.filter((m) => m.sender === "user");
    if (userMessages.length === 0) {
      chat.title = generateChatTitle(message);
    }

    chat.messages.push({
      sender: "user",
      text: message,
      timestamp: new Date(),
    });
    await chat.save();

    res.write(`data: ${JSON.stringify({ type: "started" })}\n\n`);

    const model = getModel();
    const context = chat.messages
      .slice(-6)
      .map((m) => `${m.sender === "user" ? "User" : "ByteBot"}: ${m.text}`)
      .join("\n");

    const prompt = getByteBotPrompt(context);
    const result = await model.generateContentStream(prompt);

    let fullResponse = "";
    for await (const chunk of result.stream) {
      const token = chunk.text();
      fullResponse += token;
      res.write(`data: ${JSON.stringify({ type: "token", token })}\n\n`);
    }

    chat.messages.push({
      sender: "bot",
      text: fullResponse,
      timestamp: new Date(),
    });
    await chat.save();

    res.write(`data: ${JSON.stringify({ type: "done", fullResponse })}\n\n`);
    res.end();
  } catch (error) {
    console.error("❌ ByteBot Stream Error:", error.message);
    res.write(
      `data: ${JSON.stringify({ error: "Stream failed", details: error.message })}\n\n`,
    );
    res.end();
  }
};

export const getChats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const chats = await Chat.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json(chats);
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

export const createChat = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const chat = new Chat({
      user: userId,
      title: "New Chat",
    });
    await chat.save();
    res.json({ chat });
  } catch (error) {
    console.error("Create chat error:", error);
    res.status(500).json({ message: "Failed to create chat" });
  }
};
