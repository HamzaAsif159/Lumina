import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { api } from "@/lib/api";
import { HOST } from "@/utils/constant";
import {
  CHAT_CREATE_ROUTE,
  CHAT_LIST_ROUTE,
  CHAT_SEND_ROUTE,
} from "@/utils/constant";
import { useAppStore } from "@/store";

export const useGetChats = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await api.get(CHAT_LIST_ROUTE);
      return res.data;
    },
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useCreateChat = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(CHAT_CREATE_ROUTE);
      return res.data.chat;
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, message }) => {
      return new Promise((resolve, reject) => {
        const token = localStorage.getItem("accessToken");
        let fullResponse = "";
        let botMessageId = nanoid();
        let hasBotMessage = false;

        const url = `${HOST}${CHAT_SEND_ROUTE}?chatId=${chatId}&message=${encodeURIComponent(message)}&token=${encodeURIComponent(token)}`;

        const eventSource = new EventSource(url, { withCredentials: true });

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.error) {
              eventSource.close();
              reject(new Error(data.error));
              return;
            }

            if (data.type === "started") return;

            if (data.type === "token") {
              fullResponse += data.token;
              const { chats, selectedChatId } = useAppStore.getState();

              const updatedChats = chats.map((chat) =>
                chat.id === selectedChatId
                  ? {
                      ...chat,
                      messages: chat.messages
                        .map((msg) =>
                          msg.id === botMessageId
                            ? {
                                id: botMessageId,
                                sender: "bot",
                                text: fullResponse,
                              }
                            : msg,
                        )
                        .concat(
                          hasBotMessage
                            ? []
                            : [
                                {
                                  id: botMessageId,
                                  sender: "bot",
                                  text: fullResponse,
                                },
                              ],
                        ),
                    }
                  : chat,
              );

              useAppStore.setState({ chats: updatedChats });
              hasBotMessage = true;
            }

            if (data.type === "done") {
              eventSource.close();
              resolve({
                newMessage: { sender: "bot", text: data.fullResponse },
              });
            }
          } catch (err) {
            eventSource.close();
            reject(err);
          }
        };

        eventSource.onerror = (err) => {
          console.log(err);
          eventSource.close();
          reject(new Error("Stream failed"));
        };
      });
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      }, 1500);
    },
  });
};
