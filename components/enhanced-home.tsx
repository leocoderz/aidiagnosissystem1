"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Stethoscope,
  Smartphone,
  User,
  Activity,
  Brain,
} from "lucide-react";
import LoginScreen from "@/components/login-screen";
import MobileApp from "@/components/mobile-app";
import DoctorDashboard from "@/components/doctor-dashboard";
import { useToast } from "@/hooks/use-toast";

interface SympCareUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  type: "patient" | "doctor";
  age?: number;
  gender?: "male" | "female" | "other";
  phone?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
  specialization?: string;
  licenseNumber?: string;
  hospital?: string;
}

export default function EnhancedHome() {
  const [user, setUser] = useState<SympCareUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem("sympcare24_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("sympcare24_user");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: SympCareUser) => {
    setUser(userData);
    localStorage.setItem("sympcare24_user", JSON.stringify(userData));
    setShowLogin(false);
    toast({
      title: "Welcome to SympCare24!",
      description: `Successfully logged in as ${userData.name}`,
    });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("sympcare24_user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out of SympCare24",
    });
  };

  const handleDemoLogin = (type: "patient" | "doctor") => {
    // Demo login removed - please use actual login
    setShowLogin(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Loading SympCare24...</h2>
        </div>
      </div>
    );
  }

  if (user) {
    return user.type === "patient" ? (
      <MobileApp user={user} onLogout={handleLogout} />
    ) : (
      <DoctorDashboard user={user} onLogout={handleLogout} />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">SympCare24</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered healthcare platform for patients and medical
            professionals
          </p>

          <div className="flex items-center justify-center space-x-2 mb-8">
            <Badge variant="secondary">
              <Brain className="h-4 w-4 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="secondary">
              <Activity className="h-4 w-4 mr-1" />
              Real-time Monitoring
            </Badge>
          </div>
        </div>

        {/* Login Option */}
        <div className="max-w-md mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">Access SympCare24</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Sign in to access your personalized healthcare dashboard with
                AI-powered diagnosis and health monitoring.
              </p>
              <Button className="w-full" onClick={() => setShowLogin(true)}>
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Sign In</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLogin(false)}
              >
                ×
              </Button>
            </div>
            <LoginScreen onLogin={handleLogin} />
          </div>
        </div>
      )}
    </div>
  );
}
