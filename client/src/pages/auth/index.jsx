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
import {
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
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
          navigate("/dashboard");
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
      navigate("/dashboard");
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
        navigate("/dashboard");
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
      <Card className="w-full max-w-2xl shadow-2xl rounded-3xl border-none overflow-hidden bg-white/95 backdrop-blur-sm">
        <CardHeader className="pt-8 pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
              Lumi<span className="text-indigo-600">na</span>
            </CardTitle>
          </div>
          <p className="text-center text-sm text-slate-500">
            {mfaRequired
              ? "Verify your identity to continue"
              : "Welcome! Please enter your details."}
          </p>
        </CardHeader>
        <CardContent className="px-8">
          {!mfaRequired ? (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 p-1 rounded-xl">
                <TabsTrigger
                  value="login"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Sign Up
                </TabsTrigger>
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
                          <FormLabel className="text-xs font-bold uppercase text-slate-500">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="bg-slate-50 border-slate-200 focus:ring-indigo-500 rounded-xl"
                              placeholder="name@company.com"
                              {...field}
                            />
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
                          <FormLabel className="text-xs font-bold uppercase text-slate-500">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                className="bg-slate-50 border-slate-200 focus:ring-indigo-500 rounded-xl"
                                type={showLoginPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowLoginPassword(!showLoginPassword)
                                }
                                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-indigo-500"
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
                      className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup">
                <Form {...signupForm}>
                  <form
                    onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={signupForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase text-slate-500">
                              First Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="bg-slate-50 border-slate-200 rounded-xl"
                                placeholder="John"
                                {...field}
                              />
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
                            <FormLabel className="text-xs font-bold uppercase text-slate-500">
                              Last Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="bg-slate-50 border-slate-200 rounded-xl"
                                placeholder="Doe"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase text-slate-500">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="bg-slate-50 border-slate-200 rounded-xl"
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
                          <FormLabel className="text-xs font-bold uppercase text-slate-500">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                className="bg-slate-50 border-slate-200 rounded-xl"
                                type={showSignupPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowSignupPassword(!showSignupPassword)
                                }
                                className="absolute inset-y-0 right-3 text-slate-400"
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
                          <FormLabel className="text-xs font-bold uppercase text-slate-500">
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                className="bg-slate-50 border-slate-200 rounded-xl"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute inset-y-0 right-3 text-slate-400"
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
                      className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all"
                    >
                      {signupMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-6 py-2 flex flex-col items-center">
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <ShieldCheck size={40} className="text-indigo-600" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-bold text-xl text-slate-800">
                  Two-Factor Auth
                </h3>
                <p className="text-sm text-slate-500">
                  Enter the 6-digit code from your app
                </p>
              </div>
              <form onSubmit={handleMfaVerify} className="w-full space-y-4">
                <Input
                  className="text-center text-3xl h-16 tracking-[0.3em] font-mono font-bold bg-slate-50 border-slate-200 rounded-xl focus:ring-indigo-500"
                  placeholder="000000"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  autoFocus
                />
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 py-6 rounded-xl font-bold"
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
                  className="w-full text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Login
                </button>
              </form>
            </div>
          )}
        </CardContent>
        {!mfaRequired && (
          <CardFooter className="flex flex-col gap-4 px-8 pb-8">
            <div className="relative w-full flex items-center py-2">
              <div className="w-full border-t border-slate-100"></div>
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute left-1/2 -translate-x-1/2">
                Secure Social Login
              </span>
            </div>
            <Button
              variant="outline"
              className="w-full py-6 flex gap-3 rounded-xl border-slate-200 hover:bg-slate-50 transition-all font-semibold text-slate-700"
              onClick={handleGoogleLogin}
            >
              <FcGoogle size={20} />
              <span>Continue with Google</span>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
