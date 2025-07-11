"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Stethoscope, Smartphone, User, Activity, Brain } from "lucide-react"
import LoginScreen from "@/components/login-screen"
import MobileApp from "@/components/mobile-app"
import DoctorDashboard from "@/components/doctor-dashboard"
import { useToast } from "@/hooks/use-toast"

interface SympCareUser {
  id: string
  email: string
  name: string
  avatar?: string
  type: "patient" | "doctor"
  age?: number
  gender?: "male" | "female" | "other"
  phone?: string
  address?: string
  emergencyContact?: string
  medicalHistory?: string[]
  specialization?: string
  licenseNumber?: string
  hospital?: string
}

export default function EnhancedHome() {
  const [user, setUser] = useState<SympCareUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem("sympcare24_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("sympcare24_user")
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (userData: SympCareUser) => {
    setUser(userData)
    localStorage.setItem("sympcare24_user", JSON.stringify(userData))
    setShowLogin(false)
    toast({
      title: "Welcome to SympCare24!",
      description: `Successfully logged in as ${userData.name}`,
    })
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("sympcare24_user")
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out of SympCare24",
    })
  }

  const handleDemoLogin = (type: "patient" | "doctor") => {
    const demoUser: SympCareUser =
      type === "patient"
        ? {
            id: "demo-patient-001",
            email: "patient@sympcare24.com",
            name: "Alex Johnson",
            type: "patient",
            age: 32,
            gender: "other",
            phone: "(555) 123-4567",
            address: "123 Health St, Wellness City, WC 12345",
            emergencyContact: "Emergency Contact: (555) 987-6543",
            medicalHistory: ["No significant medical history"],
          }
        : {
            id: "demo-doctor-001",
            email: "doctor@sympcare24.com",
            name: "Dr. Sarah Mitchell",
            type: "doctor",
            specialization: "Internal Medicine",
            licenseNumber: "MD-2024-001",
            hospital: "SympCare24 Medical Center",
            phone: "(555) 234-5678",
          }

    handleLogin(demoUser)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Loading SympCare24...</h2>
        </div>
      </div>
    )
  }

  if (user) {
    return user.type === "patient" ? (
      <MobileApp user={user} onLogout={handleLogout} />
    ) : (
      <DoctorDashboard user={user} onLogout={handleLogout} />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">SympCare24</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered healthcare platform for patients and medical professionals
          </p>

          <div className="flex items-center justify-center space-x-2 mb-8">
            <Badge variant="secondary">
              <Brain className="h-4 w-4 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="secondary">
              <Activity className="h-4 w-4 mr-1" />
              Real-time Monitoring
            </Badge>
          </div>
        </div>

        {/* Demo Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Patient Demo */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Patient App</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Experience the patient mobile application with AI symptom analysis, health monitoring, and wearable
                device integration.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• AI symptom diagnosis</li>
                <li>• Real-time vital signs</li>
                <li>• Wearable integration</li>
                <li>• Health timeline</li>
                <li>• Emergency alerts</li>
              </ul>
              <Button className="w-full" onClick={() => handleDemoLogin("patient")}>
                <User className="mr-2 h-4 w-4" />
                Try Patient Demo
              </Button>
            </CardContent>
          </Card>

          {/* Doctor Demo */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Doctor Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Access the professional dashboard for patient management, AI diagnosis review, and medical report
                generation.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Patient management</li>
                <li>• AI diagnosis review</li>
                <li>• PDF medical reports</li>
                <li>• Urgent case alerts</li>
                <li>• Communication tools</li>
              </ul>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => handleDemoLogin("doctor")}>
                <Stethoscope className="mr-2 h-4 w-4" />
                Try Doctor Demo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Login Option */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Have an existing account?</p>
          <Button variant="ghost" onClick={() => setShowLogin(true)}>
            Sign In
          </Button>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Sign In</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowLogin(false)}>
                ×
              </Button>
            </div>
            <LoginScreen onLogin={handleLogin} />
          </div>
        </div>
      )}
    </div>
  )
}
