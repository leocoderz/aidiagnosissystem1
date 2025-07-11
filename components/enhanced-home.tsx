"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Stethoscope,
  Smartphone,
  User,
  Activity,
  ArrowRight,
  Star,
  ChevronRight,
  Play,
  Users,
  Clock,
  Award,
  X,
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
  const [showLogin, setShowLogin] = useState(false);
  const { toast } = useToast();

  // Check for existing user session on component mount
  useState(() => {
    const savedUser = localStorage.getItem("sympcare24_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("sympcare24_user");
      }
    }
  });

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

  if (user) {
    return user.type === "patient" ? (
      <MobileApp user={user} onLogout={handleLogout} />
    ) : (
      <DoctorDashboard user={user} onLogout={handleLogout} />
    );
  }

  // Simplified Main App Landing - Only Login/Signup
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Simple Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6 mx-auto">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            SympCare24
          </h1>
          <p className="text-gray-600">Your AI Health Companion</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">95%</div>
            <div className="text-xs text-gray-600">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">24/7</div>
            <div className="text-xs text-gray-600">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">500+</div>
            <div className="text-xs text-gray-600">Conditions</div>
          </div>
        </div>

        {/* Main Action Button */}
        <Button
          onClick={() => setShowLogin(true)}
          className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mb-6"
        >
          <User className="mr-3 h-6 w-6" />
          Sign In / Sign Up
          <ArrowRight className="ml-3 h-6 w-6" />
        </Button>

        {/* Feature Cards */}
        <div className="space-y-3">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Patient Care
                  </h3>
                  <p className="text-xs text-gray-600">
                    AI symptom analysis & health tracking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Medical Professionals
                  </h3>
                  <p className="text-xs text-gray-600">
                    Advanced dashboard & AI assistance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50">
          <div className="relative w-full md:max-w-md md:max-h-[90vh] h-full md:h-auto md:rounded-t-3xl bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Sign In</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLogin(false)}
                className="w-8 h-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <LoginScreen onLogin={handleLogin} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
