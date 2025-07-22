import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { AuthPage } from "./AuthPage";
import { HomeScreen } from "@/components/layout/HomeScreen";
import { AdminDashboard } from "./AdminDashboard";

const Index = () => {
  const { isAuthenticated, userMobile, logout } = useAuth();
  const { userRole, isLoading } = useUserRole();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Redirect admin users to admin dashboard
  if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <HomeScreen 
      mobile={userMobile || ""} 
      onLogout={logout} 
    />
  );
};

export default Index;
