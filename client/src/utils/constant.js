export const HOST = import.meta.env.VITE_SERVER_URL || "http://localhost:5001";

export const AUTH_ROUTE = "/api/auth";
export const SIGN_UP_ROUTE = `${AUTH_ROUTE}/signup`;
export const LOGIN_ROUTE = `${AUTH_ROUTE}/login`;
export const LOGOUT_ROUTE = `${AUTH_ROUTE}/logout`;

export const MFA_ROUTE = `${AUTH_ROUTE}/mfa`;
export const SETUP_MFA_ROUTE = `${MFA_ROUTE}/setup`;
export const VERIFY_MFA_ROUTE = `${MFA_ROUTE}/verify`;
export const LOGIN_VERIFY_MFA_ROUTE = `${MFA_ROUTE}/login-verify`;
export const DISABLE_MFA_ROUTE = `${MFA_ROUTE}/disable`;

export const GET_USER_INFO = `/api/user/me`;
export const UPDATE_PROFILE_ROUTE = "/api/user/me";

export const FRIENDS_ROUTE = "/api/friends";
export const GET_FRIENDS_ROUTE = `${FRIENDS_ROUTE}/list`;
export const SEARCH_USERS_ROUTE = `${FRIENDS_ROUTE}/search`;

export const MESSAGES_ROUTE = "/api/messages";

export const GET_USER_CHATS_ROUTE = `${MESSAGES_ROUTE}/get-chats`;

export const ACCESS_CHAT_ROUTE = `${MESSAGES_ROUTE}`;

export const GET_CHAT_MESSAGES_ROUTE = `${MESSAGES_ROUTE}`;

export const SEND_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/send`;

export const CHAT_CREATE_ROUTE = "/api/chat/create";
export const CHAT_LIST_ROUTE = "/api/chat/chats";
export const CHAT_SEND_ROUTE = "/api/chat/send";
