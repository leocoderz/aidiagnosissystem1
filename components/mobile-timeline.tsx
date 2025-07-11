"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Activity, Brain, TrendingUp, TrendingDown } from "lucide-react"

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
  severity: "mild" | "moderate" | "severe"
  symptoms: string[]
  timestamp: string
  recommendations: string[]
}

interface MobileTimelineProps {
  symptoms: Symptom[]
  diagnoses: Diagnosis[]
}

export default function MobileTimeline({ symptoms, diagnoses }: MobileTimelineProps) {
  // Combine and sort all events by timestamp
  const allEvents = [
    ...symptoms.map((s) => ({ ...s, type: "symptom" as const })),
    ...diagnoses.map((d) => ({ ...d, type: "diagnosis" as const })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const getHealthTrend = () => {
    if (symptoms.length === 0) return { trend: "stable", icon: Activity, color: "text-blue-500" }

    const recentSymptoms = symptoms.slice(0, 3)
    const avgSeverity = recentSymptoms.reduce((sum, s) => sum + s.severity, 0) / recentSymptoms.length

    if (avgSeverity > 7) return { trend: "worsening", icon: TrendingUp, color: "text-red-500" }
    if (avgSeverity < 4) return { trend: "improving", icon: TrendingDown, color: "text-green-500" }
    return { trend: "stable", icon: Activity, color: "text-blue-500" }
  }

  const healthTrend = getHealthTrend()
  const TrendIcon = healthTrend.icon

  return (
    <div className="space-y-4">
      {/* Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Clock className="mr-2 h-5 w-5 text-purple-600" />
            Health Timeline
          </CardTitle>
          <CardDescription>Your health journey over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{symptoms.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Symptoms</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{diagnoses.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Diagnoses</div>
            </div>
            <div>
              <div className={`flex items-center justify-center ${healthTrend.color}`}>
                <TrendIcon className="h-6 w-6" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">{healthTrend.trend}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {allEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No health data recorded yet</p>
          ) : (
            <div className="space-y-4">
              {allEvents.map((event, index) => (
                <div key={`${event.type}-${event.id}`} className="relative">
                  {/* Timeline line */}
                  {index < allEvents.length - 1 && (
                    <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-200 dark:bg-gray-700"></div>
                  )}

                  <div className="flex items-start space-x-3">
                    {/* Timeline dot */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        event.type === "symptom" ? "bg-blue-100 dark:bg-blue-900" : "bg-purple-100 dark:bg-purple-900"
                      }`}
                    >
                      {event.type === "symptom" ? (
                        <Activity
                          className={`h-4 w-4 ${
                            event.type === "symptom"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-purple-600 dark:text-purple-400"
                          }`}
                        />
                      ) : (
                        <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>

                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{event.type === "symptom" ? event.name : event.condition}</h4>
                          <Badge
                            variant={
                              event.type === "symptom"
                                ? "outline"
                                : event.severity === "severe"
                                  ? "destructive"
                                  : event.severity === "moderate"
                                    ? "secondary"
                                    : "default"
                            }
                          >
                            {event.type === "symptom" ? `${event.severity}/10` : `${event.confidence}%`}
                          </Badge>
                        </div>

                        {event.type === "symptom" && event.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{event.description}</p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {new Date(event.timestamp).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Insights */}
      {symptoms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Health Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Symptom Pattern</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                You've recorded {symptoms.length} symptom{symptoms.length !== 1 ? "s" : ""} recently.
                {symptoms.length > 3 && " Consider tracking patterns to identify triggers."}
              </p>
            </div>

            {diagnoses.length > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">AI Analysis</h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Latest diagnosis: {diagnoses[0].condition} with {diagnoses[0].confidence}% confidence.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
