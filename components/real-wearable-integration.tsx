"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Watch, Heart, Activity, Smartphone, Bluetooth, Battery, Zap, AlertTriangle, Wifi } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RealWearableDevice {
  id: string
  name: string
  type: "bluetooth" | "web" | "native"
  device?: BluetoothDevice
  connected: boolean
  battery?: number
  services: string[]
  characteristics: Map<string, BluetoothRemoteGATTCharacteristic>
  lastSync: string
  status: "active" | "syncing" | "error" | "offline" | "connecting"
}

interface VitalSigns {
  heartRate: number
  steps: number
  calories: number
  distance: number
  activeMinutes: number
  timestamp: string
}

interface RealWearableIntegrationProps {
  onVitalUpdate?: (vitals: VitalSigns) => void
  onDeviceAlert?: (alert: { type: string; message: string; severity: "low" | "medium" | "high" }) => void
}

export default function RealWearableIntegration({ onVitalUpdate, onDeviceAlert }: RealWearableIntegrationProps) {
  const [devices, setDevices] = useState<RealWearableDevice[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [vitals, setVitals] = useState<VitalSigns>({
    heartRate: 0,
    steps: 0,
    calories: 0,
    distance: 0,
    activeMinutes: 0,
    timestamp: new Date().toISOString(),
  })
  const [settings, setSettings] = useState({
    autoConnect: true,
    realTimeSync: true,
    healthKitSync: false,
    googleFitSync: false,
    notifications: true,
  })
  const { toast } = useToast()

  // Check for Web Bluetooth support
  const isBluetoothSupported = useCallback(() => {
    return typeof navigator !== "undefined" && "bluetooth" in navigator
  }, [])

  // Check for device motion/orientation support
  const isDeviceMotionSupported = useCallback(() => {
    return typeof window !== "undefined" && "DeviceMotionEvent" in window
  }, [])

  // Scan for Bluetooth devices
  const scanForBluetoothDevices = async () => {
    if (!isBluetoothSupported()) {
      toast({
        title: "Bluetooth Not Supported",
        description: "Your browser doesn't support Web Bluetooth API",
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)

    try {
      // Request Bluetooth device with health-related services
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ["heart_rate"] },
          { services: ["battery_service"] },
          { services: ["device_information"] },
          { namePrefix: "Fitbit" },
          { namePrefix: "Apple Watch" },
          { namePrefix: "Samsung" },
          { namePrefix: "Garmin" },
          { namePrefix: "Polar" },
          { namePrefix: "Xiaomi" },
          { namePrefix: "Huawei" },
        ],
        optionalServices: [
          "heart_rate",
          "battery_service",
          "device_information",
          "fitness_machine",
          "cycling_power",
          "running_speed_and_cadence",
        ],
      })

      if (device) {
        await connectBluetoothDevice(device)
      }
    } catch (error) {
      console.error("Bluetooth scan error:", error)
      toast({
        title: "Bluetooth Scan Failed",
        description: "Could not scan for devices. Make sure Bluetooth is enabled.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  // Connect to Bluetooth device
  const connectBluetoothDevice = async (device: BluetoothDevice) => {
    try {
      const newDevice: RealWearableDevice = {
        id: device.id,
        name: device.name || "Unknown Device",
        type: "bluetooth",
        device,
        connected: false,
        services: [],
        characteristics: new Map(),
        lastSync: new Date().toISOString(),
        status: "connecting",
      }

      setDevices((prev) => [...prev.filter((d) => d.id !== device.id), newDevice])

      // Connect to GATT server
      const server = await device.gatt?.connect()
      if (!server) throw new Error("Could not connect to GATT server")

      // Get available services
      const services = await server.getPrimaryServices()
      const serviceUuids = services.map((s) => s.uuid)

      // Setup heart rate monitoring if available
      if (serviceUuids.includes("heart_rate")) {
        await setupHeartRateMonitoring(server, device.id)
      }

      // Setup battery monitoring if available
      if (serviceUuids.includes("battery_service")) {
        await setupBatteryMonitoring(server, device.id)
      }

      // Update device status
      setDevices((prev) =>
        prev.map((d) => (d.id === device.id ? { ...d, connected: true, status: "active", services: serviceUuids } : d)),
      )

      toast({
        title: "Device Connected",
        description: `Successfully connected to ${device.name}`,
      })
    } catch (error) {
      console.error("Device connection error:", error)
      setDevices((prev) => prev.map((d) => (d.id === device.id ? { ...d, status: "error" } : d)))

      toast({
        title: "Connection Failed",
        description: `Could not connect to ${device.name}`,
        variant: "destructive",
      })
    }
  }

  // Setup heart rate monitoring
  const setupHeartRateMonitoring = async (server: BluetoothRemoteGATTServer, deviceId: string) => {
    try {
      const service = await server.getPrimaryService("heart_rate")
      const characteristic = await service.getCharacteristic("heart_rate_measurement")

      // Start notifications
      await characteristic.startNotifications()

      characteristic.addEventListener("characteristicvaluechanged", (event) => {
        const value = event.target?.value
        if (value) {
          const heartRate = value.getUint16(1, true)

          setVitals((prev) => {
            const updated = { ...prev, heartRate, timestamp: new Date().toISOString() }
            onVitalUpdate?.(updated)
            return updated
          })

          // Check for abnormal heart rate
          if (heartRate > 100 || heartRate < 60) {
            onDeviceAlert?.({
              type: "heart_rate",
              message: `Heart rate: ${heartRate} BPM is outside normal range`,
              severity: heartRate > 120 || heartRate < 50 ? "high" : "medium",
            })
          }
        }
      })

      // Update device characteristics
      setDevices((prev) =>
        prev.map((d) => {
          if (d.id === deviceId) {
            d.characteristics.set("heart_rate", characteristic)
          }
          return d
        }),
      )
    } catch (error) {
      console.error("Heart rate setup error:", error)
    }
  }

  // Setup battery monitoring
  const setupBatteryMonitoring = async (server: BluetoothRemoteGATTServer, deviceId: string) => {
    try {
      const service = await server.getPrimaryService("battery_service")
      const characteristic = await service.getCharacteristic("battery_level")

      const value = await characteristic.readValue()
      const batteryLevel = value.getUint8(0)

      setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, battery: batteryLevel } : d)))
    } catch (error) {
      console.error("Battery setup error:", error)
    }
  }

  // Connect to phone's built-in sensors
  const connectPhoneSensors = async () => {
    if (!isDeviceMotionSupported()) {
      toast({
        title: "Sensors Not Supported",
        description: "Your device doesn't support motion sensors",
        variant: "destructive",
      })
      return
    }

    try {
      // Request permission for device motion (iOS 13+)
      if (typeof DeviceMotionEvent.requestPermission === "function") {
        const permission = await DeviceMotionEvent.requestPermission()
        if (permission !== "granted") {
          throw new Error("Motion permission denied")
        }
      }

      const phoneDevice: RealWearableDevice = {
        id: "phone-sensors",
        name: "Phone Sensors",
        type: "native",
        connected: true,
        services: ["accelerometer", "gyroscope", "step_counter"],
        characteristics: new Map(),
        lastSync: new Date().toISOString(),
        status: "active",
      }

      setDevices((prev) => [...prev.filter((d) => d.id !== "phone-sensors"), phoneDevice])

      // Setup step counting (simplified)
      let stepCount = 0
      let lastAcceleration = 0

      const handleDeviceMotion = (event: DeviceMotionEvent) => {
        if (event.accelerationIncludingGravity) {
          const { x, y, z } = event.accelerationIncludingGravity
          const acceleration = Math.sqrt(x * x + y * y + z * z)

          // Simple step detection algorithm
          if (acceleration > lastAcceleration + 2 && acceleration > 12) {
            stepCount++

            setVitals((prev) => {
              const updated = {
                ...prev,
                steps: stepCount,
                calories: Math.floor(stepCount * 0.04), // Rough estimate
                distance: stepCount * 0.0008, // Rough estimate in km
                timestamp: new Date().toISOString(),
              }
              onVitalUpdate?.(updated)
              return updated
            })
          }

          lastAcceleration = acceleration
        }
      }

      window.addEventListener("devicemotion", handleDeviceMotion)

      toast({
        title: "Phone Sensors Connected",
        description: "Now tracking steps and movement",
      })
    } catch (error) {
      console.error("Phone sensor error:", error)
      toast({
        title: "Sensor Connection Failed",
        description: "Could not access device sensors",
        variant: "destructive",
      })
    }
  }

  // Connect to Health APIs (Web API when available)
  const connectHealthAPIs = async () => {
    try {
      // Check for Web Health API (experimental)
      if ("health" in navigator) {
        // This is experimental and not widely supported yet
        toast({
          title: "Health API",
          description: "Web Health API detected but not fully supported yet",
        })
      }

      // For now, simulate health data integration
      const healthDevice: RealWearableDevice = {
        id: "health-apis",
        name: "Health Data Integration",
        type: "web",
        connected: true,
        services: ["health_records", "fitness_data"],
        characteristics: new Map(),
        lastSync: new Date().toISOString(),
        status: "active",
      }

      setDevices((prev) => [...prev.filter((d) => d.id !== "health-apis"), healthDevice])

      toast({
        title: "Health Integration Ready",
        description: "Ready to sync with health platforms",
      })
    } catch (error) {
      console.error("Health API error:", error)
    }
  }

  // Disconnect device
  const disconnectDevice = async (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId)
    if (!device) return

    try {
      if (device.device?.gatt?.connected) {
        device.device.gatt.disconnect()
      }

      setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, connected: false, status: "offline" } : d)))

      toast({
        title: "Device Disconnected",
        description: `${device.name} has been disconnected`,
      })
    } catch (error) {
      console.error("Disconnect error:", error)
    }
  }

  // Sync all connected devices
  const syncAllDevices = async () => {
    const connectedDevices = devices.filter((d) => d.connected)

    if (connectedDevices.length === 0) {
      toast({
        title: "No Connected Devices",
        description: "Connect devices first to sync data",
        variant: "destructive",
      })
      return
    }

    // Update sync status
    setDevices((prev) => prev.map((d) => (d.connected ? { ...d, status: "syncing" } : d)))

    try {
      // Simulate sync process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update last sync time
      setDevices((prev) =>
        prev.map((d) => (d.connected ? { ...d, status: "active", lastSync: new Date().toISOString() } : d)),
      )

      toast({
        title: "Sync Complete",
        description: `Synced data from ${connectedDevices.length} device(s)`,
      })
    } catch (error) {
      console.error("Sync error:", error)
      toast({
        title: "Sync Failed",
        description: "Could not sync device data",
        variant: "destructive",
      })
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "bluetooth":
        return Bluetooth
      case "native":
        return Smartphone
      case "web":
        return Wifi
      default:
        return Watch
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500"
      case "syncing":
        return "text-blue-500"
      case "connecting":
        return "text-yellow-500"
      case "error":
        return "text-red-500"
      case "offline":
        return "text-gray-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bluetooth className="mr-2 h-5 w-5 text-blue-600" />
            Real Device Integration
          </CardTitle>
          <CardDescription>
            Connect your actual wearable devices and phone sensors for real-time health monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={scanForBluetoothDevices}
              disabled={isScanning || !isBluetoothSupported()}
              className="h-20 flex-col"
            >
              {isScanning ? (
                <>
                  <Activity className="h-6 w-6 animate-spin mb-2" />
                  Scanning...
                </>
              ) : (
                <>
                  <Bluetooth className="h-6 w-6 mb-2" />
                  Bluetooth Devices
                </>
              )}
            </Button>

            <Button
              onClick={connectPhoneSensors}
              disabled={!isDeviceMotionSupported()}
              variant="outline"
              className="h-20 flex-col bg-transparent"
            >
              <Smartphone className="h-6 w-6 mb-2" />
              Phone Sensors
            </Button>

            <Button onClick={connectHealthAPIs} variant="outline" className="h-20 flex-col bg-transparent">
              <Activity className="h-6 w-6 mb-2" />
              Health APIs
            </Button>
          </div>

          {!isBluetoothSupported() && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Bluetooth Not Supported</AlertTitle>
              <AlertDescription>
                Your browser doesn't support Web Bluetooth. Try using Chrome, Edge, or Opera on desktop/Android.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Connected Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Devices ({devices.filter((d) => d.connected).length})</CardTitle>
          <CardDescription>Manage your connected health devices</CardDescription>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-8">
              <Watch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No devices connected</p>
              <p className="text-sm text-gray-400">Connect your wearable devices to start monitoring</p>
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map((device) => {
                const DeviceIcon = getDeviceIcon(device.type)
                const statusColor = getStatusColor(device.status)

                return (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <DeviceIcon className="h-6 w-6 text-gray-600" />
                        {device.connected && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{device.name}</h4>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className={statusColor}>
                            {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                          </span>
                          {device.battery && (
                            <div className="flex items-center space-x-1">
                              <Battery className="h-3 w-3" />
                              <span>{device.battery}%</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Services: {device.services.join(", ") || "None"}</p>
                      </div>
                    </div>
                    <Button
                      variant={device.connected ? "outline" : "default"}
                      size="sm"
                      onClick={() =>
                        device.connected ? disconnectDevice(device.id) : connectBluetoothDevice(device.device!)
                      }
                      disabled={device.status === "connecting" || device.status === "syncing"}
                    >
                      {device.status === "connecting"
                        ? "Connecting..."
                        : device.status === "syncing"
                          ? "Syncing..."
                          : device.connected
                            ? "Disconnect"
                            : "Connect"}
                    </Button>
                  </div>
                )
              })}

              <Button onClick={syncAllDevices} className="w-full">
                <Zap className="mr-2 h-4 w-4" />
                Sync All Devices
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Vitals */}
      {devices.some((d) => d.connected) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5 text-red-500" />
              Live Health Data
            </CardTitle>
            <CardDescription>Real-time data from your connected devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{vitals.heartRate || "--"}</div>
                <div className="text-sm text-gray-500">BPM</div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <Activity className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{vitals.steps.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Steps</div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <Zap className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{vitals.calories}</div>
                <div className="text-sm text-gray-500">Calories</div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <Activity className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{vitals.distance.toFixed(1)}</div>
                <div className="text-sm text-gray-500">km</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
          <CardDescription>Configure your device integration preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-connect">Auto-connect devices</Label>
              <p className="text-sm text-gray-600">Automatically connect to known devices</p>
            </div>
            <Switch
              id="auto-connect"
              checked={settings.autoConnect}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoConnect: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="real-time">Real-time sync</Label>
              <p className="text-sm text-gray-600">Continuously sync data from devices</p>
            </div>
            <Switch
              id="real-time"
              checked={settings.realTimeSync}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, realTimeSync: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Device notifications</Label>
              <p className="text-sm text-gray-600">Get alerts for device status changes</p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, notifications: checked }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
