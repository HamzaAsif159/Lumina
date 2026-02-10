import React from "react";
import { useAppStore } from "@/store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";

export default function FriendList({ onChatStarted }) {
  const { friends, accessChat } = useAppStore();

  const handleStartChat = async (friendId) => {
    await accessChat(friendId);
    if (onChatStarted) onChatStarted();
  };

  if (!friends || friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400">
        <p className="text-sm">No friends found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 space-y-3">
      {friends.map((friend) => (
        <div
          key={friend._id}
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 border border-gray-100">
                <AvatarImage src={friend.image} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                  {friend.firstName?.[0]}
                </AvatarFallback>
              </Avatar>
              {friend.isOnline && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">
                {friend.firstName} {friend.lastName}
              </p>
              <p className="text-[11px] text-gray-500">
                {friend.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleStartChat(friend._id)}
            className="p-2 bg-indigo-50 text-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 hover:text-white"
          >
            <MessageCircle size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
