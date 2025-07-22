import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, RotateCcw } from "lucide-react";

interface OTPVerificationScreenProps {
  mobile: string;
  onVerifyOTP: (otp: string) => Promise<void>;
  onBack: () => void;
  onResendOTP: () => Promise<void>;
  isLoading?: boolean;
}

export const OTPVerificationScreen = ({ 
  mobile, 
  onVerifyOTP, 
  onBack, 
  onResendOTP,
  isLoading = false
}: OTPVerificationScreenProps) => {
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    
    await onVerifyOTP(otp);
  };

  const handleResend = async () => {
    setResendTimer(30);
    setCanResend(false);
    setOtp("");
    await onResendOTP();
  };

  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOTP();
    }
  }, [otp]);

  return (
    <div className="min-h-screen bg-[--gradient-bg] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full hover:bg-accent/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Verify OTP</h1>
            <p className="text-sm text-muted-foreground">
              Sent to +91 {mobile}
            </p>
          </div>
        </div>

        {/* OTP Card */}
        <Card className="shadow-[--shadow-card] border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl">Enter Verification Code</CardTitle>
            <CardDescription>
              We've sent a 6-digit code to your mobile number
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-primary">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-sm font-medium">Verifying...</span>
              </div>
            )}

            {/* Resend OTP */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              
              {canResend ? (
                <Button
                  variant="outline"
                  onClick={handleResend}
                  className="gap-2 hover:bg-accent/50 transition-[--transition-smooth]"
                >
                  <RotateCcw className="w-4 h-4" />
                  Resend OTP
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                  Resend in {resendTimer}s
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Enter the 6-digit code sent to your mobile number
        </div>
      </div>
    </div>
  );
};