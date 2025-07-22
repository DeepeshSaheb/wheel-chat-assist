import { useAuth } from "@/context/AuthContext";
import { AuthPage } from "./AuthPage";
import { HomeScreen } from "@/components/layout/HomeScreen";

const Index = () => {
  const { isAuthenticated, userMobile, logout } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <HomeScreen 
      mobile={userMobile || ""} 
      onLogout={logout} 
    />
  );
};

export default Index;
