import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MobileLoginScreen } from "@/components/auth/MobileLoginScreen";
import { OTPVerificationScreen } from "@/components/auth/OTPVerificationScreen";
import { useToast } from "@/hooks/use-toast";

export const AuthPage = () => {
  const [currentStep, setCurrentStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { sendOTP, verifyOTP } = useAuth();
  const { toast } = useToast();

  const handleSendOTP = async (mobileNumber: string) => {
    setIsLoading(true);
    const { error } = await sendOTP(mobileNumber);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    setMobile(mobileNumber);
    setCurrentStep("otp");
    setIsLoading(false);
    toast({
      title: "OTP Sent",
      description: `Verification code sent to +91 ${mobileNumber}`,
    });
  };

  const handleVerifyOTP = async (otp: string) => {
    setIsLoading(true);
    const { error } = await verifyOTP(mobile, otp);
    
    if (error) {
      toast({
        title: "Invalid OTP",
        description: error,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    setIsLoading(false);
    toast({
      title: "Login Successful",
      description: "Welcome to ElectroSupport!",
    });
  };

  const handleBack = () => {
    setCurrentStep("mobile");
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    const { error } = await sendOTP(mobile);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    setIsLoading(false);
    toast({
      title: "OTP Resent",
      description: `New verification code sent to +91 ${mobile}`,
    });
  };

  return (
    <>
      {currentStep === "mobile" && (
        <MobileLoginScreen onSendOTP={handleSendOTP} isLoading={isLoading} />
      )}
      {currentStep === "otp" && (
        <OTPVerificationScreen
          mobile={mobile}
          onVerifyOTP={handleVerifyOTP}
          onBack={handleBack}
          onResendOTP={handleResendOTP}
          isLoading={isLoading}
        />
      )}
    </>
  );
};