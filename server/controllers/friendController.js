import User from "../models/UserModel.js";
import { publish } from "../config/natsClient.js";

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.userId;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: userId } },
        {
          $or: [
            { firstName: { $regex: query, $options: "i" } },
            { lastName: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
      ],
    })
      .select("firstName lastName email image friends pendingRequests")
      .limit(10);

    const formattedResults = users.map((u) => ({
      _id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      image: u.image,
      isFriend: u.friends.includes(userId),
    }));

    return res.status(200).json({ success: true, users: formattedResults });
  } catch (error) {
    return res.status(500).json({ message: "Server error during search" });
  }
};

export const getFriends = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate({
      path: "friends",
      select: "firstName lastName image isOnline lastSeen",
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ success: true, friends: user.friends });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: "pendingRequests.user",
      select: "firstName lastName image email",
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      success: true,
      pendingRequests: user.pendingRequests,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching requests" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.userId;

    if (!recipientId)
      return res.status(400).json({ message: "Recipient ID is required" });
    if (senderId === recipientId)
      return res.status(400).json({ message: "You cannot add yourself" });

    const [recipient, sender] = await Promise.all([
      User.findById(recipientId),
      User.findById(senderId),
    ]);

    if (!recipient)
      return res.status(404).json({ message: "Recipient not found" });

    const alreadyPending = recipient.pendingRequests.some(
      (r) => r.user.toString() === senderId,
    );
    const alreadyFriends = recipient.friends.includes(senderId);

    if (alreadyPending || alreadyFriends) {
      return res
        .status(400)
        .json({ message: "Already friends or request pending" });
    }

    await User.findByIdAndUpdate(senderId, {
      $push: { pendingRequests: { user: recipientId, status: "sent" } },
    });
    await User.findByIdAndUpdate(recipientId, {
      $push: { pendingRequests: { user: senderId, status: "received" } },
    });

    try {
      publish(`user.${recipientId}.notifications`, {
        type: "FRIEND_REQUEST",
        request: {
          user: {
            _id: sender._id,
            firstName: sender.firstName,
            lastName: sender.lastName,
            image: sender.image,
            email: sender.email,
          },
          status: "received",
        },
      });
    } catch (natsError) {
      console.error("NATS Publish Failed:", natsError);
    }

    return res
      .status(200)
      .json({ success: true, message: "Friend request sent" });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const recipientId = req.userId;

    await User.findByIdAndUpdate(recipientId, {
      $pull: { pendingRequests: { user: senderId } },
      $addToSet: { friends: senderId },
    });

    await User.findByIdAndUpdate(senderId, {
      $pull: { pendingRequests: { user: recipientId } },
      $addToSet: { friends: recipientId },
    });

    return res
      .status(200)
      .json({ success: true, message: "Friend request accepted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const recipientId = req.userId;

    await User.findByIdAndUpdate(recipientId, {
      $pull: { pendingRequests: { user: senderId } },
    });
    await User.findByIdAndUpdate(senderId, {
      $pull: { pendingRequests: { user: recipientId } },
    });

    return res.status(200).json({ success: true, message: "Request declined" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const unfriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.userId;
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
    return res.status(200).json({ success: true, message: "Friend removed" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
