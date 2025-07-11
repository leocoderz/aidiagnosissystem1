"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Watch,
  Heart,
  Thermometer,
  Activity,
  Smartphone,
  Bluetooth,
  Battery,
  Zap,
  Settings,
  Wifi,
  WifiOff,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WearableDevice {
  id: string
  name: string
  type: "smartwatch" | "fitness" | "ring" | "scale" | "sensor" | "phone"
  brand: string
  model: string
  connected: boolean
  battery: number
  lastSync: string
  status: "active" | "syncing" | "error" | "offline" | "pairing"
  firmwareVersion: string
  serialNumber: string
  features: string[]
  syncFrequency: "realtime" | "5min" | "15min" | "hourly"
  dataTypes: string[]
}

interface WearableManagementProps {
  onDeviceUpdate?: (devices: WearableDevice[]) => void
}

export default function WearableManagement({ onDeviceUpdate }: WearableManagementProps) {
  const [devices, setDevices] = useState<WearableDevice[]>([
    {
      id: "1",
      name: "Apple Watch Series 9",
      type: "smartwatch",
      brand: "Apple",
      model: "Series 9 GPS + Cellular",
      connected: true,
      battery: 78,
      lastSync: new Date().toISOString(),
      status: "active",
      firmwareVersion: "10.1.1",
      serialNumber: "F2LX3HGXHX05",
      features: ["Heart Rate", "ECG", "Blood Oxygen", "Sleep Tracking", "Fall Detection", "GPS"],
      syncFrequency: "realtime",
      dataTypes: ["heart_rate", "steps", "calories", "sleep", "workouts", "ecg", "blood_oxygen"],
    },
    {
      id: "2",
      name: "Fitbit Charge 5",
      type: "fitness",
      brand: "Fitbit",
      model: "Charge 5",
      connected: false,
      battery: 0,
      lastSync: new Date(Date.now() - 86400000).toISOString(),
      status: "offline",
      firmwareVersion: "1.188.47",
      serialNumber: "FB507BFPT",
      features: ["Heart Rate", "GPS", "Stress Management", "Sleep Score", "Active Zone Minutes"],
      syncFrequency: "15min",
      dataTypes: ["heart_rate", "steps", "calories", "sleep", "stress"],
    },
    {
      id: "3",
      name: "Oura Ring Gen3",
      type: "ring",
      brand: "Oura",
      model: "Generation 3",
      connected: true,
      battery: 45,
      lastSync: new Date().toISOString(),
      status: "active",
      firmwareVersion: "2.0.1",
      serialNumber: "OURA3X7Y9Z",
      features: ["Sleep Tracking", "HRV", "Body Temperature", "Activity Tracking", "Recovery"],
      syncFrequency: "hourly",
      dataTypes: ["sleep", "hrv", "temperature", "recovery", "readiness"],
    },
  ])

  const [availableDevices, setAvailableDevices] = useState([
    { name: "iPhone 14 Pro", type: "phone", brand: "Apple" },
    { name: "Samsung Galaxy Watch 6", type: "smartwatch", brand: "Samsung" },
    { name: "Garmin Forerunner 955", type: "smartwatch", brand: "Garmin" },
    { name: "Withings Body+", type: "scale", brand: "Withings" },
    { name: "Polar H10", type: "sensor", brand: "Polar" },
  ])

  const [isScanning, setIsScanning] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<WearableDevice | null>(null)
  const [showAddDevice, setShowAddDevice] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    onDeviceUpdate?.(devices)
  }, [devices, onDeviceUpdate])

  const connectDevice = async (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId)
    if (!device) return

    setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, status: "pairing" } : d)))

    // Simulate pairing process
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId
            ? {
                ...d,
                connected: true,
                status: "syncing",
                battery: Math.floor(Math.random() * 100) + 1,
              }
            : d,
        ),
      )

      // Complete connection
      setTimeout(() => {
        setDevices((prev) =>
          prev.map((d) => (d.id === deviceId ? { ...d, status: "active", lastSync: new Date().toISOString() } : d)),
        )

        toast({
          title: "Device Connected",
          description: `${device.name} is now connected and syncing`,
        })
      }, 2000)
    }, 1500)
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

  const removeDevice = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId)
    setDevices((prev) => prev.filter((d) => d.id !== deviceId))

    toast({
      title: "Device Removed",
      description: `${device?.name} has been removed from your account`,
    })
  }

  const syncDevice = async (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId)
    if (!device?.connected) return

    setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, status: "syncing" } : d)))

    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, status: "active", lastSync: new Date().toISOString() } : d)),
      )

      toast({
        title: "Sync Complete",
        description: `${device.name} data has been synchronized`,
      })
    }, 2000)
  }

  const updateSyncFrequency = (deviceId: string, frequency: "realtime" | "5min" | "15min" | "hourly") => {
    setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, syncFrequency: frequency } : d)))

    toast({
      title: "Sync Frequency Updated",
      description: `Device will now sync ${frequency === "realtime" ? "in real-time" : `every ${frequency}`}`,
    })
  }

  const scanForDevices = () => {
    setIsScanning(true)

    setTimeout(() => {
      setIsScanning(false)
      toast({
        title: "Scan Complete",
        description: `Found ${availableDevices.length} available devices`,
      })
    }, 3000)
  }

  const addNewDevice = (deviceInfo: any) => {
    const newDevice: WearableDevice = {
      id: Date.now().toString(),
      name: deviceInfo.name,
      type: deviceInfo.type,
      brand: deviceInfo.brand,
      model: deviceInfo.name,
      connected: false,
      battery: 0,
      lastSync: new Date().toISOString(),
      status: "offline",
      firmwareVersion: "1.0.0",
      serialNumber: `SN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      features: ["Basic Tracking"],
      syncFrequency: "15min",
      dataTypes: ["heart_rate", "steps"],
    }

    setDevices((prev) => [...prev, newDevice])
    setShowAddDevice(false)

    toast({
      title: "Device Added",
      description: `${deviceInfo.name} has been added to your devices`,
    })
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
      case "phone":
        return Smartphone
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
      case "pairing":
        return "text-yellow-500"
      case "error":
        return "text-red-500"
      case "offline":
        return "text-gray-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return CheckCircle
      case "syncing":
        return Activity
      case "pairing":
        return Bluetooth
      case "error":
        return AlertCircle
      case "offline":
        return WifiOff
      default:
        return Wifi
    }
  }

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return "text-green-500"
    if (battery > 20) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Device Management</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage your connected health devices and sensors</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={scanForDevices} disabled={isScanning}>
            {isScanning ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Bluetooth className="mr-2 h-4 w-4" />
                Scan Devices
              </>
            )}
          </Button>
          <Button onClick={() => setShowAddDevice(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Device
          </Button>
        </div>
      </div>

      {/* Device Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Bluetooth className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{devices.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Devices</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{devices.filter((d) => d.connected).length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Connected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{devices.filter((d) => d.status === "active").length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Device List */}
      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="devices">My Devices</TabsTrigger>
          <TabsTrigger value="settings">Sync Settings</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          {devices.map((device) => {
            const DeviceIcon = getDeviceIcon(device.type)
            const StatusIcon = getStatusIcon(device.status)
            const statusColor = getStatusColor(device.status)
            const batteryColor = getBatteryColor(device.battery)

            return (
              <Card key={device.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <DeviceIcon className="h-12 w-12 text-gray-600 dark:text-gray-300" />
                        {device.connected && device.status === "active" && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold">{device.name}</h3>
                          <Badge variant="outline">{device.brand}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{device.model}</p>

                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                            <span className={statusColor}>
                              {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                            </span>
                          </div>

                          {device.connected && device.battery > 0 && (
                            <div className="flex items-center space-x-1">
                              <Battery className={`h-4 w-4 ${batteryColor}`} />
                              <span className={batteryColor}>{device.battery}%</span>
                            </div>
                          )}

                          <div className="text-gray-500">Last sync: {new Date(device.lastSync).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {device.connected && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncDevice(device.id)}
                          disabled={device.status === "syncing"}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          {device.status === "syncing" ? "Syncing..." : "Sync"}
                        </Button>
                      )}

                      <Button
                        variant={device.connected ? "outline" : "default"}
                        size="sm"
                        onClick={() => (device.connected ? disconnectDevice(device.id) : connectDevice(device.id))}
                        disabled={device.status === "pairing" || device.status === "syncing"}
                      >
                        {device.status === "pairing" ? "Pairing..." : device.connected ? "Disconnect" : "Connect"}
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => setSelectedDevice(device)}>
                        <Settings className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDevice(device.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Device Details */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Features:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {device.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {device.features.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{device.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium">Sync Frequency:</span>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          {device.syncFrequency === "realtime" ? "Real-time" : `Every ${device.syncFrequency}`}
                        </p>
                      </div>

                      <div>
                        <span className="font-medium">Firmware:</span>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">{device.firmwareVersion}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization Settings</CardTitle>
              <CardDescription>Configure how often your devices sync data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {devices
                .filter((d) => d.connected)
                .map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{device.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Current: {device.syncFrequency === "realtime" ? "Real-time" : `Every ${device.syncFrequency}`}
                      </p>
                    </div>
                    <select
                      value={device.syncFrequency}
                      onChange={(e) => updateSyncFrequency(device.id, e.target.value as any)}
                      className="border rounded px-3 py-1 bg-white dark:bg-gray-800"
                    >
                      <option value="realtime">Real-time</option>
                      <option value="5min">Every 5 minutes</option>
                      <option value="15min">Every 15 minutes</option>
                      <option value="hourly">Every hour</option>
                    </select>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Types & Storage</CardTitle>
              <CardDescription>Manage what data is collected and stored from your devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{device.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {device.dataTypes.map((dataType, index) => (
                        <Badge key={index} variant="outline">
                          {dataType.replace("_", " ").toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Device Modal */}
      {showAddDevice && (
        <Card className="fixed inset-0 z-50 m-4 max-w-md mx-auto mt-20 h-fit">
          <CardHeader>
            <CardTitle>Add New Device</CardTitle>
            <CardDescription>Select a device to add to your health monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableDevices.map((device, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => addNewDevice(device)}
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(getDeviceIcon(device.type), { className: "h-6 w-6 text-gray-600" })}
                  <div>
                    <h4 className="font-medium">{device.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{device.brand}</p>
                  </div>
                </div>
                <Plus className="h-4 w-4 text-blue-600" />
              </div>
            ))}
            <Button variant="outline" onClick={() => setShowAddDevice(false)} className="w-full">
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Device Settings Modal */}
      {selectedDevice && (
        <Card className="fixed inset-0 z-50 m-4 max-w-lg mx-auto mt-20 h-fit">
          <CardHeader>
            <CardTitle>{selectedDevice.name} Settings</CardTitle>
            <CardDescription>Configure device-specific settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Device Name</Label>
              <Input value={selectedDevice.name} className="mt-1" />
            </div>

            <div>
              <Label>Serial Number</Label>
              <Input value={selectedDevice.serialNumber} disabled className="mt-1" />
            </div>

            <div>
              <Label>Firmware Version</Label>
              <Input value={selectedDevice.firmwareVersion} disabled className="mt-1" />
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => setSelectedDevice(null)} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setSelectedDevice(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
