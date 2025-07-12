"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  MapPin,
  Loader2,
  Heart,
  Stethoscope,
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  UserPlus,
  ArrowRight,
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
    age: "",
    gender: "",
    phone: "",
    address: "",
    emergencyContact: "",
    specialization: "",
    licenseNumber: "",
    hospital: "",
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
      // Email validation
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

      if (activeTab === "patient") {
        if (!formData.phone || !formData.age) {
          throw new Error("Phone number and age are required for patients");
        }
        if (
          Number.parseInt(formData.age) < 1 ||
          Number.parseInt(formData.age) > 120
        ) {
          throw new Error("Please enter a valid age");
        }
      }

      if (activeTab === "doctor") {
        if (
          !formData.specialization ||
          !formData.licenseNumber ||
          !formData.hospital
        ) {
          throw new Error(
            "Specialization, license number, and hospital are required for doctors",
          );
        }
      }
    }

    // Email validation
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

    if (existingUserIndex >= 0) {
      existingUsers[existingUserIndex] = {
        ...user,
        lastLogin: new Date().toISOString(),
      };
    } else {
      existingUsers.push({
        ...user,
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

      // Store password for authentication (in real app, this would be hashed)
      const userWithPassword = { ...user, password: formData.password };

      if (activeTab === "patient") {
        user.age = Number.parseInt(formData.age) || 25;
        user.gender =
          (formData.gender as "male" | "female" | "other") || "other";
        user.phone = formData.phone;
        user.address = formData.address;
        user.emergencyContact = formData.emergencyContact;
        user.medicalHistory = [];

        // Save patient to the shared patients database
        const existingPatients = JSON.parse(
          localStorage.getItem("mediai_all_patients") || "[]",
        );
        const patientData = {
          ...userWithPassword,
          registrationDate: new Date().toISOString(),
          healthScore: 85,
          status: "stable",
          symptoms: 0,
          diagnoses: 0,
          vitals: {
            heartRate: 72,
            bloodPressure: "120/80",
            temperature: 98.6,
            oxygenSaturation: 98,
          },
          alerts: 0,
          conditions: [],
          lastVisit: new Date().toISOString(),
        };

        const existingPatientIndex = existingPatients.findIndex(
          (p: any) => p.email === user.email,
        );
        if (existingPatientIndex >= 0) {
          existingPatients[existingPatientIndex] = patientData;
        } else {
          existingPatients.push(patientData);
        }

        localStorage.setItem(
          "mediai_all_patients",
          JSON.stringify(existingPatients),
        );
      } else {
        userWithPassword.specialization = formData.specialization;
        userWithPassword.licenseNumber = formData.licenseNumber;
        userWithPassword.hospital = formData.hospital;
      }

      // Save user to storage
      saveUser(userWithPassword);

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
      age: "",
      gender: "",
      phone: "",
      address: "",
      emergencyContact: "",
      specialization: "",
      licenseNumber: "",
      hospital: "",
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
      {/* Simplified Header for Modal */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600">Sign in to your SympCare24 account</p>
      </div>

      <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-6">
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
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-10 h-12 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                    required={authMode === "signup"}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

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

            {/* Patient-specific fields for signup */}
            {authMode === "signup" && activeTab === "patient" && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="age"
                      className="text-sm font-medium text-gray-700"
                    >
                      Age *
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Age"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="h-12 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                      min="1"
                      max="120"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="gender"
                      className="text-sm font-medium text-gray-700"
                    >
                      Gender
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        handleInputChange("gender", value)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="pl-10 h-12 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Doctor-specific fields for signup */}
            {authMode === "signup" && activeTab === "doctor" && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="space-y-2">
                  <Label
                    htmlFor="specialization"
                    className="text-sm font-medium text-gray-700"
                  >
                    Medical Specialization *
                  </Label>
                  <Select
                    value={formData.specialization}
                    onValueChange={(value) =>
                      handleInputChange("specialization", value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internal Medicine">
                        Internal Medicine
                      </SelectItem>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Dermatology">Dermatology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                      <SelectItem value="Emergency Medicine">
                        Emergency Medicine
                      </SelectItem>
                      <SelectItem value="Family Medicine">
                        Family Medicine
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="licenseNumber"
                    className="text-sm font-medium text-gray-700"
                  >
                    Medical License Number *
                  </Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="licenseNumber"
                      type="text"
                      placeholder="MD123456"
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        handleInputChange("licenseNumber", e.target.value)
                      }
                      className="pl-10 h-12 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="hospital"
                    className="text-sm font-medium text-gray-700"
                  >
                    Hospital/Clinic *
                  </Label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="hospital"
                      type="text"
                      placeholder="Your hospital or clinic"
                      value={formData.hospital}
                      onChange={(e) =>
                        handleInputChange("hospital", e.target.value)
                      }
                      className="pl-10 h-12 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className={`w-full h-14 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                activeTab === "patient"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  : "bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {authMode === "signin"
                    ? "Signing In..."
                    : "Creating Account..."}
                </>
              ) : (
                <>
                  {authMode === "signin" ? (
                    <User className="mr-2 h-5 w-5" />
                  ) : (
                    <UserPlus className="mr-2 h-5 w-5" />
                  )}
                  {authMode === "signin" ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

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
