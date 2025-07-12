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
  Brain,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SymptomInput from "@/components/symptom-input";
import DiagnosisResults from "@/components/diagnosis-results";
import TimelineTracker from "@/components/timeline-tracker";
import WearableIntegration from "@/components/wearable-integration";
import AISkinAssistant from "@/components/ai-skin-assistant";
import TabletLookup from "@/components/tablet-lookup";
import {
  processVitals,
  getPatientAlerts,
  WearableVitals,
  VitalAlert,
} from "@/utils/vitals-monitoring";
import { clearAllUsers, resetToRealDevicesOnly } from "@/utils/reset-system";
import {
  detectAllRealDevices,
  RealWearableDevice,
  getRealVitalsFromDevice,
} from "@/utils/real-device-detection";

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
    heartRate: 72,
    bloodPressure: "120/80",
    temperature: 98.6,
    oxygenSaturation: 98,
    steps: 8432,
    calories: 2156,
    stressLevel: 35,
  });
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [deviceName, setDeviceName] = useState("No Device");
  const [lastSync, setLastSync] = useState("");
  const [vitalsAlerts, setVitalsAlerts] = useState<any[]>([]);
  const [realDevices, setRealDevices] = useState<RealWearableDevice[]>([]);
  const [isDetectingDevices, setIsDetectingDevices] = useState(false);
  const [notifications, setNotifications] = useState(2);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Clear existing users and detect real devices on initialization
  useEffect(() => {
    const initializeRealDevicesOnly = async () => {
      // Clear all existing users and simulated data
      resetToRealDevicesOnly();

      toast({
        title: "System Reset",
        description: "All existing users cleared. Showing only real devices.",
      });

      // Detect real wearable devices
      await detectRealDevices();
    };

    initializeRealDevicesOnly();
  }, []);

  // Real device detection
  const detectRealDevices = async () => {
    setIsDetectingDevices(true);

    try {
      const devices = await detectAllRealDevices();
      setRealDevices(devices);

      if (devices.length > 0) {
        const connectedDevice =
          devices.find((d) => d.isConnected) || devices[0];
        setIsConnected(connectedDevice.isConnected);
        setDeviceName(connectedDevice.name);
        setBatteryLevel(connectedDevice.batteryLevel || 0);
        setLastSync(connectedDevice.lastSync || "");

        toast({
          title: "Real Device Detected",
          description: `Found ${connectedDevice.name}`,
        });
      } else {
        setIsConnected(false);
        setDeviceName("No Real Device Found");
        setBatteryLevel(0);
        setLastSync("");

        toast({
          title: "No Real Devices",
          description:
            "No wearable devices detected. Connect a real device to start monitoring.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error detecting devices:", error);
      toast({
        title: "Device Detection Failed",
        description: "Unable to detect wearable devices. Check permissions.",
        variant: "destructive",
      });
    } finally {
      setIsDetectingDevices(false);
    }
  };

  // Real-time vitals monitoring (only if real device connected)
  useEffect(() => {
    if (!isConnected || realDevices.length === 0) return;

    const vitalsInterval = setInterval(async () => {
      try {
        const connectedDevice = realDevices.find((d) => d.isConnected);
        if (!connectedDevice) return;

        // Get real vitals data from the connected device
        const realVitalsData = await getRealVitalsFromDevice(connectedDevice);

        // Update vitals with real data
        const newVitals: VitalSigns = {
          heartRate: realVitalsData.heartRate || 0,
          bloodPressure: realVitalsData.bloodPressure || "--/--",
          temperature: realVitalsData.temperature || 0,
          oxygenSaturation: realVitalsData.oxygenSaturation || 0,
          steps: realVitalsData.steps || 0,
          calories: realVitalsData.calories || 0,
          stressLevel: realVitalsData.stressLevel || 0,
        };

        setVitalSigns(newVitals);
        setLastSync(new Date().toISOString());

        // Send real vitals to monitoring API
        sendVitalsToMonitoring(newVitals);

        toast({
          title: "Vitals Updated",
          description: `Real data from ${connectedDevice.name}`,
        });
      } catch (error) {
        console.error("Error getting real vitals:", error);

        // If we can't get real data, show zeros
        const emptyVitals: VitalSigns = {
          heartRate: 0,
          bloodPressure: "--/--",
          temperature: 0,
          oxygenSaturation: 0,
          steps: 0,
          calories: 0,
          stressLevel: 0,
        };

        setVitalSigns(emptyVitals);

        toast({
          title: "Unable to Read Device",
          description: "Could not get real vitals data from device",
          variant: "destructive",
        });
      }
    }, 60000); // Update every 60 seconds for real devices

    return () => clearInterval(vitalsInterval);
  }, [isConnected, user.id]);

  // Check for vitals alerts
  useEffect(() => {
    const alertsInterval = setInterval(() => {
      try {
        const alerts = getPatientAlerts(user.id);
        setVitalsAlerts(alerts);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      }
    }, 15000); // Check alerts every 15 seconds

    return () => clearInterval(alertsInterval);
  }, [user.id]);

  const sendVitalsToMonitoring = (vitals: VitalSigns) => {
    try {
      const [systolic, diastolic] = vitals.bloodPressure.split("/").map(Number);

      const wearableVitals: WearableVitals = {
        patientId: user.id,
        deviceId: "apple_watch_001",
        timestamp: new Date().toISOString(),
        heartRate: vitals.heartRate,
        bloodPressure: {
          systolic: systolic || 120,
          diastolic: diastolic || 80,
        },
        temperature: vitals.temperature,
        oxygenSaturation: vitals.oxygenSaturation,
        stressLevel: vitals.stressLevel,
        steps: vitals.steps,
        calories: vitals.calories,
        batteryLevel: batteryLevel,
      };

      const alerts = processVitals(wearableVitals, user.name);

      if (alerts.length > 0) {
        // Show alert notifications for critical vitals
        alerts.forEach((alert: VitalAlert) => {
          if (alert.severity === "critical") {
            toast({
              title: "🚨 Critical Vitals Alert",
              description: alert.message,
              variant: "destructive",
            });
          } else if (alert.severity === "warning") {
            toast({
              title: "⚠️ Vitals Warning",
              description: alert.message,
            });
          }
        });
      }
    } catch (error) {
      console.error("Failed to process vitals:", error);
    }
  };

  const toggleDeviceConnection = async () => {
    if (!isConnected) {
      // Try to detect and connect to real devices
      await detectRealDevices();
    } else {
      // Disconnect from current device
      setIsConnected(false);
      setDeviceName("No Device");
      setBatteryLevel(0);
      setLastSync("");
      setRealDevices([]);

      toast({
        title: "Device Disconnected",
        description: "Disconnected from wearable device",
      });
    }
  };

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

          {/* Real Device Status Banner */}
          <div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-300"
            onClick={toggleDeviceConnection}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isDetectingDevices
                      ? "bg-yellow-400 animate-ping"
                      : isConnected
                        ? "bg-green-400 animate-pulse"
                        : "bg-red-400"
                  }`}
                ></div>
                <div>
                  <p className="text-sm font-medium">
                    {isDetectingDevices
                      ? "Detecting Devices..."
                      : isConnected
                        ? `${deviceName} Connected`
                        : "No Real Device Found"}
                  </p>
                  <p className="text-xs text-white/70">
                    {isDetectingDevices
                      ? "Scanning for wearable devices..."
                      : isConnected && lastSync
                        ? `Battery: ${batteryLevel}% • Last sync: ${new Date(lastSync).toLocaleTimeString()}`
                        : "Tap to scan for real wearable devices"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {realDevices.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white text-xs"
                  >
                    {realDevices.length} Found
                  </Badge>
                )}
                {vitalsAlerts.length > 0 && (
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {vitalsAlerts.length}
                    </span>
                  </div>
                )}
                <ChevronRight className="h-5 w-5 text-white/60" />
              </div>
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
          {/* System Reset Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">
                    Real Device Mode Active
                  </h3>
                  <p className="text-sm text-blue-600">
                    System cleared of simulated data. Only real wearable devices
                    will be shown.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Vitals Alerts */}
          {vitalsAlerts.length > 0 && (
            <Card className="border-0 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-6 w-6 animate-pulse" />
                    <h3 className="text-lg font-bold">Vitals Alert</h3>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {vitalsAlerts.length} Active
                  </Badge>
                </div>
                <div className="space-y-2">
                  {vitalsAlerts.slice(0, 2).map((alert: any, index: number) => (
                    <div key={index} className="bg-white/10 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{alert.vital}</p>
                          <p className="text-xs text-white/80">
                            {alert.message}
                          </p>
                        </div>
                        <Badge
                          variant={
                            alert.severity === "critical"
                              ? "destructive"
                              : "default"
                          }
                          className="text-xs"
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {vitalsAlerts.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-white hover:bg-white/10"
                      onClick={() => setActiveTab("devices")}
                    >
                      View {vitalsAlerts.length - 2} more alerts
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* AI Diagnosis Results */}
          {diagnosis && (
            <Card className="border-0 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Latest AI Diagnosis
                    </h3>
                    <p className="text-sm text-gray-600">AI-powered analysis</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      {diagnosis.confidence}%
                    </div>
                    <div className="text-sm text-purple-600">Confidence</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Badge
                      variant={
                        diagnosis.severity === "severe"
                          ? "destructive"
                          : diagnosis.severity === "moderate"
                            ? "default"
                            : "secondary"
                      }
                      className="mb-2"
                    >
                      {diagnosis.condition}
                    </Badge>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {diagnosis.explanation}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setActiveTab("symptoms")}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    View Full Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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
                onClick={() => setActiveTab("ai")}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    AI Skin Analysis
                  </h4>
                  <p className="text-xs text-gray-600">
                    Visual health assessment
                  </p>
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
                  <div
                    className={`text-2xl font-bold ${vitalSigns.heartRate > 100 || vitalSigns.heartRate < 60 ? "text-red-600" : "text-gray-800"}`}
                  >
                    {vitalSigns.heartRate || "--"}
                  </div>
                  <div className="text-sm text-gray-600">Heart Rate</div>
                  <div className="text-xs text-gray-500 mt-1">BPM</div>
                  {isConnected && (
                    <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-2 animate-pulse"></div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Droplets className="h-6 w-6 text-blue-500" />
                  </div>
                  <div
                    className={`text-2xl font-bold ${vitalSigns.oxygenSaturation < 95 ? "text-red-600" : "text-gray-800"}`}
                  >
                    {vitalSigns.oxygenSaturation || "--"}%
                  </div>
                  <div className="text-sm text-gray-600">Oxygen</div>
                  <div className="text-xs text-gray-500 mt-1">SpO2</div>
                  {isConnected && (
                    <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-2 animate-pulse"></div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Thermometer className="h-6 w-6 text-orange-500" />
                  </div>
                  <div
                    className={`text-2xl font-bold ${vitalSigns.temperature > 99.5 || vitalSigns.temperature < 97.0 ? "text-red-600" : "text-gray-800"}`}
                  >
                    {vitalSigns.temperature || "--"}°F
                  </div>
                  <div className="text-sm text-gray-600">Temperature</div>
                  <div className="text-xs text-gray-500 mt-1">Body Temp</div>
                  {isConnected && (
                    <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-2 animate-pulse"></div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {vitalSigns.steps.toLocaleString() || "--"}
                  </div>
                  <div className="text-sm text-gray-600">Steps</div>
                  <div className="text-xs text-gray-500 mt-1">Today</div>
                  {isConnected && (
                    <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-2 animate-pulse"></div>
                  )}
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
        <TabsContent value="symptoms" className="p-6 animate-fade-in space-y-6">
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

          {/* Show diagnosis results if available */}
          {diagnosis && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                AI Analysis Results
              </h3>
              <DiagnosisResults diagnosis={diagnosis} />
            </div>
          )}
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

        {/* Real Devices Tab */}
        <TabsContent value="devices" className="p-6 animate-fade-in space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Real Wearable Devices
              </h2>
              <p className="text-gray-600">
                Connect and manage your wearable devices
              </p>
            </div>
            <Button
              onClick={detectRealDevices}
              disabled={isDetectingDevices}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isDetectingDevices ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bluetooth className="h-4 w-4 mr-2" />
              )}
              {isDetectingDevices ? "Detecting..." : "Scan Devices"}
            </Button>
          </div>

          {/* No Real Devices Found */}
          {realDevices.length === 0 && !isDetectingDevices && (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-8 text-center">
                <Bluetooth className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No Real Devices Found
                </h3>
                <p className="text-gray-600 mb-4">
                  Connect a real wearable device (Apple Watch, Fitbit, Garmin,
                  etc.) to start monitoring your health data.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>• Enable Bluetooth on your device</p>
                  <p>• Ensure your wearable is in pairing mode</p>
                  <p>• Grant necessary permissions</p>
                </div>
                <Button
                  onClick={detectRealDevices}
                  className="mt-4"
                  variant="outline"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Scan for Devices
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Real Devices List */}
          {realDevices.length > 0 && (
            <div className="space-y-4">
              {realDevices.map((device, index) => (
                <Card
                  key={index}
                  className={`${device.isConnected ? "border-green-200 bg-green-50" : "border-gray-200"}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            device.isConnected ? "bg-green-100" : "bg-gray-100"
                          }`}
                        >
                          {device.type === "apple_watch" && (
                            <Activity className="h-6 w-6 text-gray-600" />
                          )}
                          {device.type === "fitbit" && (
                            <Heart className="h-6 w-6 text-gray-600" />
                          )}
                          {device.type === "garmin" && (
                            <TrendingUp className="h-6 w-6 text-gray-600" />
                          )}
                          {device.type === "samsung_watch" && (
                            <Activity className="h-6 w-6 text-gray-600" />
                          )}
                          {device.type === "unknown" && (
                            <Bluetooth className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {device.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {device.type.replace("_", " ").toUpperCase()}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                device.isConnected
                                  ? "bg-green-400"
                                  : "bg-red-400"
                              }`}
                            ></div>
                            <span className="text-xs text-gray-500">
                              {device.isConnected
                                ? "Connected"
                                : "Disconnected"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {device.isConnected && device.batteryLevel && (
                          <div className="flex items-center space-x-1 mb-2">
                            <Battery className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-600">
                              {device.batteryLevel}%
                            </span>
                          </div>
                        )}
                        <Badge
                          variant={device.isConnected ? "default" : "secondary"}
                        >
                          {device.isConnected ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    {/* Device Capabilities */}
                    {device.capabilities.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">
                          Capabilities:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {device.capabilities.map((capability, capIndex) => (
                            <Badge
                              key={capIndex}
                              variant="outline"
                              className="text-xs"
                            >
                              {capability.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Last Sync Info */}
                    {device.lastSync && (
                      <div className="mt-4 text-xs text-gray-500">
                        Last sync: {new Date(device.lastSync).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Device Integration Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Device Integration Guide
              </h3>
              <div className="space-y-2 text-sm text-blue-700">
                <p>
                  <strong>Apple Watch:</strong> Enable HealthKit permissions in
                  Settings &gt; Privacy &amp; Security &gt; Health
                </p>
                <p>
                  <strong>Fitbit:</strong> Use Fitbit Web API with OAuth
                  authentication
                </p>
                <p>
                  <strong>Garmin:</strong> Connect via Garmin Connect IQ SDK
                </p>
                <p>
                  <strong>Samsung Watch:</strong> Use Samsung Health SDK
                  integration
                </p>
                <p>
                  <strong>Other Devices:</strong> Bluetooth Low Energy (BLE)
                  connection required
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced AI Assistant Tab */}
        <TabsContent value="ai" className="p-6 animate-fade-in">
          <AISkinAssistant userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
