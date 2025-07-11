"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  MapPin,
  Clock,
  Shield,
  Plus,
  X,
  PhoneCall,
  Siren,
  Heart,
  Activity,
  Thermometer,
  Users,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmergencyContact {
  id: string
  name: string
  phone: string
  relation: string
  priority: "primary" | "secondary" | "emergency"
}

interface EmergencyAlert {
  id: string
  timestamp: string
  type: "critical" | "warning" | "resolved"
  trigger: string
  message: string
  resolved: boolean
  responseTime?: string
}

interface EmergencyAlertProps {
  emergencyStatus: "normal" | "warning" | "critical"
  onStatusChange: (status: "normal" | "warning" | "critical") => void
  currentSymptoms: string[]
  vitalSigns?: {
    heartRate: number
    temperature: number
    oxygenSaturation: number
    stressLevel: number
  }
}

export default function EmergencyAlert({
  emergencyStatus,
  onStatusChange,
  currentSymptoms,
  vitalSigns,
}: EmergencyAlertProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      phone: "(555) 123-4567",
      relation: "Primary Care Physician",
      priority: "primary",
    },
    { id: "2", name: "John Smith", phone: "(555) 987-6543", relation: "Emergency Contact", priority: "secondary" },
    { id: "3", name: "Emergency Services", phone: "911", relation: "Emergency", priority: "emergency" },
    { id: "4", name: "Mary Johnson", phone: "(555) 456-7890", relation: "Family Member", priority: "secondary" },
  ])

  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    relation: "",
    priority: "secondary" as const,
  })

  const [alertHistory, setAlertHistory] = useState<EmergencyAlert[]>([
    {
      id: "1",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: "warning",
      trigger: "High Heart Rate",
      message: "Heart rate exceeded 140 BPM for 5 minutes",
      resolved: true,
      responseTime: "2 minutes",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: "critical",
      trigger: "Severe Symptoms",
      message: "Multiple severe symptoms reported - chest pain, difficulty breathing",
      resolved: true,
      responseTime: "30 seconds",
    },
  ])

  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null)
  const [locationError, setLocationError] = useState("")
  const [isEmergencyActive, setIsEmergencyActive] = useState(false)
  const [emergencyCountdown, setEmergencyCountdown] = useState(0)

  const { toast } = useToast()

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          // Try to get address (mock implementation)
          try {
            const address = await getAddressFromCoordinates(location.lat, location.lng)
            setCurrentLocation({ ...location, address })
          } catch {
            setCurrentLocation(location)
          }
        },
        (error) => {
          setLocationError("Location access denied. Enable location services for emergency features.")
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
      )
    }
  }, [])

  // Monitor vital signs for emergency conditions
  useEffect(() => {
    if (!vitalSigns) return

    const checkEmergencyConditions = () => {
      const emergencyConditions = []

      if (vitalSigns.heartRate > 150 || vitalSigns.heartRate < 40) {
        emergencyConditions.push("Critical heart rate detected")
      }
      if (vitalSigns.temperature > 103) {
        emergencyConditions.push("Dangerous fever detected")
      }
      if (vitalSigns.oxygenSaturation < 90) {
        emergencyConditions.push("Critical oxygen levels detected")
      }

      if (emergencyConditions.length > 0 && emergencyStatus !== "critical") {
        triggerAutomaticEmergency(emergencyConditions.join(", "))
      }
    }

    checkEmergencyConditions()
  }, [vitalSigns])

  // Emergency countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (emergencyCountdown > 0) {
      interval = setInterval(() => {
        setEmergencyCountdown((prev) => {
          if (prev <= 1) {
            // Auto-trigger emergency services
            callEmergencyServices()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [emergencyCountdown])

  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    // Mock address lookup - in real app, use geocoding service
    return `${Math.floor(Math.random() * 9999)} Main St, City, State 12345`
  }

  const addEmergencyContact = () => {
    if (newContact.name && newContact.phone) {
      setContacts((prev) => [
        ...prev,
        {
          ...newContact,
          id: Date.now().toString(),
        },
      ])
      setNewContact({ name: "", phone: "", relation: "", priority: "secondary" })

      toast({
        title: "Contact Added",
        description: `${newContact.name} has been added to your emergency contacts`,
      })
    }
  }

  const removeContact = (id: string) => {
    const contact = contacts.find((c) => c.id === id)
    if (contact?.priority === "emergency") {
      toast({
        title: "Cannot Remove",
        description: "Emergency services contact cannot be removed",
        variant: "destructive",
      })
      return
    }

    setContacts((prev) => prev.filter((c) => c.id !== id))
    toast({
      title: "Contact Removed",
      description: "Emergency contact has been removed",
    })
  }

  const triggerEmergencyAlert = async (severity: "warning" | "critical", trigger?: string) => {
    const alertMessage =
      severity === "critical"
        ? "CRITICAL: Immediate medical attention required"
        : "WARNING: Concerning health symptoms detected"

    const newAlert: EmergencyAlert = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: severity,
      trigger: trigger || (severity === "critical" ? "Manual Emergency" : "Manual Warning"),
      message: alertMessage,
      resolved: false,
    }

    setAlertHistory((prev) => [newAlert, ...prev])
    onStatusChange(severity)

    if (severity === "critical") {
      setIsEmergencyActive(true)
      setEmergencyCountdown(30) // 30 second countdown

      // Send alerts to emergency contacts
      await sendEmergencyAlerts(newAlert)
    }

    toast({
      title: severity === "critical" ? "🚨 Emergency Alert Activated" : "⚠️ Warning Alert Sent",
      description: alertMessage,
      variant: severity === "critical" ? "destructive" : "default",
    })
  }

  const triggerAutomaticEmergency = async (trigger: string) => {
    await triggerEmergencyAlert("critical", trigger)
  }

  const sendEmergencyAlerts = async (alert: EmergencyAlert) => {
    const primaryContacts = contacts.filter((c) => c.priority === "primary" || c.priority === "emergency")

    // Simulate sending alerts
    for (const contact of primaryContacts) {
      if (contact.phone !== "911") {
        // In real app, send SMS/call
        console.log(`Sending emergency alert to ${contact.name} at ${contact.phone}`)
      }
    }

    toast({
      title: "Emergency Alerts Sent",
      description: `Notified ${primaryContacts.length} emergency contacts`,
    })
  }

  const callEmergencyServices = () => {
    setEmergencyCountdown(0)
    setIsEmergencyActive(false)

    // In real app, this would integrate with device calling
    if (confirm("This would normally call 911. Continue with simulation?")) {
      toast({
        title: "Emergency Services Contacted",
        description: "Emergency services have been notified of your location and condition",
      })

      // Add to alert history
      const responseAlert: EmergencyAlert = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: "critical",
        trigger: "Emergency Services Called",
        message: "911 contacted - emergency response dispatched",
        resolved: false,
        responseTime: "Immediate",
      }

      setAlertHistory((prev) => [responseAlert, ...prev])
    }
  }

  const cancelEmergency = () => {
    setEmergencyCountdown(0)
    setIsEmergencyActive(false)
    onStatusChange("normal")

    toast({
      title: "Emergency Cancelled",
      description: "Emergency alert has been cancelled",
    })
  }

  const resolveAlert = (alertId: string) => {
    setAlertHistory((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, resolved: true, responseTime: "Manual resolution" } : alert,
      ),
    )

    // If resolving the latest critical alert, update status
    const latestAlert = alertHistory.find((alert) => alert.id === alertId)
    if (latestAlert && !latestAlert.resolved && latestAlert.type === "critical") {
      onStatusChange("normal")
    }

    toast({
      title: "Alert Resolved",
      description: "Emergency alert has been marked as resolved",
    })
  }

  const callContact = (phone: string, name: string) => {
    if (phone === "911") {
      if (confirm("This will call emergency services. Continue?")) {
        callEmergencyServices()
      }
    } else {
      // In real app, integrate with device calling
      window.open(`tel:${phone}`)
      toast({
        title: "Calling Contact",
        description: `Calling ${name} at ${phone}`,
      })
    }
  }

  const getRiskLevel = () => {
    if (!vitalSigns) return { level: "Unknown", color: "text-gray-500", bg: "bg-gray-100" }

    let riskScore = 0

    // Heart rate risk
    if (vitalSigns.heartRate > 120 || vitalSigns.heartRate < 50) riskScore += 2
    else if (vitalSigns.heartRate > 100 || vitalSigns.heartRate < 60) riskScore += 1

    // Temperature risk
    if (vitalSigns.temperature > 102) riskScore += 3
    else if (vitalSigns.temperature > 100.4) riskScore += 1

    // Oxygen risk
    if (vitalSigns.oxygenSaturation < 90) riskScore += 3
    else if (vitalSigns.oxygenSaturation < 95) riskScore += 1

    // Stress risk
    if (vitalSigns.stressLevel > 8) riskScore += 1

    // Symptom risk
    riskScore += Math.min(currentSymptoms.length, 3)

    if (riskScore >= 6) return { level: "Critical", color: "text-red-600", bg: "bg-red-100" }
    if (riskScore >= 3) return { level: "High", color: "text-orange-600", bg: "bg-orange-100" }
    if (riskScore >= 1) return { level: "Moderate", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { level: "Low", color: "text-green-600", bg: "bg-green-100" }
  }

  const riskLevel = getRiskLevel()

  return (
    <div className="space-y-4">
      {/* Emergency Countdown */}
      {isEmergencyActive && emergencyCountdown > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950 emergency-pulse">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Siren className="h-12 w-12 text-red-600 mx-auto" />
              <div>
                <h3 className="text-xl font-bold text-red-900 dark:text-red-100">EMERGENCY ALERT ACTIVE</h3>
                <p className="text-red-800 dark:text-red-200">
                  Calling emergency services in {emergencyCountdown} seconds
                </p>
              </div>
              <div className="flex space-x-4 justify-center">
                <Button variant="destructive" onClick={callEmergencyServices}>
                  Call Now
                </Button>
                <Button variant="outline" onClick={cancelEmergency}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Status & Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Shield
              className={`mr-2 h-5 w-5 ${
                emergencyStatus === "critical"
                  ? "text-red-600"
                  : emergencyStatus === "warning"
                    ? "text-yellow-600"
                    : "text-green-600"
              }`}
            />
            Emergency Status & Risk Assessment
          </CardTitle>
          <CardDescription>Current health alert level and risk categorization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Badge
                variant={
                  emergencyStatus === "critical"
                    ? "destructive"
                    : emergencyStatus === "warning"
                      ? "secondary"
                      : "default"
                }
                className="text-lg px-4 py-2 mb-2"
              >
                {emergencyStatus.toUpperCase()}
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-300">Alert Status</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Badge className={`${riskLevel.bg} ${riskLevel.color} border-0 text-lg px-4 py-2 mb-2`}>
                {riskLevel.level.toUpperCase()}
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-300">Risk Level</p>
            </div>
          </div>

          {vitalSigns && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>{vitalSigns.heartRate} BPM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <span>{vitalSigns.temperature.toFixed(1)}°F</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span>{vitalSigns.oxygenSaturation}% SpO2</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-purple-500" />
                <span>Stress: {vitalSigns.stressLevel.toFixed(1)}/10</span>
              </div>
            </div>
          )}

          {emergencyStatus !== "normal" && (
            <Alert
              className={`${
                emergencyStatus === "critical"
                  ? "border-red-500 bg-red-50 dark:bg-red-950"
                  : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Active Health Alert</AlertTitle>
              <AlertDescription>
                {emergencyStatus === "critical"
                  ? "Critical condition detected. Emergency protocols activated."
                  : "Warning condition detected. Monitor symptoms closely."}
                {currentSymptoms.length > 0 && (
                  <div className="mt-2">
                    <strong>Current symptoms:</strong> {currentSymptoms.slice(0, 3).join(", ")}
                    {currentSymptoms.length > 3 && ` and ${currentSymptoms.length - 3} more`}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => triggerEmergencyAlert("warning")}
              className="border-yellow-500 text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-950"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Send Warning Alert
            </Button>
            <Button variant="destructive" onClick={() => triggerEmergencyAlert("critical")}>
              <Siren className="mr-2 h-4 w-4" />
              Emergency Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Users className="mr-2 h-5 w-5 text-blue-600" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>Manage your emergency contact list for critical situations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium">{contact.name}</h4>
                  <Badge
                    variant={
                      contact.priority === "emergency"
                        ? "destructive"
                        : contact.priority === "primary"
                          ? "default"
                          : "outline"
                    }
                    className="text-xs"
                  >
                    {contact.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{contact.phone}</p>
                <p className="text-xs text-gray-500">{contact.relation}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => callContact(contact.phone, contact.name)}>
                  <PhoneCall className="h-4 w-4" />
                </Button>
                {contact.priority !== "emergency" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContact(contact.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Add New Contact */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium">Add Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Contact name"
                value={newContact.name}
                onChange={(e) => setNewContact((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Phone number"
                value={newContact.phone}
                onChange={(e) => setNewContact((prev) => ({ ...prev, phone: e.target.value }))}
              />
              <Input
                placeholder="Relationship"
                value={newContact.relation}
                onChange={(e) => setNewContact((prev) => ({ ...prev, relation: e.target.value }))}
              />
              <Select
                value={newContact.priority}
                onValueChange={(value: "primary" | "secondary") =>
                  setNewContact((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary Contact</SelectItem>
                  <SelectItem value="secondary">Secondary Contact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addEmergencyContact} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Location Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MapPin className="mr-2 h-5 w-5 text-green-600" />
            Location Services
          </CardTitle>
          <CardDescription>Location information for emergency response</CardDescription>
        </CardHeader>
        <CardContent>
          {locationError ? (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Location Access Required</AlertTitle>
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
          ) : currentLocation ? (
            <div className="space-y-3">
              <div className="flex items-center text-green-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Location services enabled</span>
              </div>
              {currentLocation.address && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Address:</strong> {currentLocation.address}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Coordinates:</strong> {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
              <p className="text-xs text-gray-500">
                Location will be shared with emergency contacts during critical alerts
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300">Requesting location access...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Clock className="mr-2 h-5 w-5 text-purple-600" />
            Alert History
          </CardTitle>
          <CardDescription>Recent emergency alerts and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {alertHistory.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No emergency alerts in history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alertHistory.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <AlertTriangle
                        className={`h-4 w-4 mt-1 ${alert.type === "critical" ? "text-red-500" : "text-yellow-500"}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{alert.trigger}</h4>
                          <Badge
                            variant={
                              alert.resolved ? "default" : alert.type === "critical" ? "destructive" : "secondary"
                            }
                            className="text-xs"
                          >
                            {alert.resolved ? "Resolved" : alert.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          {alert.responseTime && <span>Response: {alert.responseTime}</span>}
                        </div>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button variant="outline" size="sm" onClick={() => resolveAlert(alert.id)}>
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
