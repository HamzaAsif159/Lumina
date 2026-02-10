import React, { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AuthPage from "./pages/auth";
import Chat from "./pages/chat";
import Profile from "./pages/profile";
import Settings from "./pages/settings";
import Dashboard from "./pages/dashboard";
import SocialMessages from "./pages/messages";
import Navbar from "./components/common/Navbar";
import { useAppStore } from "./store";
import { Loader2 } from "lucide-react";

const PrivateRoute = ({ children }) => {
  const { userInfo, loading } = useAppStore();
  if (loading) return null;
  return userInfo?._id ? children : <Navigate to="/auth" replace />;
};

const AuthRoute = ({ children }) => {
  const { userInfo, loading } = useAppStore();
  if (loading) return null;
  return userInfo?._id ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  const { initializeAuth, loading, userInfo, setupNats } = useAppStore();
  const location = useLocation();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (userInfo?._id) {
      setupNats(userInfo._id);
    }
  }, [userInfo, setupNats]);

  if (loading && !userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  const showNavbar = userInfo?._id && location.pathname !== "/auth";

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <AuthPage />
            </AuthRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <SocialMessages />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
