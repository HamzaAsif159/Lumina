import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import { UserAvatar } from "./UserAvatar";
import { useLogout } from "@/hooks/useLogout";
import {
  LogOut,
  User,
  Settings as SettingsIcon,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const { userInfo } = useAppStore();
  const logoutMutation = useLogout();

  const handleProfile = () => navigate("/profile");
  const handleSettings = () => navigate("/settings");
  const handleDashboard = () => navigate("/dashboard");

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        useAppStore.getState().clearUser();
        navigate("/auth");
      },
    });
  };

  return (
    <nav className="w-full bg-white/70 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-6 py-2 flex items-center justify-between">
        <div
          className="flex items-center gap-2 group cursor-pointer select-none"
          onClick={handleDashboard}
        >
          <div className="bg-slate-900 p-1.5 rounded-lg transition-transform group-hover:rotate-12 duration-300">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">
            Lumi<span className="text-indigo-600">na</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <div className="relative shrink-0">
                <UserAvatar
                  firstName={userInfo?.firstName}
                  lastName={userInfo?.lastName}
                  image={userInfo?.image}
                  size="md"
                  className="cursor-pointer"
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-2xl p-1.5 min-w-[240px] mt-1 animate-in fade-in zoom-in-95 duration-200"
                sideOffset={8}
                align="end"
              >
                <div className="px-4 py-3 mb-1 bg-slate-50/50 rounded-xl">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Authenticated User
                  </p>
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {userInfo?.email}
                  </p>
                </div>

                <DropdownMenu.Item
                  className="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg outline-none cursor-pointer hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  onSelect={handleDashboard}
                >
                  <LayoutDashboard className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                  Home
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg outline-none cursor-pointer hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  onSelect={handleProfile}
                >
                  <User className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                  Profile
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg outline-none cursor-pointer hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  onSelect={handleSettings}
                >
                  <SettingsIcon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                  Security
                </DropdownMenu.Item>

                <div className="h-px bg-slate-100 my-1 mx-1" />

                <DropdownMenu.Item
                  className="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 rounded-lg outline-none cursor-pointer hover:bg-red-50 transition-colors"
                  onSelect={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                  <span>
                    {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                  </span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </nav>
  );
}
