import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bot, Users, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { userInfo } = useAppStore();
  const navigate = useNavigate();

  const options = [
    {
      title: "Talk to LuminaBot",
      description: "Chat with your personal AI assistant",
      icon: <Bot className="w-8 h-8 text-indigo-600" />,
      path: "/chat",
      color: "bg-indigo-50",
    },
    {
      title: "Messaging Friends",
      description: "Connect and chat with other users across the platform",
      icon: <Users className="w-8 h-8 text-purple-600" />,
      path: "/messages",
      color: "bg-purple-50",
    },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <Card className="w-full max-w-2xl rounded-3xl shadow-2xl border-none overflow-hidden bg-white/95">
        <CardHeader className="text-center pt-10 pb-6">
          <CardTitle className="text-4xl font-extrabold text-gray-800">
            Welcome, {userInfo?.firstName || "there"}! 👋
          </CardTitle>
          <p className="text-gray-500 mt-2 text-lg">
            What would you like to do today?
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {options.map((option) => (
              <button
                key={option.title}
                onClick={() => navigate(option.path)}
                className="group flex flex-col items-center justify-between h-full p-8 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-white hover:border-indigo-400 hover:shadow-xl transition-all duration-300 text-center shadow-md cursor-pointer"
              >
                <div className="flex flex-col items-center w-full">
                  <div
                    className={`p-4 rounded-full ${option.color} mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {option.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 line-clamp-2 min-h-[40px]">
                    {option.description}
                  </p>
                </div>

                <div className="flex items-center text-indigo-600 font-semibold text-sm mt-auto">
                  Launch{" "}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
