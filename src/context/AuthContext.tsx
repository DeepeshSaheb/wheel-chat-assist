import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  userMobile: string | null;
  login: (mobile: string) => void;
  logout: () => void;
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

  useEffect(() => {
    // Check for stored auth state on app start
    const storedMobile = localStorage.getItem("userMobile");
    if (storedMobile) {
      setUserMobile(storedMobile);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (mobile: string) => {
    setUserMobile(mobile);
    setIsAuthenticated(true);
    localStorage.setItem("userMobile", mobile);
  };

  const logout = () => {
    setUserMobile(null);
    setIsAuthenticated(false);
    localStorage.removeItem("userMobile");
  };

  const value = {
    isAuthenticated,
    userMobile,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};