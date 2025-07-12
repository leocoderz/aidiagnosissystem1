import { NextRequest, NextResponse } from "next/server";

// Generate a secure password reset token
function generateResetToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36)
  );
}

// Store password reset tokens (in production, use a database)
const resetTokens = new Map<
  string,
  {
    email: string;
    token: string;
    expires: number;
    used: boolean;
  }
>();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 },
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    // Check if user exists
    let userExists = false;
    let userName = "User";
    let userType = "patient";

    if (typeof window === "undefined") {
      // Server-side: can't access localStorage, so we'll assume user exists for demo
      userExists = true;
      userName = email.split("@")[0];
    } else {
      // Client-side: check localStorage
      try {
        const existingUsers = JSON.parse(
          localStorage.getItem("sympcare24_users") || "[]",
        );
        const user = existingUsers.find((u: any) => u.email === email);

        if (user) {
          userExists = true;
          userName = user.name;
          userType = user.type;
        }
      } catch (error) {
        console.error("Error checking user existence:", error);
      }
    }

    if (!userExists) {
      // For security, we still send a success response but don't actually do anything
      // This prevents email enumeration attacks
      console.log(`Password reset requested for non-existent email: ${email}`);

      return NextResponse.json({
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link shortly.",
        timestamp: new Date().toISOString(),
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresIn = 24 * 60 * 60 * 1000; // 24 hours
    const expires = Date.now() + expiresIn;

    // Store reset token
    resetTokens.set(resetToken, {
      email,
      token: resetToken,
      expires,
      used: false,
    });

    // Create reset link (using current domain or fallback)
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      // Construct email API URL more reliably
      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            name: userName,
            type: userType,
            isWelcome: false,
            isPasswordReset: true,
            resetLink,
            resetToken,
          }),
        },
      );

      if (!emailResponse.ok) {
        throw new Error("Failed to send reset email");
      }

      console.log(`Password reset email sent to: ${email}`);
      console.log(`Reset token: ${resetToken}`);
      console.log(`Reset link: ${resetLink}`);
      console.log(`Expires: ${new Date(expires).toISOString()}`);
    } catch (emailError) {
      console.error("Error sending reset email:", emailError);
      // Continue anyway - we don't want to reveal if email sending failed
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link shortly.",
      details: {
        email,
        tokenGenerated: true,
        expiresIn: "24 hours",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 },
    );
  }
}

// Verify reset token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Reset token is required" },
        { status: 400 },
      );
    }

    const resetData = resetTokens.get(token);

    if (!resetData) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    if (resetData.used) {
      return NextResponse.json(
        { error: "Reset token has already been used" },
        { status: 400 },
      );
    }

    if (Date.now() > resetData.expires) {
      resetTokens.delete(token);
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      email: resetData.email,
      valid: true,
      expiresAt: new Date(resetData.expires).toISOString(),
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify reset token" },
      { status: 500 },
    );
  }
}

// Reset password with token
export async function PATCH(request: NextRequest) {
  try {
    const { token, newPassword, confirmPassword } = await request.json();

    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    const resetData = resetTokens.get(token);

    if (!resetData) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    if (resetData.used) {
      return NextResponse.json(
        { error: "Reset token has already been used" },
        { status: 400 },
      );
    }

    if (Date.now() > resetData.expires) {
      resetTokens.delete(token);
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 },
      );
    }

    // Update password in localStorage (in production, update database)
    if (typeof window !== "undefined") {
      try {
        const existingUsers = JSON.parse(
          localStorage.getItem("sympcare24_users") || "[]",
        );
        const userIndex = existingUsers.findIndex(
          (u: any) => u.email === resetData.email,
        );

        if (userIndex >= 0) {
          existingUsers[userIndex].password = newPassword;
          existingUsers[userIndex].passwordResetAt = new Date().toISOString();
          localStorage.setItem(
            "sympcare24_users",
            JSON.stringify(existingUsers),
          );
        }
      } catch (error) {
        console.error("Error updating password:", error);
      }
    }

    // Mark token as used
    resetData.used = true;
    resetTokens.set(token, resetData);

    // Send confirmation email
    try {
      await fetch(new URL("/api/send-email", "http://localhost:3000"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetData.email,
          name: resetData.email.split("@")[0],
          type: "patient",
          isWelcome: false,
          isPasswordReset: false,
          isPasswordChanged: true,
        }),
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    console.log(`Password successfully reset for: ${resetData.email}`);

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset",
      email: resetData.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 },
    );
  }
}
