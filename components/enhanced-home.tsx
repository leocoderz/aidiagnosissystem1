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
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Tablet,
  Monitor,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full mx-auto animate-ping opacity-20"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">SympCare24</h2>
          <p className="text-gray-600">Loading your health companion...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto px-4 pt-8 pb-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Heart className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              SympCare24
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Your AI-powered health companion for
              <span className="block md:inline font-semibold text-blue-600">
                {" "}
                24/7 medical care
              </span>
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 border-blue-200 px-4 py-2 text-sm font-medium rounded-full"
              >
                <Brain className="h-4 w-4 mr-2" />
                AI-Powered Diagnosis
              </Badge>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 border-green-200 px-4 py-2 text-sm font-medium rounded-full"
              >
                <Activity className="h-4 w-4 mr-2" />
                Real-time Monitoring
              </Badge>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 border-purple-200 px-4 py-2 text-sm font-medium rounded-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                HIPAA Compliant
              </Badge>
            </div>
          </div>

          {/* Main CTA */}
          <div className="max-w-md mx-auto mb-16">
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <User className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Access Your Health Dashboard
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Sign in to manage your health with AI-powered insights
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => setShowLogin(true)}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <User className="mr-3 h-5 w-5" />
                  Get Started
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Patient Care
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  AI symptom analysis, health tracking, and personalized
                  recommendations
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Medical Professionals
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Advanced dashboard for patient management and AI-assisted
                  diagnosis
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  AI Intelligence
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Cutting-edge AI for accurate diagnosis and treatment
                  recommendations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  10K+
                </div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  95%
                </div>
                <div className="text-sm text-gray-600">Accuracy Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  24/7
                </div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-600 mb-1">
                  500+
                </div>
                <div className="text-sm text-gray-600">Conditions</div>
              </div>
            </div>
          </div>

          {/* Device Compatibility */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Works on All Your Devices
            </h3>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <Smartphone className="h-8 w-8 text-gray-600" />
              <Tablet className="h-8 w-8 text-gray-600" />
              <Monitor className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
            <LoginScreen onLogin={handleLogin} />
          </div>
        </div>
      )}
    </div>
  );
}
