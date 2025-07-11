"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, TrendingUp, TrendingDown, Calendar, Activity, AlertCircle } from "lucide-react"

interface TimelineTrackerProps {
  symptoms: string[]
  diagnosisHistory: any[]
}

export default function TimelineTracker({ symptoms, diagnosisHistory }: TimelineTrackerProps) {
  const [timeRange, setTimeRange] = useState("7days")
  const [timelineData, setTimelineData] = useState<any[]>([])

  useEffect(() => {
    generateTimelineData()
  }, [symptoms, diagnosisHistory, timeRange])

  const generateTimelineData = () => {
    const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // Mock symptom data for demonstration
      const dayData = {
        date: date.toISOString().split("T")[0],
        symptoms: Math.random() > 0.7 ? generateRandomSymptoms() : [],
        severity: Math.floor(Math.random() * 10) + 1,
        mood: Math.floor(Math.random() * 10) + 1,
        sleep: Math.random() * 4 + 6, // 6-10 hours
        activities: generateRandomActivities(),
      }

      data.push(dayData)
    }

    setTimelineData(data)
  }

  const generateRandomSymptoms = () => {
    const possibleSymptoms = ["Headache", "Fatigue", "Cough", "Nausea", "Dizziness"]
    const count = Math.floor(Math.random() * 3) + 1
    return possibleSymptoms.slice(0, count)
  }

  const generateRandomActivities = () => {
    const activities = ["Exercise", "Work", "Rest", "Social", "Medical"]
    return activities[Math.floor(Math.random() * activities.length)]
  }

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return "bg-green-500"
    if (severity <= 6) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getTrend = (data: number[]) => {
    if (data.length < 2) return "stable"
    const recent = data.slice(-3).reduce((a, b) => a + b, 0) / 3
    const previous = data.slice(-6, -3).reduce((a, b) => a + b, 0) / 3

    if (recent > previous + 1) return "increasing"
    if (recent < previous - 1) return "decreasing"
    return "stable"
  }

  const severityData = timelineData.map((d) => d.severity)
  const severityTrend = getTrend(severityData)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-blue-600" />
                Symptom Timeline
              </CardTitle>
              <CardDescription>Track your health patterns over time</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 Days</SelectItem>
                <SelectItem value="30days">30 Days</SelectItem>
                <SelectItem value="90days">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {severityTrend === "increasing" ? (
                  <TrendingUp className="h-5 w-5 text-red-500" />
                ) : severityTrend === "decreasing" ? (
                  <TrendingDown className="h-5 w-5 text-green-500" />
                ) : (
                  <Activity className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="text-2xl font-bold">
                {severityData.length > 0 ? (severityData.slice(-7).reduce((a, b) => a + b, 0) / 7).toFixed(1) : "0"}
              </div>
              <div className="text-sm text-gray-600">Avg Severity</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">{timelineData.filter((d) => d.symptoms.length > 0).length}</div>
              <div className="text-sm text-gray-600">Symptomatic Days</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-2xl font-bold">{timelineData.filter((d) => d.severity > 7).length}</div>
              <div className="text-sm text-gray-600">High Severity Days</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Timeline</CardTitle>
          <CardDescription>Detailed view of your health journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {timelineData.map((day, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full mt-1 ${getSeverityColor(day.severity)}`}
                    title={`Severity: ${day.severity}/10`}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {day.symptoms.length > 0 ? "Symptoms Reported" : "No Symptoms"}
                      </span>
                      {day.severity > 7 && (
                        <Badge variant="destructive" className="text-xs">
                          High Severity
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">Severity: {day.severity}/10</div>
                  </div>

                  {day.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {day.symptoms.map((symptom: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>Sleep: {day.sleep.toFixed(1)}h</div>
                    <div>Mood: {day.mood}/10</div>
                    <div>Activity: {day.activities}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pattern Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern Analysis</CardTitle>
          <CardDescription>AI-identified patterns in your health data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Weekly Pattern</h4>
              <p className="text-blue-800 text-sm">
                Symptoms tend to be more severe on weekdays, possibly stress-related.
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Sleep Correlation</h4>
              <p className="text-green-800 text-sm">Better sleep quality correlates with reduced symptom severity.</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Trend Alert</h4>
              <p className="text-orange-800 text-sm">
                {severityTrend === "increasing"
                  ? "Symptom severity has been increasing. Consider medical consultation."
                  : severityTrend === "decreasing"
                    ? "Symptoms are improving. Continue current management."
                    : "Symptoms remain stable. Monitor for any changes."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
