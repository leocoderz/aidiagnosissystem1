"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Clock,
  MapPin,
  Mic,
  Brain,
  Stethoscope,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Symptom {
  id: string;
  name: string;
  severity: number;
  duration: string;
  location: string;
  description: string;
  timestamp: string;
}

interface SymptomInputProps {
  currentSymptoms?: Symptom[];
  onSymptomsUpdate?: (symptoms: Symptom[]) => void;
  onDiagnosisRequest?: (symptoms: Symptom[]) => void;
}

export default function SymptomInput({
  currentSymptoms = [],
  onSymptomsUpdate = () => {},
  onDiagnosisRequest = () => {},
}: SymptomInputProps) {
  const [symptoms, setSymptoms] = useState<Symptom[]>(currentSymptoms);
  const [newSymptom, setNewSymptom] = useState("");
  const [severity, setSeverity] = useState([5]);
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const commonSymptoms = [
    "Headache",
    "Fever",
    "Cough",
    "Fatigue",
    "Nausea",
    "Dizziness",
    "Chest Pain",
    "Shortness of Breath",
    "Abdominal Pain",
    "Joint Pain",
    "Sore Throat",
    "Runny Nose",
    "Muscle Aches",
    "Loss of Appetite",
    "Vomiting",
    "Diarrhea",
    "Constipation",
    "Back Pain",
    "Skin Rash",
    "Swelling",
  ];

  const handleAddSymptom = () => {
    if (!newSymptom.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a symptom name",
        variant: "destructive",
      });
      return;
    }

    const symptom: Symptom = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: newSymptom,
      severity: severity[0],
      duration,
      location,
      description,
      timestamp: new Date().toISOString(),
    };

    const updatedSymptoms = [...symptoms, symptom];
    setSymptoms(updatedSymptoms);
    onSymptomsUpdate(updatedSymptoms);

    // Reset form
    setNewSymptom("");
    setSeverity([5]);
    setDuration("");
    setLocation("");
    setDescription("");

    toast({
      title: "Symptom Added",
      description: `${newSymptom} has been recorded successfully`,
    });
  };

  const handleRemoveSymptom = (id: string) => {
    const updatedSymptoms = symptoms.filter((symptom) => symptom.id !== id);
    setSymptoms(updatedSymptoms);
    onSymptomsUpdate(updatedSymptoms);

    toast({
      title: "Symptom Removed",
      description: "Symptom has been deleted from your records",
    });
  };

  const handleVoiceInput = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast({
        title: "Not supported",
        description: "Speech recognition not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    setIsListening(true);

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => prev + (prev ? " " : "") + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      toast({
        title: "Voice input failed",
        description: "Please try again or type your description",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleGetDiagnosis = () => {
    if (symptoms.length === 0) {
      toast({
        title: "No symptoms to analyze",
        description:
          "Please add at least one symptom before requesting diagnosis",
        variant: "destructive",
      });
      return;
    }

    onDiagnosisRequest(symptoms);
    toast({
      title: "AI Analysis Started",
      description: "Analyzing your symptoms for medical insights...",
    });
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return "bg-green-100 text-green-800";
    if (severity <= 6) return "bg-yellow-100 text-yellow-800";
    if (severity <= 8) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 3) return "Mild";
    if (severity <= 6) return "Moderate";
    if (severity <= 8) return "Severe";
    return "Critical";
  };

  return (
    <div className="space-y-6">
      {/* Add Symptom Form */}
      <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Plus className="mr-3 h-5 w-5 text-blue-600" />
            Add New Symptom
          </CardTitle>
          <CardDescription>
            Record your symptoms for AI-powered medical analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Add Buttons */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Common Symptoms
            </Label>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.slice(0, 8).map((symptom) => (
                <Button
                  key={symptom}
                  variant="outline"
                  size="sm"
                  onClick={() => setNewSymptom(symptom)}
                  className="text-xs h-8 hover:bg-blue-50 hover:border-blue-300"
                >
                  {symptom}
                </Button>
              ))}
            </div>
          </div>

          {/* Symptom Name */}
          <div>
            <Label htmlFor="symptom" className="text-sm font-medium">
              Symptom Name *
            </Label>
            <Input
              id="symptom"
              value={newSymptom}
              onChange={(e) => setNewSymptom(e.target.value)}
              placeholder="e.g., Headache, Fever, Cough"
              className="mt-2"
            />
          </div>

          {/* Severity Slider */}
          <div>
            <Label className="text-sm font-medium">
              Severity: {severity[0]}/10 - {getSeverityLabel(severity[0])}
            </Label>
            <div className="px-2 py-4">
              <Slider
                value={severity}
                onValueChange={setSeverity}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1 - Mild</span>
                <span>5 - Moderate</span>
                <span>10 - Severe</span>
              </div>
            </div>
          </div>

          {/* Duration and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration" className="text-sm font-medium">
                Duration
              </Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="How long have you had this?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Few minutes</SelectItem>
                  <SelectItem value="hours">Few hours</SelectItem>
                  <SelectItem value="1day">1 day</SelectItem>
                  <SelectItem value="2-3days">2-3 days</SelectItem>
                  <SelectItem value="week">About a week</SelectItem>
                  <SelectItem value="2weeks">2 weeks</SelectItem>
                  <SelectItem value="month">About a month</SelectItem>
                  <SelectItem value="months">Several months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location" className="text-sm font-medium">
                Location/Body Part
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Head, Chest, Abdomen"
                className="mt-2"
              />
            </div>
          </div>

          {/* Description with Voice Input */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Detailed Description
            </Label>
            <div className="relative mt-2">
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your symptom in detail... (e.g., sharp pain, dull ache, comes and goes, etc.)"
                rows={4}
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleVoiceInput}
                disabled={isListening}
              >
                <Mic
                  className={`h-4 w-4 ${isListening ? "text-red-500 animate-pulse" : "text-gray-400"}`}
                />
              </Button>
            </div>
            {isListening && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <Mic className="h-3 w-3 mr-1 animate-pulse" />
                Listening... Speak now
              </p>
            )}
          </div>

          <Button
            onClick={handleAddSymptom}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Symptom
          </Button>
        </CardContent>
      </Card>

      {/* Current Symptoms */}
      <Card className="border-0 bg-white shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center">
                <Stethoscope className="mr-3 h-5 w-5 text-green-600" />
                Your Symptoms ({symptoms.length})
              </CardTitle>
              <CardDescription>
                Review and manage your recorded symptoms
              </CardDescription>
            </div>
            {symptoms.length > 0 && (
              <Button
                onClick={handleGetDiagnosis}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                <Brain className="h-4 w-4 mr-2" />
                Get AI Diagnosis
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {symptoms.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No symptoms recorded yet
              </h3>
              <p className="text-gray-600">
                Add your first symptom above to get started with AI diagnosis
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {symptoms.map((symptom, index) => (
                <div
                  key={symptom.id}
                  className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold text-lg">
                          {symptom.name}
                        </h4>
                        <Badge
                          className={`${getSeverityColor(symptom.severity)} border-0`}
                        >
                          {symptom.severity}/10 -{" "}
                          {getSeverityLabel(symptom.severity)}
                        </Badge>
                        {symptom.severity >= 8 && (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            High Priority
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {symptom.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>
                              <strong>Duration:</strong> {symptom.duration}
                            </span>
                          </div>
                        )}
                        {symptom.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-500" />
                            <span>
                              <strong>Location:</strong> {symptom.location}
                            </span>
                          </div>
                        )}
                      </div>

                      {symptom.description && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-3 rounded border-l-4 border-blue-500">
                            <strong>Description:</strong> {symptom.description}
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-gray-400">
                        Added: {new Date(symptom.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSymptom(symptom.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Separator className="my-6" />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleGetDiagnosis}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Get AI Diagnosis & Treatment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSymptoms([]);
                    onSymptomsUpdate([]);
                  }}
                  className="sm:w-auto"
                >
                  Clear All
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      AI Medical Analysis Ready
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      You have {symptoms.length} symptom
                      {symptoms.length !== 1 ? "s" : ""} recorded. Click "Get AI
                      Diagnosis" to receive comprehensive medical analysis,
                      potential conditions, and treatment recommendations
                      powered by advanced AI.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
