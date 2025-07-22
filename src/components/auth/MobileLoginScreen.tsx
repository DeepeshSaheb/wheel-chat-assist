import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, ArrowRight } from "lucide-react";
import escooterHero from "@/assets/escooter-hero.jpg";

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
      {/* Background Hero Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src={escooterHero} 
          alt="Electric Scooter" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/95"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Hero Image Section */}
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden shadow-2xl ring-2 ring-primary/20">
              <img 
                src={escooterHero} 
                alt="ElectroSupport - Electric Scooter" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-[--gradient-primary] flex items-center justify-center shadow-[--shadow-glow] animate-pulse">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground animate-fade-in">ElectroSupport</h1>
            <p className="text-muted-foreground text-lg animate-fade-in">Your electric scooter companion</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-[--shadow-card] border-0 bg-card/90 backdrop-blur-lg animate-scale-in">
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