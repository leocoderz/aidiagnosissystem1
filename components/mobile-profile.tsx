"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Bell, Download, LogOut, Heart, Activity, Brain, Settings } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"

interface MobileProfileProps {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  }
  onLogout: () => void
  healthScore: number
}

export default function MobileProfile({ user, onLogout, healthScore }: MobileProfileProps) {
  const getHealthStatus = () => {
    if (healthScore >= 80) return { status: "Excellent", color: "text-green-600", bg: "bg-green-100" }
    if (healthScore >= 60) return { status: "Good", color: "text-blue-600", bg: "bg-blue-100" }
    if (healthScore >= 40) return { status: "Fair", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { status: "Poor", color: "text-red-600", bg: "bg-red-100" }
  }

  const healthStatus = getHealthStatus()

  const handleExportData = () => {
    const symptoms = JSON.parse(localStorage.getItem("mediai_symptoms") || "[]")
    const diagnoses = JSON.parse(localStorage.getItem("mediai_diagnoses") || "[]")

    const exportData = {
      user: {
        name: user.name,
        email: user.email,
      },
      healthScore,
      symptoms,
      diagnoses,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mediai-health-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-lg">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={`${healthStatus.bg} ${healthStatus.color} border-0`}>{healthStatus.status}</Badge>
                <span className="text-sm text-gray-500">Health Score: {healthScore}/100</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Health Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit mx-auto">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-lg font-semibold">
                {JSON.parse(localStorage.getItem("mediai_symptoms") || "[]").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Symptoms</div>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full w-fit mx-auto">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-lg font-semibold">
                {JSON.parse(localStorage.getItem("mediai_diagnoses") || "[]").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Diagnoses</div>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit mx-auto">
                <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-lg font-semibold">{healthScore}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Health Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5 text-gray-600" />
              <span>Theme</span>
            </div>
            <ThemeToggle />
          </div>

          <Separator />

          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Health Data
          </Button>

          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Bell className="h-4 w-4 mr-2" />
            Notification Settings
          </Button>

          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Shield className="h-4 w-4 mr-2" />
            Privacy & Security
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardContent className="pt-6">
          <Button variant="destructive" className="w-full" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">MediAI</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Version 1.0.0</p>
            <p className="text-xs text-gray-500">AI-powered health diagnosis and tracking</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
