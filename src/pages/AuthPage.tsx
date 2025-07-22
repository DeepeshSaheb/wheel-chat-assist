import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MobileLoginScreen } from "@/components/auth/MobileLoginScreen";
import { OTPVerificationScreen } from "@/components/auth/OTPVerificationScreen";
import { useToast } from "@/hooks/use-toast";

export const AuthPage = () => {
  const [currentStep, setCurrentStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSendOTP = (mobileNumber: string) => {
    setMobile(mobileNumber);
    setCurrentStep("otp");
    toast({
      title: "OTP Sent",
      description: `Verification code sent to +91 ${mobileNumber}`,
    });
  };

  const handleVerifyOTP = (otp: string) => {
    // In a real app, this would verify with backend
    // For demo, accept any 6-digit OTP
    if (otp.length === 6) {
      login(mobile);
      toast({
        title: "Login Successful",
        description: "Welcome to ElectroSupport!",
      });
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setCurrentStep("mobile");
  };

  const handleResendOTP = () => {
    toast({
      title: "OTP Resent",
      description: `New verification code sent to +91 ${mobile}`,
    });
  };

  return (
    <>
      {currentStep === "mobile" && (
        <MobileLoginScreen onSendOTP={handleSendOTP} />
      )}
      {currentStep === "otp" && (
        <OTPVerificationScreen
          mobile={mobile}
          onVerifyOTP={handleVerifyOTP}
          onBack={handleBack}
          onResendOTP={handleResendOTP}
        />
      )}
    </>
  );
};