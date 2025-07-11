import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SympCare24 - 24/7 AI Health Companion",
  description:
    "Your 24/7 AI-powered health companion for symptom tracking and medical guidance",
  generator: "v0.dev",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            * {
              -webkit-user-select: none;
              -webkit-touch-callout: none;
              -webkit-tap-highlight-color: transparent;
            }
            input, textarea {
              -webkit-user-select: text;
            }
            body {
              touch-action: pan-x pan-y;
              -ms-touch-action: pan-x pan-y;
            }
          `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
