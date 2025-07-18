"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Loader2,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  UserPlus,
  ArrowRight,
  Stethoscope,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginUser {
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

interface LoginScreenProps {
  onLogin: (user: LoginUser) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState("patient");
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">(
    "signin",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateUserId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const validateForm = () => {
    if (authMode === "forgot") {
      if (!formData.email) {
        throw new Error("Email address is required");
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }
      return;
    }

    if (!formData.email || !formData.password) {
      throw new Error("Email and password are required");
    }

    if (authMode === "signup") {
      if (!formData.name) {
        throw new Error("Full name is required");
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      throw new Error("Please enter a valid email address");
    }
  };

  const checkUserExists = (email: string): any | null => {
    const existingUsers = JSON.parse(
      localStorage.getItem("sympcare24_users") || "[]",
    );
    return existingUsers.find((user: any) => user.email === email) || null;
  };

  const saveUser = (user: LoginUser) => {
    const existingUsers = JSON.parse(
      localStorage.getItem("sympcare24_users") || "[]",
    );
    const existingUserIndex = existingUsers.findIndex(
      (u: any) => u.email === user.email,
    );

    const userWithPassword = { ...user, password: formData.password };

    if (existingUserIndex >= 0) {
      existingUsers[existingUserIndex] = {
        ...userWithPassword,
        lastLogin: new Date().toISOString(),
      };
    } else {
      existingUsers.push({
        ...userWithPassword,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });
    }

    localStorage.setItem("sympcare24_users", JSON.stringify(existingUsers));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      validateForm();

      // Handle forgot password
      if (authMode === "forgot") {
        const response = await fetch("/api/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setForgotPasswordSent(true);
          toast({
            title: "Reset Link Sent",
            description: data.message,
          });
        } else {
          throw new Error(data.error || "Failed to send reset email");
        }

        setIsLoading(false);
        return;
      }

      // Check if user exists for signin
      if (authMode === "signin") {
        const existingUser = checkUserExists(formData.email);
        if (!existingUser) {
          throw new Error(
            "Account not found. Please sign up first or check your email address.",
          );
        }

        // Verify password matches
        if (existingUser.password !== formData.password) {
          throw new Error(
            "Invalid password. Please check your credentials and try again.",
          );
        }

        const user: LoginUser = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          type: existingUser.type,
          avatar: existingUser.avatar,
          age: existingUser.age,
          gender: existingUser.gender,
          phone: existingUser.phone,
          address: existingUser.address,
          emergencyContact: existingUser.emergencyContact,
          medicalHistory: existingUser.medicalHistory,
          specialization: existingUser.specialization,
          licenseNumber: existingUser.licenseNumber,
          hospital: existingUser.hospital,
        };

        // Update last login
        saveUser(user);

        toast({
          title: "Welcome Back!",
          description: `Successfully signed in as ${user.name}`,
        });

        onLogin(user);
        return;
      }

      // Handle signup
      const existingUser = checkUserExists(formData.email);
      if (existingUser) {
        throw new Error("Account already exists. Please sign in instead.");
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const userId = generateUserId();
      const user: LoginUser = {
        id: userId,
        email: formData.email,
        name: formData.name || formData.email.split("@")[0],
        type: activeTab as "patient" | "doctor",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name || formData.email}`,
      };

      // Save user to storage
      saveUser(user);

      // Send welcome email for new signups
      try {
        const emailResponse = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            type: user.type,
            isWelcome: true,
          }),
        });

        if (emailResponse.ok) {
          toast({
            title: "Account Created!",
            description: `Welcome to SympCare24, ${user.name}! Check your email for a welcome message.`,
          });
        } else {
          toast({
            title: "Account Created!",
            description: `Welcome to SympCare24, ${user.name}! (Email notification failed)`,
          });
        }
      } catch (emailError) {
        console.error("Email notification error:", emailError);
        toast({
          title: "Account Created!",
          description: `Welcome to SympCare24, ${user.name}! (Email notification failed)`,
        });
      }

      onLogin(user);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    });
    setForgotPasswordSent(false);
  };

  const switchAuthMode = () => {
    if (authMode === "signin") {
      setAuthMode("signup");
    } else if (authMode === "signup") {
      setAuthMode("signin");
    } else if (authMode === "forgot") {
      setAuthMode("signin");
    }
    resetForm();
  };

  const showForgotPassword = () => {
    setAuthMode("forgot");
    resetForm();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          {authMode === "forgot" ? "Reset Password" : "Welcome Back"}
        </h1>
        <p className="text-gray-600">
          {authMode === "forgot"
            ? "Enter your email to receive a password reset link"
            : "Sign in to your SympCare24 account"}
        </p>
      </div>

      <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-6">
          {authMode !== "forgot" && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 h-12 rounded-2xl">
                <TabsTrigger
                  value="patient"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl font-medium transition-all duration-300"
                >
                  <User className="h-4 w-4" />
                  Patient
                </TabsTrigger>
                <TabsTrigger
                  value="doctor"
                  className="flex items-center gap-2 data-[state=active]:bg-cyan-600 data-[state=active]:text-white rounded-xl font-medium transition-all duration-300"
                >
                  <Stethoscope className="h-4 w-4" />
                  Doctor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="patient" className="mt-6">
                <div className="text-center">
                  <CardTitle className="text-2xl flex items-center justify-center gap-2 mb-2">
                    {authMode === "signin" ? "Welcome Back" : "Join SympCare24"}
                    <Badge
                      variant="outline"
                      className="border-blue-200 text-blue-700 bg-blue-50 rounded-full"
                    >
                      Patient
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {authMode === "signin"
                      ? "Sign in to your patient account"
                      : "Create your patient account"}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="doctor" className="mt-6">
                <div className="text-center">
                  <CardTitle className="text-2xl flex items-center justify-center gap-2 mb-2">
                    {authMode === "signin" ? "Welcome Back" : "Join Our Team"}
                    <Badge
                      variant="outline"
                      className="border-cyan-200 text-cyan-700 bg-cyan-50 rounded-full"
                    >
                      Doctor
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {authMode === "signin"
                      ? "Sign in to your doctor account"
                      : "Join our medical professionals"}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Forgot Password Success Message */}
          {authMode === "forgot" && forgotPasswordSent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Reset Link Sent!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  We've sent a password reset link to{" "}
                  <strong>{formData.email}</strong>
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    Next Steps:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Check your email inbox</li>
                    <li>• Click the reset link in the email</li>
                    <li>• The link will expire in 24 hours</li>
                    <li>• Check spam folder if not found</li>
                  </ul>
                </div>
              </div>
              <Button
                onClick={() => {
                  setAuthMode("signin");
                  resetForm();
                }}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name field - only for signup */}
              {authMode === "signup" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="pl-10 h-12 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                      required={authMode === "signup"}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 h-12 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password field - hidden in forgot password mode */}
              {authMode !== "forgot" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="pl-10 pr-12 h-12 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-full hover:bg-gray-100"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Confirm Password field - only for signup */}
              {authMode === "signup" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className="pl-10 h-12 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                      required={authMode === "signup"}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Forgot Password Link - only in signin mode */}
              {authMode === "signin" && (
                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    onClick={showForgotPassword}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 p-0 h-auto"
                  >
                    Forgot password?
                  </Button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full h-14 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                  authMode === "forgot"
                    ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    : activeTab === "patient"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      : "bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {authMode === "forgot"
                      ? "Sending Reset Link..."
                      : authMode === "signin"
                        ? "Signing In..."
                        : "Creating Account..."}
                  </>
                ) : (
                  <>
                    {authMode === "forgot" ? (
                      <Mail className="mr-2 h-5 w-5" />
                    ) : authMode === "signin" ? (
                      <User className="mr-2 h-5 w-5" />
                    ) : (
                      <UserPlus className="mr-2 h-5 w-5" />
                    )}
                    {authMode === "forgot"
                      ? "Send Reset Link"
                      : authMode === "signin"
                        ? "Sign In"
                        : "Create Account"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Switch Auth Mode */}
          {authMode !== "forgot" && !forgotPasswordSent && (
            <div className="text-center">
              <Button
                variant="link"
                onClick={switchAuthMode}
                className="text-sm font-medium text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                {authMode === "signin"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </Button>
            </div>
          )}

          {/* Back to Login - only in forgot password mode */}
          {authMode === "forgot" && !forgotPasswordSent && (
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setAuthMode("signin")}
                className="text-sm font-medium text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">
          By signing up, you agree to our{" "}
          <span className="text-blue-600 font-medium">Terms of Service</span>{" "}
          and <span className="text-blue-600 font-medium">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
