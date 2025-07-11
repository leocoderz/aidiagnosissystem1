"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  ChevronRight,
  Play,
  Sparkles,
  Users,
  Clock,
  Award,
  X,
  ChevronLeft,
  Download,
  Share,
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Show splash screen for 2.5 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      setIsLoading(false);

      // Check if user has seen onboarding
      const hasSeenOnboarding = localStorage.getItem(
        "sympcare24_onboarding_seen",
      );
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }

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
    }, 2500);

    return () => clearTimeout(splashTimer);
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

  const onboardingSteps = [
    {
      title: "AI-Powered Health Companion",
      description:
        "Get instant medical insights powered by advanced artificial intelligence",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "24/7 Health Monitoring",
      description: "Track your symptoms and health metrics around the clock",
      icon: Activity,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Professional Medical Care",
      description: "Connect with certified healthcare professionals instantly",
      icon: Stethoscope,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Secure & Private",
      description:
        "Your health data is protected with enterprise-grade security",
      icon: Shield,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
    },
  ];

  const nextOnboardingStep = () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setShowOnboarding(false);
      localStorage.setItem("sympcare24_onboarding_seen", "true");
    }
  };

  const skipOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("sympcare24_onboarding_seen", "true");
  };

  // Splash Screen
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 flex items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 text-center text-white">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Heart className="h-16 w-16 text-white animate-pulse" />
            </div>
            <div className="absolute inset-0 w-32 h-32 bg-white/10 rounded-3xl mx-auto animate-ping"></div>
          </div>

          <h1 className="text-5xl font-bold mb-4 animate-fade-in">
            SympCare24
          </h1>
          <p className="text-xl text-white/80 animate-fade-in delay-300">
            Your AI Health Companion
          </p>

          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-200"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-400"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding Flow
  if (showOnboarding) {
    const currentStep = onboardingSteps[onboardingStep];
    const IconComponent = currentStep.icon;

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white flex flex-col">
        {/* Progress Bar */}
        <div className="flex-shrink-0 p-6 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= onboardingStep ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipOnboarding}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
          <div
            className={`w-48 h-48 ${currentStep.bgColor} rounded-full flex items-center justify-center mb-12 relative`}
          >
            <div
              className={`w-32 h-32 bg-gradient-to-r ${currentStep.color} rounded-full flex items-center justify-center shadow-2xl`}
            >
              <IconComponent className="h-16 w-16 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full animate-pulse"></div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6 max-w-sm">
            {currentStep.title}
          </h2>

          <p className="text-lg text-gray-600 text-center mb-12 max-w-md leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex-shrink-0 p-6 pt-4">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={
                onboardingStep > 0
                  ? () => setOnboardingStep(onboardingStep - 1)
                  : undefined
              }
              className={`${onboardingStep === 0 ? "invisible" : ""}`}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={nextOnboardingStep}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8"
            >
              {onboardingStep === onboardingSteps.length - 1
                ? "Get Started"
                : "Next"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
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

  // Main App Landing
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col">
      {/* Status Bar Simulation */}
      <div className="flex-shrink-0 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white text-sm font-medium">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span>SympCare24</span>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-8 flex flex-col h-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6 animate-float">
                <Heart className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              SympCare24
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Your AI Health Companion
            </p>

            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge className="bg-green-100 text-green-700 border-green-200 rounded-full">
                <Star className="h-3 w-3 mr-1 fill-current" />
                4.9 Rating
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 rounded-full">
                <Users className="h-3 w-3 mr-1" />
                10K+ Users
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">95%</div>
              <div className="text-xs text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">24/7</div>
              <div className="text-xs text-gray-600">Available</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Award className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">500+</div>
              <div className="text-xs text-gray-600">Conditions</div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4 mb-8 flex-1">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Patient Care
                    </h3>
                    <p className="text-sm text-gray-600">
                      AI symptom analysis & health tracking
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Medical Professionals
                    </h3>
                    <p className="text-sm text-gray-600">
                      Advanced dashboard & AI assistance
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={() => setShowLogin(true)}
              className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Play className="mr-3 h-6 w-6" />
              Get Started
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => setShowOnboarding(true)}
                className="h-14 rounded-2xl border-2 border-gray-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Tour App
              </Button>
              <Button
                variant="outline"
                className="h-14 rounded-2xl border-2 border-gray-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
              >
                <Share className="mr-2 h-5 w-5" />
                Share App
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Safe Area */}
      <div className="flex-shrink-0 h-8 bg-gradient-to-r from-blue-600 to-cyan-600"></div>

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
