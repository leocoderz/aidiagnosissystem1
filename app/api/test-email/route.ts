import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json(
        { error: "Test email address is required" },
        { status: 400 },
      );
    }

    // Send a test welcome email
    const emailResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          name: "Test User",
          type: "patient",
          isWelcome: true,
        }),
      },
    );

    const emailData = await emailResponse.json();

    if (emailResponse.ok && emailData.success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully via Gmail",
        details: emailData.details,
      });
    } else {
      throw new Error(emailData.error || "Failed to send test email");
    }
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { error: `Test email failed: ${error.message}` },
      { status: 500 },
    );
  }
}
