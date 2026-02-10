import React, { useState } from "react";
import { Bell, Check, X, UserRoundSearch } from "lucide-react"; // Changed UserClock
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  useGetPendingRequests,
  useHandleFriendRequest,
} from "@/hooks/useSocial";

export default function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: requests = [] } = useGetPendingRequests();
  const { mutate: handleRequest } = useHandleFriendRequest();

  const receivedRequests = requests
    ? requests.filter((req) => req.status === "received")
    : [];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full hover:bg-gray-100 focus-visible:ring-0"
      >
        <Bell size={22} className="text-gray-600" />
        {receivedRequests.length > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {receivedRequests.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute -right-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
            <div className="p-4 border-b border-gray-50 bg-white">
              <h3 className="font-bold text-gray-800">Notifications</h3>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-2 bg-white custom-scrollbar">
              {receivedRequests.length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center gap-2">
                  <UserRoundSearch className="text-gray-300" size={32} />
                  <p className="text-sm text-gray-400">
                    No new friend requests
                  </p>
                </div>
              ) : (
                receivedRequests.map((req) => (
                  <div
                    key={req.user._id}
                    className="flex items-center justify-between p-3 hover:bg-indigo-50/50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-gray-100">
                        <AvatarImage src={req.user.image} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          {req.user.firstName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">
                          {req.user.firstName} {req.user.lastName}
                        </span>
                        <span className="text-[10px] text-gray-500 italic">
                          Sent a request
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        className="h-7 w-7 bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm"
                        onClick={() => {
                          handleRequest({
                            senderId: req.user._id,
                            action: "accept",
                          });
                        }}
                      >
                        <Check size={14} className="text-white" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                        onClick={() => {
                          handleRequest({
                            senderId: req.user._id,
                            action: "decline",
                          });
                        }}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
