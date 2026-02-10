import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldCheck, Loader2, ShieldOff, Fingerprint } from "lucide-react";
import { useAppStore } from "@/store";
import { useMfa } from "@/hooks/useMfa";

export default function Settings() {
  const { userInfo } = useAppStore();
  const { setupMfa, verifyMfa, disableMfa } = useMfa();

  const [step, setStep] = useState("idle");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (userInfo?.mfa?.enabled) setStep("verified");
    else setStep("idle");
  }, [userInfo?.mfa?.enabled]);

  const handleStartSetup = async () => {
    await setupMfa.mutateAsync();
    setStep("setup");
  };

  const handleVerify = () => {
    if (code.length !== 6) return;
    verifyMfa.mutate(code);
  };

  const handleDisable = () => {
    if (window.confirm("Are you sure? This will reduce your account security."))
      disableMfa.mutate();
  };

  const isLoading =
    setupMfa.isPending || verifyMfa.isPending || disableMfa.isPending;

  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <Card className="w-full max-w-2xl rounded-3xl shadow-2xl border-none overflow-hidden bg-white/95">
        <CardHeader className="text-center pt-10 pb-4">
          <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Fingerprint className="text-indigo-600 w-10 h-10" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">
            Security Settings
          </CardTitle>
          <p className="text-gray-500 mt-2">Manage your account protection</p>
        </CardHeader>

        <CardContent className="px-8 pb-10 text-center">
          {step === "idle" && (
            <div className="space-y-6">
              <p className="text-slate-600 leading-relaxed">
                Add an extra layer of security to your account by enabling
                Two-Factor Authentication (MFA).
              </p>
              <Button
                onClick={handleStartSetup}
                className="bg-indigo-600 hover:bg-indigo-700 w-full py-6 text-lg font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Enable MFA Now"
                )}
              </Button>
            </div>
          )}

          {step === "setup" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Step 1: Scan QR Code
                </p>
                <p className="text-xs text-gray-500">
                  Open your Authenticator app and scan the code below
                </p>
              </div>

              <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-indigo-100">
                {setupMfa.data?.qrCode ? (
                  <img
                    src={setupMfa.data?.qrCode}
                    alt="QR Code"
                    className="w-44 h-44"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center">
                    <Loader2 className="animate-spin text-indigo-500" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Step 2: Enter 6-Digit Code
                </p>
                <Input
                  className="text-center text-3xl h-16 tracking-[0.4em] font-mono font-bold bg-gray-50 border-indigo-100 rounded-xl focus-visible:ring-indigo-500"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleVerify}
                  className="bg-indigo-600 hover:bg-indigo-700 w-full py-6 rounded-xl font-bold transition-all"
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Verify & Activate"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep("idle")}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Cancel Setup
                </Button>
              </div>
            </div>
          )}

          {step === "verified" && (
            <div className="py-4 space-y-8">
              <div className="relative">
                <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <ShieldCheck className="text-green-600" size={56} />
                </div>
                <div className="absolute top-0 right-[35%] w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  MFA is Protected
                </h2>
                <p className="text-sm text-gray-500 px-4">
                  Your account is secured with a secondary device. You will be
                  asked for a code during login.
                </p>
              </div>

              <Button
                onClick={handleDisable}
                variant="ghost"
                className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <ShieldOff className="mr-2 h-4 w-4" />
                )}
                Disable Two-Factor Auth
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
