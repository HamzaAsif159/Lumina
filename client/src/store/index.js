import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createAuthSlice } from "./slices/authSlice";
import { createChatSlice } from "./slices/chatSlice";
import { createAppSocialSlice } from "./slices/socialSlice";

export const useAppStore = create(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createChatSlice(...a),
      ...createAppSocialSlice(...a),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ userInfo: state.userInfo }),
    },
  ),
);
