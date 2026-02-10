import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, Loader2, Check, Clock } from "lucide-react";
import { useSearchUsers, useSendFriendRequest } from "@/hooks/useSocial";
import { useAppStore } from "@/store";

export default function SearchUsersModal() {
  const [searchTerm, setSearchTerm] = useState("");

  const sentRequestIds = useAppStore((state) => state.sentRequestIds);
  const markAsSent = useAppStore((state) => state.markAsSent);
  const clearSentRequests = useAppStore((state) => state.clearSentRequests);

  const { data: results, refetch, isFetching } = useSearchUsers(searchTerm);
  const { mutateAsync: sendRequest, isLoading: isSending } =
    useSendFriendRequest();

  const usersToRender =
    results?.users || (Array.isArray(results) ? results : []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      clearSentRequests();
      refetch();
    }
  };

  const onSendRequest = async (userId) => {
    try {
      await sendRequest(userId);
      markAsSent(userId);
    } catch (error) {
      if (error.response?.status === 400) {
        markAsSent(userId);
      }
    }
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setSearchTerm("");
          clearSentRequests();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-gray-50 text-indigo-600"
        >
          <UserPlus size={20} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Find Friends
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            disabled={isFetching}
            className="bg-indigo-600 rounded-xl px-6"
          >
            {isFetching ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              "Search"
            )}
          </Button>
        </form>

        <div className="mt-6 max-h-[350px] overflow-y-auto space-y-3 pr-1">
          {usersToRender.length > 0
            ? usersToRender.map((user) => {
                const isSent = sentRequestIds.includes(user._id);
                const isFriend = user.isFriend;

                return (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 bg-gray-50/50 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700">
                          {user.firstName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-gray-500 line-clamp-1">
                          {user.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {isFriend ? (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                          <Check size={14} /> Friends
                        </span>
                      ) : isSent ? (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                          <Clock size={14} /> Sent
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => onSendRequest(user._id)}
                          disabled={isSending}
                          className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"
                        >
                          {isSending ? (
                            <Loader2 className="animate-spin w-3 h-3" />
                          ) : (
                            "Add"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            : !isFetching &&
              searchTerm && (
                <p className="text-center text-gray-400 text-sm py-10">
                  No users found.
                </p>
              )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
