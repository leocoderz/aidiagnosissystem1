// Fitbit Web API integration
// Documentation: https://dev.fitbit.com/build/reference/

export interface FitbitConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

export interface FitbitDevice {
  id: string;
  deviceVersion: string;
  type: string;
  battery: string;
  batteryLevel: number;
  lastSyncTime: string;
  mac: string;
}

export interface FitbitUser {
  encodedId: string;
  displayName: string;
  fullName: string;
  avatar: string;
  avatar150: string;
  avatar640: string;
  dateOfBirth: string;
  gender: string;
  height: number;
  weight: number;
  timezone: string;
  memberSince: string;
}

export interface FitbitHeartRate {
  dateTime: string;
  value: {
    customHeartRateZones: any[];
    heartRateZones: Array<{
      caloriesOut: number;
      max: number;
      min: number;
      minutes: number;
      name: string;
    }>;
    restingHeartRate: number;
  };
}

export interface FitbitActivities {
  activities: Array<{
    activityId: number;
    activityParentId: number;
    activityParentName: string;
    calories: number;
    description: string;
    distance: number;
    duration: number;
    hasActiveZoneMinutes: boolean;
    hasStartTime: boolean;
    isFavorite: boolean;
    lastModified: string;
    logId: number;
    name: string;
    startDate: string;
    startTime: string;
    steps: number;
  }>;
  goals: {
    activeMinutes: number;
    caloriesOut: number;
    distance: number;
    floors: number;
    steps: number;
  };
  summary: {
    activeScore: number;
    activityCalories: number;
    caloriesBMR: number;
    caloriesOut: number;
    distances: Array<{
      activity: string;
      distance: number;
    }>;
    elevation: number;
    fairlyActiveMinutes: number;
    floors: number;
    heartRateZones: Array<{
      caloriesOut: number;
      max: number;
      min: number;
      minutes: number;
      name: string;
    }>;
    lightlyActiveMinutes: number;
    marginalCalories: number;
    restingHeartRate: number;
    sedentaryMinutes: number;
    steps: number;
    veryActiveMinutes: number;
  };
}

export interface FitbitSleep {
  sleep: Array<{
    dateOfSleep: string;
    duration: number;
    efficiency: number;
    endTime: string;
    infoCode: number;
    isMainSleep: boolean;
    levels: {
      data: Array<{
        dateTime: string;
        level: string;
        seconds: number;
      }>;
      shortData: Array<{
        dateTime: string;
        level: string;
        seconds: number;
      }>;
      summary: {
        deep: { count: number; minutes: number; thirtyDayAvgMinutes: number };
        light: { count: number; minutes: number; thirtyDayAvgMinutes: number };
        rem: { count: number; minutes: number; thirtyDayAvgMinutes: number };
        wake: { count: number; minutes: number; thirtyDayAvgMinutes: number };
      };
    };
    logId: number;
    minutesAfterWakeup: number;
    minutesAsleep: number;
    minutesAwake: number;
    minutesToFallAsleep: number;
    startTime: string;
    timeInBed: number;
    type: string;
  }>;
  summary: {
    stages: {
      deep: number;
      light: number;
      rem: number;
      wake: number;
    };
    totalMinutesAsleep: number;
    totalSleepRecords: number;
    totalTimeInBed: number;
  };
}

// Fitbit API Configuration
export const FITBIT_CONFIG: FitbitConfig = {
  clientId: process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID || "",
  clientSecret: process.env.FITBIT_CLIENT_SECRET || "",
  redirectUri:
    process.env.NEXT_PUBLIC_FITBIT_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/fitbit/callback`,
  scope: [
    "activity",
    "heartrate",
    "location",
    "nutrition",
    "profile",
    "settings",
    "sleep",
    "social",
    "weight",
  ],
};

// Fitbit API URLs
export const FITBIT_API_BASE = "https://api.fitbit.com/1";
export const FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize";
export const FITBIT_TOKEN_URL = "https://api.fitbit.com/oauth2/token";

// Generate Fitbit OAuth URL
export function getFitbitAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: FITBIT_CONFIG.clientId,
    redirect_uri: FITBIT_CONFIG.redirectUri,
    scope: FITBIT_CONFIG.scope.join(" "),
    state: state || generateRandomState(),
  });

  return `${FITBIT_AUTH_URL}?${params.toString()}`;
}

// Generate random state for OAuth security
export function generateRandomState(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Base64 encode for Basic auth
export function encodeBasicAuth(
  clientId: string,
  clientSecret: string,
): string {
  return Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  user_id: string;
}> {
  const response = await fetch(FITBIT_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodeBasicAuth(FITBIT_CONFIG.clientId, FITBIT_CONFIG.clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: FITBIT_CONFIG.clientId,
      grant_type: "authorization_code",
      redirect_uri: FITBIT_CONFIG.redirectUri,
      code: code,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  return response.json();
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  user_id: string;
}> {
  const response = await fetch(FITBIT_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodeBasicAuth(FITBIT_CONFIG.clientId, FITBIT_CONFIG.clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  return response.json();
}

// Make authenticated API request to Fitbit
export async function fitbitApiRequest(
  endpoint: string,
  accessToken: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
): Promise<any> {
  const url = `${FITBIT_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Fitbit API request failed: ${response.status} ${error}`);
  }

  return response.json();
}

// Get user devices
export async function getFitbitDevices(
  accessToken: string,
): Promise<FitbitDevice[]> {
  return fitbitApiRequest("/user/-/devices.json", accessToken);
}

// Get user profile
export async function getFitbitProfile(
  accessToken: string,
): Promise<{ user: FitbitUser }> {
  return fitbitApiRequest("/user/-/profile.json", accessToken);
}

// Get heart rate data
export async function getFitbitHeartRate(
  accessToken: string,
  date: string = "today",
): Promise<FitbitHeartRate> {
  return fitbitApiRequest(
    `/user/-/activities/heart/date/${date}/1d.json`,
    accessToken,
  );
}

// Get activities data
export async function getFitbitActivities(
  accessToken: string,
  date: string = "today",
): Promise<FitbitActivities> {
  return fitbitApiRequest(`/user/-/activities/date/${date}.json`, accessToken);
}

// Get sleep data
export async function getFitbitSleep(
  accessToken: string,
  date: string = "today",
): Promise<FitbitSleep> {
  return fitbitApiRequest(`/user/-/sleep/date/${date}.json`, accessToken);
}

// Convert Fitbit device to our RealWearableDevice format
export function convertFitbitDevice(fitbitDevice: FitbitDevice): any {
  return {
    id: fitbitDevice.id,
    name: `Fitbit ${fitbitDevice.type}`,
    type: "fitbit" as const,
    isConnected: true,
    connectionType: "wifi" as const,
    batteryLevel: fitbitDevice.batteryLevel,
    lastSync: fitbitDevice.lastSyncTime,
    capabilities: ["heart_rate", "steps", "calories", "sleep", "activity"],
    serialNumber: fitbitDevice.id,
    macAddress: fitbitDevice.mac,
  };
}
