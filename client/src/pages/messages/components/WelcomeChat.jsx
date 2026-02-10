import { MessageSquareText } from "lucide-react";

export default function WelcomeChat() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-12">
      <div className="p-6 rounded-full bg-indigo-50 mb-6">
        <MessageSquareText className="w-16 h-14 text-indigo-600" />
      </div>
      <h2 className="text-3xl font-extrabold text-gray-800">Your Inbox</h2>
      <p className="text-gray-500 mt-2 max-w-sm">
        Select a friend from the sidebar to start chatting in real-time.
      </p>
    </div>
  );
}
