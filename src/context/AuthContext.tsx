import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  isAuthenticated: boolean;
  userMobile: string | null;
  user: User | null;
  session: Session | null;
  sendOTP: (mobile: string) => Promise<{ error?: string }>;
  verifyOTP: (mobile: string, otp: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userMobile, setUserMobile] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        
        // Extract mobile number from user metadata
        if (session?.user?.phone) {
          setUserMobile(session.user.phone);
        } else if (session?.user?.user_metadata?.phone) {
          setUserMobile(session.user.user_metadata.phone);
        } else {
          setUserMobile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      
      if (session?.user?.phone) {
        setUserMobile(session.user.phone);
      } else if (session?.user?.user_metadata?.phone) {
        setUserMobile(session.user.user_metadata.phone);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const sendOTP = async (mobile: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${mobile}`,
        options: {
          channel: 'sms'
        }
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      return { error: 'Failed to send OTP. Please try again.' };
    }
  };

  const verifyOTP = async (mobile: string, otp: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: `+91${mobile}`,
        token: otp,
        type: 'sms'
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      return { error: 'Invalid OTP. Please try again.' };
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  const value = {
    isAuthenticated,
    userMobile,
    user,
    session,
    sendOTP,
    verifyOTP,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};