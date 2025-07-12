import { NextRequest, NextResponse } from "next/server";
import {
  getFitbitDevices,
  getFitbitProfile,
  getFitbitHeartRate,
  getFitbitActivities,
  convertFitbitDevice,
  refreshAccessToken,
} from "@/utils/fitbit-api";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 401 },
      );
    }

    try {
      // Get user devices
      const devices = await getFitbitDevices(accessToken);

      // Get user profile for additional context
      const profileData = await getFitbitProfile(accessToken);

      // Get current heart rate and activity data
      const [heartRateData, activitiesData] = await Promise.allSettled([
        getFitbitHeartRate(accessToken),
        getFitbitActivities(accessToken),
      ]);

      // Convert Fitbit devices to our standard format
      const convertedDevices = devices.map(convertFitbitDevice);

      // Add real-time vitals data to the first connected device
      if (convertedDevices.length > 0) {
        const primaryDevice = convertedDevices[0];

        // Add current vitals if available
        if (heartRateData.status === "fulfilled" && heartRateData.value) {
          primaryDevice.currentVitals = {
            heartRate: heartRateData.value.value?.restingHeartRate || 0,
            timestamp: new Date().toISOString(),
          };
        }

        if (activitiesData.status === "fulfilled" && activitiesData.value) {
          const activities = activitiesData.value;
          primaryDevice.currentVitals = {
            ...primaryDevice.currentVitals,
            steps: activities.summary?.steps || 0,
            calories: activities.summary?.caloriesOut || 0,
            activeMinutes: activities.summary?.veryActiveMinutes || 0,
          };
        }
      }

      return NextResponse.json({
        devices: convertedDevices,
        profile: profileData.user,
        connected: true,
        lastSync: new Date().toISOString(),
      });
    } catch (apiError: any) {
      console.error("Fitbit API error:", apiError);

      // Check if token is expired (401 error)
      if (apiError.message?.includes("401")) {
        return NextResponse.json(
          {
            error: "Access token expired",
            needsRefresh: true,
          },
          { status: 401 },
        );
      }

      return NextResponse.json(
        {
          error: "Failed to fetch Fitbit data",
          details: apiError.message,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Fitbit devices endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 },
      );
    }

    try {
      // Refresh the access token
      const newTokenData = await refreshAccessToken(refreshToken);

      return NextResponse.json({
        access_token: newTokenData.access_token,
        refresh_token: newTokenData.refresh_token,
        expires_in: newTokenData.expires_in,
        user_id: newTokenData.user_id,
      });
    } catch (refreshError: any) {
      console.error("Token refresh error:", refreshError);
      return NextResponse.json(
        {
          error: "Failed to refresh token",
          needsReauth: true,
        },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Fitbit token refresh endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
