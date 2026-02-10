import React, { useState, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { useAppStore } from "@/store";
import { useGetChats, useCreateChat, useSendMessage } from "@/hooks/useChat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Plus, Send, Sparkles } from "lucide-react";

export default function Chat() {
  const {
    chats,
    selectedChatId,
    selectChat,
    addMessageToSelectedChat,
    setChats,
  } = useAppStore();

  const { data: backendChats, refetch: refetchChats } = useGetChats();
  const createChatMutation = useCreateChat();
  const sendMessageMutation = useSendMessage();

  const selectedChat = chats.find((c) => c.id === selectedChatId);
  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef(null);

  const showEmptyState = !selectedChat || selectedChat.messages.length === 0;

  useEffect(() => {
    if (backendChats?.length) {
      setChats(
        backendChats.map((chat) => ({
          id: chat._id,
          title: chat.title,
          messages: chat.messages.map((msg) => ({
            id: nanoid(),
            sender: msg.sender,
            text: msg.text,
          })),
        })),
      );
    }
  }, [backendChats, setChats]);

  const handleCreateChat = async () => {
    try {
      const backendChat = await createChatMutation.mutateAsync();
      selectChat(backendChat._id);
      refetchChats();
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const handleSend = async () => {
    if (!prompt.trim() || !selectedChatId || sendMessageMutation.isPending)
      return;

    const userMessage = { id: nanoid(), sender: "user", text: prompt };
    addMessageToSelectedChat(userMessage);
    setPrompt("");

    sendMessageMutation.mutate({ chatId: selectedChatId, message: prompt });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      <div className="w-72 bg-slate-50/50 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            LuminaBot
          </h2>
          <Button
            size="sm"
            variant="outline"
            className="rounded-lg border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
            onClick={handleCreateChat}
            disabled={createChatMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${
                chat.id === selectedChatId
                  ? "bg-white shadow-sm border border-slate-200 text-indigo-600 ring-1 ring-black/5"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
              onClick={() => selectChat(chat.id)}
            >
              <div className="shrink-0">
                <UserAvatar
                  firstName={chat.title[0]?.toUpperCase() || "C"}
                  lastName=""
                  size="sm"
                  className={
                    chat.id === selectedChatId
                      ? "bg-indigo-600"
                      : "bg-slate-400"
                  }
                />
              </div>
              <span className="truncate text-sm font-semibold flex-1">
                {chat.title}
              </span>
            </div>
          ))}
          {chats.length === 0 && (
            <div className="p-8 text-slate-400 text-xs text-center italic">
              No conversations yet. Start a new one!
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          {showEmptyState ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
                <Sparkles className="text-indigo-600 h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                LuminaBot
              </h3>
              <p className="text-sm text-center max-w-xs text-slate-500">
                {selectedChat
                  ? "Type a message below to start your conversation."
                  : 'Select or create a "New Chat" to begin.'}
              </p>
            </div>
          ) : (
            <>
              {selectedChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white self-end shadow-md shadow-indigo-100"
                      : "bg-slate-100 text-slate-800 self-start border border-slate-200/50"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}

              {sendMessageMutation.isPending && (
                <div className="self-start bg-slate-100 border border-slate-200/50 p-4 rounded-2xl animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      LuminaBot is thinking...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {selectedChat && (
          <div className="p-6 bg-white">
            <div className="max-w-4xl mx-auto flex gap-3 p-2 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <Input
                placeholder="Ask LuminaBot anything..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !sendMessageMutation.isPending &&
                  handleSend()
                }
                className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 min-h-[44px] text-slate-700"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={
                  !prompt.trim() ||
                  !selectedChatId ||
                  sendMessageMutation.isPending
                }
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 h-11"
              >
                {sendMessageMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
