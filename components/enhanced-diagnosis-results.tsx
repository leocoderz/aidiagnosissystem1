"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Stethoscope,
  Activity,
  Pill,
  Shield,
  TrendingUp,
  Clock,
  Heart,
} from "lucide-react"

interface EnhancedDiagnosisResultsProps {
  symptoms: string[]
  patientInfo?: any
  onDiagnosisComplete?: (diagnosis: any) => void
}

export default function EnhancedDiagnosisResults({
  symptoms = [],
  patientInfo,
  onDiagnosisComplete,
}: EnhancedDiagnosisResultsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [diagnosis, setDiagnosis] = useState<any>(null)

  const analyzeSymptomsWithAI = async () => {
    if (symptoms.length === 0) return

    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/ai-diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms,
          patientInfo,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get diagnosis")
      }

      const diagnosisResult = await response.json()
      setDiagnosis(diagnosisResult)

      if (onDiagnosisComplete) {
        onDiagnosisComplete({
          ...diagnosisResult,
          date: new Date().toLocaleDateString(),
          symptoms: symptoms.map((s) => {
            try {
              return JSON.parse(s).name
            } catch {
              return s
            }
          }),
        })
      }
    } catch (error) {
      console.error("Analysis failed:", error)
      // Fallback diagnosis
      setDiagnosis({
        condition: "Analysis Error",
        confidence: 0,
        severity: "mild",
        explanation: "Unable to complete analysis. Please try again or consult a healthcare provider.",
        recommendations: ["Please try the analysis again", "Consider consulting a healthcare provider"],
        treatment: ["Consult healthcare provider for proper evaluation"],
        seekImmediateCare: false,
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
      case "severe":
        return "destructive"
      case "moderate":
        return "secondary"
      default:
        return "default"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "severe":
        return <AlertTriangle className="h-4 w-4" />
      case "moderate":
        return <Activity className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {symptoms.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Symptoms to Analyze</h3>
            <p className="text-gray-600">Add symptoms in the Symptoms tab to get AI-powered diagnosis</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5 text-blue-600" />
                AI Medical Analysis
              </CardTitle>
              <CardDescription>
                Advanced AI analysis of your symptoms with evidence-based medical insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={analyzeSymptomsWithAI} disabled={isAnalyzing} className="w-full" size="lg">
                {isAnalyzing ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing {symptoms.length} Symptom{symptoms.length !== 1 ? "s" : ""}...
                  </>
                ) : (
                  <>
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Get AI Diagnosis & Treatment Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {isAnalyzing && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <div className="animate-pulse">
                    <Brain className="mx-auto h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Medical Analysis in Progress</h3>
                    <p className="text-sm text-gray-600">Processing symptoms through advanced medical AI...</p>
                  </div>
                  <Progress value={75} className="w-full max-w-md mx-auto" />
                </div>
              </CardContent>
            </Card>
          )}

          {diagnosis && (
            <Tabs defaultValue="diagnosis" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                <TabsTrigger value="treatment">Treatment</TabsTrigger>
                <TabsTrigger value="explanation">Analysis</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              </TabsList>

              <TabsContent value="diagnosis">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Heart className="mr-2 h-5 w-5 text-red-500" />
                          {diagnosis.condition}
                        </span>
                        <Badge variant={getSeverityColor(diagnosis.severity)} className="flex items-center gap-1">
                          {getSeverityIcon(diagnosis.severity)}
                          {diagnosis.severity}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{diagnosis.explanation?.substring(0, 200)}...</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">AI Confidence Level</span>
                          <span className="text-sm font-semibold">{diagnosis.confidence}%</span>
                        </div>
                        <Progress value={diagnosis.confidence} className="h-3" />
                      </div>

                      {diagnosis.seekImmediateCare && (
                        <Alert className="border-red-500 bg-red-50">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Urgent Medical Attention Required</AlertTitle>
                          <AlertDescription>
                            This diagnosis suggests you should seek immediate medical care. Please contact emergency
                            services or visit the nearest emergency room.
                          </AlertDescription>
                        </Alert>
                      )}

                      {diagnosis.differentialDiagnoses && diagnosis.differentialDiagnoses.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Alternative Diagnoses Considered</h4>
                          <div className="space-y-2">
                            {diagnosis.differentialDiagnoses.map((alt: any, index: number) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">{alt.condition}</span>
                                <Badge variant="outline">{alt.probability}% probability</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="treatment">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Pill className="mr-2 h-5 w-5 text-green-600" />
                        Treatment Plan
                      </CardTitle>
                      <CardDescription>Evidence-based treatment recommendations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {diagnosis.treatment && diagnosis.treatment.length > 0 ? (
                        <div className="space-y-4">
                          {diagnosis.treatment.map((treatment: string, index: number) => (
                            <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-green-900">{treatment}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">No specific treatment recommendations available.</p>
                      )}
                    </CardContent>
                  </Card>

                  {diagnosis.redFlags && diagnosis.redFlags.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-red-600">
                          <AlertTriangle className="mr-2 h-5 w-5" />
                          Warning Signs
                        </CardTitle>
                        <CardDescription>Seek immediate medical attention if you experience:</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {diagnosis.redFlags.map((flag: string, index: number) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                              <span className="text-red-900">{flag}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="explanation">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-yellow-600" />
                      Medical Analysis
                    </CardTitle>
                    <CardDescription>Detailed explanation of the diagnosis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{diagnosis.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="monitoring">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                        Prognosis & Recovery
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{diagnosis.prognosis}</p>
                    </CardContent>
                  </Card>

                  {diagnosis.prevention && diagnosis.prevention.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Shield className="mr-2 h-5 w-5 text-purple-600" />
                          Prevention Measures
                        </CardTitle>
                        <CardDescription>Steps to prevent recurrence</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {diagnosis.prevention.map((measure: string, index: number) => (
                            <div key={index} className="flex items-start space-x-3">
                              <Shield className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{measure}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-orange-600" />
                        Follow-up Care
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Clock className="h-4 w-4 text-orange-600 mt-1" />
                          <span>Monitor symptoms daily and track any changes</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Clock className="h-4 w-4 text-orange-600 mt-1" />
                          <span>Follow up with healthcare provider in 3-7 days</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Clock className="h-4 w-4 text-orange-600 mt-1" />
                          <span>Return immediately if symptoms worsen</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  )
}
