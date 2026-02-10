import React from "react";
import { useAppStore } from "@/store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ChatList() {
  const { socialChats, setSelectedSocialChat, selectedSocialChat, userInfo } =
    useAppStore();

  return (
    <div className="flex flex-col overflow-y-auto">
      {socialChats.map((chat) => {
        const otherUser = chat.participants.find(
          (p) => (p._id || p) !== userInfo?._id,
        );
        const isActive = selectedSocialChat?._id === chat._id;
        const lastMsg = chat.lastMessage;

        const isUnread =
          lastMsg &&
          (lastMsg.sender?._id || lastMsg.sender) !== userInfo?._id &&
          !lastMsg.readBy?.includes(userInfo?._id);

        return (
          <button
            key={chat._id}
            onClick={() => setSelectedSocialChat(chat)}
            className={`flex items-center gap-4 p-4 transition-all relative group ${
              isActive
                ? "bg-indigo-50 border-r-4 border-indigo-600"
                : "hover:bg-gray-50/80"
            }`}
          >
            <div className="relative">
              <Avatar className="h-12 w-12 border border-gray-100 shadow-sm">
                <AvatarImage src={otherUser?.image} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                  {otherUser?.firstName?.[0]}
                </AvatarFallback>
              </Avatar>
              {otherUser?.isOnline && (
                <span className="absolute bottom-0.5 right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            <div className="flex-1 text-left overflow-hidden">
              <div className="flex justify-between items-center mb-0.5">
                <h4
                  className={`truncate text-sm ${isUnread ? "font-black text-gray-900" : "font-semibold text-gray-700"}`}
                >
                  {otherUser?.firstName} {otherUser?.lastName}
                </h4>
                {lastMsg && (
                  <span className="text-[10px] text-gray-400">
                    {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs truncate max-w-[140px] text-gray-500">
                  {lastMsg?.content || "Start a conversation"}
                </p>

                {isUnread && !isActive && (
                  <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white shadow-sm animate-in fade-in zoom-in">
                    new
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
