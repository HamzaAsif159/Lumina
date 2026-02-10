import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { useAppStore } from "@/store";
import { profileSchema } from "./profile.schema";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useProfile } from "@/hooks/useProfile";
import { ArrowLeft, Save } from "lucide-react";

export default function ProfilePage() {
  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();
  const updateProfileMutation = useProfile();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: userInfo?.firstName ?? "",
      lastName: userInfo?.lastName ?? "",
      email: userInfo?.email ?? "",
    },
  });

  const { isDirty } = form.formState;

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data, {
      onSuccess: (res) => {
        const updatedUser = res.user;
        setUserInfo(updatedUser);
        
        form.reset({
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
        });
        
        toast.success("Profile updated successfully");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Update failed");
      },
    });
  };

  if (!userInfo) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <Card className="w-full max-w-2xl rounded-3xl shadow-2xl border-none overflow-hidden bg-white/95 backdrop-blur-sm">
        <CardHeader className="flex flex-col items-center gap-4 pt-10 pb-6 border-b border-slate-50 bg-slate-50/30">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative">
              <UserAvatar
                firstName={userInfo.firstName}
                lastName={userInfo.lastName}
                image={userInfo.image}
                className="w-24 h-24 border-4 border-white shadow-xl"
              />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-800">
              Account Settings
            </CardTitle>
            <p className="text-slate-500 text-sm mt-1">
              Manage your Lumina identity
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            >
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-slate-50 border-slate-200 rounded-xl py-6 focus:ring-indigo-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-slate-50 border-slate-200 rounded-xl py-6 focus:ring-indigo-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        className="bg-slate-50 border-slate-200 rounded-xl py-6 focus:ring-indigo-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 flex items-center justify-between gap-4 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/dashboard")}
                  className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl px-6 cursor-pointer"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending || !isDirty}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none text-white rounded-xl px-8 py-6 shadow-lg shadow-indigo-100 transition-all font-bold"
                >
                  {updateProfileMutation.isPending ? (
                    "Saving..."
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" /> Update Profile
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
