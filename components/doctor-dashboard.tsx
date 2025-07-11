"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PatientHealthReport from "@/components/patient-health-report";
import type { User as UserType } from "@/types/user"; // Renamed to avoid redeclaration

interface DoctorDashboardProps {
  user: UserType;
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
  const { toast } = useToast();

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

  const stats = {
    totalPatients: patients.length,
    urgentCases: urgentCases.length,
    totalSymptoms: patients.reduce((acc, p) => acc + p.symptoms.length, 0),
    aiDiagnoses: patients.filter((p) => p.aiDiagnosis).length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold">{user.name}</h1>
              <p className="text-sm opacity-90">
                {user.specialization} • {user.hospital}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="urgent">Urgent Cases</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="p-4 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
                <div className="text-sm text-muted-foreground">
                  Total Patients
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.urgentCases}</div>
                <div className="text-sm text-muted-foreground">
                  Urgent Cases
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalSymptoms}</div>
                <div className="text-sm text-muted-foreground">
                  Total Symptoms
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.aiDiagnoses}</div>
                <div className="text-sm text-muted-foreground">
                  AI Diagnoses
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Patients */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patients.slice(0, 3).map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold">{patient.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {patient.condition}
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
                      >
                        {patient.severity}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Patient List */}
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-semibold">{patient.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {patient.age} years • {patient.gender}
                        </div>
                        <div className="text-sm text-muted-foreground">
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
                      >
                        {patient.severity}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePatientContact(patient, "call")}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePatientContact(patient, "sms")}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePatientContact(patient, "email")}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Patient Details */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Heart Rate</div>
                      <div className="font-semibold">
                        {patient.vitals.heartRate} BPM
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Blood Pressure
                      </div>
                      <div className="font-semibold">
                        {patient.vitals.bloodPressure}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Temperature</div>
                      <div className="font-semibold">
                        {patient.vitals.temperature}°F
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">SpO2</div>
                      <div className="font-semibold">
                        {patient.vitals.oxygenSaturation}%
                      </div>
                    </div>
                  </div>

                  {/* AI Diagnosis */}
                  {patient.aiDiagnosis && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-sm">
                          AI Diagnosis
                        </div>
                        <Badge variant="secondary">
                          {patient.aiDiagnosis.confidence}% confidence
                        </Badge>
                      </div>
                      <div className="text-sm">
                        {patient.aiDiagnosis.condition}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Urgent Cases Tab */}
        <TabsContent value="urgent" className="p-4 space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold">
              Urgent Cases Requiring Attention
            </h2>
          </div>

          {urgentCases.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  No urgent cases at this time
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {urgentCases.map((patient) => (
                <Card key={patient.id} className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{patient.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {patient.condition}
                          </div>
                          <div className="text-sm text-red-600">
                            Severity: {patient.severity}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="destructive">
                          <Phone className="h-4 w-4 mr-1" />
                          Call Now
                        </Button>
                        <Button size="sm" variant="outline">
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

        {/* Reports Tab */}
        <TabsContent value="reports" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Medical Reports</h2>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>

          {selectedPatient ? (
            <PatientHealthReport patient={selectedPatient} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-muted-foreground mb-4">
                  Select a patient to generate medical reports
                </div>
                <Button onClick={() => setActiveTab("patients")}>
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
