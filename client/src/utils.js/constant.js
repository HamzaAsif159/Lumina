export const HOST = import.meta.env.VITE_SERVER_URL || "http://localhost:5001";

export const AUTH_ROUTE = "/api/auth";

export const SIGN_UP_ROUTE = `${AUTH_ROUTE}/signup`;
export const LOGIN_ROUTE = `${AUTH_ROUTE}/login`;
export const LOGOUT_ROUTE = `${AUTH_ROUTE}/logout`;

export const GET_USER_INFO = `api/user/me`;
export const UPDATE_PROFILE_ROUTE = "/api/user/me";

export const CHAT_CREATE_ROUTE = "/api/chat/create";
export const CHAT_LIST_ROUTE = "/api/chat/chats";
export const CHAT_SEND_ROUTE = "/api/chat/send";
