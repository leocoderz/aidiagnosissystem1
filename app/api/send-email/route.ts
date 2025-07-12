import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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
            isPasswordReset
              ? `
            <h2 style="color: #1e293b; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
            <div style="background: #f59e0b; color: white; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
              <h3 style="margin: 0 0 10px 0; font-size: 18px;">🔑 Reset Your Password</h3>
              <p style="margin: 0; opacity: 0.9;">We received a request to reset your password.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Security Notice:</strong></p>
              <ul style="color: #92400e; font-size: 14px; margin: 10px 0 0 0; padding-left: 20px;">
                <li>This link will expire in 24 hours</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
                <li>Reset token: ${resetToken ? resetToken.substring(0, 8) + "..." : "N/A"}</li>
              </ul>
            </div>
          `
              : isPasswordChanged
                ? `
            <h2 style="color: #1e293b; text-align: center; margin-bottom: 20px;">Password Changed Successfully</h2>
            <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
              <h3 style="margin: 0 0 10px 0; font-size: 18px;">🔒 Your Password Has Been Updated</h3>
              <p style="margin: 0; opacity: 0.9;">Your account is now secured with your new password.</p>
            </div>
            
            <div style="background: #dcfce7; border: 1px solid #22c55e; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #166534; font-size: 14px;"><strong>Password Change Details:</strong></p>
              <ul style="color: #166534; font-size: 14px; margin: 10px 0 0 0; padding-left: 20px;">
                <li>Change completed: ${new Date().toLocaleString()}</li>
                <li>Account: ${email}</li>
                <li>If this wasn't you, contact support immediately</li>
              </ul>
            </div>
          `
                : isWelcome
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

    // Configure Gmail SMTP with nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER || "natarajmurali56@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD || "hdnw yoqy byxc dten",
      },
    });

    const emailType = isPasswordReset
      ? "Password Reset"
      : isPasswordChanged
        ? "Password Changed"
        : isWelcome
          ? "Welcome Email"
          : "Login Notification";

    console.log("=== SENDING EMAIL VIA GMAIL ===");
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Type: ${emailType}`);
    if (isPasswordReset) {
      console.log(`Reset Link: ${resetLink}`);
    }
    console.log("================================");

    // Send email via Gmail
    try {
      const mailOptions = {
        from: {
          name: process.env.NEXT_PUBLIC_APP_NAME || "SympCare24",
          address: process.env.GMAIL_USER || "natarajmurali56@gmail.com",
        },
        to: email,
        subject: subject,
        html: htmlContent,
        text: emailMessage, // Fallback text version
      };

      const emailResult = await transporter.sendMail(mailOptions);

      console.log("Email sent successfully:", emailResult.messageId);
      console.log("Response:", emailResult.response);
    } catch (emailError) {
      console.error("Gmail sending error:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: isPasswordReset
        ? "Password reset email sent successfully"
        : isPasswordChanged
          ? "Password change confirmation sent successfully"
          : isWelcome
            ? "Welcome email sent successfully"
            : "Login notification sent successfully",
      details: {
        email,
        name,
        type,
        emailType,
        timestamp: new Date().toISOString(),
        ...(isPasswordReset && { resetLinkSent: !!resetLink }),
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
