import { api } from "@/lib/api";
import { GET_USER_INFO } from "@/utils/constant";

export const createAuthSlice = (set, get) => ({
  userInfo: null,
  loading: false,
  initializeAuth: async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      set({ userInfo: null, loading: false });
      return;
    }
    if (get().loading) return;
    set({ loading: true });
    try {
      const response = await api.get(GET_USER_INFO);
      if (response.data?.user) {
        set({ userInfo: response.data.user });
      } else {
        set({ userInfo: null });
        localStorage.removeItem("accessToken");
      }
    } catch (error) {
      set({ userInfo: null });
      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
      }
    } finally {
      set({ loading: false });
    }
  },
  setAuth: (user, token) => {
    localStorage.setItem("accessToken", token);
    set({ userInfo: user });
  },
  setUserInfo: (newUserInfo) =>
    set((state) => ({
      ...state,
      userInfo: newUserInfo ? { ...state.userInfo, ...newUserInfo } : null,
    })),
  clearUser: () => {
    localStorage.removeItem("accessToken");
    set({ userInfo: null });
  },
});
