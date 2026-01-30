import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Loader2, ShieldOff } from "lucide-react";
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
    if (window.confirm("Are you sure?")) disableMfa.mutate();
  };

  const isLoading =
    setupMfa.isPending || verifyMfa.isPending || disableMfa.isPending;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Security Settings
        </h1>

        {step === "idle" && (
          <div className="space-y-4">
            <p className="text-gray-500">
              Protect your account with Two-Factor Authentication.
            </p>
            <Button
              onClick={handleStartSetup}
              className="bg-indigo-600 w-full py-6"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Enable MFA"}
            </Button>
          </div>
        )}

        {step === "setup" && (
          <div className="space-y-6">
            <p className="text-sm font-medium text-gray-600">
              Scan this QR code in Google Authenticator
            </p>
            <div className="flex justify-center p-4 bg-gray-50 rounded-xl border border-dashed">
              <img
                src={setupMfa.data?.qrCode}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
            <Input
              className="text-center text-2xl h-14 tracking-[0.3em] font-mono font-bold"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleVerify}
                className="bg-green-600 w-full"
                disabled={isLoading}
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
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === "verified" && (
          <div className="py-6 space-y-6">
            <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="text-green-500" size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">MFA is Active</h2>
            <Button
              onClick={handleDisable}
              variant="ghost"
              className="w-full text-red-500"
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
      </div>
    </div>
  );
}
