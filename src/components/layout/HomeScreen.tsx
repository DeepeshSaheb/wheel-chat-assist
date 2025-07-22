import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  FileText, 
  Package, 
  LogOut, 
  User,
  Bell,
  Headphones,
  Upload,
  Bot
} from "lucide-react";
import { ChatbotPage } from "@/components/chat/ChatbotPage";

interface HomeScreenProps {
  mobile: string;
  onLogout: () => void;
}

export const HomeScreen = ({ mobile, onLogout }: HomeScreenProps) => {
  const [currentView, setCurrentView] = React.useState<'home' | 'chat'>('home');

  if (currentView === 'chat') {
    return <ChatbotPage onBack={() => setCurrentView('home')} />;
  }

  const supportOptions = [
    {
      icon: Bot,
      title: "AI Chat Assistant",
      description: "Get instant answers to scooter questions",
      action: "Start Chat",
      color: "bg-blue-500",
      onClick: () => setCurrentView('chat'),
    },
    {
      icon: MessageCircle,
      title: "Live Chat Support",
      description: "Connect with our support team",
      action: "Start Chat",
      color: "bg-green-500",
    },
    {
      icon: FileText,
      title: "Submit Question",
      description: "Send your question to our support team",
      action: "Submit",
      color: "bg-green-500",
    },
    {
      icon: Package,
      title: "Order Status",
      description: "Track your scooter orders and deliveries",
      action: "Check Orders",
      color: "bg-purple-500",
    },
    {
      icon: Upload,
      title: "Upload Files",
      description: "Share images or documents with support",
      action: "Upload",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[--gradient-bg]">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[--gradient-primary] flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Welcome back!</h2>
              <p className="text-sm text-muted-foreground">+91 {mobile}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-[--shadow-card]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">24/7</p>
                  <p className="text-xs text-muted-foreground">Support</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-[--shadow-card]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">2</p>
                  <p className="text-xs text-muted-foreground">Active Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">How can we help?</h3>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Online
            </Badge>
          </div>

          <div className="grid gap-4">
            {supportOptions.map((option, index) => (
              <Card 
                key={index}
                className="bg-card/80 backdrop-blur-sm border-0 shadow-[--shadow-card] hover:shadow-[--shadow-glow] transition-[--transition-smooth] cursor-pointer group"
                onClick={option.onClick}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${option.color} flex items-center justify-center group-hover:scale-110 transition-[--transition-smooth]`}>
                      <option.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-[--transition-smooth]">
                        {option.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-primary hover:bg-primary/10"
                    >
                      {option.action}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          
          <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-[--shadow-card]">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-sm text-foreground">Order #ES2024001 shipped</p>
                  <span className="text-xs text-muted-foreground ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-foreground">Chat session completed</p>
                  <span className="text-xs text-muted-foreground ml-auto">1 day ago</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <p className="text-sm text-foreground">Support ticket resolved</p>
                  <span className="text-xs text-muted-foreground ml-auto">3 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};