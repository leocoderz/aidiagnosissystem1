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

interface PatientHealthReportProps {
  patient: any
  doctor: any
  onReportGenerated?: (report: any) => void
}

export default function PatientHealthReport({ patient, doctor, onReportGenerated }: PatientHealthReportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [clinicalNotes, setClinicalNotes] = useState("")
  const [treatmentPlan, setTreatmentPlan] = useState("")
  const [reportType, setReportType] = useState("comprehensive")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateReportId = () => {
    return `MR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
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

  const getVitalStatus = (vital: string, value: any) => {
    switch (vital) {
      case "heartRate":
        if (value >= 60 && value <= 100) return { status: "Normal", color: "text-green-600", range: "60-100 BPM" }
        return { status: "Abnormal", color: "text-red-600", range: "60-100 BPM" }
      case "temperature":
        if (value >= 97 && value <= 100) return { status: "Normal", color: "text-green-600", range: "97.0-100.0°F" }
        return { status: "Abnormal", color: "text-red-600", range: "97.0-100.0°F" }
      case "oxygenSaturation":
        if (value >= 95) return { status: "Normal", color: "text-green-600", range: "≥95%" }
        return { status: "Low", color: "text-red-600", range: "≥95%" }
      case "bloodPressure":
        return { status: "Recorded", color: "text-blue-600", range: "Normal: <120/80" }
      default:
        return { status: "Recorded", color: "text-gray-600", range: "N/A" }
    }
  }

  const generateProfessionalReport = () => {
    const reportId = generateReportId()
    const currentDateTime = getCurrentDateTime()

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

    const reportHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medical Report - ${patient.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 40px;
            max-width: 210mm;
            margin: 0 auto;
        }
        
        .letterhead {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .clinic-name {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }
        
        .clinic-subtitle {
            font-size: 16px;
            color: #64748b;
            margin-bottom: 10px;
        }
        
        .clinic-info {
            font-size: 12px;
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
        }
        
        .report-title {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        
        .report-meta {
            font-size: 12px;
            color: #64748b;
        }
        
        .doctor-info {
            text-align: right;
            font-size: 14px;
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
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .section-icon {
            width: 20px;
            height: 20px;
            fill: currentColor;
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
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            color: #1f2937;
            font-size: 14px;
        }
        
        .vitals-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .vitals-table th,
        .vitals-table td {
            border: 1px solid #d1d5db;
            padding: 12px;
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
            padding: 15px;
            margin-bottom: 10px;
        }
        
        .symptom-header,
        .diagnosis-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .symptom-name,
        .diagnosis-name {
            font-weight: bold;
            color: #1e40af;
        }
        
        .severity-badge,
        .confidence-badge {
            background: #2563eb;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
        }
        
        .severity-high { background: #dc2626; }
        .severity-medium { background: #d97706; }
        .severity-low { background: #059669; }
        
        .symptom-details,
        .diagnosis-details {
            font-size: 13px;
            color: #4b5563;
            line-height: 1.5;
        }
        
        .recommendations {
            margin-top: 10px;
        }
        
        .recommendations ul {
            margin-left: 20px;
            margin-top: 5px;
        }
        
        .recommendations li {
            margin-bottom: 3px;
        }
        
        .clinical-notes {
            background: #fefce8;
            border: 1px solid #fbbf24;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .clinical-notes-title {
            font-weight: bold;
            color: #92400e;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .clinical-notes-content {
            color: #451a03;
            line-height: 1.6;
            white-space: pre-wrap;
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
            height: 40px;
            margin-bottom: 10px;
        }
        
        .signature-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #d1d5db;
            font-size: 10px;
            color: #6b7280;
            text-align: center;
            line-height: 1.4;
        }
        
        .disclaimer {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
            font-size: 11px;
            color: #7f1d1d;
        }
        
        @media print {
            body { padding: 20px; }
            .no-print { display: none; }
        }
        
        @page {
            margin: 1in;
            size: letter;
        }
    </style>
</head>
<body>
    <!-- Medical Letterhead -->
    <div class="letterhead">
        <div class="clinic-name">MediAI Medical Center</div>
        <div class="clinic-subtitle">Advanced AI-Powered Healthcare Solutions</div>
        <div class="clinic-info">
            123 Healthcare Boulevard, Medical District, State 12345<br>
            Phone: (555) 123-MEDI | Fax: (555) 123-FAX | Email: info@mediai.com<br>
            License: HC-2024-AI-001 | Accredited by Joint Commission
        </div>
    </div>

    <!-- Report Header -->
    <div class="report-header">
        <div>
            <div class="report-title">MEDICAL REPORT</div>
            <div class="report-meta">
                <strong>Report ID:</strong> ${reportId}<br>
                <strong>Report Type:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}<br>
                <strong>Generated:</strong> ${currentDateTime}
            </div>
        </div>
        <div class="doctor-info">
            <div class="doctor-name">Dr. ${doctor.name}</div>
            <div>${doctor.specialization || "General Medicine"}</div>
            <div>License: ${doctor.licenseNumber || "MD-2024-001"}</div>
            <div>Phone: (555) 123-4567</div>
            <div>Email: ${doctor.email}</div>
        </div>
    </div>

    <!-- Patient Information -->
    <div class="section">
        <div class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            PATIENT INFORMATION
        </div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${patient.name}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Date of Birth</div>
                <div class="info-value">${patient.dateOfBirth || "Not specified"}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Gender</div>
                <div class="info-value">${patient.gender || "Not specified"}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Patient ID</div>
                <div class="info-value">${patient.id}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Phone Number</div>
                <div class="info-value">${patient.phone || "Not provided"}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Email Address</div>
                <div class="info-value">${patient.email}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Address</div>
                <div class="info-value">${patient.address || "Not provided"}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Emergency Contact</div>
                <div class="info-value">${patient.emergencyContact || "Not provided"}</div>
            </div>
        </div>
    </div>

    <!-- Vital Signs -->
    ${
      patient.vitals
        ? `
    <div class="section">
        <div class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            VITAL SIGNS
        </div>
        <table class="vitals-table">
            <thead>
                <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Normal Range</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(patient.vitals)
                  .map(([key, value]) => {
                    const vitalInfo = getVitalStatus(key, value)
                    return `
                    <tr>
                        <td>${key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</td>
                        <td><strong>${value}${key === "heartRate" ? " BPM" : key === "temperature" ? "°F" : key === "oxygenSaturation" ? "%" : ""}</strong></td>
                        <td>${vitalInfo.range}</td>
                        <td class="status-${vitalInfo.status.toLowerCase()}">${vitalInfo.status}</td>
                    </tr>
                    `
                  })
                  .join("")}
            </tbody>
        </table>
    </div>
    `
        : ""
    }

    <!-- Symptoms -->
    ${
      patient.symptoms && patient.symptoms.length > 0
        ? `
    <div class="section">
        <div class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            REPORTED SYMPTOMS
        </div>
        <ul class="symptoms-list">
            ${patient.symptoms
              .map(
                (symptom, index) => `
            <li class="symptom-item">
                <div class="symptom-header">
                    <div class="symptom-name">${symptom.name}</div>
                    <div class="severity-badge ${symptom.severity >= 7 ? "severity-high" : symptom.severity >= 4 ? "severity-medium" : "severity-low"}">
                        Severity: ${symptom.severity}/10
                    </div>
                </div>
                <div class="symptom-details">
                    ${symptom.duration ? `<strong>Duration:</strong> ${symptom.duration}<br>` : ""}
                    ${symptom.location ? `<strong>Location:</strong> ${symptom.location}<br>` : ""}
                    ${symptom.description ? `<strong>Description:</strong> ${symptom.description}<br>` : ""}
                    <strong>Reported:</strong> ${new Date(symptom.timestamp).toLocaleString()}
                </div>
            </li>
            `,
              )
              .join("")}
        </ul>
    </div>
    `
        : ""
    }

    <!-- AI Diagnoses -->
    ${
      patient.diagnoses && patient.diagnoses.length > 0
        ? `
    <div class="section">
        <div class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11H7l4-4 4 4h-2a4 4 0 0 1-4 4z"></path>
                <path d="M13 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path>
                <path d="M17 17h2a2 2 0 0 0 2-2v-2a4 4 0 0 0-8 0v2a2 2 0 0 0 2 2z"></path>
            </svg>
            AI-ASSISTED DIAGNOSTIC FINDINGS
        </div>
        <ul class="diagnoses-list">
            ${patient.diagnoses
              .map(
                (diagnosis, index) => `
            <li class="diagnosis-item">
                <div class="diagnosis-header">
                    <div class="diagnosis-name">${diagnosis.condition}</div>
                    <div class="confidence-badge">Confidence: ${diagnosis.confidence}%</div>
                </div>
                <div class="diagnosis-details">
                    <strong>Severity:</strong> ${diagnosis.severity}<br>
                    ${diagnosis.explanation ? `<strong>AI Analysis:</strong> ${diagnosis.explanation}<br>` : ""}
                    <strong>Generated:</strong> ${new Date(diagnosis.timestamp).toLocaleString()}
                    ${
                      diagnosis.recommendations && diagnosis.recommendations.length > 0
                        ? `
                    <div class="recommendations">
                        <strong>AI Recommendations:</strong>
                        <ul>
                            ${diagnosis.recommendations.map((rec) => `<li>${rec}</li>`).join("")}
                        </ul>
                    </div>
                    `
                        : ""
                    }
                </div>
            </li>
            `,
              )
              .join("")}
        </ul>
    </div>
    `
        : ""
    }

    <!-- Clinical Assessment -->
    ${
      clinicalNotes
        ? `
    <div class="section">
        <div class="clinical-notes">
            <div class="clinical-notes-title">
                <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <line x1="10" y1="9" x2="8" y2="9"></line>
                </svg>
                CLINICAL ASSESSMENT
            </div>
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
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11H7l4-4 4 4h-2a4 4 0 0 1-4 4z"></path>
                <path d="M13 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path>
                <path d="M17 17h2a2 2 0 0 0 2-2v-2a4 4 0 0 0-8 0v2a2 2 0 0 0 2 2z"></path>
            </svg>
            TREATMENT PLAN & RECOMMENDATIONS
        </div>
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 20px; line-height: 1.6; white-space: pre-wrap;">${treatmentPlan}</div>
    </div>
    `
        : ""
    }

    <!-- Medical History -->
    ${
      patient.medicalHistory || patient.medications || patient.allergies
        ? `
    <div class="section">
        <div class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <line x1="10" y1="9" x2="8" y2="9"></line>
            </svg>
            MEDICAL HISTORY & MEDICATIONS
        </div>
        <div class="info-grid">
            ${
              patient.medications
                ? `
            <div class="info-item">
                <div class="info-label">Current Medications</div>
                <div class="info-value">${patient.medications}</div>
            </div>
            `
                : ""
            }
            ${
              patient.allergies
                ? `
            <div class="info-item">
                <div class="info-label">Known Allergies</div>
                <div class="info-value">${patient.allergies}</div>
            </div>
            `
                : ""
            }
            ${
              patient.medicalHistory
                ? `
            <div class="info-item">
                <div class="info-label">Medical History</div>
                <div class="info-value">${patient.medicalHistory}</div>
            </div>
            `
                : ""
            }
            <div class="info-item">
                <div class="info-label">Last Visit</div>
                <div class="info-value">${new Date(patient.lastVisit).toLocaleDateString()}</div>
            </div>
        </div>
    </div>
    `
        : ""
    }

    <!-- Digital Signature Section -->
    <div class="signature-section">
        <div class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"></path>
                <path d="M3 10h18M7 21h10"></path>
            </svg>
            DIGITAL VERIFICATION & SIGNATURES
        </div>
        <div class="signature-grid">
            <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-label">
                    <strong>Dr. ${doctor.name}</strong><br>
                    ${doctor.specialization || "General Medicine"}<br>
                    License: ${doctor.licenseNumber || "MD-2024-001"}<br>
                    Date: ${new Date().toLocaleDateString()}
                </div>
            </div>
            <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-label">
                    <strong>Digital Timestamp</strong><br>
                    Report ID: ${reportId}<br>
                    Generated: ${currentDateTime}<br>
                    System: MediAI v2.0
                </div>
            </div>
        </div>
    </div>

    <!-- Footer & Disclaimers -->
    <div class="footer">
        <div>
            <strong>MediAI Medical Center</strong> | 123 Healthcare Boulevard, Medical District, State 12345<br>
            Phone: (555) 123-MEDI | Email: info@mediai.com | www.mediai.com<br>
            Licensed Healthcare Facility | Joint Commission Accredited | HIPAA Compliant
        </div>
        
        <div class="disclaimer">
            <strong>MEDICAL DISCLAIMER:</strong> This report contains confidential medical information and is intended solely for the use of the patient and authorized healthcare providers. 
            The AI-assisted diagnostic findings are supplementary tools and should not replace professional medical judgment. 
            All diagnoses and treatment recommendations require validation by licensed medical professionals. 
            This document is protected under HIPAA regulations and patient privacy laws. 
            Unauthorized disclosure is strictly prohibited and may result in legal action.
        </div>
    </div>
</body>
</html>
    `

    return { reportHTML, reportData }
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const { reportHTML, reportData } = generateProfessionalReport()

      // Open report in new window for printing
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(reportHTML)
        printWindow.document.close()

        // Auto-focus and print
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
        }, 1000)
      }

      // Save report data
      const existingReports = JSON.parse(localStorage.getItem("mediai_reports") || "[]")
      existingReports.push(reportData)
      localStorage.setItem("mediai_reports", JSON.stringify(existingReports))

      toast({
        title: "Medical Report Generated",
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
      toast({
        title: "Error Generating Report",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const exportHealthData = () => {
    const healthData = {
      patient: {
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
      },
      vitals: patient.vitals,
      symptoms: patient.symptoms || [],
      diagnoses: patient.diagnoses || [],
      medications: patient.medications,
      allergies: patient.allergies,
      medicalHistory: patient.medicalHistory,
      exportDate: new Date().toISOString(),
      exportedBy: doctor.name,
    }

    const dataStr = JSON.stringify(healthData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${patient.name.replace(/\s+/g, "_")}_health_data_${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Health Data Exported",
      description: `Complete health data exported for ${patient.name}`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          Generate Medical Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Medical Report - {patient.name}
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive medical report with AI diagnostics and clinical assessment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Name:</strong> {patient.name}
                </div>
                <div>
                  <strong>Email:</strong> {patient.email}
                </div>
                <div>
                  <strong>Phone:</strong> {patient.phone}
                </div>
                <div>
                  <strong>Last Visit:</strong> {new Date(patient.lastVisit).toLocaleDateString()}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4 mt-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {patient.symptoms?.length || 0} Symptoms
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  {patient.diagnoses?.length || 0} Diagnoses
                </Badge>
                {patient.status === "urgent" && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Urgent
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Report Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="followup">Follow-up Report</SelectItem>
                  <SelectItem value="referral">Referral Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="clinicalNotes">Clinical Assessment & Notes</Label>
              <Textarea
                id="clinicalNotes"
                placeholder="Enter your clinical assessment, observations, and professional notes..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="treatmentPlan">Treatment Plan & Recommendations</Label>
              <Textarea
                id="treatmentPlan"
                placeholder="Enter treatment recommendations, follow-up instructions, and care plan..."
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleGenerateReport} disabled={isGenerating} className="flex-1">
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" />
                  Generate & Print Report
                </>
              )}
            </Button>

            <Button variant="outline" onClick={exportHealthData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          {/* Report Preview Info */}
          <Card className="bg-blue-50 dark:bg-blue-950">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Professional Medical Report Features:
                  </p>
                  <ul className="text-blue-700 dark:text-blue-200 space-y-1">
                    <li>• Official medical letterhead with doctor credentials</li>
                    <li>• Comprehensive patient information and vital signs</li>
                    <li>• AI-assisted diagnostic findings with confidence levels</li>
                    <li>• Clinical assessment and treatment recommendations</li>
                    <li>• Digital signatures and timestamp verification</li>
                    <li>• HIPAA-compliant medical disclaimers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
