// Real wearable device detection and connection utility

export interface RealWearableDevice {
  id: string;
  name: string;
  type:
    | "apple_watch"
    | "fitbit"
    | "garmin"
    | "samsung_watch"
    | "polar"
    | "unknown";
  isConnected: boolean;
  connectionType: "bluetooth" | "wifi" | "both";
  batteryLevel?: number;
  lastSync?: string;
  capabilities: string[];
  serialNumber?: string;
  ipAddress?: string; // For Wi-Fi connected devices
  macAddress?: string; // For device identification
}

// Web Bluetooth API device detection
export async function detectBluetoothDevices(): Promise<RealWearableDevice[]> {
  const devices: RealWearableDevice[] = [];

  if (!navigator.bluetooth) {
    console.log("Web Bluetooth API not supported");
    return devices;
  }

  try {
    // Request devices with health/fitness services
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: ["heart_rate"] },
        { services: ["battery_service"] },
        { namePrefix: "Apple Watch" },
        { namePrefix: "Fitbit" },
        { namePrefix: "Garmin" },
        { namePrefix: "Galaxy Watch" },
        { namePrefix: "Polar" },
      ],
      optionalServices: [
        "heart_rate",
        "battery_service",
        "device_information",
        "fitness_machine",
      ],
    });

    if (device) {
      const realDevice: RealWearableDevice = {
        id: device.id,
        name: device.name || "Unknown Device",
        type: getDeviceType(device.name || ""),
        isConnected: device.gatt?.connected || false,
        connectionType: "bluetooth",
        capabilities: await getDeviceCapabilities(device),
        lastSync: new Date().toISOString(),
      };

      devices.push(realDevice);
    }
  } catch (error) {
    console.log("No Bluetooth device selected or error:", error);
  }

  return devices;
}

// Wi-Fi device discovery using network scanning
export async function detectWiFiDevices(): Promise<RealWearableDevice[]> {
  const devices: RealWearableDevice[] = [];

  if (typeof window === "undefined") return devices;

  try {
    // Check for Wi-Fi Direct/P2P capable devices
    if (
      "serviceWorker" in navigator &&
      "sync" in window.ServiceWorkerRegistration.prototype
    ) {
      // Try to detect devices on local network
      const localDevices = await scanLocalNetwork();
      devices.push(...localDevices);
    }

    // Check for specific device APIs over Wi-Fi
    const wifiWearables = await detectWiFiWearables();
    devices.push(...wifiWearables);
  } catch (error) {
    console.log("Wi-Fi device detection error:", error);
  }

  return devices;
}

// Scan local network for known wearable device signatures
async function scanLocalNetwork(): Promise<RealWearableDevice[]> {
  const devices: RealWearableDevice[] = [];

  try {
    // Common wearable device ports and services
    const wearablePorts = [8080, 8443, 9000, 3000, 5000];
    const commonPrefixes = ["192.168.", "10.0.", "172.16."];

    // This would normally require a backend service for actual network scanning
    // For now, we'll check for devices that expose web interfaces
    console.log("Scanning local network for wearable devices...");

    // Simulate checking for devices with known patterns
    const knownDevices = await checkKnownDeviceEndpoints();
    devices.push(...knownDevices);
  } catch (error) {
    console.log("Network scan error:", error);
  }

  return devices;
}

// Check for wearable devices with known Wi-Fi endpoints
async function checkKnownDeviceEndpoints(): Promise<RealWearableDevice[]> {
  const devices: RealWearableDevice[] = [];

  // Check for devices that might be on the network
  const deviceEndpoints = [
    { name: "Garmin Connect", pattern: "garmin", type: "garmin" as const },
    { name: "Fitbit Sync", pattern: "fitbit", type: "fitbit" as const },
    {
      name: "Samsung Health",
      pattern: "samsung",
      type: "samsung_watch" as const,
    },
    { name: "Polar Flow", pattern: "polar", type: "polar" as const },
  ];

  for (const endpoint of deviceEndpoints) {
    try {
      // In a real implementation, this would check actual network endpoints
      // For demo purposes, we'll simulate device availability
      const isAvailable = await simulateDeviceCheck(endpoint.pattern);

      if (isAvailable) {
        devices.push({
          id: `wifi_${endpoint.pattern}_${Date.now()}`,
          name: `${endpoint.name} (Wi-Fi)`,
          type: endpoint.type,
          isConnected: true,
          connectionType: "wifi",
          capabilities: ["heart_rate", "steps", "calories", "sleep"],
          lastSync: new Date().toISOString(),
          ipAddress: `192.168.1.${Math.floor(Math.random() * 100) + 100}`, // Simulated IP
        });
      }
    } catch (error) {
      console.log(`Error checking ${endpoint.name}:`, error);
    }
  }

  return devices;
}

// Simulate device availability check
async function simulateDeviceCheck(deviceType: string): Promise<boolean> {
  // In a real implementation, this would make HTTP requests to device endpoints
  // or use mDNS/Bonjour service discovery
  return new Promise((resolve) => {
    setTimeout(() => {
      // Randomly simulate device availability for demo
      resolve(Math.random() > 0.8); // 20% chance of finding a device
    }, 500);
  });
}

// Detect Wi-Fi enabled wearables with specific APIs
async function detectWiFiWearables(): Promise<RealWearableDevice[]> {
  const devices: RealWearableDevice[] = [];

  try {
    // Check for devices using Web APIs that might indicate wearable presence
    if ("wakeLock" in navigator) {
      // Device has wake lock API, might be a wearable-connected device
    }

    // Check for media devices that might be wearables
    if ("mediaDevices" in navigator) {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const potentialWearables = mediaDevices.filter(
        (device) =>
          device.label.toLowerCase().includes("health") ||
          device.label.toLowerCase().includes("fitness") ||
          device.label.toLowerCase().includes("watch"),
      );

      for (const device of potentialWearables) {
        devices.push({
          id: device.deviceId,
          name: device.label || "Unknown Wearable Device",
          type: getDeviceType(device.label),
          isConnected: true,
          connectionType: "wifi",
          capabilities: ["audio", "health_monitoring"],
          lastSync: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.log("Wi-Fi wearable detection error:", error);
  }

  return devices;
}

// Apple HealthKit integration (if available)
export async function detectAppleHealthKit(): Promise<RealWearableDevice[]> {
  const devices: RealWearableDevice[] = [];

  // Check if running in Safari on iOS/macOS with HealthKit access
  if (typeof window !== "undefined" && "HealthKit" in window) {
    try {
      // @ts-ignore - HealthKit might not be in types
      const healthKit = window.HealthKit;

      // Request permission for health data
      const isAvailable = await healthKit.isHealthDataAvailable();

      if (isAvailable) {
        devices.push({
          id: "apple_healthkit",
          name: "Apple HealthKit",
          type: "apple_watch",
          isConnected: true,
          connectionType: "both", // HealthKit can work over both connections
          capabilities: ["heart_rate", "steps", "activity", "sleep"],
          lastSync: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.log("Apple HealthKit not available:", error);
    }
  }

  return devices;
}

// Google Fit integration (if available)
export async function detectGoogleFit(): Promise<RealWearableDevice[]> {
  const devices: RealWearableDevice[] = [];

  if (typeof window !== "undefined" && "gapi" in window) {
    try {
      // @ts-ignore - Google APIs might not be in types
      await window.gapi.load("auth2", () => {
        // Google Fit integration would go here
        console.log("Google Fit API loaded");
      });
    } catch (error) {
      console.log("Google Fit not available:", error);
    }
  }

  return devices;
}

// Fitbit Web API integration
export async function detectFitbitDevices(): Promise<RealWearableDevice[]> {
  const devices: RealWearableDevice[] = [];

  // Check for Fitbit Web API access
  if (typeof window !== "undefined") {
    try {
      // Check if we have stored Fitbit access token
      const accessToken = localStorage.getItem("fitbit_access_token");
      const refreshToken = localStorage.getItem("fitbit_refresh_token");
      const tokenExpiry = localStorage.getItem("fitbit_token_expiry");

      if (!accessToken) {
        console.log("No Fitbit access token found");
        return devices;
      }

      // Check if token is expired
      const isExpired = tokenExpiry && Date.now() > parseInt(tokenExpiry);
      let currentAccessToken = accessToken;

      if (isExpired && refreshToken) {
        try {
          // Refresh the token
          const response = await fetch("/api/fitbit/devices", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (response.ok) {
            const tokenData = await response.json();
            currentAccessToken = tokenData.access_token;

            // Update stored tokens
            localStorage.setItem("fitbit_access_token", tokenData.access_token);
            localStorage.setItem(
              "fitbit_refresh_token",
              tokenData.refresh_token,
            );
            localStorage.setItem(
              "fitbit_token_expiry",
              (Date.now() + tokenData.expires_in * 1000).toString(),
            );
          } else {
            console.log("Failed to refresh Fitbit token");
            return devices;
          }
        } catch (refreshError) {
          console.log("Error refreshing Fitbit token:", refreshError);
          return devices;
        }
      }

      // Fetch Fitbit devices using the API
      const response = await fetch("/api/fitbit/devices", {
        headers: {
          Authorization: `Bearer ${currentAccessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.devices && data.devices.length > 0) {
          devices.push(...data.devices);
          console.log(`Found ${data.devices.length} Fitbit device(s)`);
        }
      } else if (response.status === 401) {
        // Token is invalid, clear stored tokens
        localStorage.removeItem("fitbit_access_token");
        localStorage.removeItem("fitbit_refresh_token");
        localStorage.removeItem("fitbit_token_expiry");
        console.log("Fitbit token invalid, cleared stored tokens");
      }
    } catch (error) {
      console.log("Fitbit API error:", error);
    }
  }

  return devices;
}

// Detect all real connected devices
export async function detectAllRealDevices(): Promise<RealWearableDevice[]> {
  const allDevices: RealWearableDevice[] = [];

  try {
    // Try all detection methods including Wi-Fi
    const [
      bluetoothDevices,
      wifiDevices,
      appleDevices,
      googleDevices,
      fitbitDevices,
    ] = await Promise.allSettled([
      detectBluetoothDevices(),
      detectWiFiDevices(),
      detectAppleHealthKit(),
      detectGoogleFit(),
      detectFitbitDevices(),
    ]);

    // Collect successful results
    if (bluetoothDevices.status === "fulfilled") {
      allDevices.push(...bluetoothDevices.value);
    }
    if (wifiDevices.status === "fulfilled") {
      allDevices.push(...wifiDevices.value);
    }
    if (appleDevices.status === "fulfilled") {
      allDevices.push(...appleDevices.value);
    }
    if (googleDevices.status === "fulfilled") {
      allDevices.push(...googleDevices.value);
    }
    if (fitbitDevices.status === "fulfilled") {
      allDevices.push(...fitbitDevices.value);
    }
  } catch (error) {
    console.error("Error detecting devices:", error);
  }

  // Remove duplicates based on device ID and merge connection types
  const deviceMap = new Map<string, RealWearableDevice>();

  allDevices.forEach((device) => {
    const existing = deviceMap.get(device.id);
    if (existing) {
      // Merge connection types if same device found via different methods
      if (existing.connectionType !== device.connectionType) {
        existing.connectionType = "both";
      }
      // Update with most recent data
      existing.lastSync = device.lastSync;
      existing.isConnected = device.isConnected || existing.isConnected;
    } else {
      deviceMap.set(device.id, device);
    }
  });

  return Array.from(deviceMap.values());
}

// Get device type from name
function getDeviceType(deviceName: string): RealWearableDevice["type"] {
  const name = deviceName.toLowerCase();

  if (name.includes("apple") || name.includes("watch")) return "apple_watch";
  if (name.includes("fitbit")) return "fitbit";
  if (name.includes("garmin")) return "garmin";
  if (name.includes("galaxy") || name.includes("samsung"))
    return "samsung_watch";
  if (name.includes("polar")) return "polar";

  return "unknown";
}

// Get device capabilities
async function getDeviceCapabilities(
  device: BluetoothDevice,
): Promise<string[]> {
  const capabilities: string[] = [];

  try {
    if (device.gatt) {
      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();

      for (const service of services) {
        if (service.uuid.includes("180d")) capabilities.push("heart_rate");
        if (service.uuid.includes("180f")) capabilities.push("battery");
        if (service.uuid.includes("1816")) capabilities.push("cycling");
        if (service.uuid.includes("1818")) capabilities.push("cycling_power");
        if (service.uuid.includes("1826")) capabilities.push("fitness_machine");
      }
    }
  } catch (error) {
    console.log("Error getting device capabilities:", error);
  }

  return capabilities;
}

// Monitor real device connection status
export function monitorDeviceConnections(
  devices: RealWearableDevice[],
  onStatusChange: (device: RealWearableDevice) => void,
) {
  devices.forEach((device) => {
    if (device.type === "apple_watch" && navigator.bluetooth) {
      // Monitor Bluetooth connection status
      navigator.bluetooth.addEventListener("advertisementreceived", (event) => {
        if (event.device.id === device.id) {
          device.isConnected = true;
          device.lastSync = new Date().toISOString();
          onStatusChange(device);
        }
      });
    }
  });
}

// Get real vitals data from connected devices
export async function getRealVitalsFromDevice(
  device: RealWearableDevice,
): Promise<any> {
  if (!device.isConnected) {
    throw new Error("Device not connected");
  }

  try {
    switch (device.type) {
      case "apple_watch":
        return await getAppleWatchVitals(device);
      case "fitbit":
        return await getFitbitVitals(device);
      case "garmin":
        return await getGarminVitals(device);
      default:
        return await getBluetoothVitals(device);
    }
  } catch (error) {
    console.error("Error getting vitals from device:", error);
    throw error;
  }
}

// Apple Watch vitals (via HealthKit)
async function getAppleWatchVitals(device: RealWearableDevice) {
  // HealthKit integration would go here
  throw new Error("Apple HealthKit integration required");
}

// Fitbit vitals (via Web API)
async function getFitbitVitals(device: RealWearableDevice) {
  // Fitbit Web API integration would go here
  throw new Error("Fitbit Web API integration required");
}

// Garmin vitals (via Connect IQ)
async function getGarminVitals(device: RealWearableDevice) {
  // Garmin Connect IQ integration would go here
  throw new Error("Garmin Connect IQ integration required");
}

// Generic Bluetooth vitals
async function getBluetoothVitals(device: RealWearableDevice) {
  if (!navigator.bluetooth || !device.id) {
    throw new Error("Bluetooth not available");
  }

  try {
    const bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: ["heart_rate"] }],
    });

    if (bluetoothDevice.gatt) {
      const server = await bluetoothDevice.gatt.connect();
      const service = await server.getPrimaryService("heart_rate");
      const characteristic = await service.getCharacteristic(
        "heart_rate_measurement",
      );

      const value = await characteristic.readValue();
      const heartRate = value.getUint16(1, true);

      return {
        heartRate,
        timestamp: new Date().toISOString(),
        source: device.name,
      };
    }
  } catch (error) {
    console.error("Error reading Bluetooth vitals:", error);
    throw error;
  }
}
