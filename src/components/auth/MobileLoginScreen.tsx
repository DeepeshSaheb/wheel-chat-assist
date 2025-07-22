import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, ArrowRight } from "lucide-react";

interface MobileLoginScreenProps {
  onSendOTP: (mobile: string) => Promise<void>;
  isLoading?: boolean;
}

export const MobileLoginScreen = ({ onSendOTP, isLoading = false }: MobileLoginScreenProps) => {
  const [mobile, setMobile] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) return;
    
    await onSendOTP(mobile);
  };

  const formatMobile = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.slice(0, 10);
  };

  return (
    <div className="min-h-screen bg-[--gradient-bg] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-[--gradient-primary] flex items-center justify-center shadow-[--shadow-glow]">
            <Smartphone className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">ElectroSupport</h1>
            <p className="text-muted-foreground">Your electric scooter companion</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-[--shadow-card] border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>
              Enter your mobile number to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-sm font-medium">
                  Mobile Number
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 flex items-center text-muted-foreground">
                    <span className="text-sm">+91</span>
                  </div>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(formatMobile(e.target.value))}
                    className="pl-12 h-12 text-base transition-[--transition-smooth] focus:shadow-[--shadow-glow]"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all duration-300 shadow-lg text-base font-medium"
                disabled={mobile.length !== 10 || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Sending OTP...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Send OTP
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
};