import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      name,
      type,
      isWelcome = true,
      isPasswordReset = false,
      isPasswordChanged = false,
      resetLink,
      resetToken,
    } = await request.json();

    if (!email || !name || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Email content based on user type and purpose
    const subject = isPasswordReset
      ? `SympCare24 - Password Reset Request`
      : isPasswordChanged
        ? `SympCare24 - Password Successfully Changed`
        : isWelcome
          ? `Welcome to SympCare24 - Your AI Health Companion!`
          : `SympCare24 Login Notification`;

    const emailMessage = isPasswordReset
      ? `You have requested to reset your password for your SympCare24 account. Click the link below to reset your password.`
      : isPasswordChanged
        ? `Your SympCare24 account password has been successfully changed.`
        : isWelcome
          ? type === "patient"
            ? `Welcome to SympCare24! Your patient account has been successfully created. You can now access our AI-powered health platform with features like symptom analysis, health monitoring, and professional consultations.`
            : `Welcome to SympCare24! Your doctor account has been successfully created. You now have access to our comprehensive patient management system and AI diagnostic tools.`
          : `Hello ${name}, you have successfully signed in to your SympCare24 account.`;

    // Enhanced email template
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">SympCare24</h1>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Your AI Health Companion</p>
          </div>
          
          ${
            isWelcome
              ? `
            <h2 style="color: #1e293b; text-align: center; margin-bottom: 20px;">Welcome aboard, ${name}!</h2>
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 10px 0; font-size: 18px;">Your ${type} account is ready!</h3>
              <p style="margin: 0; opacity: 0.9;">Start exploring our AI-powered health platform today.</p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1e293b; margin-bottom: 15px;">What you can do now:</h3>
              <ul style="color: #475569; padding-left: 20px; line-height: 1.6;">
                ${
                  type === "patient"
                    ? `
                  <li>Analyze symptoms with AI</li>
                  <li>Track your health metrics</li>
                  <li>Schedule consultations</li>
                  <li>Manage your medical history</li>
                `
                    : `
                  <li>Access patient management dashboard</li>
                  <li>Review AI diagnostic insights</li>
                  <li>Manage appointments and consultations</li>
                  <li>Track patient health metrics</li>
                `
                }
              </ul>
            </div>
          `
              : `
            <h2 style="color: #1e293b; text-align: center; margin-bottom: 20px;">Welcome back, ${name}!</h2>
            <div style="background: #10b981; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <p style="margin: 0;">✅ Successfully signed in to your ${type} account</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Login time: ${new Date().toLocaleString()}</p>
            </div>
          `
          }
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; margin: 0; font-size: 14px;">Need help? Contact our support team</p>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">support@sympcare24.com</p>
          </div>
        </div>
      </div>
    `;

    // In production, you would use an email service like SendGrid, Nodemailer, etc.
    // For now, we'll simulate sending an email and log the details
    console.log("=== EMAIL NOTIFICATION ===");
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${emailMessage}`);
    console.log(`User: ${name} (${type})`);
    console.log(`Type: ${isWelcome ? "Welcome Email" : "Login Notification"}`);
    console.log(`HTML Content: ${htmlContent.substring(0, 200)}...`);
    console.log("===========================");

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real implementation, you would integrate with an email service:
    /*
    // Example with a hypothetical email service
    const emailResult = await emailService.send({
      to: email,
      subject: subject,
      html: htmlContent
    });
    */

    return NextResponse.json({
      success: true,
      message: isWelcome
        ? "Welcome email sent successfully"
        : "Login notification sent successfully",
      details: {
        email,
        name,
        type,
        emailType: isWelcome ? "welcome" : "login",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email notification" },
      { status: 500 },
    );
  }
}
