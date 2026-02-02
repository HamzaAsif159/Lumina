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
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const { userInfo } = useAppStore();
  const logoutMutation = useLogout();

  const handleProfile = () => navigate("/profile");
  const handleSettings = () => navigate("/settings");

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        useAppStore.getState().clearUser();
        navigate("/auth");
      },
    });
  };

  return (
    <nav className="w-full bg-white/90 backdrop-blur-xl border-b border-indigo-100 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between h-16">
        <div
          className="font-black text-xl bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 hover:scale-[1.02] cursor-pointer select-none"
          onClick={() => navigate("/chat")}
        >
          ByteBot
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="outline-none group">
              <div className="relative bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 p-2 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:shadow-indigo-200/50">
                <UserAvatar
                  firstName={userInfo?.firstName || "U"}
                  lastName={userInfo?.lastName || "N"}
                  image={userInfo?.image}
                  size="sm"
                />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-500 border-2 border-white rounded-full shadow-sm" />
              </div>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content className="bg-white/95 backdrop-blur-xl border border-indigo-100 shadow-xl rounded-xl p-1 min-w-[220px] mr-1">
              <div className="px-3 py-2.5 border-b border-indigo-100">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  <span className="text-xs font-medium text-indigo-600 uppercase tracking-wider">
                    Active
                  </span>
                </div>
                <div className="font-medium text-xs text-slate-800 truncate">
                  {userInfo?.email}
                </div>
              </div>

              <DropdownMenu.Item
                className="px-3 py-2.5 cursor-pointer hover:bg-indigo-50 rounded-lg flex items-center gap-2.5 font-medium text-slate-800 transition-all duration-150 hover:scale-[1.01]"
                onSelect={handleProfile}
              >
                <div className="p-1.5 bg-indigo-100/50 hover:bg-indigo-200 rounded transition-colors">
                  <User className="h-4 w-4 text-indigo-600" />
                </div>
                Profile
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className="px-3 py-2.5 cursor-pointer hover:bg-indigo-50 rounded-lg flex items-center gap-2.5 font-medium text-slate-800 transition-all duration-150 hover:scale-[1.01]"
                onSelect={handleSettings}
              >
                <div className="p-1.5 bg-indigo-100/50 hover:bg-indigo-200 rounded transition-colors">
                  <SettingsIcon className="h-4 w-4 text-indigo-600" />
                </div>
                Settings
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className="px-3 py-2.5 cursor-pointer hover:bg-indigo-50 border-t border-indigo-100 rounded-b-lg flex items-center gap-2.5 font-medium text-slate-800 transition-all duration-150 data-[disabled]:opacity-50"
                onSelect={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <div className="p-1.5 bg-indigo-100/50 hover:bg-indigo-200 rounded transition-colors">
                  <LogOut className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="flex-1">
                  {logoutMutation.isPending ? "Logging out..." : "Sign Out"}
                </span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </nav>
  );
}
