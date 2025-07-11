"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, Share2, Printer, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DataExportProps {
  user: any
  symptoms: any[]
  diagnoses: any[]
  vitals?: any
}

export default function DataExport({ user, symptoms, diagnoses, vitals }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const generateHealthReport = () => {
    const currentDate = new Date().toLocaleDateString()
    const currentTime = new Date().toLocaleTimeString()

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>MediAI Health Report - ${user.name}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .report-title {
            font-size: 24px;
            color: #1f2937;
            margin: 10px 0;
          }
          .patient-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #2563eb;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 20px;
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .symptom-card, .diagnosis-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
          }
          .severity-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            color: white;
          }
          .severity-low { background-color: #10b981; }
          .severity-medium { background-color: #f59e0b; }
          .severity-high { background-color: #ef4444; }
          .vitals-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          .vital-card {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .vital-value {
            font-size: 24px;
            font-weight: bold;
            color: #0369a1;
          }
          .vital-label {
            font-size: 14px;
            color: #64748b;
            margin-top: 5px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #64748b;
            font-size: 14px;
          }
          .disclaimer {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .timestamp {
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏥 MediAI</div>
          <div class="report-title">Comprehensive Health Report</div>
          <div class="timestamp">Generated on ${currentDate} at ${currentTime}</div>
        </div>

        <div class="patient-info">
          <h3>Patient Information</h3>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Phone:</strong> ${user.phone || "Not provided"}</p>
          <p><strong>Address:</strong> ${user.address || "Not provided"}</p>
          <p><strong>Emergency Contact:</strong> ${user.emergencyContact || "Not provided"}</p>
          <p><strong>Report ID:</strong> MED-${Date.now()}</p>
        </div>

        ${
          vitals
            ? `
        <div class="section">
          <h2 class="section-title">📊 Current Vital Signs</h2>
          <div class="vitals-grid">
            <div class="vital-card">
              <div class="vital-value">${vitals.heartRate || "N/A"}</div>
              <div class="vital-label">Heart Rate (BPM)</div>
            </div>
            <div class="vital-card">
              <div class="vital-value">${vitals.bloodPressure || "N/A"}</div>
              <div class="vital-label">Blood Pressure</div>
            </div>
            <div class="vital-card">
              <div class="vital-value">${vitals.temperature || "N/A"}</div>
              <div class="vital-label">Temperature (°F)</div>
            </div>
            <div class="vital-card">
              <div class="vital-value">${vitals.oxygenSaturation || "N/A"}</div>
              <div class="vital-label">Oxygen Saturation (%)</div>
            </div>
          </div>
        </div>
        `
            : ""
        }

        <div class="section">
          <h2 class="section-title">🩺 Symptoms History (${symptoms.length} total)</h2>
          ${
            symptoms.length === 0
              ? "<p>No symptoms recorded.</p>"
              : symptoms
                  .map(
                    (symptom) => `
              <div class="symptom-card">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                  <h4 style="margin: 0;">${symptom.name}</h4>
                  <span class="severity-badge ${
                    symptom.severity <= 3 ? "severity-low" : symptom.severity <= 6 ? "severity-medium" : "severity-high"
                  }">
                    Severity: ${symptom.severity}/10
                  </span>
                </div>
                ${symptom.duration ? `<p><strong>Duration:</strong> ${symptom.duration}</p>` : ""}
                ${symptom.location ? `<p><strong>Location:</strong> ${symptom.location}</p>` : ""}
                ${symptom.description ? `<p><strong>Description:</strong> ${symptom.description}</p>` : ""}
                <p class="timestamp">Recorded: ${new Date(symptom.timestamp).toLocaleString()}</p>
              </div>
            `,
                  )
                  .join("")
          }
        </div>

        <div class="section">
          <h2 class="section-title">🔬 AI Diagnoses & Analysis (${diagnoses.length} total)</h2>
          ${
            diagnoses.length === 0
              ? "<p>No diagnoses generated yet.</p>"
              : diagnoses
                  .map(
                    (diagnosis) => `
              <div class="diagnosis-card">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                  <h4 style="margin: 0;">${diagnosis.condition}</h4>
                  <span class="severity-badge ${
                    diagnosis.severity === "mild"
                      ? "severity-low"
                      : diagnosis.severity === "moderate"
                        ? "severity-medium"
                        : "severity-high"
                  }">
                    ${diagnosis.severity} - ${diagnosis.confidence}% confidence
                  </span>
                </div>
                ${diagnosis.explanation ? `<p><strong>Analysis:</strong> ${diagnosis.explanation}</p>` : ""}
                ${
                  diagnosis.recommendations
                    ? `
                  <div>
                    <strong>Recommendations:</strong>
                    <ul>
                      ${diagnosis.recommendations.map((rec) => `<li>${rec}</li>`).join("")}
                    </ul>
                  </div>
                `
                    : ""
                }
                ${diagnosis.seekImmediateCare ? '<p style="color: #ef4444; font-weight: bold;">⚠️ Immediate medical attention recommended</p>' : ""}
                <p class="timestamp">Generated: ${new Date(diagnosis.timestamp).toLocaleString()}</p>
              </div>
            `,
                  )
                  .join("")
          }
        </div>

        <div class="disclaimer">
          <h4>⚠️ Medical Disclaimer</h4>
          <p>This report is generated by MediAI for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers with any questions regarding medical conditions. In case of medical emergency, call 911 immediately.</p>
        </div>

        <div class="footer">
          <p>Generated by MediAI - Advanced AI Medical Assistant</p>
          <p>Report ID: MED-${Date.now()} | Generated: ${currentDate} ${currentTime}</p>
          <p>This document contains confidential medical information. Handle according to HIPAA guidelines.</p>
        </div>
      </body>
      </html>
    `
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const htmlContent = generateHealthReport()

      // Create a new window for printing
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()

        // Wait for content to load then print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
          }, 500)
        }
      }

      toast({
        title: "PDF Export Ready",
        description: "Your health report is ready for printing/saving as PDF",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to generate PDF report",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const exportToJSON = () => {
    const data = {
      patient: user,
      symptoms,
      diagnoses,
      vitals,
      exportDate: new Date().toISOString(),
      reportId: `MED-${Date.now()}`,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mediai-health-data-${user.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Data Exported",
      description: "Your health data has been downloaded as JSON",
    })
  }

  const shareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MediAI Health Report",
          text: `Health report for ${user.name} - ${symptoms.length} symptoms, ${diagnoses.length} diagnoses`,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to copying to clipboard
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    const reportSummary = `
MediAI Health Report - ${user.name}
Generated: ${new Date().toLocaleDateString()}

Symptoms Recorded: ${symptoms.length}
AI Diagnoses: ${diagnoses.length}

Recent Symptoms:
${symptoms
  .slice(0, 3)
  .map((s) => `• ${s.name} (Severity: ${s.severity}/10)`)
  .join("\n")}

Recent Diagnoses:
${diagnoses
  .slice(0, 3)
  .map((d) => `• ${d.condition} (${d.confidence}% confidence)`)
  .join("\n")}

Generated by MediAI - Advanced AI Medical Assistant
    `

    navigator.clipboard.writeText(reportSummary).then(() => {
      toast({
        title: "Report Copied",
        description: "Health report summary copied to clipboard",
      })
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Export Health Data
        </CardTitle>
        <CardDescription>Download your complete medical records and AI analysis reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{symptoms.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Symptoms Recorded</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{diagnoses.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">AI Diagnoses</div>
          </div>
        </div>

        <Separator />

        {/* Export Options */}
        <div className="space-y-3">
          <Button onClick={exportToPDF} disabled={isExporting} className="w-full justify-start h-12">
            <Printer className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Export as PDF Report</div>
              <div className="text-sm opacity-70">Professional medical report format</div>
            </div>
          </Button>

          <Button variant="outline" onClick={exportToJSON} className="w-full justify-start h-12 bg-transparent">
            <Download className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Download Raw Data (JSON)</div>
              <div className="text-sm opacity-70">Complete data export for backup</div>
            </div>
          </Button>

          <Button variant="outline" onClick={shareReport} className="w-full justify-start h-12 bg-transparent">
            <Share2 className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Share Report Summary</div>
              <div className="text-sm opacity-70">Share via system share or clipboard</div>
            </div>
          </Button>
        </div>

        <Separator />

        {/* Report Preview */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Report Contents:</h4>
          <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
            <li>• Patient information and demographics</li>
            <li>• Complete symptom history with severity ratings</li>
            <li>• AI diagnosis results and confidence levels</li>
            <li>• Medical recommendations and treatment suggestions</li>
            <li>• Vital signs and health metrics (if available)</li>
            <li>• Professional medical disclaimers</li>
          </ul>
        </div>

        {/* Privacy Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
          <div className="flex items-start">
            <Calendar className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-yellow-800 dark:text-yellow-200">Privacy Notice</div>
              <div className="text-yellow-700 dark:text-yellow-300">
                Your health data is processed locally and securely. Reports contain sensitive medical information -
                handle according to privacy guidelines.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
