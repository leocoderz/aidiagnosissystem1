"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Watch, Heart, Thermometer, Activity, Smartphone, Bluetooth, Battery, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WearableDevice {
  id: string
  name: string
  type: "smartwatch" | "fitness" | "ring" | "scale" | "sensor"
  connected: boolean
  battery: number
  lastSync: string
  status: "active" | "syncing" | "error" | "offline"
}

interface VitalSigns {
  heartRate: number
  heartRateVariability: number
  bloodPressure: { systolic: number; diastolic: number }
  oxygenSaturation: number
  temperature: number
  respiratoryRate: number
  steps: number
  calories: number
  activeMinutes: number
  sleepScore: number
  stressLevel: number
  timestamp: string
}

interface WearableIntegrationProps {
  onVitalAlert?: (alert: { type: string; message: string; severity: "low" | "medium" | "high" }) => void
  onEmergencyDetected?: () => void
}

export default function WearableIntegration({ onVitalAlert, onEmergencyDetected }: WearableIntegrationProps) {
  const [devices, setDevices] = useState<WearableDevice[]>([
    {
      id: "1",
      name: "Apple Watch Series 9",
      type: "smartwatch",
      connected: true,
      battery: 78,
      lastSync: new Date().toISOString(),
      status: "active",
    },
    {
      id: "2",
      name: "Fitbit Charge 5",
      type: "fitness",
      connected: false,
      battery: 0,
      lastSync: new Date(Date.now() - 86400000).toISOString(),
      status: "offline",
    },
    {
      id: "3",
      name: "Oura Ring Gen3",
      type: "ring",
      connected: true,
      battery: 45,
      lastSync: new Date().toISOString(),
      status: "active",
    },
  ])

  const [vitals, setVitals] = useState<VitalSigns>({
    heartRate: 72, // Normal resting: 60-100 BPM
    heartRateVariability: 42, // Normal: 20-50ms
    bloodPressure: { systolic: 118, diastolic: 78 }, // Normal: <120/<80
    oxygenSaturation: 98, // Normal: 95-100%
    temperature: 98.4, // Normal: 97.8-99.1°F
    respiratoryRate: 16, // Normal: 12-20 breaths/min
    steps: 7842, // Daily goal: 8000-10000
    calories: 1654, // Based on activity
    activeMinutes: 32, // WHO recommends 150min/week
    sleepScore: 78, // Good: 70-84, Excellent: 85+
    stressLevel: 4.2, // Scale 1-10, <5 is good
    timestamp: new Date().toISOString(),
  })

  const [settings, setSettings] = useState({
    autoSync: true,
    realTimeMonitoring: true,
    emergencyAlerts: true,
    dataSharing: false,
    heartRateAlerts: true,
    temperatureAlerts: true,
  })

  const { toast } = useToast()

  // Simulate real-time vital signs monitoring with realistic medical ranges
  useEffect(() => {
    if (!settings.realTimeMonitoring) return

    const interval = setInterval(() => {
      setVitals((prev) => {
        const newVitals = {
          ...prev,
          // Heart rate: Normal resting 60-100, can vary ±5 BPM normally
          heartRate: Math.max(55, Math.min(105, prev.heartRate + Math.floor(Math.random() * 6 - 3))),

          // HRV: Normal 20-50ms, varies ±3ms
          heartRateVariability: Math.max(20, Math.min(50, prev.heartRateVariability + (Math.random() * 6 - 3))),

          // Blood pressure: Normal <120/<80, can vary ±5 mmHg
          bloodPressure: {
            systolic: Math.max(90, Math.min(140, prev.bloodPressure.systolic + Math.floor(Math.random() * 6 - 3))),
            diastolic: Math.max(60, Math.min(90, prev.bloodPressure.diastolic + Math.floor(Math.random() * 4 - 2))),
          },

          // SpO2: Normal 95-100%, rarely varies more than 1%
          oxygenSaturation: Math.max(94, Math.min(100, prev.oxygenSaturation + (Math.random() * 2 - 1))),

          // Temperature: Normal 97.8-99.1°F, varies ±0.3°F
          temperature: Math.max(97.5, Math.min(99.5, prev.temperature + (Math.random() * 0.6 - 0.3))),

          // Respiratory rate: Normal 12-20, varies ±1
          respiratoryRate: Math.max(12, Math.min(20, prev.respiratoryRate + Math.floor(Math.random() * 3 - 1))),

          // Steps: Incremental throughout day
          steps: prev.steps + Math.floor(Math.random() * 15),

          // Calories: Based on activity, incremental
          calories: prev.calories + Math.floor(Math.random() * 3),

          // Active minutes: Incremental
          activeMinutes: prev.activeMinutes + (Math.random() > 0.9 ? 1 : 0),

          // Stress: 1-10 scale, varies ±0.5
          stressLevel: Math.max(1, Math.min(10, prev.stressLevel + (Math.random() * 1 - 0.5))),

          timestamp: new Date().toISOString(),
        }

        // Check for medically significant vital sign alerts
        checkVitalAlerts(newVitals)

        return newVitals
      })
    }, 8000) // Update every 8 seconds for realistic monitoring

    return () => clearInterval(interval)
  }, [settings.realTimeMonitoring])

  const checkVitalAlerts = (vitals: VitalSigns) => {
    // Heart rate alerts - medically significant thresholds
    if (settings.heartRateAlerts) {
      if (vitals.heartRate > 100) {
        // Tachycardia
        onVitalAlert?.({
          type: "tachycardia",
          message: `Elevated heart rate: ${vitals.heartRate} BPM (Normal: 60-100)`,
          severity: vitals.heartRate > 120 ? "high" : "medium",
        })
      } else if (vitals.heartRate < 60) {
        // Bradycardia
        onVitalAlert?.({
          type: "bradycardia",
          message: `Low heart rate: ${vitals.heartRate} BPM (Normal: 60-100)`,
          severity: vitals.heartRate < 50 ? "high" : "medium",
        })
      }
    }

    // Blood pressure alerts
    if (vitals.bloodPressure.systolic > 130 || vitals.bloodPressure.diastolic > 80) {
      onVitalAlert?.({
        type: "hypertension",
        message: `Elevated blood pressure: ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg`,
        severity: vitals.bloodPressure.systolic > 140 ? "high" : "medium",
      })
    }

    // Temperature alerts - fever thresholds
    if (settings.temperatureAlerts && vitals.temperature > 100.4) {
      // Medical fever threshold
      onVitalAlert?.({
        type: "fever",
        message: `Fever detected: ${vitals.temperature.toFixed(1)}°F (Normal: <100.4°F)`,
        severity: vitals.temperature > 102 ? "high" : "medium",
      })
    }

    // Oxygen saturation - critical medical threshold
    if (vitals.oxygenSaturation < 95) {
      // Medical concern threshold
      onVitalAlert?.({
        type: "hypoxemia",
        message: `Low oxygen saturation: ${vitals.oxygenSaturation}% (Normal: ≥95%)`,
        severity: vitals.oxygenSaturation < 90 ? "high" : "medium",
      })
    }

    // Emergency conditions - medically critical
    if (
      vitals.heartRate > 150 ||
      vitals.heartRate < 40 ||
      vitals.oxygenSaturation < 88 ||
      vitals.temperature > 103.5 ||
      vitals.bloodPressure.systolic > 180
    ) {
      onEmergencyDetected?.()
    }
  }

  const connectDevice = async (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId)
    if (!device) return

    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId ? { ...d, connected: true, status: "syncing", battery: Math.floor(Math.random() * 100) } : d,
      ),
    )

    // Simulate connection process
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, status: "active", lastSync: new Date().toISOString() } : d)),
      )

      toast({
        title: "Device Connected",
        description: `${device.name} is now connected and syncing`,
      })
    }, 2000)
  }

  const disconnectDevice = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId)
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, connected: false, status: "offline", battery: 0 } : d)),
    )

    toast({
      title: "Device Disconnected",
      description: `${device?.name} has been disconnected`,
    })
  }

  const syncAllDevices = async () => {
    const connectedDevices = devices.filter((d) => d.connected)

    if (connectedDevices.length === 0) {
      toast({
        title: "No Devices",
        description: "No connected devices to sync",
        variant: "destructive",
      })
      return
    }

    // Set all connected devices to syncing
    setDevices((prev) => prev.map((d) => (d.connected ? { ...d, status: "syncing" } : d)))

    // Simulate sync process
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) => (d.connected ? { ...d, status: "active", lastSync: new Date().toISOString() } : d)),
      )

      toast({
        title: "Sync Complete",
        description: `Synced data from ${connectedDevices.length} device${connectedDevices.length !== 1 ? "s" : ""}`,
      })
    }, 3000)
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "smartwatch":
        return Watch
      case "fitness":
        return Activity
      case "ring":
        return Heart
      case "scale":
        return Activity
      case "sensor":
        return Thermometer
      default:
        return Smartphone
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500"
      case "syncing":
        return "text-blue-500"
      case "error":
        return "text-red-500"
      case "offline":
        return "text-gray-400"
      default:
        return "text-gray-400"
    }
  }

  const getVitalStatus = (vital: string, value: number | { systolic: number; diastolic: number }) => {
    switch (vital) {
      case "heartRate":
        const hr = value as number
        if (hr < 60 || hr > 100) return { status: "abnormal", color: "text-red-600" }
        if (hr < 65 || hr > 95) return { status: "borderline", color: "text-yellow-600" }
        return { status: "normal", color: "text-green-600" }

      case "bloodPressure":
        const bp = value as { systolic: number; diastolic: number }
        if (bp.systolic > 130 || bp.diastolic > 80) return { status: "elevated", color: "text-red-600" }
        if (bp.systolic > 120 || bp.diastolic > 75) return { status: "borderline", color: "text-yellow-600" }
        return { status: "optimal", color: "text-green-600" }

      case "oxygenSaturation":
        const spo2 = value as number
        if (spo2 < 95) return { status: "low", color: "text-red-600" }
        if (spo2 < 97) return { status: "borderline", color: "text-yellow-600" }
        return { status: "normal", color: "text-green-600" }

      case "temperature":
        const temp = value as number
        if (temp > 100.4) return { status: "fever", color: "text-red-600" }
        if (temp > 99.5 || temp < 97.8) return { status: "borderline", color: "text-yellow-600" }
        return { status: "normal", color: "text-green-600" }

      case "stressLevel":
        const stress = value as number
        if (stress > 7) return { status: "high", color: "text-red-600" }
        if (stress > 5) return { status: "moderate", color: "text-yellow-600" }
        return { status: "low", color: "text-green-600" }

      default:
        return { status: "normal", color: "text-green-600" }
    }
  }

  return (
    <div className="space-y-4">
      {/* Device Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Bluetooth className="mr-2 h-5 w-5 text-blue-600" />
            Connected Devices
          </CardTitle>
          <CardDescription>Manage your wearable devices and health sensors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {devices.map((device) => {
            const DeviceIcon = getDeviceIcon(device.type)
            const statusColor = getStatusColor(device.status)

            return (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <DeviceIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    {device.connected && device.status === "active" && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full connection-pulse" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{device.name}</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className={statusColor}>
                        {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                      </span>
                      {device.connected && device.battery > 0 && (
                        <div className="flex items-center space-x-1">
                          <Battery className="h-3 w-3" />
                          <span>{device.battery}%</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Last sync: {new Date(device.lastSync).toLocaleString()}</p>
                  </div>
                </div>
                <Button
                  variant={device.connected ? "outline" : "default"}
                  size="sm"
                  onClick={() => (device.connected ? disconnectDevice(device.id) : connectDevice(device.id))}
                  disabled={device.status === "syncing"}
                >
                  {device.status === "syncing" ? "Syncing..." : device.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            )
          })}

          <Button onClick={syncAllDevices} className="w-full" disabled={!devices.some((d) => d.connected)}>
            <Zap className="mr-2 h-4 w-4" />
            Sync All Devices
          </Button>
        </CardContent>
      </Card>

      {/* Real-time Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Activity className="mr-2 h-5 w-5 text-green-600" />
            Real-time Vital Signs
          </CardTitle>
          <CardDescription>Live health metrics from your wearable devices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Heart Rate */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Heart className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm font-medium">Heart Rate</span>
                </div>
                <Badge
                  variant={
                    getVitalStatus("heartRate", vitals.heartRate).status === "abnormal"
                      ? "destructive"
                      : getVitalStatus("heartRate", vitals.heartRate).status === "borderline"
                        ? "secondary"
                        : "default"
                  }
                >
                  {getVitalStatus("heartRate", vitals.heartRate).status}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{vitals.heartRate} BPM</div>
              <Progress value={(vitals.heartRate / 150) * 100} className="mt-2 h-2" />
            </div>

            {/* Oxygen Saturation */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm font-medium">SpO2</span>
                </div>
                <Badge
                  variant={
                    getVitalStatus("oxygenSaturation", vitals.oxygenSaturation).status === "low"
                      ? "destructive"
                      : getVitalStatus("oxygenSaturation", vitals.oxygenSaturation).status === "borderline"
                        ? "secondary"
                        : "default"
                  }
                >
                  {getVitalStatus("oxygenSaturation", vitals.oxygenSaturation).status}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{vitals.oxygenSaturation}%</div>
              <Progress value={vitals.oxygenSaturation} className="mt-2 h-2" />
            </div>

            {/* Temperature */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Thermometer className="h-4 w-4 text-orange-500 mr-2" />
                  <span className="text-sm font-medium">Temperature</span>
                </div>
                <Badge
                  variant={
                    getVitalStatus("temperature", vitals.temperature).status === "fever"
                      ? "destructive"
                      : getVitalStatus("temperature", vitals.temperature).status === "borderline"
                        ? "secondary"
                        : "default"
                  }
                >
                  {getVitalStatus("temperature", vitals.temperature).status}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{vitals.temperature.toFixed(1)}°F</div>
              <Progress value={((vitals.temperature - 96) / 6) * 100} className="mt-2 h-2" />
            </div>

            {/* Stress Level */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-purple-500 mr-2" />
                  <span className="text-sm font-medium">Stress Level</span>
                </div>
                <Badge
                  variant={
                    getVitalStatus("stressLevel", vitals.stressLevel).status === "high"
                      ? "destructive"
                      : getVitalStatus("stressLevel", vitals.stressLevel).status === "moderate"
                        ? "secondary"
                        : "default"
                  }
                >
                  {getVitalStatus("stressLevel", vitals.stressLevel).status}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{vitals.stressLevel.toFixed(1)}/10</div>
              <Progress value={vitals.stressLevel * 10} className="mt-2 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monitoring Settings</CardTitle>
          <CardDescription>Configure your wearable device monitoring preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="realtime" className="text-base font-medium">
                Real-time Monitoring
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-300">Continuously monitor vital signs</p>
            </div>
            <Switch
              id="realtime"
              checked={settings.realTimeMonitoring}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, realTimeMonitoring: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="heart-alerts" className="text-base font-medium">
                Heart Rate Alerts
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-300">Get notified of abnormal heart rates</p>
            </div>
            <Switch
              id="heart-alerts"
              checked={settings.heartRateAlerts}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, heartRateAlerts: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="temp-alerts" className="text-base font-medium">
                Temperature Alerts
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-300">Get notified of fever detection</p>
            </div>
            <Switch
              id="temp-alerts"
              checked={settings.temperatureAlerts}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, temperatureAlerts: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emergency" className="text-base font-medium">
                Emergency Alerts
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-300">Automatic emergency detection</p>
            </div>
            <Switch
              id="emergency"
              checked={settings.emergencyAlerts}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emergencyAlerts: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Health Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Health Insights</CardTitle>
          <CardDescription>Personalized insights based on your wearable data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Heart Rate Analysis</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your resting heart rate of {vitals.heartRate} BPM is{" "}
              {vitals.heartRate < 60 ? "below" : vitals.heartRate > 100 ? "above" : "within"} normal range.
            </p>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Activity Level</h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              You've taken {vitals.steps.toLocaleString()} steps today.{" "}
              {vitals.steps > 8000 ? "Great job staying active!" : "Try to reach 10,000 steps for optimal health."}
            </p>
          </div>

          {vitals.stressLevel > 6 && (
            <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-1">Stress Management</h4>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Your stress levels are elevated. Consider practicing relaxation techniques or taking breaks.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
