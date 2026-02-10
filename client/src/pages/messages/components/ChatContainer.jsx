import React, { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Paperclip } from "lucide-react";

export default function ChatContainer() {
  const { selectedSocialChat, socialMessages, sendSocialMessage, userInfo } =
    useAppStore();
  const [message, setMessage] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [socialMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    await sendSocialMessage(message);
    setMessage("");
  };

  const otherUser = selectedSocialChat?.participants?.find(
    (p) => (p._id || p) !== userInfo?._id,
  );

  if (!selectedSocialChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-400">
        <p>Select a friend to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 shadow-sm bg-white z-10">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border border-indigo-100">
            <AvatarImage src={otherUser?.image} />
            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
              {otherUser?.firstName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-gray-800 leading-tight">
              {otherUser?.firstName} {otherUser?.lastName}
            </h3>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${otherUser?.isOnline ? "bg-green-500" : "bg-gray-300"}`}
              />
              <p className="text-[11px] text-gray-500 font-medium">
                {otherUser?.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fdfdff] custom-scrollbar">
        {socialMessages.map((msg, index) => {
          const senderId = msg.sender?._id || msg.sender;
          const isMe = senderId === userInfo?._id;

          return (
            <div
              key={msg._id || index}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-[14px] shadow-sm ${
                  isMe
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>
                <span
                  className={`text-[10px] block mt-1 font-medium ${isMe ? "text-indigo-200 text-right" : "text-gray-400 text-left"}`}
                >
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Sending..."}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="p-6 border-t border-gray-100 bg-white">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-indigo-400 transition-all"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-indigo-600"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${otherUser?.firstName || "..."}`}
            className="border-none bg-transparent focus-visible:ring-0 placeholder:text-gray-400"
          />
          <Button
            type="submit"
            disabled={!message.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2"
          >
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider mr-2">
              Send
            </span>
            <SendHorizontal className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
