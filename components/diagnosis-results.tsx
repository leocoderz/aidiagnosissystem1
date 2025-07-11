"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";

interface DiagnosisResultsProps {
  diagnosis: any;
}

export default function DiagnosisResults({ diagnosis }: DiagnosisResultsProps) {
  if (!diagnosis) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Diagnosis Available
          </h3>
          <p className="text-gray-600">
            Add symptoms and request diagnosis to see results
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
                {diagnosis.explanation?.substring(0, 200)}
                {diagnosis.explanation?.length > 200 ? "..." : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Confidence Level</span>
                  <span className="text-sm font-semibold">
                    {diagnosis.confidence}%
                  </span>
                </div>
                <Progress value={diagnosis.confidence} className="h-3" />
              </div>

              {diagnosis.seekImmediateCare && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Urgent Medical Attention Required</AlertTitle>
                  <AlertDescription>
                    This diagnosis suggests you should seek immediate medical
                    care.
                  </AlertDescription>
                </Alert>
              )}

              {diagnosis.differentialDiagnoses &&
                diagnosis.differentialDiagnoses.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">
                      Alternative Diagnoses
                    </h4>
                    <div className="space-y-2">
                      {diagnosis.differentialDiagnoses.map(
                        (diff: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm">{diff.condition}</span>
                            <Badge variant="outline">{diff.probability}%</Badge>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
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
              <CardDescription>Recommended treatment steps</CardDescription>
            </CardHeader>
            <CardContent>
              {diagnosis.treatment && diagnosis.treatment.length > 0 ? (
                <div className="space-y-3">
                  {diagnosis.treatment.map(
                    (treatment: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
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

              {diagnosis.redFlags && diagnosis.redFlags.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-red-600">
                    Warning Signs
                  </h4>
                  <div className="space-y-2">
                    {diagnosis.redFlags.map((flag: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-700">{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-4">
            {diagnosis.recommendations &&
            diagnosis.recommendations.length > 0 ? (
              diagnosis.recommendations.map((rec: string, index: number) => (
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
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">
                    No specific recommendations available.
                  </p>
                </CardContent>
              </Card>
            )}

            {diagnosis.prognosis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prognosis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{diagnosis.prognosis}</p>
                </CardContent>
              </Card>
            )}

            {diagnosis.prevention && diagnosis.prevention.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prevention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {diagnosis.prevention.map((prev: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{prev}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
