import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot,
  LogOut, 
  User,
  Bell,
  Zap,
  Battery,
  MapPin,
  Star,
  Calendar,
  Clock,
  Shield,
  ChevronRight,
  Sparkles
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
      title: "Evolve - AI Assistant",
      description: "Get instant answers about your escooter",
      action: "Start Chat",
      onClick: () => setCurrentView('chat'),
    }
  ];

  const escooterFeatures = [
    {
      icon: Zap,
      title: "High Performance",
      description: "Up to 50km range on single charge",
      color: "bg-gradient-to-r from-yellow-400 to-orange-500"
    },
    {
      icon: Battery,
      title: "Fast Charging",
      description: "0-80% charge in just 3 hours",
      color: "bg-gradient-to-r from-green-400 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Advanced braking & LED lights",
      color: "bg-gradient-to-r from-blue-400 to-purple-500"
    }
  ];

  const newLaunchProducts = [
    {
      name: "EcoRide Pro X",
      price: "₹89,999",
      features: ["65km Range", "Dual Motors", "Smart Dashboard"],
      status: "Pre-Order",
      image: "🛴"
    },
    {
      name: "EcoRide City",
      price: "₹45,999", 
      features: ["35km Range", "Lightweight", "Foldable"],
      status: "Available",
      image: "🛵"
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-bg)' }}>
      {/* Header */}
      <header className="bg-card/90 backdrop-blur-lg border-b border-border/30 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center shadow-lg shadow-primary/20">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">Welcome back!</h2>
              <p className="text-sm text-muted-foreground">+91 {mobile}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
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
      <main className="p-4 max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card/80 to-primary/5 p-8 border border-border/30" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                New Launch
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Ride the Future with EcoRide
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
              Experience the next generation of electric scooters. Sustainable, powerful, and designed for the modern rider.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl shadow-lg shadow-primary/20">
                Explore Models
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="px-6 py-3 rounded-xl border-primary/30 hover:bg-primary/5">
                Book Test Ride
              </Button>
            </div>
          </div>
        </div>

        {/* AI Assistant Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Need Help?</h3>
          
          <div className="grid gap-4">
            {supportOptions.map((option, index) => (
              <Card 
                key={index}
                className="bg-card/80 backdrop-blur-sm border-border/30 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 cursor-pointer group"
                onClick={option.onClick}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <option.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                        {option.title}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {option.description}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-primary hover:bg-primary/10 rounded-xl px-2 sm:px-3 flex-shrink-0"
                    >
                      <span className="hidden sm:inline">{option.action}</span>
                      <ChevronRight className="w-4 h-4 sm:ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">50km</p>
              <p className="text-xs text-muted-foreground">Max Range</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                <Battery className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">3hrs</p>
              <p className="text-xs text-muted-foreground">Fast Charge</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">4.8</p>
              <p className="text-xs text-muted-foreground">User Rating</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">500+</p>
              <p className="text-xs text-muted-foreground">Service Centers</p>
            </CardContent>
          </Card>
        </div>

        {/* New Launch Products */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">New Launch Collection</h3>
            <Badge className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
              Limited Time
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {newLaunchProducts.map((product, index) => (
              <Card 
                key={index}
                className="bg-card/80 backdrop-blur-sm border-border/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{product.image}</div>
                    <Badge 
                      variant={product.status === "Available" ? "default" : "outline"}
                      className={product.status === "Available" ? "bg-green-500" : "bg-orange-500"}
                    >
                      {product.status}
                    </Badge>
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">{product.name}</h4>
                  <p className="text-2xl font-bold text-primary mb-3">{product.price}</p>
                  <div className="space-y-2 mb-4">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 text-primary-foreground rounded-xl">
                    {product.status === "Available" ? "Buy Now" : "Pre-Order"}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Why Choose EcoRide?</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {escooterFeatures.map((feature, index) => (
              <Card key={index} className="bg-card/80 backdrop-blur-sm border-border/30 hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>


        {/* Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Recent Activity</h3>
          
          <Card className="bg-card/80 backdrop-blur-sm border-border/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">EcoRide Pro X pre-order confirmed</p>
                    <p className="text-xs text-muted-foreground">Order #ES2024001</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    2 hours ago
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Test ride scheduled</p>
                    <p className="text-xs text-muted-foreground">Tomorrow at 3:00 PM</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    1 day ago
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">AI Chat session completed</p>
                    <p className="text-xs text-muted-foreground">Battery care tips discussed</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    3 days ago
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};