import { NextRequest, NextResponse } from "next/server";
import {
  getFitbitHeartRate,
  getFitbitActivities,
  getFitbitSleep,
} from "@/utils/fitbit-api";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "");
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date") || "today";

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 401 },
      );
    }

    try {
      // Fetch all vitals data in parallel
      const [heartRateResult, activitiesResult, sleepResult] =
        await Promise.allSettled([
          getFitbitHeartRate(accessToken, date),
          getFitbitActivities(accessToken, date),
          getFitbitSleep(accessToken, date),
        ]);

      // Process heart rate data
      let heartRate = 0;
      let restingHeartRate = 0;
      if (heartRateResult.status === "fulfilled" && heartRateResult.value) {
        const hrData = heartRateResult.value;
        restingHeartRate = hrData.value?.restingHeartRate || 0;
        // Get latest heart rate from zones if available
        const zones = hrData.value?.heartRateZones;
        if (zones && zones.length > 0) {
          // Calculate average from heart rate zones
          const totalMinutes = zones.reduce(
            (sum, zone) => sum + zone.minutes,
            0,
          );
          const weightedHR = zones.reduce(
            (sum, zone) => sum + ((zone.min + zone.max) / 2) * zone.minutes,
            0,
          );
          heartRate =
            totalMinutes > 0
              ? Math.round(weightedHR / totalMinutes)
              : restingHeartRate;
        }
      }

      // Process activities data
      let steps = 0;
      let calories = 0;
      let distance = 0;
      let activeMinutes = 0;
      if (activitiesResult.status === "fulfilled" && activitiesResult.value) {
        const activities = activitiesResult.value;
        steps = activities.summary?.steps || 0;
        calories = activities.summary?.caloriesOut || 0;
        activeMinutes =
          (activities.summary?.veryActiveMinutes || 0) +
          (activities.summary?.fairlyActiveMinutes || 0);

        // Get total distance
        const distances = activities.summary?.distances || [];
        distance = distances.reduce((total, d) => total + (d.distance || 0), 0);
      }

      // Process sleep data
      let sleepMinutes = 0;
      let sleepEfficiency = 0;
      if (sleepResult.status === "fulfilled" && sleepResult.value) {
        const sleep = sleepResult.value;
        if (sleep.summary) {
          sleepMinutes = sleep.summary.totalMinutesAsleep || 0;
        }
        if (sleep.sleep && sleep.sleep.length > 0) {
          // Get most recent sleep record
          const latestSleep = sleep.sleep[0];
          sleepEfficiency = latestSleep.efficiency || 0;
        }
      }

      // Calculate stress level (simplified estimation based on heart rate and sleep)
      let stressLevel = 0;
      if (restingHeartRate > 0 && heartRate > 0) {
        const hrVariability = Math.abs(heartRate - restingHeartRate);
        const sleepFactor =
          sleepEfficiency > 0 ? (100 - sleepEfficiency) / 100 : 0.5;
        stressLevel = Math.min(
          10,
          Math.round(hrVariability / 10 + sleepFactor * 5),
        );
      }

      const vitalsData = {
        heartRate,
        restingHeartRate,
        steps,
        calories,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        activeMinutes,
        sleepMinutes,
        sleepEfficiency,
        stressLevel,
        timestamp: new Date().toISOString(),
        date,
        // Additional Fitbit-specific data
        bloodPressure: "--/--", // Fitbit doesn't provide blood pressure
        temperature: 0, // Most Fitbits don't measure temperature
        oxygenSaturation: 0, // Only some Fitbit models have SpO2
      };

      return NextResponse.json({
        vitals: vitalsData,
        source: "fitbit",
        success: true,
      });
    } catch (apiError: any) {
      console.error("Fitbit vitals API error:", apiError);

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
          error: "Failed to fetch Fitbit vitals",
          details: apiError.message,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Fitbit vitals endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
