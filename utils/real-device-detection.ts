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
      // Fitbit OAuth would be implemented here
      console.log("Checking for Fitbit connection...");
    } catch (error) {
      console.log("Fitbit API not available:", error);
    }
  }

  return devices;
}

// Detect all real connected devices
export async function detectAllRealDevices(): Promise<RealWearableDevice[]> {
  const allDevices: RealWearableDevice[] = [];

  try {
    // Try all detection methods
    const [bluetoothDevices, appleDevices, googleDevices, fitbitDevices] =
      await Promise.allSettled([
        detectBluetoothDevices(),
        detectAppleHealthKit(),
        detectGoogleFit(),
        detectFitbitDevices(),
      ]);

    // Collect successful results
    if (bluetoothDevices.status === "fulfilled") {
      allDevices.push(...bluetoothDevices.value);
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

  return allDevices;
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
