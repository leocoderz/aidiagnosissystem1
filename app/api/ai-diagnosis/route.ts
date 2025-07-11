import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { symptoms, patientInfo } = await req.json();

  if (!symptoms || symptoms.length === 0) {
    return Response.json({
      condition: "No symptoms provided",
      confidence: 0,
      severity: "mild",
      explanation: "Please provide symptoms for analysis",
      recommendations: ["Please provide symptoms for analysis"],
      treatment: [],
      seekImmediateCare: false,
    });
  }

  try {
    // Prepare detailed symptom information for AI analysis
    const symptomDetails = symptoms
      .map((symptom: any) => {
        if (typeof symptom === "string") {
          try {
            const parsed = JSON.parse(symptom);
            return `${parsed.name} (severity: ${parsed.severity}/10, duration: ${parsed.duration || "not specified"}, location: ${parsed.location || "not specified"}, description: ${parsed.description || "none"})`;
          } catch {
            return symptom;
          }
        }
        return `${symptom.name} (severity: ${symptom.severity}/10, duration: ${symptom.duration || "not specified"}, location: ${symptom.location || "not specified"}, description: ${symptom.description || "none"})`;
      })
      .join("; ");

    const patientContext = patientInfo
      ? `
Patient Information:
- Age: ${patientInfo.age || "Not specified"}
- Gender: ${patientInfo.gender || "Not specified"}
- Medical History: ${patientInfo.medicalHistory || "None reported"}
- Current Medications: ${patientInfo.medications || "None reported"}
- Allergies: ${patientInfo.allergies || "None reported"}
`
      : "";

    const prompt = `You are an experienced medical AI assistant with expertise in differential diagnosis and treatment planning. Analyze the following symptoms and provide a comprehensive medical assessment.

${patientContext}

Symptoms: ${symptomDetails}

Please provide a structured medical analysis in the following format:

1. PRIMARY DIAGNOSIS: Most likely condition with confidence percentage (60-95%)
2. SEVERITY: mild/moderate/severe/critical with medical justification
3. PATHOPHYSIOLOGY: Brief explanation of the underlying medical mechanism
4. DIFFERENTIAL DIAGNOSES: List 3-4 alternative possible conditions with probabilities
5. TREATMENT RECOMMENDATIONS: Specific, actionable treatment steps including:
   - Immediate care measures
   - Medications (generic names, typical dosages, duration)
   - Lifestyle modifications
   - Follow-up care timeline
6. RED FLAGS: Warning signs that require immediate medical attention
7. PROGNOSIS: Expected outcome and timeline for recovery
8. PREVENTION: Measures to prevent recurrence or worsening

Base your analysis on current medical evidence and clinical guidelines. Be specific with treatment recommendations while emphasizing the importance of professional medical consultation for proper diagnosis and treatment.`;

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system: `You are a medical AI assistant with expertise in evidence-based medicine, differential diagnosis, and treatment planning. 
      Provide accurate, comprehensive medical assessments following current clinical guidelines.
      Always emphasize that AI analysis should supplement, not replace, professional medical evaluation.
      Be specific with treatment recommendations while maintaining appropriate medical caution.
      Format responses clearly with proper medical terminology and practical guidance.
      Focus on actionable medical advice while being appropriately cautious about serious conditions.`,
    });

    // Parse the AI response and structure it
    const diagnosis = parseAIResponse(text, symptoms);

    return Response.json(diagnosis);
  } catch (error) {
    console.error("AI Diagnosis API error:", error);

    // Fallback to rule-based diagnosis
    const fallbackDiagnosis = generateRuleBasedDiagnosis(symptoms);
    return Response.json(fallbackDiagnosis);
  }
}

function parseAIResponse(aiText: string, symptoms: any[]) {
  const lines = aiText.split("\n").filter((line) => line.trim());

  let condition = "Medical Assessment";
  let confidence = 75;
  let severity = "moderate";
  const explanation = aiText;
  let recommendations: string[] = [];
  let treatment: string[] = [];
  const differentialDiagnoses: Array<{
    condition: string;
    probability: number;
  }> = [];
  const redFlags: string[] = [];
  let prognosis = "";
  const prevention: string[] = [];
  let seekImmediateCare = false;

  // Parse structured response sections
  let currentSection = "";

  for (const line of lines) {
    const upperLine = line.toUpperCase();
    const trimmedLine = line.trim();

    // Identify sections
    if (
      upperLine.includes("PRIMARY DIAGNOSIS") ||
      upperLine.includes("DIAGNOSIS:")
    ) {
      currentSection = "diagnosis";
      const match = line.match(/(\d+)%/);
      if (match) confidence = Number.parseInt(match[1]);
      const conditionMatch = line.match(
        /(?:diagnosis|condition)[:\-\s]*(.+?)(?:\s*\(|\s*with|\s*-|$)/i,
      );
      if (conditionMatch) condition = conditionMatch[1].trim();
    } else if (upperLine.includes("SEVERITY")) {
      currentSection = "severity";
      if (upperLine.includes("CRITICAL") || upperLine.includes("SEVERE"))
        severity = "severe";
      else if (upperLine.includes("MODERATE")) severity = "moderate";
      else if (upperLine.includes("MILD")) severity = "mild";
    } else if (
      upperLine.includes("TREATMENT") ||
      upperLine.includes("RECOMMENDATIONS")
    ) {
      currentSection = "treatment";
    } else if (upperLine.includes("DIFFERENTIAL")) {
      currentSection = "differential";
    } else if (
      upperLine.includes("RED FLAGS") ||
      upperLine.includes("WARNING")
    ) {
      currentSection = "redflags";
    } else if (upperLine.includes("PROGNOSIS")) {
      currentSection = "prognosis";
    } else if (upperLine.includes("PREVENTION")) {
      currentSection = "prevention";
    }

    // Parse content based on current section
    if (
      trimmedLine.startsWith("-") ||
      trimmedLine.startsWith("•") ||
      /^\d+\./.test(trimmedLine)
    ) {
      const content = trimmedLine.replace(/^[-•\d.]\s*/, "").trim();
      if (content) {
        switch (currentSection) {
          case "treatment":
            treatment.push(content);
            break;
          case "differential":
            const probMatch = content.match(/(\d+)%/);
            const prob = probMatch ? Number.parseInt(probMatch[1]) : 10;
            const condName = content.replace(/$$\d+%$$/, "").trim();
            if (condName)
              differentialDiagnoses.push({
                condition: condName,
                probability: prob,
              });
            break;
          case "redflags":
            redFlags.push(content);
            break;
          case "prevention":
            prevention.push(content);
            break;
        }
      }
    } else if (
      currentSection === "prognosis" &&
      trimmedLine &&
      !upperLine.includes("PROGNOSIS")
    ) {
      prognosis += trimmedLine + " ";
    }
  }

  // Check for emergency conditions
  const emergencyKeywords = [
    "immediate",
    "emergency",
    "urgent",
    "critical",
    "severe",
    "911",
  ];
  if (
    emergencyKeywords.some((keyword) =>
      aiText.toLowerCase().includes(keyword),
    ) ||
    severity === "severe"
  ) {
    seekImmediateCare = true;
  }

  // Default values if parsing failed
  if (treatment.length === 0) {
    treatment = [
      "Rest and adequate hydration",
      "Monitor symptoms closely for changes",
      "Over-the-counter pain relief as needed (acetaminophen or ibuprofen)",
      "Consult healthcare provider if symptoms persist or worsen",
      "Follow up within 3-7 days if no improvement",
    ];
  }

  if (recommendations.length === 0) {
    recommendations = [
      "Follow treatment plan consistently",
      "Monitor for symptom changes daily",
      "Maintain good nutrition and hydration",
      "Get adequate rest and sleep",
      "Avoid known triggers if applicable",
    ];
  }

  return {
    condition:
      condition.replace(/[^\w\s-]/g, "").trim() || "Medical Assessment",
    confidence: Math.min(Math.max(confidence, 60), 95),
    severity,
    explanation:
      explanation.substring(0, 1000) + (explanation.length > 1000 ? "..." : ""),
    recommendations,
    treatment,
    differentialDiagnoses: differentialDiagnoses.slice(0, 4),
    redFlags: redFlags.slice(0, 5),
    prognosis:
      prognosis.trim() ||
      "Prognosis depends on adherence to treatment and individual factors. Most cases resolve with appropriate care.",
    prevention: prevention.slice(0, 5),
    seekImmediateCare,
    aiGenerated: true,
    timestamp: new Date().toISOString(),
  };
}

function generateRuleBasedDiagnosis(symptoms: any[]) {
  const symptomText = symptoms
    .map((s) =>
      typeof s === "string" ? s : `${s.name} ${s.description || ""}`,
    )
    .join(" ")
    .toLowerCase();

  // Emergency conditions
  const emergencyKeywords = [
    "chest pain",
    "difficulty breathing",
    "severe",
    "unbearable",
    "emergency",
  ];
  if (emergencyKeywords.some((keyword) => symptomText.includes(keyword))) {
    return {
      condition: "Emergency Medical Condition",
      confidence: 95,
      severity: "severe",
      explanation:
        "Your symptoms suggest a serious condition that requires immediate medical attention.",
      recommendations: [
        "Seek immediate emergency medical care",
        "Call 911 or go to the nearest emergency room",
        "Do not delay medical treatment",
      ],
      treatment: [
        "Immediate medical evaluation required",
        "Emergency department assessment",
        "Professional medical intervention",
        "Do not attempt self-treatment",
      ],
      differentialDiagnoses: [
        { condition: "Acute cardiac event", probability: 30 },
        { condition: "Respiratory emergency", probability: 25 },
        { condition: "Severe allergic reaction", probability: 20 },
        { condition: "Acute neurological event", probability: 15 },
      ],
      redFlags: [
        "Worsening symptoms",
        "Loss of consciousness",
        "Severe pain",
        "Difficulty breathing",
      ],
      prognosis:
        "Depends on immediate medical intervention and underlying condition",
      prevention: [
        "Regular health checkups",
        "Emergency action plan",
        "Know warning signs",
      ],
      seekImmediateCare: true,
      aiGenerated: false,
    };
  }

  // Respiratory conditions
  if (symptomText.includes("cough") && symptomText.includes("fever")) {
    return {
      condition: "Upper Respiratory Infection",
      confidence: 82,
      severity: "moderate",
      explanation:
        "Your symptoms are consistent with a viral or bacterial upper respiratory infection, commonly affecting the nose, throat, and upper airways.",
      recommendations: [
        "Get plenty of rest and stay hydrated",
        "Use a humidifier or breathe steam",
        "Monitor temperature regularly",
        "Avoid close contact with others",
      ],
      treatment: [
        "Rest and increased fluid intake (8-10 glasses of water daily)",
        "Acetaminophen or ibuprofen for fever and pain (follow package directions)",
        "Throat lozenges or warm salt water gargles for sore throat",
        "Honey for cough relief (not for children under 1 year)",
        "Humidifier or steam inhalation for congestion",
      ],
      differentialDiagnoses: [
        { condition: "Viral upper respiratory infection", probability: 60 },
        { condition: "Bacterial sinusitis", probability: 25 },
        { condition: "Allergic rhinitis", probability: 10 },
        { condition: "Early pneumonia", probability: 5 },
      ],
      redFlags: [
        "High fever over 103��F (39.4°C)",
        "Difficulty breathing",
        "Severe headache",
        "Chest pain",
      ],
      prognosis:
        "Usually resolves within 7-10 days with proper care. Most people recover completely without complications.",
      prevention: [
        "Hand hygiene",
        "Avoid close contact with sick individuals",
        "Annual flu vaccination",
        "Adequate sleep",
      ],
      seekImmediateCare: false,
      aiGenerated: false,
    };
  }

  // Default assessment
  return {
    condition: "General Health Assessment",
    confidence: 70,
    severity: "mild",
    explanation:
      "Based on your symptoms, this appears to be a general health concern that should be monitored and may benefit from medical evaluation.",
    recommendations: [
      "Monitor symptoms closely and track any changes",
      "Maintain good hydration and nutrition",
      "Get adequate rest and sleep",
      "Consider consulting a healthcare provider",
    ],
    treatment: [
      "Symptomatic care and monitoring",
      "Adequate rest and hydration",
      "Over-the-counter medications as needed for comfort",
      "Follow-up with healthcare provider if symptoms persist beyond 3-5 days",
      "Keep a symptom diary to track changes",
    ],
    differentialDiagnoses: [
      { condition: "Viral syndrome", probability: 40 },
      { condition: "Stress-related symptoms", probability: 30 },
      { condition: "Minor bacterial infection", probability: 20 },
      { condition: "Allergic reaction", probability: 10 },
    ],
    redFlags: [
      "Worsening symptoms",
      "High fever",
      "Severe pain",
      "Difficulty breathing",
    ],
    prognosis:
      "Good with appropriate care and monitoring. Most mild conditions resolve within a few days to a week.",
    prevention: [
      "Healthy lifestyle",
      "Regular exercise",
      "Stress management",
      "Adequate sleep",
    ],
    seekImmediateCare: false,
    aiGenerated: false,
  };
}
