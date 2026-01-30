import React, { useState, useEffect } from "react";
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
import { Loader2, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { HOST } from "@/utils/constant";
import { api } from "@/lib/api";

export default function AuthPage() {
  const navigate = useNavigate();
  const { setAuth } = useAppStore();
  const signupMutation = useSignup();
  const loginMutation = useLogin();

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mfaRequiredParam = params.get("mfaRequired");
    const mfaTokenParam = params.get("mfaToken");

    if (mfaRequiredParam === "true" && mfaTokenParam) {
      setMfaRequired(true);
      setMfaToken(mfaTokenParam);
      window.history.replaceState({}, document.title, "/auth");
      toast.info("Two-factor authentication required.");
    }
  }, []);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onLoginSubmit = async (data) => {
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        if (res.mfaRequired) {
          setMfaRequired(true);
          setMfaToken(res.mfaSessionToken);
          toast.info("Two-Factor Authentication is required.");
        } else {
          setAuth(res.user, res.accessToken);
          navigate("/chat");
          toast.success("Login successful!");
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Login Failed");
      },
    });
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    if (mfaCode.length !== 6) return toast.error("Please enter a 6-digit code");
    setIsVerifying(true);
    try {
      const response = await api.post("/api/auth/mfa/login-verify", {
        code: mfaCode,
        mfaSessionToken: mfaToken,
      });
      setAuth(response.data.user, response.data.accessToken);
      navigate("/chat");
      toast.success("Identity verified!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired code");
    } finally {
      setIsVerifying(false);
    }
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
    signupMutation.mutate(data, {
      onSuccess: (res) => {
        setAuth(res.user, res.accessToken);
        toast.success("Account created successfully!");
        navigate("/chat");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Signup failed.");
      },
    });
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
            {mfaRequired
              ? "Verify your device"
              : "Login or create an account to continue"}
          </p>
        </CardHeader>
        <CardContent>
          {!mfaRequired ? (
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
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowLoginPassword(!showLoginPassword)
                                }
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
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
                    <Button
                      type="submit"
                      className="w-full bg-indigo-600"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
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
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowSignupPassword(!showSignupPassword)
                                }
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
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
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
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
                      className="w-full bg-indigo-600"
                    >
                      {signupMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Sign Up"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-6 py-4 flex flex-col items-center">
              <div className="bg-indigo-100 p-4 rounded-full">
                <ShieldCheck size={48} className="text-indigo-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-bold text-xl text-gray-800">
                  Two-Factor Auth
                </h3>
                <p className="text-sm text-gray-500">
                  Enter the code from your authenticator app.
                </p>
              </div>
              <form onSubmit={handleMfaVerify} className="w-full space-y-4">
                <Input
                  className="text-center text-3xl h-16 tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  autoFocus
                />
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 py-6"
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Verify Identity"
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setMfaRequired(false)}
                  className="w-full text-sm text-gray-400 flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={14} /> Back to Login
                </button>
              </form>
            </div>
          )}
        </CardContent>
        {!mfaRequired && (
          <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full flex items-center">
              <div className="w-full border-t border-gray-200"></div>
              <span className="bg-white px-2 text-xs text-gray-400 uppercase absolute left-1/2 -translate-x-1/2">
                Or
              </span>
            </div>
            <Button
              variant="outline"
              className="w-full py-6 flex gap-3"
              onClick={handleGoogleLogin}
            >
              <FcGoogle size={24} />
              <span>Google</span>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
