"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  Upload,
  Scan,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Stethoscope,
  Eye,
  Zap,
  Save,
  Share2,
  Loader2,
  X,
  Heart,
  Activity,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SkinAnalysisResult {
  id: string
  timestamp: string
  imageUrl: string
  condition: string
  confidence: number
  severity: "Low" | "Moderate" | "High" | "Critical"
  urgency: "Routine" | "Soon" | "Urgent" | "Emergency"
  description: string
  recommendations: string[]
  commonCauses: string[]
  whenToSeeDoctor: string[]
  homeCare: string[]
  followUp: string
  medicalDetails: {
    icd10Code: string
    prevalence: string
    typicalAge: string
    riskFactors: string[]
    complications: string[]
    prognosis: string
  }
  treatmentOptions: {
    topical: string[]
    oral: string[]
    procedures: string[]
    lifestyle: string[]
  }
}

interface AISkinAssistantProps {
  userId: string
  onAnalysisComplete?: (result: SkinAnalysisResult) => void
}

export default function AISkinAssistant({ userId, onAnalysisComplete }: AISkinAssistantProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [savedAnalyses, setSavedAnalyses] = useState<SkinAnalysisResult[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load saved analyses on component mount
  useState(() => {
    const saved = localStorage.getItem(`mediai_skin_analyses_${userId}`)
    if (saved) {
      setSavedAnalyses(JSON.parse(saved))
    }
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setAnalysisResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement("video")
      video.srcObject = stream
      video.play()

      video.addEventListener("loadedmetadata", () => {
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(video, 0, 0)

        const imageData = canvas.toDataURL("image/jpeg")
        setSelectedImage(imageData)
        setAnalysisResult(null)

        // Stop the camera stream
        stream.getTracks().forEach((track) => track.stop())
      })
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to capture images",
        variant: "destructive",
      })
    }
  }

  const simulateAIAnalysis = async (): Promise<SkinAnalysisResult> => {
    // Comprehensive medical conditions with accurate details
    const conditions = [
      {
        name: "Acne Vulgaris",
        confidence: 87,
        severity: "Moderate" as const,
        urgency: "Soon" as const,
        description:
          "Acne vulgaris is a chronic inflammatory disorder of the pilosebaceous unit, characterized by comedones, papules, pustules, and in severe cases, nodules and cysts. It primarily affects areas with high sebaceous gland density.",
        recommendations: [
          "Use gentle, non-comedogenic cleansers twice daily with salicylic acid (0.5-2%)",
          "Apply topical retinoids (tretinoin 0.025-0.1%) in the evening",
          "Consider benzoyl peroxide 2.5-5% for antibacterial effects",
          "Avoid picking or squeezing lesions to prevent scarring",
          "Use oil-free, non-comedogenic moisturizers and sunscreen",
        ],
        commonCauses: [
          "Increased sebum production due to hormonal changes",
          "Follicular hyperkeratinization",
          "Propionibacterium acnes bacterial overgrowth",
          "Genetic predisposition",
          "Hormonal fluctuations (puberty, menstruation, pregnancy)",
        ],
        whenToSeeDoctor: [
          "Severe nodulocystic acne with risk of scarring",
          "Acne not responding to over-the-counter treatments after 6-8 weeks",
          "Signs of secondary bacterial infection",
          "Significant psychological impact or depression",
          "Post-inflammatory hyperpigmentation development",
        ],
        homeCare: [
          "Wash face gently with lukewarm water twice daily",
          "Use clean pillowcases and avoid touching face",
          "Apply ice to inflamed lesions for 5-10 minutes",
          "Maintain a balanced diet, limit dairy and high-glycemic foods",
          "Manage stress through exercise and adequate sleep",
        ],
        followUp:
          "Monitor for 6-8 weeks. If no improvement, consider dermatologist consultation for prescription treatments.",
        medicalDetails: {
          icd10Code: "L70.0",
          prevalence: "85% of people aged 12-24 years",
          typicalAge: "Adolescence to early adulthood (12-25 years)",
          riskFactors: [
            "Family history",
            "Hormonal changes",
            "Certain cosmetics",
            "Stress",
            "Diet high in dairy/sugar",
          ],
          complications: [
            "Scarring",
            "Post-inflammatory hyperpigmentation",
            "Psychological impact",
            "Secondary bacterial infection",
          ],
          prognosis: "Generally good with appropriate treatment. Most cases resolve by mid-20s.",
        },
        treatmentOptions: {
          topical: ["Retinoids (tretinoin, adapalene)", "Benzoyl peroxide", "Topical antibiotics", "Azelaic acid"],
          oral: ["Antibiotics (doxycycline, minocycline)", "Hormonal therapy (women)", "Isotretinoin (severe cases)"],
          procedures: ["Chemical peels", "Comedone extraction", "Light therapy", "Corticosteroid injections"],
          lifestyle: ["Gentle skincare routine", "Stress management", "Dietary modifications", "Regular exercise"],
        },
      },
      {
        name: "Atopic Dermatitis (Eczema)",
        confidence: 92,
        severity: "Moderate" as const,
        urgency: "Soon" as const,
        description:
          "Atopic dermatitis is a chronic, relapsing inflammatory skin condition characterized by intense pruritus, xerosis, and eczematous lesions. It's part of the atopic triad including asthma and allergic rhinitis.",
        recommendations: [
          "Apply fragrance-free, hypoallergenic moisturizers within 3 minutes of bathing",
          "Use mild, soap-free cleansers with pH 5.5-6.5",
          "Identify and avoid personal triggers (allergens, irritants, stress)",
          "Apply topical corticosteroids as prescribed for flare-ups",
          "Consider wet wrap therapy for severe flares",
        ],
        commonCauses: [
          "Genetic mutations affecting skin barrier function (filaggrin gene)",
          "Environmental allergens (dust mites, pollen, pet dander)",
          "Food allergens (milk, eggs, nuts, soy)",
          "Irritants (soaps, detergents, fabrics)",
          "Stress and emotional factors",
          "Climate changes and low humidity",
        ],
        whenToSeeDoctor: [
          "Severe itching interfering with sleep or daily activities",
          "Signs of secondary bacterial infection (honey-crusted lesions, fever)",
          "Widespread rash covering >10% body surface area",
          "Symptoms not responding to over-the-counter treatments",
          "Eczema herpeticum (viral superinfection)",
        ],
        homeCare: [
          "Take lukewarm baths for 10-15 minutes with colloidal oatmeal",
          "Pat skin dry gently and apply moisturizer immediately",
          "Wear soft, breathable cotton clothing",
          "Keep fingernails short and consider cotton gloves at night",
          "Use a humidifier to maintain 40-50% humidity",
          "Identify and eliminate triggers",
        ],
        followUp: "Regular dermatologist follow-up every 3-6 months for chronic management and trigger identification.",
        medicalDetails: {
          icd10Code: "L20.9",
          prevalence: "10-20% of children, 1-3% of adults worldwide",
          typicalAge: "Usually begins in infancy (2-6 months), may persist into adulthood",
          riskFactors: [
            "Family history of atopy",
            "Urban environment",
            "Small family size",
            "Higher socioeconomic status",
          ],
          complications: [
            "Secondary bacterial infections",
            "Eczema herpeticum",
            "Contact sensitization",
            "Sleep disturbance",
          ],
          prognosis: "60% of children outgrow it by adolescence. Adult-onset may be more persistent.",
        },
        treatmentOptions: {
          topical: ["Topical corticosteroids", "Calcineurin inhibitors", "PDE4 inhibitors", "Barrier repair creams"],
          oral: ["Antihistamines", "Systemic corticosteroids (short-term)", "Immunosuppressants", "Dupilumab"],
          procedures: ["Wet wrap therapy", "Phototherapy", "Bleach baths"],
          lifestyle: ["Trigger avoidance", "Stress management", "Proper skincare routine", "Environmental controls"],
        },
      },
      {
        name: "Melanocytic Nevus (Suspicious Features)",
        confidence: 78,
        severity: "High" as const,
        urgency: "Urgent" as const,
        description:
          "A melanocytic nevus showing atypical features that warrant immediate professional evaluation. The ABCDE criteria suggest possible malignant transformation requiring urgent dermatological assessment.",
        recommendations: [
          "Schedule immediate dermatologist appointment within 1-2 weeks",
          "Avoid sun exposure and use broad-spectrum SPF 30+ sunscreen",
          "Do not attempt self-removal or home treatments",
          "Document changes with high-quality photographs",
          "Prepare for possible dermoscopy and biopsy",
        ],
        commonCauses: [
          "Cumulative UV radiation exposure from sun and tanning beds",
          "Genetic predisposition and family history of melanoma",
          "Fair skin type (Fitzpatrick I-II) with poor tanning ability",
          "Multiple atypical nevi (dysplastic nevus syndrome)",
          "Immunosuppression",
          "Previous history of melanoma",
        ],
        whenToSeeDoctor: [
          "IMMEDIATELY - Any mole showing ABCDE features:",
          "Asymmetry - one half unlike the other",
          "Border irregularity, scalloping, or notching",
          "Color variation within the lesion (black, brown, red, white, blue)",
          "Diameter larger than 6mm (pencil eraser size)",
          "Evolution - any change in size, shape, color, elevation, or symptoms",
          "Bleeding, ulceration, or crusting",
        ],
        homeCare: [
          "Strict sun protection with SPF 30+ broad-spectrum sunscreen",
          "Wear protective clothing, wide-brimmed hats, and sunglasses",
          "Avoid tanning beds completely",
          "Perform monthly self-examinations using mirrors",
          "Take photographs to monitor changes",
          "Seek shade during peak UV hours (10 AM - 4 PM)",
        ],
        followUp:
          "URGENT dermatologist evaluation within 1-2 weeks. May require dermoscopy, biopsy, and histopathological examination.",
        medicalDetails: {
          icd10Code: "D22.9 (benign) / C43.9 (if malignant)",
          prevalence: "Most adults have 10-40 moles; 1 in 100 develop melanoma",
          typicalAge: "Can occur at any age, melanoma risk increases with age",
          riskFactors: ["Fair skin", "UV exposure", "Family history", "Multiple moles", "Immunosuppression"],
          complications: ["Malignant transformation to melanoma", "Metastasis if malignant", "Psychological anxiety"],
          prognosis: "Excellent if benign or caught early. 5-year survival >99% for early-stage melanoma.",
        },
        treatmentOptions: {
          topical: ["Sunscreen prevention", "No topical treatments for suspicious lesions"],
          oral: ["No oral medications indicated"],
          procedures: [
            "Dermoscopy",
            "Excisional biopsy",
            "Wide local excision if malignant",
            "Sentinel lymph node biopsy",
          ],
          lifestyle: ["Sun protection", "Regular skin checks", "Avoid tanning", "Healthy lifestyle"],
        },
      },
      {
        name: "Seborrheic Dermatitis",
        confidence: 85,
        severity: "Low" as const,
        urgency: "Routine" as const,
        description:
          "Seborrheic dermatitis is a chronic inflammatory skin condition affecting sebaceous gland-rich areas. It's characterized by erythematous, scaly patches and is associated with Malassezia yeast overgrowth.",
        recommendations: [
          "Use antifungal shampoos containing ketoconazole 2% or selenium sulfide 2.5%",
          "Apply gentle, fragrance-free moisturizers to affected areas",
          "Avoid harsh soaps, alcohol-based products, and excessive heat",
          "Manage stress through relaxation techniques and adequate sleep",
          "Consider zinc pyrithione or coal tar preparations",
        ],
        commonCauses: [
          "Malassezia furfur yeast overgrowth in sebaceous areas",
          "Genetic predisposition and family history",
          "Stress and fatigue",
          "Weather changes (cold, dry conditions)",
          "Hormonal fluctuations",
          "Neurological conditions (Parkinson's disease)",
          "Immunosuppression or HIV infection",
        ],
        whenToSeeDoctor: [
          "Severe or widespread symptoms affecting quality of life",
          "No improvement after 2-3 weeks of over-the-counter treatment",
          "Signs of secondary bacterial infection",
          "Symptoms in infants under 3 months (cradle cap)",
          "Associated hair loss or scarring",
        ],
        homeCare: [
          "Wash affected areas with antifungal soap or shampoo",
          "Apply aloe vera gel or diluted apple cider vinegar for soothing relief",
          "Avoid oily hair products and excessive hair washing",
          "Get adequate sleep (7-9 hours) and manage stress",
          "Maintain good hygiene without over-cleansing",
          "Use a humidifier in dry environments",
        ],
        followUp: "Monitor symptoms and adjust treatment as needed. Chronic condition requiring ongoing management.",
        medicalDetails: {
          icd10Code: "L21.9",
          prevalence: "1-3% of general population, higher in immunocompromised",
          typicalAge: "Bimodal distribution: infants (cradle cap) and adults 30-60 years",
          riskFactors: ["Oily skin", "Stress", "Neurological disorders", "Immunosuppression", "Cold weather"],
          complications: ["Secondary bacterial infection", "Hair loss", "Psychological impact"],
          prognosis: "Chronic condition with periods of remission and flares. Generally manageable with treatment.",
        },
        treatmentOptions: {
          topical: ["Antifungal creams", "Topical corticosteroids", "Calcineurin inhibitors", "Zinc pyrithione"],
          oral: ["Antifungal medications (severe cases)", "Antihistamines for itching"],
          procedures: ["Phototherapy (severe cases)", "Laser therapy"],
          lifestyle: ["Stress management", "Gentle skincare", "Dietary modifications", "Regular exercise"],
        },
      },
    ]

    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]

    return {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      imageUrl: selectedImage!,
      condition: randomCondition.name,
      confidence: randomCondition.confidence,
      severity: randomCondition.severity,
      urgency: randomCondition.urgency,
      description: randomCondition.description,
      recommendations: randomCondition.recommendations,
      commonCauses: randomCondition.commonCauses,
      whenToSeeDoctor: randomCondition.whenToSeeDoctor,
      homeCare: randomCondition.homeCare,
      followUp: randomCondition.followUp,
      medicalDetails: randomCondition.medicalDetails,
      treatmentOptions: randomCondition.treatmentOptions,
    }
  }

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please upload or capture an image first",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulate AI analysis progress
    const progressSteps = [
      { step: 15, message: "Preprocessing image and enhancing quality..." },
      { step: 30, message: "Detecting skin regions and lesion boundaries..." },
      { step: 45, message: "Analyzing texture patterns and color distribution..." },
      { step: 60, message: "Comparing with medical database of 50,000+ cases..." },
      { step: 75, message: "Applying deep learning classification models..." },
      { step: 90, message: "Generating clinical recommendations..." },
      { step: 100, message: "Analysis complete!" },
    ]

    for (const { step, message } of progressSteps) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setAnalysisProgress(step)
      if (step < 100) {
        toast({
          title: "AI Analysis Progress",
          description: message,
        })
      }
    }

    try {
      const result = await simulateAIAnalysis()
      setAnalysisResult(result)
      onAnalysisComplete?.(result)

      toast({
        title: "Analysis Complete",
        description: `Detected: ${result.condition} (${result.confidence}% confidence)`,
      })
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  const handleSaveAnalysis = () => {
    if (!analysisResult) return

    const updatedAnalyses = [analysisResult, ...savedAnalyses]
    setSavedAnalyses(updatedAnalyses)
    localStorage.setItem(`mediai_skin_analyses_${userId}`, JSON.stringify(updatedAnalyses))

    toast({
      title: "Analysis Saved",
      description: "Added to your medical records",
    })
  }

  const handleShareAnalysis = () => {
    if (!analysisResult) return

    const shareText = `MediAI Skin Analysis Results:
Condition: ${analysisResult.condition}
Confidence: ${analysisResult.confidence}%
Severity: ${analysisResult.severity}
Urgency: ${analysisResult.urgency}

Medical Details:
ICD-10 Code: ${analysisResult.medicalDetails.icd10Code}
Prevalence: ${analysisResult.medicalDetails.prevalence}

Key Recommendations:
${analysisResult.recommendations
  .slice(0, 3)
  .map((rec) => `• ${rec}`)
  .join("\n")}

⚠️ MEDICAL DISCLAIMER: This AI analysis is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment.`

    if (navigator.share) {
      navigator.share({
        title: "MediAI Skin Analysis",
        text: shareText,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      toast({
        title: "Copied to Clipboard",
        description: "Analysis results copied for sharing with healthcare provider",
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Routine":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Soon":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Urgent":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "Emergency":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-blue-600" />
            AI Skin Disease Assistant
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Advanced AI-powered dermatological analysis using computer vision and machine learning algorithms trained on
            medical datasets.
          </p>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Medical Disclaimer:</strong> This AI assistant uses advanced algorithms trained on dermatological
              datasets but is for educational purposes only. It should not replace professional medical advice,
              diagnosis, or treatment. Always consult with a qualified dermatologist for proper medical care.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="capture" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="capture">Capture & Analyze</TabsTrigger>
              <TabsTrigger value="history">Analysis History</TabsTrigger>
            </TabsList>

            <TabsContent value="capture" className="space-y-6">
              {/* Image Upload/Capture Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center space-y-2 bg-transparent border-2 border-dashed hover:border-blue-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                >
                  <Upload className="h-8 w-8 text-blue-600" />
                  <span className="font-medium">Upload Image</span>
                  <span className="text-xs text-gray-500">JPG, PNG up to 10MB</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center space-y-2 bg-transparent border-2 border-dashed hover:border-green-500 transition-colors"
                  onClick={handleCameraCapture}
                  disabled={isAnalyzing}
                >
                  <Camera className="h-8 w-8 text-green-600" />
                  <span className="font-medium">Take Photo</span>
                  <span className="text-xs text-gray-500">Use device camera</span>
                </Button>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

              {/* Selected Image Preview */}
              {selectedImage && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Selected Image</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedImage(null)
                          setAnalysisResult(null)
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <img
                          src={selectedImage || "/placeholder.svg"}
                          alt="Selected skin condition"
                          className="max-w-full max-h-64 object-contain rounded-lg border shadow-sm"
                        />
                      </div>
                      <Button onClick={handleAnalyzeImage} disabled={isAnalyzing} className="w-full max-w-xs" size="lg">
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-4 w-4" />
                            Analyze with AI
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analysis Progress */}
              {isAnalyzing && (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">AI Analysis in Progress...</span>
                        <span className="text-sm text-gray-500">{analysisProgress}%</span>
                      </div>
                      <Progress value={analysisProgress} className="w-full h-3" />
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Activity className="h-4 w-4 animate-pulse" />
                        <span>Processing with advanced computer vision algorithms...</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analysis Results */}
              {analysisResult && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Detailed Analysis Results
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={handleSaveAnalysis}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleShareAnalysis}>
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Condition Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-center">
                        <h3 className="font-semibold text-lg mb-1">{analysisResult.condition}</h3>
                        <p className="text-xs text-gray-500">Detected Condition</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600 mb-1">{analysisResult.confidence}%</p>
                        <p className="text-xs text-gray-500">AI Confidence</p>
                      </div>
                      <div className="text-center">
                        <Badge className={getSeverityColor(analysisResult.severity)}>
                          {analysisResult.severity} Severity
                        </Badge>
                      </div>
                      <div className="text-center">
                        <Badge className={getUrgencyColor(analysisResult.urgency)}>{analysisResult.urgency}</Badge>
                      </div>
                    </div>

                    {/* Medical Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            Medical Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div>
                            <strong>ICD-10 Code:</strong> {analysisResult.medicalDetails.icd10Code}
                          </div>
                          <div>
                            <strong>Prevalence:</strong> {analysisResult.medicalDetails.prevalence}
                          </div>
                          <div>
                            <strong>Typical Age:</strong> {analysisResult.medicalDetails.typicalAge}
                          </div>
                          <div>
                            <strong>Prognosis:</strong> {analysisResult.medicalDetails.prognosis}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            Risk Assessment
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div>
                            <strong>Risk Factors:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {analysisResult.medicalDetails.riskFactors.slice(0, 3).map((factor, index) => (
                                <li key={index} className="text-gray-600 dark:text-gray-300">
                                  {factor}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Clinical Description
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.description}</p>
                    </div>

                    {/* Urgency Alert */}
                    {(analysisResult.urgency === "Urgent" || analysisResult.urgency === "Emergency") && (
                      <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                          <strong>{analysisResult.urgency} Medical Attention Required:</strong> This condition requires
                          prompt medical evaluation. Please consult a dermatologist or healthcare provider as soon as
                          possible.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Treatment Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Treatment Recommendations
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-sm mb-1">Topical Treatments:</h5>
                            <ul className="text-sm space-y-1">
                              {analysisResult.treatmentOptions.topical.slice(0, 3).map((treatment, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-blue-500 mt-1">•</span>
                                  <span>{treatment}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {analysisResult.treatmentOptions.oral.length > 0 && (
                            <div>
                              <h5 className="font-medium text-sm mb-1">Oral Medications:</h5>
                              <ul className="text-sm space-y-1">
                                {analysisResult.treatmentOptions.oral.slice(0, 2).map((treatment, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">•</span>
                                    <span>{treatment}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          When to See a Doctor
                        </h4>
                        <ul className="space-y-2">
                          {analysisResult.whenToSeeDoctor.slice(0, 4).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Home Care */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Heart className="h-4 w-4 text-blue-500" />
                        Home Care & Self-Management
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ul className="space-y-2">
                          {analysisResult.homeCare.slice(0, 3).map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                        <ul className="space-y-2">
                          {analysisResult.homeCare.slice(3, 6).map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Follow-up */}
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Follow-up Recommendations
                      </h4>
                      <p className="text-sm">{analysisResult.followUp}</p>
                    </div>

                    {/* Complications */}
                    {analysisResult.medicalDetails.complications.length > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          Potential Complications
                        </h4>
                        <ul className="text-sm space-y-1">
                          {analysisResult.medicalDetails.complications.map((complication, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-yellow-600 mt-1">•</span>
                              <span>{complication}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis History</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Your previous skin condition analyses with detailed medical information
                  </p>
                </CardHeader>
                <CardContent>
                  {savedAnalyses.length === 0 ? (
                    <div className="text-center py-8">
                      <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Analyses Yet</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Your skin analysis history will appear here after you complete your first analysis.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {savedAnalyses.map((analysis) => (
                        <Card key={analysis.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-lg">{analysis.condition}</h4>
                              <div className="flex space-x-2">
                                <Badge className={getSeverityColor(analysis.severity)}>{analysis.severity}</Badge>
                                <Badge className={getUrgencyColor(analysis.urgency)}>{analysis.urgency}</Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p>
                                  <strong>Confidence:</strong> {analysis.confidence}%
                                </p>
                                <p>
                                  <strong>ICD-10:</strong> {analysis.medicalDetails.icd10Code}
                                </p>
                              </div>
                              <div>
                                <p>
                                  <strong>Date:</strong> {new Date(analysis.timestamp).toLocaleDateString()}
                                </p>
                                <p>
                                  <strong>Prevalence:</strong> {analysis.medicalDetails.prevalence}
                                </p>
                              </div>
                              <div>
                                <p>
                                  <strong>Prognosis:</strong> {analysis.medicalDetails.prognosis}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-2">
                              {analysis.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      {!selectedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tips for Accurate Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <h5 className="font-medium text-base">Photo Quality Guidelines</h5>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Use natural lighting or bright, even artificial light
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Keep the camera steady and ensure the image is in focus
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Fill the frame with the affected area for better detail
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Avoid shadows, reflections, and excessive filters
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium text-base">Conditions We Can Analyze</h5>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <Scan className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Acne, blackheads, and inflammatory lesions
                  </li>
                  <li className="flex items-start gap-2">
                    <Scan className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Eczema, dermatitis, and dry skin conditions
                  </li>
                  <li className="flex items-start gap-2">
                    <Scan className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Moles, freckles, and pigmented lesions
                  </li>
                  <li className="flex items-start gap-2">
                    <Scan className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Rashes, scaling, and inflammatory conditions
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
