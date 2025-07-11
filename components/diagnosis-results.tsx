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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Stethoscope,
  Activity,
} from "lucide-react";

interface DiagnosisResultsProps {
  diagnosis: any;
}

export default function DiagnosisResults({ diagnosis }: DiagnosisResultsProps) {
  const analyzeSymptomsWithAI = async () => {
    if (symptoms.length === 0) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/ai-diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms,
          patientInfo: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get diagnosis");
      }

      const diagnosisResult = await response.json();
      setDiagnosis(diagnosisResult);

      onDiagnosisComplete({
        ...diagnosisResult,
        date: new Date().toLocaleDateString(),
        symptoms: symptoms.map((s) => {
          try {
            return JSON.parse(s).name;
          } catch {
            return s;
          }
        }),
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      // Fallback diagnosis
      setDiagnosis({
        condition: "Analysis Error",
        confidence: 0,
        severity: "mild",
        explanation:
          "Unable to complete analysis. Please try again or consult a healthcare provider.",
        recommendations: [
          "Please try the analysis again",
          "Consider consulting a healthcare provider",
        ],
        treatment: ["Consult healthcare provider for proper evaluation"],
        seekImmediateCare: false,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {symptoms.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Symptoms to Analyze
            </h3>
            <p className="text-gray-600">
              Add symptoms in the Symptoms tab to get AI-powered diagnosis
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5 text-blue-600" />
                AI Diagnosis Analysis
              </CardTitle>
              <CardDescription>
                Advanced machine learning analysis of your symptoms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={analyzeSymptomsWithAI}
                disabled={isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Analyze {symptoms.length} Symptom
                    {symptoms.length !== 1 ? "s" : ""}
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
                    <h3 className="font-semibold">AI Analysis in Progress</h3>
                    <p className="text-sm text-gray-600">
                      Processing symptoms through neural networks...
                    </p>
                  </div>
                  <Progress value={66} className="w-full max-w-md mx-auto" />
                </div>
              </CardContent>
            </Card>
          )}

          {diagnosis && (
            <Tabs defaultValue="diagnosis" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                <TabsTrigger value="treatment">Treatment</TabsTrigger>
                <TabsTrigger value="recommendations">Care Plan</TabsTrigger>
              </TabsList>

              <TabsContent value="diagnosis">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{diagnosis.condition}</span>
                      <Badge
                        variant={
                          diagnosis.severity === "critical" ||
                          diagnosis.severity === "severe"
                            ? "destructive"
                            : diagnosis.severity === "moderate"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {diagnosis.severity}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {diagnosis.explanation?.substring(0, 200)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Confidence Level
                        </span>
                        <span className="text-sm font-semibold">
                          {diagnosis.confidence}%
                        </span>
                      </div>
                      <Progress value={diagnosis.confidence} className="h-3" />
                    </div>

                    {diagnosis.seekImmediateCare && (
                      <Alert className="border-red-500 bg-red-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>
                          Urgent Medical Attention Required
                        </AlertTitle>
                        <AlertDescription>
                          This diagnosis suggests you should seek immediate
                          medical care.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="treatment">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                      Treatment Plan
                    </CardTitle>
                    <CardDescription>
                      Recommended treatment steps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {diagnosis.treatment && diagnosis.treatment.length > 0 ? (
                      <div className="space-y-3">
                        {diagnosis.treatment.map(
                          (treatment: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3"
                            >
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{treatment}</span>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        No specific treatment recommendations available.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations">
                <div className="space-y-4">
                  {diagnosis.recommendations &&
                    diagnosis.recommendations.map(
                      (rec: string, index: number) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="flex items-start space-x-4">
                              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                <Lightbulb className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-600">{rec}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ),
                    )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}
