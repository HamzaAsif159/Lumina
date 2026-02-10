import { natsService } from "@/services/natsService";
import { api } from "@/lib/api";
import {
  GET_USER_CHATS_ROUTE,
  SEND_MESSAGE_ROUTE,
  GET_FRIENDS_ROUTE,
  ACCESS_CHAT_ROUTE,
  GET_CHAT_MESSAGES_ROUTE,
} from "@/utils/constant";

export const createAppSocialSlice = (set, get) => ({
  socialChats: [],
  selectedSocialChat: null,
  socialMessages: [],
  friends: [],
  sentRequestIds: [],
  isSocialLoading: false,

  accessChat: async (userId) => {
    try {
      const response = await api.post(ACCESS_CHAT_ROUTE, { userId });
      const chat = response.data;

      set({ selectedSocialChat: chat, socialMessages: [] });

      const msgRes = await api.get(`${GET_CHAT_MESSAGES_ROUTE}/${chat._id}`);
      set({ socialMessages: msgRes.data });

      get().fetchSocialChats();
      return chat;
    } catch (error) {
      console.error("Error accessing chat:", error);
    }
  },

  setSelectedSocialChat: async (chat) => {
    if (
      get().selectedSocialChat?._id === chat?._id &&
      get().socialMessages.length > 0
    )
      return;

    const { socialChats, userInfo } = get();

    const updatedChats = socialChats.map((c) => {
      if (c._id === chat._id) {
        return {
          ...c,
          lastMessage: c.lastMessage
            ? {
                ...c.lastMessage,
                readBy: [
                  ...new Set([...(c.lastMessage.readBy || []), userInfo?._id]),
                ],
              }
            : c.lastMessage,
        };
      }
      return c;
    });

    set({
      selectedSocialChat: chat,
      socialMessages: [],
      socialChats: updatedChats,
    });

    if (chat?._id) {
      try {
        const response = await api.get(
          `${GET_CHAT_MESSAGES_ROUTE}/${chat._id}`,
        );
        set({ socialMessages: response.data });

        await api.put(`/api/social/mark-as-read/${chat._id}`);

        const refreshedChats = await api.get(GET_USER_CHATS_ROUTE);
        set({ socialChats: refreshedChats.data });
      } catch (error) {
        console.error("Error selecting chat:", error);
      }
    }
  },

  handleIncomingMessage: async (fullMessage) => {
    const { selectedSocialChat, socialMessages } = get();
    const chatId = fullMessage.chatId?._id || fullMessage.chatId;

    if (selectedSocialChat?._id === chatId) {
      if (!socialMessages.some((m) => m._id === fullMessage._id)) {
        set({ socialMessages: [...socialMessages, fullMessage] });
        api.put(`/api/social/mark-as-read/${chatId}`);
      }
    }

    get().fetchSocialChats();
  },

  sendSocialMessage: async (content) => {
    const { selectedSocialChat } = get();
    if (!selectedSocialChat || !content.trim()) return;

    try {
      const response = await api.post(SEND_MESSAGE_ROUTE, {
        chatId: selectedSocialChat._id,
        content,
      });

      if (!get().socialMessages.some((m) => m._id === response.data._id)) {
        set((state) => ({
          socialMessages: [...state.socialMessages, response.data],
        }));
      }
      get().fetchSocialChats();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  },

  fetchSocialChats: async () => {
    try {
      const response = await api.get(GET_USER_CHATS_ROUTE);
      set({ socialChats: response.data });
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  },

  setupNats: async (userId) => {
    try {
      await natsService.connect();
      natsService.subscribeToChat(userId, (payload) => {
        if (payload.type === "NEW_MESSAGE")
          get().handleIncomingMessage(payload.message);
      });
    } catch (err) {
      console.error("NATS Setup Error:", err);
    }
  },

  fetchFriends: async () => {
    try {
      const response = await api.get(GET_FRIENDS_ROUTE);
      set({ friends: response.data.friends || response.data || [] });
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  },

  logoutNats: async () => {
    await natsService.disconnect();
  },

  markAsSent: (userId) =>
    set((state) => ({
      sentRequestIds: [...new Set([...state.sentRequestIds, userId])],
    })),

  clearSentRequests: () => set({ sentRequestIds: [] }),
});
