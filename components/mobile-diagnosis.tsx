"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Brain, AlertTriangle, Stethoscope, Activity, Lightbulb, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Symptom {
  id: string
  name: string
  severity: number
  duration: string
  location: string
  description: string
  timestamp: string
}

interface Diagnosis {
  id: string
  condition: string
  confidence: number
  severity: "mild" | "moderate" | "severe" | "critical"
  symptoms: string[]
  timestamp: string
  recommendations: string[]
  explanation?: string
  seekImmediateCare?: boolean
}

interface MobileDiagnosisProps {
  symptoms: Symptom[]
  onAddDiagnosis: (diagnosis: Omit<Diagnosis, "id" | "timestamp">) => void
  diagnoses: Diagnosis[]
}

export default function MobileDiagnosis({ symptoms, onAddDiagnosis, diagnoses }: MobileDiagnosisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentDiagnosis, setCurrentDiagnosis] = useState<Diagnosis | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const { toast } = useToast()

  const analyzeSymptomsWithAI = async () => {
    if (symptoms.length === 0) {
      toast({
        title: "No symptoms",
        description: "Please add symptoms first to get a diagnosis",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 15
      })
    }, 300)

    try {
      // Call our local diagnosis API
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: symptoms.map(
            (s) =>
              `${s.name} (severity: ${s.severity}/10, duration: ${s.duration}, location: ${s.location}, description: ${s.description})`,
          ),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const aiResponse = await response.json()

      // Complete progress
      setAnalysisProgress(100)

      const diagnosis: Omit<Diagnosis, "id" | "timestamp"> = {
        condition: aiResponse.condition || "General Health Assessment",
        confidence: aiResponse.confidence || 75,
        severity: aiResponse.severity || "mild",
        symptoms: symptoms.map((s) => s.name),
        recommendations: aiResponse.recommendations || [
          "Monitor symptoms closely",
          "Stay hydrated and get adequate rest",
          "Consult healthcare provider if symptoms worsen",
        ],
        explanation: aiResponse.explanation,
        seekImmediateCare: aiResponse.seekImmediateCare,
      }

      setCurrentDiagnosis({ ...diagnosis, id: Date.now().toString(), timestamp: new Date().toISOString() })
      onAddDiagnosis(diagnosis)

      // Show additional warning for severe cases
      if (aiResponse.seekImmediateCare) {
        toast({
          title: "⚠️ Urgent Medical Attention",
          description: "Your symptoms suggest you should seek immediate medical care.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "✅ Analysis Complete",
          description: `${aiResponse.condition} - ${aiResponse.confidence}% confidence`,
        })
      }
    } catch (error) {
      console.error("Analysis failed:", error)

      // Generate simple fallback diagnosis
      const fallbackDiagnosis = generateSimpleFallback(symptoms)
      setCurrentDiagnosis({ ...fallbackDiagnosis, id: Date.now().toString(), timestamp: new Date().toISOString() })
      onAddDiagnosis(fallbackDiagnosis)

      toast({
        title: "Analysis completed offline",
        description: "Using local symptom analysis",
      })
    } finally {
      clearInterval(progressInterval)
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  const getSeverityCategory = (avgSeverity: number, symptoms: Symptom[]) => {
    // Check for emergency keywords
    const emergencyKeywords = ["chest pain", "difficulty breathing", "severe", "unbearable", "emergency"]
    const hasEmergencySymptoms = symptoms.some((s) =>
      emergencyKeywords.some(
        (keyword) => s.name.toLowerCase().includes(keyword) || s.description.toLowerCase().includes(keyword),
      ),
    )

    if (hasEmergencySymptoms || avgSeverity >= 9) {
      return { severity: "critical" as const, seekImmediateCare: true }
    } else if (avgSeverity >= 7) {
      return { severity: "severe" as const, seekImmediateCare: false }
    } else if (avgSeverity >= 4) {
      return { severity: "moderate" as const, seekImmediateCare: false }
    } else {
      return { severity: "mild" as const, seekImmediateCare: false }
    }
  }

  const generateSimpleFallback = (symptoms: Symptom[]): Omit<Diagnosis, "id" | "timestamp"> => {
    const avgSeverity = symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length
    const severityCategory = getSeverityCategory(avgSeverity, symptoms)

    return {
      condition: severityCategory.severity === "critical" ? "Critical Health Assessment" : "Symptom Assessment",
      confidence: severityCategory.severity === "critical" ? 95 : 70,
      severity: severityCategory.severity,
      symptoms: symptoms.map((s) => s.name),
      recommendations: severityCategory.seekImmediateCare
        ? [
            "Seek immediate emergency medical care",
            "Call 911 or go to the nearest emergency room",
            "Do not delay medical treatment",
            "Have someone accompany you if possible",
          ]
        : [
            "Monitor your symptoms closely",
            "Stay hydrated and get adequate rest",
            "Consult a healthcare provider if symptoms persist",
            "Seek immediate care if symptoms worsen significantly",
          ],
      explanation: `Based on ${symptoms.length} reported symptom${symptoms.length !== 1 ? "s" : ""} with an average severity of ${avgSeverity.toFixed(1)}/10. ${severityCategory.seekImmediateCare ? "Immediate medical attention recommended." : "Continue monitoring and seek care if needed."}`,
      seekImmediateCare: severityCategory.seekImmediateCare,
    }
  }

  return (
    <div className="space-y-4">
      {/* Analysis Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Brain className="mr-2 h-5 w-5 text-blue-600" />
            AI Diagnosis Engine
          </CardTitle>
          <CardDescription>Advanced symptom analysis using medical knowledge base</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={analyzeSymptomsWithAI}
            disabled={isAnalyzing || symptoms.length === 0}
            className="w-full h-12"
          >
            {isAnalyzing ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" />
                Analyzing {symptoms.length} symptom{symptoms.length !== 1 ? "s" : ""}...
              </>
            ) : (
              <>
                <Stethoscope className="mr-2 h-4 w-4" />
                Analyze {symptoms.length} Symptom{symptoms.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>

          {symptoms.length === 0 && (
            <p className="text-sm text-gray-500 text-center mt-2">Add symptoms first to get a diagnosis</p>
          )}
        </CardContent>
      </Card>

      {/* Loading State with Progress */}
      {isAnalyzing && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <Brain className="mx-auto h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Medical Analysis in Progress</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Processing symptoms through medical knowledge base...
                </p>
              </div>
              <div className="space-y-2">
                <Progress value={analysisProgress} className="w-full max-w-md mx-auto" />
                <p className="text-xs text-gray-500">{analysisProgress}% complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Diagnosis */}
      {currentDiagnosis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                {currentDiagnosis.condition}
              </CardTitle>
              <Badge
                variant={
                  currentDiagnosis.severity === "severe" || currentDiagnosis.severity === "critical"
                    ? "destructive"
                    : currentDiagnosis.severity === "moderate"
                      ? "secondary"
                      : "default"
                }
              >
                {currentDiagnosis.severity}
              </Badge>
            </div>
            {currentDiagnosis.explanation && (
              <CardDescription className="mt-2">{currentDiagnosis.explanation}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Confidence Level</span>
                <span className="text-sm font-semibold">{currentDiagnosis.confidence}%</span>
              </div>
              <Progress value={currentDiagnosis.confidence} className="h-2" />
            </div>

            {currentDiagnosis.seekImmediateCare && (
              <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>⚠️ Urgent Medical Attention Required</AlertTitle>
                <AlertDescription>
                  Your symptoms suggest you should seek immediate medical care. Please contact emergency services or
                  visit the nearest emergency room.
                </AlertDescription>
              </Alert>
            )}

            {currentDiagnosis.severity === "severe" && !currentDiagnosis.seekImmediateCare && (
              <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important Notice</AlertTitle>
                <AlertDescription>
                  Your symptoms are severe. Consider consulting with a healthcare provider soon.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 mr-1" />
                Medical Recommendations
              </h4>
              <ul className="space-y-2">
                {currentDiagnosis.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                    <span className="mr-2 text-blue-600">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <strong>Analysis completed:</strong> {new Date(currentDiagnosis.timestamp).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnosis History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Diagnosis History</CardTitle>
          <CardDescription>Your previous medical assessments</CardDescription>
        </CardHeader>
        <CardContent>
          {diagnoses.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No diagnoses yet</p>
              <p className="text-sm text-gray-400">Your analysis history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {diagnoses.slice(0, 5).map((diagnosis) => (
                <div key={diagnosis.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{diagnosis.condition}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{diagnosis.confidence}%</Badge>
                      <Badge
                        variant={
                          diagnosis.severity === "severe" || diagnosis.severity === "critical"
                            ? "destructive"
                            : diagnosis.severity === "moderate"
                              ? "secondary"
                              : "default"
                        }
                        className="text-xs"
                      >
                        {diagnosis.severity}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {new Date(diagnosis.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Medical Disclaimer</AlertTitle>
        <AlertDescription className="text-xs">
          This analysis is for informational purposes only and should not replace professional medical advice. Always
          consult with qualified healthcare providers for medical concerns. In case of emergency, call 911 immediately.
        </AlertDescription>
      </Alert>
    </div>
  )
}
