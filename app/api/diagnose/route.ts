export async function POST(req: Request) {
  try {
    const { symptoms } = await req.json()

    if (!symptoms || symptoms.length === 0) {
      return Response.json({
        condition: "No symptoms provided",
        confidence: 0,
        severity: "mild",
        explanation: "Please provide symptoms for analysis",
        recommendations: ["Please provide symptoms for analysis"],
        seekImmediateCare: false,
      })
    }

    // Generate diagnosis using rule-based system (no external API required)
    const diagnosis = generateDiagnosis(symptoms)

    // Simulate AI processing time for better UX
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return Response.json(diagnosis)
  } catch (error) {
    console.error("Diagnosis API error:", error)

    return Response.json(
      {
        condition: "Analysis Error",
        confidence: 0,
        severity: "mild",
        explanation: "Unable to process symptoms at this time due to a technical issue",
        recommendations: [
          "Please try again in a few moments",
          "Consult healthcare provider if symptoms persist",
          "Monitor symptoms closely",
          "Seek immediate care if symptoms worsen",
        ],
        seekImmediateCare: false,
      },
      { status: 500 },
    )
  }
}

function generateDiagnosis(symptoms: string[]) {
  const symptomText = symptoms.join(" ").toLowerCase()

  // Extract symptom keywords and severity indicators
  const keywords = extractKeywords(symptomText)
  const severityScore = calculateSeverityScore(symptomText)

  // Determine condition based on symptom patterns
  const condition = determineCondition(keywords, severityScore)

  return {
    condition: condition.name,
    confidence: condition.confidence,
    severity: condition.severity,
    explanation: condition.explanation,
    recommendations: condition.recommendations,
    seekImmediateCare: condition.seekImmediateCare,
  }
}

function extractKeywords(symptomText: string) {
  const keywords = {
    respiratory: ["cough", "throat", "breathing", "chest", "congestion", "runny nose", "sneezing"],
    fever: ["fever", "temperature", "hot", "chills", "sweating"],
    pain: ["pain", "ache", "hurt", "sore", "tender"],
    digestive: ["nausea", "vomit", "stomach", "abdominal", "diarrhea", "appetite"],
    neurological: ["headache", "dizzy", "confusion", "memory", "concentration"],
    fatigue: ["tired", "fatigue", "exhausted", "weak", "energy"],
    skin: ["rash", "itchy", "swelling", "red", "bump"],
    emergency: ["severe", "intense", "unbearable", "emergency", "urgent", "difficulty breathing", "chest pain"],
  }

  const found = {}
  for (const [category, words] of Object.entries(keywords)) {
    found[category] = words.some((word) => symptomText.includes(word))
  }

  return found
}

function calculateSeverityScore(symptomText: string) {
  let score = 0

  // Check for severity indicators
  if (symptomText.includes("severe") || symptomText.includes("10")) score += 3
  if (symptomText.includes("moderate") || symptomText.includes("8") || symptomText.includes("9")) score += 2
  if (symptomText.includes("mild") || symptomText.includes("1") || symptomText.includes("2")) score += 1

  // Check for duration indicators
  if (symptomText.includes("weeks") || symptomText.includes("chronic")) score += 2
  if (symptomText.includes("days")) score += 1

  return Math.min(score, 10)
}

function determineCondition(keywords: any, severityScore: number) {
  // Emergency conditions
  if (keywords.emergency || (keywords.respiratory && keywords.pain && severityScore > 7)) {
    return {
      name: "Emergency Medical Condition",
      confidence: 95,
      severity: "severe",
      explanation: "Your symptoms suggest a serious condition that requires immediate medical attention.",
      recommendations: [
        "Seek immediate emergency medical care",
        "Call 911 or go to the nearest emergency room",
        "Do not delay medical treatment",
        "Have someone accompany you if possible",
      ],
      seekImmediateCare: true,
    }
  }

  // Respiratory infections
  if (keywords.respiratory && keywords.fever) {
    return {
      name: "Upper Respiratory Infection",
      confidence: 85,
      severity: severityScore > 6 ? "moderate" : "mild",
      explanation: "Your symptoms are consistent with a viral or bacterial upper respiratory infection.",
      recommendations: [
        "Get plenty of rest and stay hydrated",
        "Use a humidifier or breathe steam",
        "Consider over-the-counter pain relievers",
        "Consult a doctor if symptoms worsen or persist beyond 7-10 days",
        "Avoid close contact with others to prevent spread",
      ],
      seekImmediateCare: false,
    }
  }

  // Flu-like illness
  if (keywords.fever && keywords.fatigue && (keywords.pain || keywords.neurological)) {
    return {
      name: "Viral Flu-like Illness",
      confidence: 82,
      severity: severityScore > 6 ? "moderate" : "mild",
      explanation: "Your symptoms suggest a viral illness, possibly influenza or similar infection.",
      recommendations: [
        "Rest and avoid strenuous activities",
        "Drink plenty of fluids",
        "Take fever reducers as needed",
        "Isolate yourself to prevent spreading illness",
        "See a healthcare provider if symptoms are severe or prolonged",
      ],
      seekImmediateCare: false,
    }
  }

  // Tension headache
  if (keywords.neurological && !keywords.fever) {
    return {
      name: "Tension Headache",
      confidence: 78,
      severity: severityScore > 7 ? "moderate" : "mild",
      explanation:
        "Your symptoms are consistent with tension-type headaches, often caused by stress or muscle tension.",
      recommendations: [
        "Apply cold or warm compress to head/neck",
        "Practice relaxation techniques",
        "Ensure adequate sleep and regular meals",
        "Consider over-the-counter pain relievers",
        "Identify and avoid potential triggers",
      ],
      seekImmediateCare: false,
    }
  }

  // Digestive issues
  if (keywords.digestive) {
    return {
      name: "Gastrointestinal Upset",
      confidence: 75,
      severity: severityScore > 6 ? "moderate" : "mild",
      explanation: "Your symptoms suggest digestive system irritation, possibly from food, stress, or minor infection.",
      recommendations: [
        "Stay hydrated with clear fluids",
        "Follow the BRAT diet (bananas, rice, applesauce, toast)",
        "Avoid dairy, fatty, or spicy foods temporarily",
        "Rest and avoid strenuous activity",
        "Seek medical care if symptoms persist or worsen",
      ],
      seekImmediateCare: false,
    }
  }

  // General fatigue/malaise
  if (keywords.fatigue) {
    return {
      name: "General Fatigue Syndrome",
      confidence: 70,
      severity: "mild",
      explanation:
        "Your symptoms suggest general fatigue, which can have many causes including stress, poor sleep, or early illness.",
      recommendations: [
        "Ensure adequate sleep (7-9 hours nightly)",
        "Maintain regular exercise routine",
        "Eat a balanced, nutritious diet",
        "Manage stress through relaxation techniques",
        "Consider vitamin D and B12 levels if fatigue persists",
      ],
      seekImmediateCare: false,
    }
  }

  // Default general assessment
  return {
    name: "General Health Assessment",
    confidence: 65,
    severity: severityScore > 7 ? "moderate" : "mild",
    explanation: "Based on your symptoms, this appears to be a general health concern that should be monitored.",
    recommendations: [
      "Monitor symptoms closely and track any changes",
      "Maintain good hydration and nutrition",
      "Get adequate rest and sleep",
      "Consult a healthcare provider if symptoms persist or worsen",
      "Keep a symptom diary to identify patterns",
    ],
    seekImmediateCare: false,
  }
}
