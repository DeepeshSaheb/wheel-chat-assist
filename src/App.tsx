import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import QueriesHistoryPage from "./pages/QueriesHistoryPage";
import ChatHistoryPage from "./pages/ChatHistoryPage";
import ChatSessionPage from "./pages/ChatSessionPage";
import { ChatbotPage } from "./components/chat/ChatbotPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { OrdersPage } from "./pages/OrdersPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/chat" element={<ChatbotPage onBack={() => window.history.back()} />} />
            <Route path="/orders" element={<OrdersPage onBack={() => window.history.back()} />} />
            <Route path="/queries" element={<QueriesHistoryPage />} />
            <Route path="/chat-history" element={<ChatHistoryPage />} />
            <Route path="/chat/:sessionId" element={<ChatSessionPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
