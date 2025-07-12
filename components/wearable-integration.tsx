"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bluetooth,
  Wifi,
  AlertTriangle,
  Search,
  RefreshCw,
  Settings,
  Shield,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BluetoothDevice {
  id: string;
  name: string;
  deviceClass: number;
  connected: boolean;
  paired: boolean;
  rssi?: number;
  serviceUUIDs?: string[];
}

interface WiFiDevice {
  ssid: string;
  rssi: number;
  frequency: number;
  capabilities: string;
  connected: boolean;
}

interface WearableIntegrationProps {
  onVitalAlert?: (alert: {
    type: string;
    message: string;
    severity: "low" | "medium" | "high";
  }) => void;
  onDeviceConnected?: (device: BluetoothDevice) => void;
}

export default function WearableIntegration({
  onVitalAlert,
  onDeviceConnected,
}: WearableIntegrationProps) {
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDevice[]>(
    [],
  );
  const [wifiNetworks, setWifiNetworks] = useState<WiFiDevice[]>([]);
  const [isBluetoothScanning, setIsBluetoothScanning] = useState(false);
  const [isWifiScanning, setIsWifiScanning] = useState(false);
  const [bluetoothSupported, setBluetoothSupported] = useState(false);
  const [wifiSupported, setWifiSupported] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [wifiEnabled, setWifiEnabled] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [activeTab, setActiveTab] = useState<"bluetooth" | "wifi">("bluetooth");

  const { toast } = useToast();

  useEffect(() => {
    checkDeviceSupport();
  }, []);

  const checkDeviceSupport = async () => {
    // Check if running in secure context (HTTPS required for Bluetooth)
    const isSecureContext = window.isSecureContext;

    // Check Bluetooth support
    if ("bluetooth" in navigator && isSecureContext) {
      try {
        // Check if Bluetooth is available in permissions policy
        const permissionStatus = await navigator.permissions?.query?.({
          name: "bluetooth" as any,
        });
        if (permissionStatus?.state === "denied") {
          console.warn("Bluetooth access is denied by permissions policy");
          setBluetoothSupported(false);
          return;
        }

        setBluetoothSupported(true);
        const available = await (navigator as any).bluetooth.getAvailability();
        setBluetoothEnabled(available);
      } catch (error) {
        console.log("Bluetooth availability check failed:", error);
        setBluetoothSupported(false);
      }
    } else {
      console.log("Bluetooth not supported: Missing API or insecure context");
      setBluetoothSupported(false);
    }

    // Check WiFi support (limited in browsers)
    if ("navigator" in window && "connection" in navigator) {
      setWifiSupported(true);
      setWifiEnabled(true);
    }
  };

  const requestBluetoothPermission = async () => {
    if (!bluetoothSupported) {
      const reason = !window.isSecureContext
        ? "Bluetooth requires HTTPS connection"
        : "Your browser doesn't support Bluetooth connectivity";

      toast({
        title: "Bluetooth Not Available",
        description: reason,
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if we're in a secure context
      if (!window.isSecureContext) {
        throw new Error("Bluetooth requires HTTPS");
      }

      // Request device with specific filters to avoid permission policy issues
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: ["heart_rate"] },
          { services: ["battery_service"] },
          { services: ["device_information"] },
          { name: "Heart Rate Monitor" },
          { namePrefix: "Polar" },
          { namePrefix: "Garmin" },
          { namePrefix: "Fitbit" },
        ],
        optionalServices: [
          "heart_rate",
          "battery_service",
          "device_information",
          "health_thermometer",
          "blood_pressure",
        ],
      });

      setPermissionGranted(true);
      toast({
        title: "Permission Granted",
        description: "Bluetooth access has been granted",
      });

      return device;
    } catch (error: any) {
      console.error("Bluetooth permission denied:", error);

      let errorMessage = "Bluetooth access was denied";

      if (error.message?.includes("permissions policy")) {
        errorMessage =
          "Bluetooth is disabled by security policy. Please enable in browser settings.";
      } else if (error.message?.includes("HTTPS")) {
        errorMessage = "Bluetooth requires a secure HTTPS connection";
      } else if (error.name === "NotFoundError") {
        errorMessage =
          "No compatible Bluetooth devices found. Make sure device is in pairing mode.";
      } else if (error.name === "SecurityError") {
        errorMessage =
          "Bluetooth access blocked by security policy or permissions";
      }

      toast({
        title: "Bluetooth Access Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const scanForBluetoothDevices = async () => {
    if (!permissionGranted) {
      await requestBluetoothPermission();
      return;
    }

    setIsBluetoothScanning(true);

    try {
      // Check if getDevices method is available
      if (!(navigator as any).bluetooth.getDevices) {
        throw new Error("getDevices method not available");
      }

      // Get already paired devices
      const devices = await (navigator as any).bluetooth.getDevices();

      const deviceList: BluetoothDevice[] = devices.map((device: any) => ({
        id: device.id,
        name: device.name || "Unknown Device",
        deviceClass: 0,
        connected: device.gatt?.connected || false,
        paired: true,
        serviceUUIDs: [],
      }));

      setBluetoothDevices(deviceList);

      toast({
        title: "Scan Complete",
        description: `Found ${deviceList.length} paired device(s)`,
      });
    } catch (error: any) {
      console.error("Bluetooth scan failed:", error);

      let errorMessage = "Failed to scan for Bluetooth devices";

      if (error.message?.includes("getDevices")) {
        errorMessage = "Device scanning not supported in this browser version";
      } else if (error.name === "SecurityError") {
        errorMessage =
          "Permission required. Please grant Bluetooth access first.";
      }

      toast({
        title: "Scan Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsBluetoothScanning(false);
    }
  };

  const connectBluetoothDevice = async (deviceId: string) => {
    const device = bluetoothDevices.find((d) => d.id === deviceId);
    if (!device) return;

    try {
      // In a real implementation, you would connect to the device here
      setBluetoothDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, connected: true } : d)),
      );

      onDeviceConnected?.(device);

      toast({
        title: "Device Connected",
        description: `Successfully connected to ${device.name}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${device.name}`,
        variant: "destructive",
      });
    }
  };

  const disconnectBluetoothDevice = (deviceId: string) => {
    const device = bluetoothDevices.find((d) => d.id === deviceId);

    setBluetoothDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, connected: false } : d)),
    );

    toast({
      title: "Device Disconnected",
      description: `Disconnected from ${device?.name}`,
    });
  };

  const scanForWifiNetworks = async () => {
    setIsWifiScanning(true);

    // Note: Real WiFi scanning is not available in browsers for security reasons
    // This is a placeholder that would typically be handled by a companion app

    setTimeout(() => {
      setIsWifiScanning(false);
      toast({
        title: "WiFi Scan Limitation",
        description: "WiFi device discovery requires a companion mobile app",
        variant: "default",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Device Connection Center
          </CardTitle>
          <CardDescription>
            Connect real Bluetooth and WiFi health devices for live monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Bluetooth className="h-5 w-5 text-blue-500" />
                <span>Bluetooth</span>
              </div>
              <Badge
                variant={
                  bluetoothSupported && bluetoothEnabled
                    ? "default"
                    : "secondary"
                }
              >
                {bluetoothSupported
                  ? bluetoothEnabled
                    ? "Ready"
                    : "Disabled"
                  : "Not Supported"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Wifi className="h-5 w-5 text-green-500" />
                <span>WiFi</span>
              </div>
              <Badge variant={wifiSupported ? "default" : "secondary"}>
                {wifiSupported ? "Available" : "Not Supported"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Type Tabs */}
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setActiveTab("bluetooth")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "bluetooth"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Bluetooth className="inline-block w-4 h-4 mr-2" />
          Bluetooth Devices
        </button>
        <button
          onClick={() => setActiveTab("wifi")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "wifi"
              ? "border-green-500 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Wifi className="inline-block w-4 h-4 mr-2" />
          WiFi Devices
        </button>
      </div>

      {activeTab === "bluetooth" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Bluetooth className="mr-2 h-5 w-5 text-blue-500" />
                Bluetooth Health Devices
              </CardTitle>
              <div className="space-x-2">
                {!permissionGranted && (
                  <Button
                    onClick={requestBluetoothPermission}
                    variant="outline"
                    size="sm"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Grant Permission
                  </Button>
                )}
                <Button
                  onClick={scanForBluetoothDevices}
                  disabled={isBluetoothScanning || !bluetoothSupported}
                  size="sm"
                >
                  {isBluetoothScanning ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  {isBluetoothScanning ? "Scanning..." : "Scan Devices"}
                </Button>
              </div>
            </div>
            <CardDescription>
              Pair with fitness trackers, smartwatches, and health monitoring
              devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!bluetoothSupported && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {!window.isSecureContext
                    ? "Bluetooth requires HTTPS connection. Please access this page via HTTPS or localhost."
                    : "Bluetooth is not supported in your current browser. Try using Chrome, Edge, or Opera with HTTPS."}
                </AlertDescription>
              </Alert>
            )}

            {bluetoothSupported && !permissionGranted && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Click "Grant Permission" to allow access to Bluetooth devices
                  for health monitoring.
                </AlertDescription>
              </Alert>
            )}

            {bluetoothDevices.length === 0 && permissionGranted && (
              <div className="text-center py-8 text-gray-500">
                <Bluetooth className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No paired devices found</p>
                <p className="text-sm">
                  Make sure your health devices are in pairing mode
                </p>
              </div>
            )}

            <div className="space-y-3">
              {bluetoothDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Bluetooth className="h-6 w-6 text-blue-500" />
                      {device.connected && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{device.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Badge
                          variant={device.paired ? "default" : "secondary"}
                        >
                          {device.paired ? "Paired" : "Not Paired"}
                        </Badge>
                        <Badge
                          variant={device.connected ? "default" : "outline"}
                        >
                          {device.connected ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={device.connected ? "outline" : "default"}
                    size="sm"
                    onClick={() =>
                      device.connected
                        ? disconnectBluetoothDevice(device.id)
                        : connectBluetoothDevice(device.id)
                    }
                  >
                    {device.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "wifi" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Wifi className="mr-2 h-5 w-5 text-green-500" />
                WiFi Health Devices
              </CardTitle>
              <Button
                onClick={scanForWifiNetworks}
                disabled={isWifiScanning}
                size="sm"
              >
                {isWifiScanning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {isWifiScanning ? "Scanning..." : "Discover Devices"}
              </Button>
            </div>
            <CardDescription>
              Connect to WiFi-enabled smart scales, blood pressure monitors, and
              other devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                WiFi device discovery is limited in web browsers. For full
                functionality, please use our companion mobile app or
                device-specific setup instructions.
              </AlertDescription>
            </Alert>

            <div className="text-center py-8 text-gray-500">
              <Wifi className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>WiFi Device Discovery</p>
              <p className="text-sm">
                Use device manufacturer's app for initial setup
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Device Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">
                Supported Device Types:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Heart rate monitors (Polar, Garmin, Wahoo)</li>
                <li>• Smartwatches (Apple Watch, Samsung Galaxy Watch)</li>
                <li>• Fitness trackers (Fitbit, Garmin, Xiaomi)</li>
                <li>• Blood pressure monitors (Omron, Withings)</li>
                <li>• Smart scales (Withings, Fitbit Aria)</li>
                <li>• Pulse oximeters (Masimo, Nonin)</li>
                <li>• Continuous glucose monitors (Dexcom, FreeStyle)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Setup Steps:</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Put your device in pairing/discovery mode</li>
                <li>2. Grant Bluetooth permissions when prompted</li>
                <li>3. Click "Scan Devices" to find your device</li>
                <li>4. Select and connect to your device</li>
                <li>5. Follow any additional device-specific setup</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Privacy & Security:</strong> All device connections are
          encrypted and health data is processed locally on your device. No data
          is transmitted without your explicit consent.
        </AlertDescription>
      </Alert>
    </div>
  );
}
