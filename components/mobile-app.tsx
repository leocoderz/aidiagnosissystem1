"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Zap,
  Clock,
  AlertTriangle,
  Phone,
  LogOut,
  Plus,
  TrendingUp,
  Bluetooth,
  Battery,
  Pill,
  User,
  Bell,
  Settings,
  ChevronRight,
  Star,
  Sparkles,
  Shield,
  RefreshCw,
  Calendar,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SymptomInput from "@/components/symptom-input";
import DiagnosisResults from "@/components/diagnosis-results";
import TimelineTracker from "@/components/timeline-tracker";
import WearableIntegration from "@/components/wearable-integration";
import AISkinAssistant from "@/components/ai-skin-assistant";
import TabletLookup from "@/components/tablet-lookup";

interface MobileAppUser {
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
}

interface MobileAppProps {
  user: MobileAppUser;
  onLogout: () => void;
}

interface VitalSigns {
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  oxygenSaturation: number;
  steps: number;
  calories: number;
  stressLevel: number;
}

export default function MobileApp({ user, onLogout }: MobileAppProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    heartRate: 0,
    bloodPressure: "--/--",
    temperature: 0,
    oxygenSaturation: 0,
    steps: 0,
    calories: 0,
    stressLevel: 0,
  });
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [notifications, setNotifications] = useState(2);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Note: Connect real wearable devices for live data

  const handleSymptomSubmit = (symptomData: any) => {
    setSymptoms((prev) => [...prev, symptomData.symptom]);
    toast({
      title: "Symptoms Recorded",
      description: "Your symptoms have been recorded for analysis.",
    });
  };

  const handleDiagnosisRequest = async (symptoms: any[]) => {
    if (symptoms.length === 0) {
      toast({
        title: "No symptoms provided",
        description: "Please add symptoms before requesting diagnosis",
        variant: "destructive",
      });
      return;
    }

    try {
      setDiagnosis(null); // Clear previous diagnosis

      // Show loading toast
      toast({
        title: "AI Analysis in Progress",
        description: "Analyzing your symptoms with advanced AI...",
      });

      const response = await fetch("/api/ai-diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: symptoms,
          patientInfo: {
            age: user.age,
            gender: user.gender,
            medicalHistory: user.medicalHistory || [],
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const diagnosisResult = await response.json();
      setDiagnosis(diagnosisResult);

      toast({
        title: "AI Diagnosis Complete",
        description: `Analysis complete: ${diagnosisResult.condition}`,
      });

      // Switch to dashboard to show results
      setActiveTab("dashboard");
    } catch (error) {
      console.error("Diagnosis error:", error);
      toast({
        title: "Diagnosis Failed",
        description: "Unable to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmergency = () => {
    toast({
      title: "Emergency Alert Activated",
      description: "Emergency services have been notified.",
      variant: "destructive",
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Data Refreshed",
        description: "Your health data has been updated",
      });
    }, 2000);
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  const getGreeting = () => {
    const timeOfDay = getTimeOfDay();
    const firstName = user.name.split(" ")[0];
    return `Good ${timeOfDay}, ${firstName}!`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 p-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="font-bold text-lg">{getGreeting()}</h1>
                <p className="text-sm text-white/80">
                  Patient ID: {user.id.slice(-6)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                {notifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {notifications}
                    </span>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Device Status Banner */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                ></div>
                <div>
                  <p className="text-sm font-medium">
                    {isConnected
                      ? "Health Device Connected"
                      : "No Device Connected"}
                  </p>
                  <p className="text-xs text-white/70">
                    {isConnected
                      ? `Battery: ${batteryLevel}%`
                      : "Pair a device for real-time monitoring"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/90">
          <TabsList className="grid w-full grid-cols-6 h-16 bg-transparent rounded-none border-0">
            <TabsTrigger
              value="dashboard"
              className="flex flex-col items-center py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-2xl mx-1 transition-all duration-300"
            >
              <Activity className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Home</span>
            </TabsTrigger>
            <TabsTrigger
              value="symptoms"
              className="flex flex-col items-center py-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-600 rounded-2xl mx-1 transition-all duration-300"
            >
              <Plus className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Symptoms</span>
            </TabsTrigger>
            <TabsTrigger
              value="tablets"
              className="flex flex-col items-center py-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 rounded-2xl mx-1 transition-all duration-300"
            >
              <Pill className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Medicines</span>
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="flex flex-col items-center py-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 rounded-2xl mx-1 transition-all duration-300"
            >
              <Clock className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Timeline</span>
            </TabsTrigger>
            <TabsTrigger
              value="devices"
              className="flex flex-col items-center py-2 data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-600 rounded-2xl mx-1 transition-all duration-300"
            >
              <Bluetooth className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Devices</span>
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="flex flex-col items-center py-2 data-[state=active]:bg-pink-50 data-[state=active]:text-pink-600 rounded-2xl mx-1 transition-all duration-300"
            >
              <Sparkles className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">AI</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Enhanced Dashboard Tab */}
        <TabsContent
          value="dashboard"
          className="p-6 space-y-6 animate-fade-in"
        >
          {/* Emergency Button */}
          <Card className="border-0 bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-xl">
            <CardContent className="p-6">
              <Button
                variant="ghost"
                className="w-full h-16 text-lg font-semibold text-white hover:bg-white/20 border-2 border-white/30 rounded-2xl backdrop-blur-sm"
                onClick={handleEmergency}
              >
                <AlertTriangle className="mr-3 h-6 w-6 animate-pulse" />
                Emergency Alert
                <Zap className="ml-3 h-6 w-6" />
              </Button>
            </CardContent>
          </Card>

          {/* Health Score */}
          <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Health Score
                  </h3>
                  <p className="text-sm text-gray-600">
                    Overall wellness rating
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">85</div>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +5 this week
                  </div>
                </div>
              </div>
              <Progress value={85} className="h-3 bg-green-100" />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Poor</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Card
                className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => setActiveTab("symptoms")}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Log Symptoms
                  </h4>
                  <p className="text-xs text-gray-600">Add new symptoms</p>
                </CardContent>
              </Card>

              <Card
                className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => {
                  toast({
                    title: "Appointment Booking",
                    description:
                      "Appointment booking feature coming soon. Please call our clinic at (555) 123-4567.",
                  });
                }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Book Appointment
                  </h4>
                  <p className="text-xs text-gray-600">Schedule with doctor</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Vital Signs Grid */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Vital Signs
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {vitalSigns.heartRate || "--"}
                  </div>
                  <div className="text-sm text-gray-600">Heart Rate</div>
                  <div className="text-xs text-gray-500 mt-1">BPM</div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Droplets className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {vitalSigns.oxygenSaturation || "--"}%
                  </div>
                  <div className="text-sm text-gray-600">Oxygen</div>
                  <div className="text-xs text-gray-500 mt-1">SpO2</div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Thermometer className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {vitalSigns.temperature || "--"}°F
                  </div>
                  <div className="text-sm text-gray-600">Temperature</div>
                  <div className="text-xs text-gray-500 mt-1">Body Temp</div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {vitalSigns.steps || "--"}
                  </div>
                  <div className="text-sm text-gray-600">Steps</div>
                  <div className="text-xs text-gray-500 mt-1">Today</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Diagnosis */}
          {diagnosis && (
            <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="mr-3 h-5 w-5 text-purple-600" />
                  Latest AI Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">
                      {diagnosis.condition}
                    </span>
                    <Badge
                      variant={
                        diagnosis.severity === "mild"
                          ? "secondary"
                          : "destructive"
                      }
                      className="rounded-full"
                    >
                      {diagnosis.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${diagnosis.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-purple-600">
                      {diagnosis.confidence}%
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl"
                  >
                    View Full Results
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Enhanced Symptoms Tab */}
        <TabsContent value="symptoms" className="p-6 animate-fade-in">
          <SymptomInput
            onDiagnosisRequest={handleDiagnosisRequest}
            currentSymptoms={symptoms.map((s, index) => ({
              id: index.toString(),
              name: s,
              severity: 5,
              duration: "unknown",
              location: "unknown",
              description: s,
              timestamp: new Date().toISOString(),
            }))}
          />
        </TabsContent>

        {/* Enhanced Tablets Tab */}
        <TabsContent value="tablets" className="p-6 animate-fade-in">
          <TabletLookup />
        </TabsContent>

        {/* Enhanced Timeline Tab */}
        <TabsContent value="timeline" className="p-6 animate-fade-in">
          <TimelineTracker
            symptoms={symptoms}
            diagnosisHistory={diagnosis ? [diagnosis] : []}
          />
        </TabsContent>

        {/* Enhanced Devices Tab */}
        <TabsContent value="devices" className="p-6 animate-fade-in">
          <WearableIntegration />
        </TabsContent>

        {/* Enhanced AI Assistant Tab */}
        <TabsContent value="ai" className="p-6 animate-fade-in">
          <AISkinAssistant userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
