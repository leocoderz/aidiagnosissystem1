import { NextRequest, NextResponse } from "next/server";
import { getFitbitAuthUrl, generateRandomState } from "@/utils/fitbit-api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Generate state parameter for OAuth security
    const state = generateRandomState();

    // In a real app, you'd store the state and userId in a database/session
    // For now, we'll encode it in the state parameter
    const stateData = {
      userId,
      timestamp: Date.now(),
      random: state,
    };

    const encodedState = Buffer.from(JSON.stringify(stateData)).toString(
      "base64url",
    );

    // Generate Fitbit authorization URL
    const authUrl = getFitbitAuthUrl(encodedState);

    return NextResponse.json({
      authUrl,
      state: encodedState,
    });
  } catch (error) {
    console.error("Error generating Fitbit auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 },
    );
  }
}
