"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  AlertTriangle,
  FileText,
  Search,
  Phone,
  Mail,
  MessageSquare,
  Activity,
  User,
  LogOut,
  Stethoscope,
  TrendingUp,
  Bell,
  Settings,
  Filter,
  Calendar,
  Clock,
  Heart,
  Brain,
  Shield,
  Plus,
  ChevronRight,
  Star,
  RefreshCw,
  BarChart3,
  Users2,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PatientHealthReport from "@/components/patient-health-report";
// import type { User as UserType } from "@/types/user";

interface DoctorDashboardProps {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    type: "patient" | "doctor";
    specialization?: string;
    licenseNumber?: string;
    hospital?: string;
  };
  onLogout: () => void;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  condition: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  vitals: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSaturation: number;
  };
  symptoms: string[];
  aiDiagnosis?: {
    condition: string;
    confidence: number;
    recommendations: string[];
  };
}

export default function DoctorDashboard({
  user,
  onLogout,
}: DoctorDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [notifications, setNotifications] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    emergencyContact: "",
    condition: "",
    severity: "Low" as "Low" | "Medium" | "High" | "Critical",
  });
  const { toast } = useToast();

  // Load real patient data from localStorage
  useEffect(() => {
    const loadPatientData = () => {
      try {
        const storedPatients = localStorage.getItem("mediai_all_patients");
        if (storedPatients) {
          const allPatients = JSON.parse(storedPatients);

          // Convert stored patient data to dashboard format
          const dashboardPatients: Patient[] = allPatients.map((p: any) => ({
            id: p.id,
            name: p.name,
            age: p.age || 30,
            gender: p.gender || "other",
            lastVisit: p.lastVisit || new Date().toLocaleDateString(),
            condition: p.condition || "General Checkup",
            severity: (p.severity || "Low") as
              | "Low"
              | "Medium"
              | "High"
              | "Critical",
            vitals: p.vitals || {
              heartRate: 72,
              bloodPressure: "120/80",
              temperature: 98.6,
              oxygenSaturation: 98,
            },
            symptoms: p.symptoms || [],
            aiDiagnosis: p.aiDiagnosis,
          }));

          setPatients(dashboardPatients);
        }
      } catch (error) {
        console.error("Error loading patient data:", error);
      }
    };

    loadPatientData();
  }, []);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const urgentCases = patients.filter(
    (p) => p.severity === "High" || p.severity === "Critical",
  );

  const handlePatientContact = (
    patient: Patient,
    method: "call" | "sms" | "email",
  ) => {
    toast({
      title: `Contacting ${patient.name}`,
      description: `Initiating ${method} communication...`,
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Data Refreshed",
        description: "Patient data has been updated",
      });
    }, 2000);
  };

  const stats = {
    totalPatients: patients.length,
    urgentCases: urgentCases.length,
    totalSymptoms: patients.reduce((acc, p) => acc + p.symptoms.length, 0),
    aiDiagnoses: patients.filter((p) => p.aiDiagnosis).length,
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  const getGreeting = () => {
    const timeOfDay = getTimeOfDay();
    return `Good ${timeOfDay}, Dr. ${user.name?.split(" ").slice(-1)[0] || user.name}!`;
  };

  const generatePatientId = () => {
    return (
      "PAT_" + Date.now().toString() + Math.random().toString(36).substr(2, 6)
    );
  };

  const handleAddPatient = async () => {
    if (!newPatientData.name || !newPatientData.email || !newPatientData.age) {
      toast({
        title: "Validation Error",
        description: "Name, email, and age are required fields",
        variant: "destructive",
      });
      return;
    }

    setIsAddingPatient(true);

    try {
      // Create new patient object
      const newPatient: Patient = {
        id: generatePatientId(),
        name: newPatientData.name,
        age: parseInt(newPatientData.age),
        gender: newPatientData.gender || "other",
        lastVisit: new Date().toLocaleDateString(),
        condition: newPatientData.condition || "General Checkup",
        severity: newPatientData.severity,
        vitals: {
          heartRate: 72,
          bloodPressure: "120/80",
          temperature: 98.6,
          oxygenSaturation: 98,
        },
        symptoms: [],
      };

      // Add to patients list
      setPatients((prev) => [...prev, newPatient]);

      // Also add to shared patients database for cross-component access
      const existingPatients = JSON.parse(
        localStorage.getItem("mediai_all_patients") || "[]",
      );
      const patientData = {
        id: newPatient.id,
        email: newPatientData.email,
        name: newPatient.name,
        type: "patient",
        age: newPatient.age,
        gender: newPatient.gender,
        phone: newPatientData.phone,
        address: newPatientData.address,
        emergencyContact: newPatientData.emergencyContact,
        registrationDate: new Date().toISOString(),
        healthScore: 85,
        status: "stable",
        symptoms: 0,
        diagnoses: 0,
        vitals: newPatient.vitals,
        alerts: 0,
        conditions: [newPatient.condition],
        lastVisit: new Date().toISOString(),
        severity: newPatient.severity,
        doctorId: user.id,
      };

      existingPatients.push(patientData);
      localStorage.setItem(
        "mediai_all_patients",
        JSON.stringify(existingPatients),
      );

      // Reset form
      setNewPatientData({
        name: "",
        email: "",
        age: "",
        gender: "",
        phone: "",
        address: "",
        emergencyContact: "",
        condition: "",
        severity: "Low",
      });

      setShowAddPatient(false);

      toast({
        title: "Patient Added Successfully",
        description: `${newPatient.name} has been added to your patient list`,
      });

      // Switch to patients tab to show the new patient
      setActiveTab("patients");
    } catch (error) {
      console.error("Error adding patient:", error);
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingPatient(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewPatientData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 p-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="h-3 w-3 text-white fill-current" />
                </div>
              </div>
              <div>
                <h1 className="font-bold text-xl">{getGreeting()}</h1>
                <p className="text-sm text-white/80">
                  {user.specialization} • {user.hospital}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    License: {user.licenseNumber}
                  </Badge>
                </div>
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
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
              >
                <Settings className="h-4 w-4" />
              </Button>

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

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <div className="text-xs text-white/70">Total Patients</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
              <div className="text-2xl font-bold text-red-300">
                {stats.urgentCases}
              </div>
              <div className="text-xs text-white/70">Urgent Cases</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
              <div className="text-2xl font-bold">{stats.aiDiagnoses}</div>
              <div className="text-xs text-white/70">AI Diagnoses</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
              <div className="text-2xl font-bold">95%</div>
              <div className="text-xs text-white/70">Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/90">
          <TabsList className="grid w-full grid-cols-5 h-16 bg-transparent rounded-none border-0">
            <TabsTrigger
              value="overview"
              className="flex flex-col items-center py-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-600 rounded-2xl mx-1 transition-all duration-300"
            >
              <BarChart3 className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="predictions"
              className="flex flex-col items-center py-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 rounded-2xl mx-1 transition-all duration-300"
            >
              <Brain className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Predictions</span>
            </TabsTrigger>
            <TabsTrigger
              value="patients"
              className="flex flex-col items-center py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-2xl mx-1 transition-all duration-300"
            >
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Patients</span>
            </TabsTrigger>
            <TabsTrigger
              value="urgent"
              className="flex flex-col items-center py-2 data-[state=active]:bg-red-50 data-[state=active]:text-red-600 rounded-2xl mx-1 transition-all duration-300"
            >
              <AlertTriangle className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Urgent</span>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex flex-col items-center py-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 rounded-2xl mx-1 transition-all duration-300"
            >
              <FileText className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Reports</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Enhanced Overview Tab */}
        <TabsContent value="overview" className="p-6 space-y-6 animate-fade-in">
          {/* Daily Summary */}
          <Card className="border-0 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-3 h-5 w-5 text-blue-600" />
                Today's Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalPatients}
                  </div>
                  <div className="text-sm text-gray-600">Total Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.aiDiagnoses}
                  </div>
                  <div className="text-sm text-gray-600">AI Diagnoses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.totalSymptoms}
                  </div>
                  <div className="text-sm text-gray-600">Symptoms Logged</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.urgentCases}
                  </div>
                  <div className="text-sm text-gray-600">Urgent Cases</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
                <DialogTrigger asChild>
                  <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Plus className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">
                        Add Patient
                      </h4>
                      <p className="text-xs text-gray-600">
                        Register new patient
                      </p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-green-700">
                      Add New Patient
                    </DialogTitle>
                    <DialogDescription>
                      Enter patient information to add them to your practice
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="patient-name"
                          className="text-sm font-medium"
                        >
                          Full Name *
                        </Label>
                        <Input
                          id="patient-name"
                          placeholder="Enter patient's full name"
                          value={newPatientData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="h-10"
                          disabled={isAddingPatient}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="patient-email"
                          className="text-sm font-medium"
                        >
                          Email *
                        </Label>
                        <Input
                          id="patient-email"
                          type="email"
                          placeholder="patient@example.com"
                          value={newPatientData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="h-10"
                          disabled={isAddingPatient}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="patient-age"
                          className="text-sm font-medium"
                        >
                          Age *
                        </Label>
                        <Input
                          id="patient-age"
                          type="number"
                          placeholder="Age"
                          value={newPatientData.age}
                          onChange={(e) =>
                            handleInputChange("age", e.target.value)
                          }
                          className="h-10"
                          min="1"
                          max="120"
                          disabled={isAddingPatient}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="patient-gender"
                          className="text-sm font-medium"
                        >
                          Gender
                        </Label>
                        <Select
                          value={newPatientData.gender}
                          onValueChange={(value) =>
                            handleInputChange("gender", value)
                          }
                          disabled={isAddingPatient}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select gender" />
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
                        htmlFor="patient-phone"
                        className="text-sm font-medium"
                      >
                        Phone Number
                      </Label>
                      <Input
                        id="patient-phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={newPatientData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="h-10"
                        disabled={isAddingPatient}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="patient-address"
                        className="text-sm font-medium"
                      >
                        Address
                      </Label>
                      <Input
                        id="patient-address"
                        placeholder="Patient's address"
                        value={newPatientData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        className="h-10"
                        disabled={isAddingPatient}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="emergency-contact"
                        className="text-sm font-medium"
                      >
                        Emergency Contact
                      </Label>
                      <Input
                        id="emergency-contact"
                        placeholder="Emergency contact number"
                        value={newPatientData.emergencyContact}
                        onChange={(e) =>
                          handleInputChange("emergencyContact", e.target.value)
                        }
                        className="h-10"
                        disabled={isAddingPatient}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="patient-condition"
                          className="text-sm font-medium"
                        >
                          Initial Condition
                        </Label>
                        <Input
                          id="patient-condition"
                          placeholder="e.g., General Checkup, Hypertension"
                          value={newPatientData.condition}
                          onChange={(e) =>
                            handleInputChange("condition", e.target.value)
                          }
                          className="h-10"
                          disabled={isAddingPatient}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="patient-severity"
                          className="text-sm font-medium"
                        >
                          Severity Level
                        </Label>
                        <Select
                          value={newPatientData.severity}
                          onValueChange={(
                            value: "Low" | "Medium" | "High" | "Critical",
                          ) => handleInputChange("severity", value)}
                          disabled={isAddingPatient}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddPatient(false)}
                      disabled={isAddingPatient}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddPatient}
                      disabled={isAddingPatient}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {isAddingPatient ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Patient
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Generate Report
                  </h4>
                  <p className="text-xs text-gray-600">Create medical report</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Insights */}
          <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <Brain className="mr-3 h-5 w-5 text-purple-600" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Pattern Detection
                    </p>
                    <p className="text-sm text-gray-600">
                      Increased respiratory symptoms detected in 3 patients this
                      week
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Treatment Efficacy
                    </p>
                    <p className="text-sm text-gray-600">
                      95% success rate with current hypertension protocol
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-800">Risk Assessment</p>
                    <p className="text-sm text-gray-600">
                      2 patients flagged for follow-up based on vital trends
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="border-0 bg-white shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="mr-3 h-5 w-5 text-green-600" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      Patient Satisfaction
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      4.8/5
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "96%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      Diagnosis Accuracy
                    </span>
                    <span className="text-sm font-bold text-blue-600">95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "95%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Patients Tab */}
        <TabsContent value="patients" className="p-6 space-y-6 animate-fade-in">
          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients..."
                className="pl-10 h-12 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-12 px-6 rounded-2xl border-gray-200 hover:border-gray-300"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Patient List */}
          {patients.length === 0 ? (
            <Card className="border-0 bg-gradient-to-r from-gray-50 to-gray-100 shadow-lg">
              <CardContent className="p-12 text-center">
                <Users2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Patients Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Start adding patients to your practice
                </p>
                <Button
                  onClick={() => setShowAddPatient(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-2xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Patient
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <Card
                  key={patient.id}
                  className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {patient.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {patient.age} years • {patient.gender}
                          </div>
                          <div className="text-sm text-gray-500">
                            Last visit: {patient.lastVisit}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            patient.severity === "Critical"
                              ? "destructive"
                              : patient.severity === "High"
                                ? "destructive"
                                : patient.severity === "Medium"
                                  ? "default"
                                  : "secondary"
                          }
                          className="rounded-full"
                        >
                          {patient.severity}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Enhanced Urgent Cases Tab */}
        <TabsContent value="urgent" className="p-6 space-y-6 animate-fade-in">
          <div className="flex items-center space-x-2 mb-6">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold text-gray-800">Urgent Cases</h2>
            <Badge variant="destructive" className="rounded-full">
              {urgentCases.length}
            </Badge>
          </div>

          {urgentCases.length === 0 ? (
            <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
              <CardContent className="p-12 text-center">
                <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-700 mb-2">
                  All Clear!
                </h3>
                <p className="text-green-600">
                  No urgent cases requiring immediate attention
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {urgentCases.map((patient) => (
                <Card
                  key={patient.id}
                  className="border-2 border-red-200 bg-red-50 shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {patient.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {patient.condition}
                          </div>
                          <div className="text-sm text-red-600 font-medium">
                            Severity: {patient.severity}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="rounded-2xl"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-2xl border-red-200 text-red-700 hover:bg-red-50"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Enhanced Reports Tab */}
        <TabsContent value="reports" className="p-6 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Medical Reports</h2>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>

          {selectedPatient ? (
            <PatientHealthReport patient={selectedPatient} doctor={user} />
          ) : (
            <Card className="border-0 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-purple-700 mb-2">
                  Generate Reports
                </h3>
                <p className="text-purple-600 mb-6">
                  Select a patient to generate comprehensive medical reports
                </p>
                <Button
                  onClick={() => setActiveTab("patients")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Patients
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
