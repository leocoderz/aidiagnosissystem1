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
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Activity,
  Stethoscope,
  Clock,
} from "lucide-react";

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
            Add symptoms and request AI analysis to see comprehensive medical
            assessment
          </p>
        </CardContent>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-500 text-white";
      case "severe":
        return "bg-red-400 text-white";
      case "moderate":
        return "bg-yellow-500 text-white";
      case "mild":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 border-green-600";
    if (confidence >= 80) return "text-blue-600 border-blue-600";
    if (confidence >= 70) return "text-yellow-600 border-yellow-600";
    return "text-red-600 border-red-600";
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return "Recently generated";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card with Key Information */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">{diagnosis.condition}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  {diagnosis.icdCode && (
                    <Badge variant="outline" className="text-xs">
                      ICD-10: {diagnosis.icdCode}
                    </Badge>
                  )}
                  {diagnosis.analysisQuality && (
                    <Badge variant="outline" className="text-xs">
                      {diagnosis.analysisQuality} analysis
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getSeverityColor(diagnosis.severity)}>
                {diagnosis.severity?.toUpperCase() || "UNKNOWN"}
              </Badge>
              <Badge
                variant="outline"
                className={getConfidenceColor(diagnosis.confidence)}
              >
                {diagnosis.confidence}% Confidence
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTimestamp(diagnosis.timestamp)}</span>
            </div>
            {diagnosis.aiGenerated && (
              <div className="flex items-center gap-1">
                <Stethoscope className="h-4 w-4" />
                <span>AI-Generated Analysis</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Alert */}
      {diagnosis.seekImmediateCare && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            ⚠️ Urgent Medical Attention Required
          </AlertTitle>
          <AlertDescription className="text-red-700">
            This condition may require immediate medical evaluation. Consider
            seeking emergency care or contacting your healthcare provider
            promptly.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="diagnosis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 text-sm">
          <TabsTrigger value="diagnosis">Assessment</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="treatment">Treatment</TabsTrigger>
          <TabsTrigger value="differential">Differential</TabsTrigger>
          <TabsTrigger value="monitoring">Follow-up</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnosis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Clinical Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-800 leading-relaxed">
                    {diagnosis.explanation}
                  </p>
                </div>
              </div>

              {diagnosis.clinicalEvidence &&
                diagnosis.clinicalEvidence.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      Supporting Clinical Evidence
                    </h4>
                    <div className="space-y-3">
                      {diagnosis.clinicalEvidence.map(
                        (evidence: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-800">{evidence}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Confidence Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Diagnostic Confidence
                  </span>
                  <span className="text-sm text-gray-600">
                    {diagnosis.confidence}%
                  </span>
                </div>
                <Progress value={diagnosis.confidence} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">
                  Based on symptom analysis and medical knowledge base
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-600" />
                Disease Risk Predictions
              </CardTitle>
              <CardDescription>
                AI-powered predictions for potential future health conditions
                based on current symptoms and risk factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {diagnosis.diseasePredictions &&
                diagnosis.diseasePredictions.length > 0 ? (
                  <div>
                    <h4 className="font-semibold mb-4 text-orange-700 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Predicted Health Risks
                    </h4>
                    <div className="space-y-4">
                      {diagnosis.diseasePredictions.map(
                        (prediction: any, index: number) => (
                          <div
                            key={index}
                            className="p-4 border rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold text-orange-800">
                                {prediction.disease}
                              </h5>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`${
                                    prediction.riskScore >= 70
                                      ? "border-red-500 text-red-700"
                                      : prediction.riskScore >= 40
                                        ? "border-yellow-500 text-yellow-700"
                                        : "border-green-500 text-green-700"
                                  }`}
                                >
                                  {prediction.riskScore}% Risk
                                </Badge>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      prediction.riskScore >= 70
                                        ? "bg-red-500"
                                        : prediction.riskScore >= 40
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
                                    }`}
                                    style={{
                                      width: `${Math.min(prediction.riskScore, 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <p>
                                <strong>Timeline:</strong> {prediction.timeline}
                              </p>
                              {prediction.preventionMeasures &&
                                prediction.preventionMeasures.length > 0 && (
                                  <div>
                                    <strong>Prevention:</strong>
                                    <ul className="mt-1 ml-4 list-disc text-orange-700">
                                      {prediction.preventionMeasures.map(
                                        (measure: string, i: number) => (
                                          <li key={i}>{measure}</li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                )}
                              {prediction.earlyWarningSignsForDisease &&
                                prediction.earlyWarningSignsForDisease.length >
                                  0 && (
                                  <div>
                                    <strong>Early Warning Signs:</strong>
                                    <ul className="mt-1 ml-4 list-disc text-red-700">
                                      {prediction.earlyWarningSignsForDisease.map(
                                        (sign: string, i: number) => (
                                          <li key={i}>{sign}</li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">
                      No specific disease predictions available for current
                      symptoms.
                    </p>
                  </div>
                )}

                {diagnosis.predictiveInsights &&
                  diagnosis.predictiveInsights.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-blue-700 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Clinical Insights for Healthcare Providers
                      </h4>
                      <div className="space-y-3">
                        {diagnosis.predictiveInsights.map(
                          (insight: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
                            >
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-blue-800">{insight}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {diagnosis.riskFactors && diagnosis.riskFactors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-red-700 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Contributing Risk Factors
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {diagnosis.riskFactors.map(
                        (factor: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-red-50 rounded border-l-2 border-red-400"
                          >
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-red-800 text-sm">
                              {factor}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                Evidence-Based Treatment Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4 text-green-700 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Therapeutic Interventions
                  </h4>
                  <div className="space-y-3">
                    {diagnosis.treatment && diagnosis.treatment.length > 0 ? (
                      diagnosis.treatment.map((item: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-400"
                        >
                          <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-gray-800 leading-relaxed">
                            {item}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 italic">
                        No specific treatment recommendations available.
                      </p>
                    )}
                  </div>
                </div>

                {diagnosis.redFlags && diagnosis.redFlags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-4 text-red-700 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Critical Warning Signs
                    </h4>
                    <div className="space-y-3">
                      {diagnosis.redFlags.map((flag: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500"
                        >
                          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-red-800 font-medium leading-relaxed">
                            {flag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="differential">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Differential Diagnosis
              </CardTitle>
              <CardDescription>
                Alternative conditions to consider based on symptom analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diagnosis.differentialDiagnoses &&
                diagnosis.differentialDiagnoses.length > 0 ? (
                  diagnosis.differentialDiagnoses.map(
                    (diff: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-purple-800">
                            {diff.condition}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-purple-600"
                            >
                              {diff.probability}% probability
                            </Badge>
                            <div className="w-16 bg-purple-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${diff.probability}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        {diff.distinguishingFeatures && (
                          <p className="text-sm text-purple-700">
                            <strong>Key distinguishing features:</strong>{" "}
                            {diff.distinguishingFeatures}
                          </p>
                        )}
                      </div>
                    ),
                  )
                ) : (
                  <div className="text-center py-8">
                    <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">
                      No differential diagnoses available in current analysis.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Monitoring & Follow-up Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4 text-blue-700">
                    Care Recommendations
                  </h4>
                  <div className="space-y-3">
                    {diagnosis.recommendations &&
                    diagnosis.recommendations.length > 0 ? (
                      diagnosis.recommendations.map(
                        (item: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                          >
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-800">{item}</span>
                          </div>
                        ),
                      )
                    ) : (
                      <p className="text-gray-600 italic">
                        No specific care recommendations provided.
                      </p>
                    )}
                  </div>
                </div>

                {diagnosis.prognosis && (
                  <div>
                    <h4 className="font-semibold mb-3 text-green-700">
                      Expected Outcome & Prognosis
                    </h4>
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="text-gray-800 leading-relaxed">
                        {diagnosis.prognosis}
                      </p>
                    </div>
                  </div>
                )}

                {diagnosis.prevention && diagnosis.prevention.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-indigo-700">
                      Prevention Strategies
                    </h4>
                    <div className="space-y-2">
                      {diagnosis.prevention.map(
                        (item: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-800">{item}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {diagnosis.followUpPlan &&
                  diagnosis.followUpPlan.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-amber-700">
                        Follow-up Schedule
                      </h4>
                      <div className="space-y-2">
                        {diagnosis.followUpPlan.map(
                          (item: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg"
                            >
                              <Clock className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                              <span className="text-gray-800">{item}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Medical Disclaimer */}
      <Alert>
        <Stethoscope className="h-4 w-4" />
        <AlertTitle>Medical Disclaimer</AlertTitle>
        <AlertDescription>
          This AI analysis is for educational and informational purposes only.
          It should never replace professional medical evaluation, diagnosis, or
          treatment. Always consult qualified healthcare providers for medical
          decisions and urgent health concerns.
        </AlertDescription>
      </Alert>
    </div>
  );
}
