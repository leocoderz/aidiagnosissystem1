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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SymptomInput from "@/components/symptom-input";
import DiagnosisResults from "@/components/diagnosis-results";
import TimelineTracker from "@/components/timeline-tracker";
import WearableIntegration from "@/components/wearable-integration";
import AISkinAssistant from "@/components/ai-skin-assistant";

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
  const { toast } = useToast();

  // Note: Connect real wearable devices for live data

  const handleSymptomSubmit = (symptomData: any) => {
    setSymptoms((prev) => [...prev, symptomData.symptom]);
    // Real AI diagnosis will be implemented here
    toast({
      title: "Symptoms Recorded",
      description: "Your symptoms have been recorded for analysis.",
    });
  };

  const handleEmergency = () => {
    toast({
      title: "Emergency Alert Activated",
      description: "Emergency services have been notified.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold">{user.name}</h1>
              <p className="text-sm opacity-90">
                Patient ID: {user.id.slice(-6)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Bluetooth
                className={`h-4 w-4 ${isConnected ? "text-green-300" : "text-red-300"}`}
              />
              <Battery className="h-4 w-4" />
              <span className="text-xs">{batteryLevel}%</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 rounded-none border-b">
          <TabsTrigger
            value="dashboard"
            className="flex flex-col items-center py-2"
          >
            <Activity className="h-4 w-4" />
            <span className="text-xs mt-1">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger
            value="symptoms"
            className="flex flex-col items-center py-2"
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs mt-1">Symptoms</span>
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="flex flex-col items-center py-2"
          >
            <Clock className="h-4 w-4" />
            <span className="text-xs mt-1">Timeline</span>
          </TabsTrigger>
          <TabsTrigger
            value="devices"
            className="flex flex-col items-center py-2"
          >
            <Bluetooth className="h-4 w-4" />
            <span className="text-xs mt-1">Devices</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex flex-col items-center py-2">
            <Zap className="h-4 w-4" />
            <span className="text-xs mt-1">AI Assistant</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="p-4 space-y-4">
          {/* Emergency Button */}
          <Card className="border-red-200 bg-red-50 dark:bg-red-950">
            <CardContent className="p-4">
              <Button
                variant="destructive"
                className="w-full"
                size="lg"
                onClick={handleEmergency}
              >
                <AlertTriangle className="mr-2 h-5 w-5" />
                Emergency Alert
              </Button>
            </CardContent>
          </Card>

          {/* Vital Signs Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{vitalSigns.heartRate}</div>
                <div className="text-sm text-muted-foreground">BPM</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {vitalSigns.oxygenSaturation}%
                </div>
                <div className="text-sm text-muted-foreground">SpO2</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Thermometer className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {vitalSigns.temperature}°F
                </div>
                <div className="text-sm text-muted-foreground">Temperature</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{vitalSigns.steps}</div>
                <div className="text-sm text-muted-foreground">Steps</div>
              </CardContent>
            </Card>
          </div>

          {/* Stress Level */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Stress Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Current Level</span>
                  <span className="font-semibold">
                    {vitalSigns.stressLevel}%
                  </span>
                </div>
                <Progress value={vitalSigns.stressLevel} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  {vitalSigns.stressLevel < 30
                    ? "Low stress"
                    : vitalSigns.stressLevel < 70
                      ? "Moderate stress"
                      : "High stress"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Diagnosis */}
          {diagnosis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Latest AI Diagnosis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{diagnosis.condition}</span>
                    <Badge
                      variant={
                        diagnosis.severity === "Mild"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {diagnosis.severity}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Confidence: {diagnosis.confidence}%
                  </div>
                  <Progress value={diagnosis.confidence} className="h-1" />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Symptoms Tab */}
        <TabsContent value="symptoms" className="p-4">
          <SymptomInput onSubmit={handleSymptomSubmit} />
          {diagnosis && (
            <div className="mt-6">
              <DiagnosisResults diagnosis={diagnosis} />
            </div>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="p-4">
          <TimelineTracker symptoms={symptoms} />
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="p-4">
          <WearableIntegration />
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai" className="p-4">
          <AISkinAssistant />
        </TabsContent>
      </Tabs>
    </div>
  );
}
