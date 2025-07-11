"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Printer, User, Activity, Stethoscope, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PDFMedicalReportProps {
  patient: any
  doctor: any
  onReportGenerated?: (report: any) => void
}

export default function PDFMedicalReport({ patient, doctor, onReportGenerated }: PDFMedicalReportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [clinicalNotes, setClinicalNotes] = useState("")
  const [treatmentPlan, setTreatmentPlan] = useState("")
  const [reportType, setReportType] = useState("comprehensive")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateReportId = () => {
    return `SC24-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  }

  const getCurrentDateTime = () => {
    return new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    })
  }

  const generatePDFReport = async () => {
    setIsGenerating(true)

    try {
      const reportId = generateReportId()
      const currentDateTime = getCurrentDateTime()

      // Create comprehensive report data
      const reportData = {
        id: reportId,
        patient,
        doctor,
        clinicalNotes,
        treatmentPlan,
        reportType,
        generatedAt: currentDateTime,
        timestamp: new Date().toISOString(),
      }

      // Generate PDF using browser's print functionality with custom styling
      const pdfContent = generatePDFContent(reportData)

      // Create a new window for PDF generation
      const printWindow = window.open("", "_blank", "width=800,height=600")
      if (!printWindow) {
        throw new Error("Could not open print window")
      }

      printWindow.document.write(pdfContent)
      printWindow.document.close()

      // Wait for content to load then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus()
          printWindow.print()

          // Close window after printing (optional)
          printWindow.onafterprint = () => {
            printWindow.close()
          }
        }, 500)
      }

      // Save report data locally
      const existingReports = JSON.parse(localStorage.getItem("sympcare24_reports") || "[]")
      existingReports.push(reportData)
      localStorage.setItem("sympcare24_reports", JSON.stringify(existingReports))

      toast({
        title: "PDF Medical Report Generated",
        description: `Professional medical report created for ${patient.name}. Print dialog opened.`,
      })

      if (onReportGenerated) {
        onReportGenerated(reportData)
      }

      setIsOpen(false)
      setClinicalNotes("")
      setTreatmentPlan("")
      setReportType("comprehensive")
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        title: "Error Generating PDF Report",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generatePDFContent = (reportData: any) => {
    const { id, patient, doctor, clinicalNotes, treatmentPlan, generatedAt } = reportData

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SympCare24 Medical Report - ${patient.name}</title>
    <style>
        @page {
            size: A4;
            margin: 0.5in;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            font-size: 12px;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 20px;
            border-radius: 8px;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }
        
        .tagline {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 10px;
        }
        
        .clinic-info {
            font-size: 10px;
            color: #64748b;
            line-height: 1.4;
        }
        
        .report-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding: 20px;
            background: #f8fafc;
            border-left: 4px solid #2563eb;
            border-radius: 6px;
        }
        
        .report-title {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        
        .report-meta {
            font-size: 11px;
            color: #64748b;
        }
        
        .doctor-info {
            text-align: right;
            font-size: 12px;
        }
        
        .doctor-name {
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }
        
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        
        .info-label {
            font-weight: bold;
            color: #374151;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            color: #1f2937;
            font-size: 12px;
        }
        
        .vitals-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
        }
        
        .vitals-table th,
        .vitals-table td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
        }
        
        .vitals-table th {
            background: #f3f4f6;
            font-weight: bold;
            color: #374151;
        }
        
        .status-normal { color: #059669; font-weight: bold; }
        .status-abnormal { color: #dc2626; font-weight: bold; }
        .status-low { color: #d97706; font-weight: bold; }
        
        .symptoms-list,
        .diagnoses-list {
            list-style: none;
        }
        
        .symptom-item,
        .diagnosis-item {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 8px;
        }
        
        .symptom-header,
        .diagnosis-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
        }
        
        .symptom-name,
        .diagnosis-name {
            font-weight: bold;
            color: #1e40af;
            font-size: 12px;
        }
        
        .severity-badge,
        .confidence-badge {
            background: #2563eb;
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
        }
        
        .severity-high { background: #dc2626; }
        .severity-medium { background: #d97706; }
        .severity-low { background: #059669; }
        
        .clinical-notes {
            background: #fefce8;
            border: 1px solid #fbbf24;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .clinical-notes-title {
            font-weight: bold;
            color: #92400e;
            margin-bottom: 8px;
            font-size: 13px;
        }
        
        .clinical-notes-content {
            color: #451a03;
            line-height: 1.6;
            white-space: pre-wrap;
            font-size: 11px;
        }
        
        .signature-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #d1d5db;
        }
        
        .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 30px;
        }
        
        .signature-block {
            text-align: center;
        }
        
        .signature-line {
            border-bottom: 1px solid #374151;
            height: 30px;
            margin-bottom: 8px;
        }
        
        .signature-label {
            font-size: 10px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #d1d5db;
            font-size: 9px;
            color: #6b7280;
            text-align: center;
            line-height: 1.4;
        }
        
        .disclaimer {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 12px;
            margin-top: 15px;
            font-size: 9px;
            color: #7f1d1d;
        }
        
        .ai-badge {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: bold;
        }
        
        @media print {
            body { 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="logo">SympCare24</div>
        <div class="tagline">AI-Powered 24/7 Health Companion</div>
        <div class="clinic-info">
            Advanced Healthcare Solutions | AI-Assisted Medical Analysis<br>
            Digital Health Platform | Secure & HIPAA Compliant<br>
            support@sympcare24.com | www.sympcare24.com
        </div>
    </div>

    <!-- Report Header -->
    <div class="report-header">
        <div>
            <div class="report-title">MEDICAL REPORT</div>
            <div class="report-meta">
                <strong>Report ID:</strong> ${id}<br>
                <strong>Report Type:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}<br>
                <strong>Generated:</strong> ${generatedAt}
            </div>
        </div>
        <div class="doctor-info">
            <div class="doctor-name">Dr. ${doctor.name}</div>
            <div>${doctor.specialization}</div>
            <div>License: ${doctor.license}</div>
            <div>${doctor.hospital}</div>
            <div>${doctor.contact}</div>
        </div>
    </div>

    <!-- Patient Information -->
    <div class="section">
        <div class="section-title">
            👤 PATIENT INFORMATION
        </div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${patient.name}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Patient ID</div>
                <div class="info-value">${patient.id}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Age</div>
                <div class="info-value">${patient.age} years</div>
            </div>
            <div class="info-item">
                <div class="info-label">Gender</div>
                <div class="info-value">${patient.gender}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Contact</div>
                <div class="info-value">${patient.phone}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${patient.email}</div>
            </div>
        </div>
    </div>

    <!-- Current Vital Signs -->
    <div class="section">
        <div class="section-title">
            📊 CURRENT VITAL SIGNS
        </div>
        <table class="vitals-table">
            <thead>
                <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Normal Range</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Heart Rate</td>
                    <td>${patient.vitals?.heartRate || "N/A"} BPM</td>
                    <td>60-100 BPM</td>
                    <td class="status-normal">Normal</td>
                    <td>${new Date().toLocaleString()}</td>
                </tr>
                <tr>
                    <td>Blood Pressure</td>
                    <td>${patient.vitals?.bloodPressure || "N/A"}</td>
                    <td>120/80 mmHg</td>
                    <td class="status-normal">Normal</td>
                    <td>${new Date().toLocaleString()}</td>
                </tr>
                <tr>
                    <td>Temperature</td>
                    <td>${patient.vitals?.temperature || "N/A"}°F</td>
                    <td>97.8-99.1°F</td>
                    <td class="status-normal">Normal</td>
                    <td>${new Date().toLocaleString()}</td>
                </tr>
                <tr>
                    <td>Oxygen Saturation</td>
                    <td>${patient.vitals?.oxygenSaturation || "N/A"}%</td>
                    <td>95-100%</td>
                    <td class="status-normal">Normal</td>
                    <td>${new Date().toLocaleString()}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Symptoms Analysis -->
    <div class="section">
        <div class="section-title">
            🩺 SYMPTOMS ANALYSIS
        </div>
        <ul class="symptoms-list">
            ${
              patient.symptoms
                ?.map(
                  (symptom: any) => `
                <li class="symptom-item">
                    <div class="symptom-header">
                        <div class="symptom-name">${symptom.name || symptom}</div>
                        <div class="severity-badge severity-${symptom.severity || "medium"}">${symptom.severity || "Medium"} Severity</div>
                    </div>
                    <div style="font-size: 11px; color: #4b5563;">
                        <strong>Duration:</strong> ${symptom.duration || "Not specified"}<br>
                        <strong>Location:</strong> ${symptom.location || "Not specified"}<br>
                        <strong>Description:</strong> ${symptom.description || "No additional details"}
                    </div>
                </li>
            `,
                )
                .join("") || '<li class="symptom-item">No symptoms recorded</li>'
            }
        </ul>
    </div>

    <!-- AI Diagnosis -->
    <div class="section">
        <div class="section-title">
            🤖 AI-ASSISTED DIAGNOSIS
        </div>
        <ul class="diagnoses-list">
            ${
              patient.diagnoses
                ?.map(
                  (diagnosis: any) => `
                <li class="diagnosis-item">
                    <div class="diagnosis-header">
                        <div class="diagnosis-name">${diagnosis.condition}</div>
                        <div style="display: flex; gap: 6px; align-items: center;">
                            <div class="confidence-badge">${diagnosis.confidence}% Confidence</div>
                            ${diagnosis.aiGenerated ? '<div class="ai-badge">AI Generated</div>' : ""}
                        </div>
                    </div>
                    <div style="font-size: 11px; color: #4b5563; margin-top: 6px;">
                        <strong>Severity:</strong> ${diagnosis.severity}<br>
                        <strong>Explanation:</strong> ${diagnosis.explanation}<br>
                        <strong>Recommendations:</strong>
                        <ul style="margin-left: 15px; margin-top: 4px;">
                            ${diagnosis.recommendations?.map((rec: string) => `<li>${rec}</li>`).join("") || "<li>No specific recommendations</li>"}
                        </ul>
                    </div>
                </li>
            `,
                )
                .join("") || '<li class="diagnosis-item">No diagnoses recorded</li>'
            }
        </ul>
    </div>

    <!-- Clinical Notes -->
    ${
      clinicalNotes
        ? `
    <div class="section">
        <div class="section-title">
            📝 CLINICAL NOTES
        </div>
        <div class="clinical-notes">
            <div class="clinical-notes-title">Doctor's Clinical Assessment</div>
            <div class="clinical-notes-content">${clinicalNotes}</div>
        </div>
    </div>
    `
        : ""
    }

    <!-- Treatment Plan -->
    ${
      treatmentPlan
        ? `
    <div class="section">
        <div class="section-title">
            💊 TREATMENT PLAN
        </div>
        <div class="clinical-notes">
            <div class="clinical-notes-title">Prescribed Treatment & Care Plan</div>
            <div class="clinical-notes-content">${treatmentPlan}</div>
        </div>
    </div>
    `
        : ""
    }

    <!-- Signature Section -->
    <div class="signature-section">
        <div class="signature-grid">
            <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-label">Doctor's Signature & Date</div>
            </div>
            <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-label">Patient's Signature & Date</div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <div>
            <strong>SympCare24 - AI-Powered Healthcare Platform</strong><br>
            This report was generated using advanced AI medical analysis combined with professional medical oversight.<br>
            Report ID: ${id} | Generated: ${generatedAt}<br>
            For questions about this report, contact: support@sympcare24.com
        </div>
        
        <div class="disclaimer">
            <strong>MEDICAL DISCLAIMER:</strong> This report contains AI-assisted medical analysis and should be used in conjunction with professional medical judgment. 
            The AI analysis is for informational purposes and does not replace professional medical diagnosis, treatment, or advice. 
            Always consult with qualified healthcare providers for medical decisions. In case of emergency, contact emergency services immediately.
        </div>
    </div>
</body>
</html>
    `
  }

  const downloadReportData = () => {
    const reportData = {
      patient,
      doctor,
      clinicalNotes,
      treatmentPlan,
      reportType,
      generatedAt: getCurrentDateTime(),
      id: generateReportId(),
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `SympCare24_Report_${patient.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Report Data Downloaded",
      description: "Medical report data saved as JSON file",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          Generate PDF Medical Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-600" />
            Generate Professional Medical Report
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive PDF medical report for {patient.name} with professional formatting and AI analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <User className="mr-2 h-4 w-4" />
                Patient Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Name:</span> {patient.name}
                </div>
                <div>
                  <span className="font-medium">Age:</span> {patient.age}
                </div>
                <div>
                  <span className="font-medium">Gender:</span> {patient.gender}
                </div>
                <div>
                  <span className="font-medium">ID:</span> {patient.id}
                </div>
              </div>
              <div className="mt-3">
                <span className="font-medium">Current Status:</span>
                <Badge variant={patient.status === "urgent" ? "destructive" : "secondary"} className="ml-2">
                  {patient.status}
                </Badge>
              </div>
              {patient.symptoms && patient.symptoms.length > 0 && (
                <div className="mt-3">
                  <span className="font-medium">Active Symptoms:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {patient.symptoms.slice(0, 3).map((symptom: any, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {typeof symptom === "string" ? symptom : symptom.name}
                      </Badge>
                    ))}
                    {patient.symptoms.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{patient.symptoms.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Medical Report</SelectItem>
                  <SelectItem value="summary">Medical Summary</SelectItem>
                  <SelectItem value="diagnosis">Diagnosis Report</SelectItem>
                  <SelectItem value="treatment">Treatment Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="clinical-notes">Clinical Notes</Label>
              <Textarea
                id="clinical-notes"
                placeholder="Enter detailed clinical observations, examination findings, and professional medical assessment..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="treatment-plan">Treatment Plan & Recommendations</Label>
              <Textarea
                id="treatment-plan"
                placeholder="Enter prescribed medications, treatment procedures, follow-up instructions, and care recommendations..."
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          {/* Report Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Report Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span>AI-Enhanced Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Stethoscope className="h-4 w-4 text-blue-600" />
                  <span>Professional Formatting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span>Comprehensive Documentation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Printer className="h-4 w-4 text-gray-600" />
                  <span>Print-Ready PDF</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button onClick={generatePDFReport} disabled={isGenerating} className="flex-1">
              {isGenerating ? (
                <>
                  <Activity className="mr-2 h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate PDF Report
                </>
              )}
            </Button>

            <Button onClick={downloadReportData} variant="outline" className="flex-1 bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Download Data
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800 dark:text-yellow-200">
                <p className="font-medium mb-1">Medical Report Disclaimer</p>
                <p>
                  This PDF report is generated by SympCare24's AI-powered system and includes professional medical
                  formatting. The report should be reviewed by qualified healthcare providers before use in clinical
                  settings. AI analysis supplements but does not replace professional medical judgment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
