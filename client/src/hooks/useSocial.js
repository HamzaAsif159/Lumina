import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useSearchUsers = (searchTerm) => {
  return useQuery({
    queryKey: ["searchUsers", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const response = await api.get(
        `/api/friends/search?query=${encodeURIComponent(searchTerm)}`,
      );
      return response.data.users || [];
    },
    enabled: false,
    retry: false,
    staleTime: 0,
  });
};

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipientId) => {
      const response = await api.post("/api/friends/request", { recipientId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error) => {
      console.error("Failed to send friend request:", error);
    },
  });
};

export const useGetPendingRequests = () => {
  return useQuery({
    queryKey: ["pendingRequests"],
    queryFn: async () => {
      const response = await api.get("/api/friends/pending");
      return response.data.pendingRequests || [];
    },
  });
};

export const useHandleFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ senderId, action }) => {
      const response = await api.post(`/api/friends/${action}`, { senderId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });
};
