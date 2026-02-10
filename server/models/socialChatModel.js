import mongoose from "mongoose";

const SocialChatSchema = new mongoose.Schema(
  {
    chatType: {
      type: String,
      enum: ["private", "group"],
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    groupMetadata: {
      title: { type: String },
      admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      groupImage: { type: String },
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SocialMessage",
    },
  },
  { timestamps: true },
);

export default mongoose.model("SocialChat", SocialChatSchema);
