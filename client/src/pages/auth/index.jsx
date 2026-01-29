import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { useAppStore } from "../../store";
import { useSignup, useLogin } from "@/hooks/useAuth";
import { loginSchema, signupSchema } from "./auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { HOST } from "@/utils.js/constant";

export default function AuthPage() {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const signupMutation = useSignup();
  const loginMutation = useLogin();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onLoginSubmit = async (data) => {
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        setUserInfo(res.user);
        navigate("/chat");
        toast.success("Login successful!");
        loginForm.reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Login Failed");
      },
    });
  };

  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSignupSubmit = (data) => {
    const { firstName, lastName, email, password } = data;
    signupMutation.mutate(
      { firstName, lastName, email, password },
      {
        onSuccess: (res) => {
          setUserInfo(res.user);
          toast.success("Account created successfully!");
          signupForm.reset();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Signup failed.");
        },
      },
    );
  };

  const handleGoogleLogin = () => {
    window.location.href = `${HOST}/api/auth/google`;
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl border-none">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-gray-800">
            ByteBot 👋
          </CardTitle>
          <p className="text-center text-sm text-gray-500 mt-1">
            Login or create a new account to continue to{" "}
            <span className="font-semibold">ByteBot</span>
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showLoginPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowLoginPassword(!showLoginPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showLoginPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <a href="#" className="text-indigo-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in" : "Login"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="signup">
              <Form {...signupForm}>
                <form
                  onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={signupForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showSignupPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowSignupPassword(!showSignupPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showSignupPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={signupMutation.isPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {signupMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <div className="relative w-full flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <span className="relative bg-white px-2 text-xs text-gray-400 uppercase">
              Or continue with
            </span>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full py-6 border-gray-100 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all rounded-xl shadow-sm cursor-pointer"
            onClick={handleGoogleLogin}
          >
            <FcGoogle size={24} />
            <span className="text-gray-700 font-semibold text-base">
              Google
            </span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
