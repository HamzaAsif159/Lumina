import User from "../models/UserModel.js"
import { publish } from "../config/natsClient.js";

export const updateUserStatus = async (userId, status) => {
  try {
    const isOnline = status === "online";
    const user = await User.findByIdAndUpdate(
      userId,
      { isOnline, lastSeen: new Date() },
      { new: true },
    );

    if (!user) return;

    publish(`user.${userId}.presence`, {
      userId: user._id,
      status: isOnline ? "online" : "offline",
      lastSeen: user.lastSeen,
      name: `${user.firstName} ${user.lastName}`,
    });
  } catch (error) {
    console.error("❌ Presence Update Error:", error);
  }
};
