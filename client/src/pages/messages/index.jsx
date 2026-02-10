import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import ChatList from "./components/ChatList";
import FriendList from "./components/FriendList";
import ChatContainer from "./components/ChatContainer";
import WelcomeChat from "./components/WelcomeChat";
import SearchUsersModal from "./components/SearchUserModal";
import NotificationPopover from "./components/NotificationPopover";
import { MessageSquare, Users } from "lucide-react";

export default function SocialMessages() {
  const selectedSocialChat = useAppStore((state) => state.selectedSocialChat);
  const fetchSocialChats = useAppStore((state) => state.fetchSocialChats);
  const fetchFriends = useAppStore((state) => state.fetchFriends);

  const [activeTab, setActiveTab] = useState("chats");

  useEffect(() => {
    if (typeof fetchSocialChats === "function") fetchSocialChats();
    if (typeof fetchFriends === "function") fetchFriends();
  }, [fetchSocialChats, fetchFriends]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-6">
      <div className="flex w-full max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
        {/* Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-white/50">
          <div className="p-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Social</h1>
            <div className="flex items-center gap-2">
              <NotificationPopover />
              <SearchUsersModal />
            </div>
          </div>

          <div className="flex px-6 mb-4 gap-6">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex items-center gap-2 pb-2 text-sm font-bold transition-all ${
                activeTab === "chats"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <MessageSquare size={16} /> Inbox
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex items-center gap-2 pb-2 text-sm font-bold transition-all ${
                activeTab === "friends"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Users size={16} /> Friends
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === "chats" ? (
              <ChatList />
            ) : (
              <FriendList onChatStarted={() => setActiveTab("chats")} />
            )}
          </div>
        </div>

        <div className="hidden md:flex flex-1 flex-col bg-white">
          {selectedSocialChat ? <ChatContainer /> : <WelcomeChat />}
        </div>
      </div>
    </div>
  );
}
