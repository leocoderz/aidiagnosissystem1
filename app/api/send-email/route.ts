import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, name, type } = await request.json();

    if (!email || !name || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Email content based on user type
    const subject = `Welcome to SympCare24 - Your AI Health Companion!`;
    const welcomeMessage =
      type === "patient"
        ? `Welcome to SympCare24! Your patient account has been successfully created.`
        : `Welcome to SympCare24! Your doctor account has been successfully created.`;

    // In production, you would use an email service like SendGrid, Nodemailer, etc.
    // For now, we'll simulate sending an email and log the details
    console.log("=== EMAIL NOTIFICATION ===");
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${welcomeMessage}`);
    console.log(`User: ${name} (${type})`);
    console.log("==========================");

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real implementation, you would integrate with an email service:
    /*
    // Example with a hypothetical email service
    const emailResult = await emailService.send({
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to SympCare24!</h2>
          <p>Hello ${name},</p>
          <p>${welcomeMessage}</p>
          <p>You can now access all features of our AI-powered health platform:</p>
          <ul>
            <li>AI symptom analysis</li>
            <li>Real-time health monitoring</li>
            <li>Professional medical consultations</li>
            <li>Secure health data management</li>
          </ul>
          <p>Get started by logging into your account.</p>
          <p>Best regards,<br>The SympCare24 Team</p>
        </div>
      `
    });
    */

    return NextResponse.json({
      success: true,
      message: "Welcome email sent successfully",
      details: {
        email,
        name,
        type,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 },
    );
  }
}
