import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/utils/fitbit-api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("Fitbit OAuth error:", error);
      return NextResponse.redirect(
        new URL(
          `/dashboard?fitbit_error=${encodeURIComponent(error)}`,
          request.url,
        ),
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard?fitbit_error=missing_code_or_state", request.url),
      );
    }

    try {
      // Decode state to get user information
      const stateData = JSON.parse(
        Buffer.from(state, "base64url").toString("utf-8"),
      );

      // Exchange authorization code for access token
      const tokenData = await exchangeCodeForToken(code);

      // In a real app, you'd store these tokens securely in a database
      // For now, we'll store them in localStorage via client-side redirect
      const tokenParams = new URLSearchParams({
        fitbit_connected: "true",
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        user_id: tokenData.user_id,
        expires_in: tokenData.expires_in.toString(),
      });

      return NextResponse.redirect(
        new URL(`/dashboard?${tokenParams.toString()}`, request.url),
      );
    } catch (tokenError) {
      console.error("Error exchanging code for token:", tokenError);
      return NextResponse.redirect(
        new URL("/dashboard?fitbit_error=token_exchange_failed", request.url),
      );
    }
  } catch (error) {
    console.error("Fitbit callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?fitbit_error=callback_failed", request.url),
    );
  }
}
