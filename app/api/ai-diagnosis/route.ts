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
PATIENT DEMOGRAPHICS & HISTORY:
- Age: ${patientInfo.age || "Not specified"}
- Gender: ${patientInfo.gender || "Not specified"}
- Medical History: ${patientInfo.medicalHistory || "None reported"}
- Current Medications: ${patientInfo.medications || "None reported"}
- Allergies: ${patientInfo.allergies || "None reported"}
- Family History: ${patientInfo.familyHistory || "None reported"}
`
      : "";

    const prompt = `You are an expert medical AI assistant with advanced training in clinical medicine, differential diagnosis, and evidence-based treatment protocols. You have access to comprehensive medical databases and current clinical guidelines. Analyze the patient's symptoms with the rigor of a specialist physician.

${patientContext}

SYMPTOM ANALYSIS:
${symptomDetails}

CONDUCT A COMPREHENSIVE MEDICAL ASSESSMENT:

**CLINICAL REASONING PROCESS:**
1. SYMPTOM PATTERN ANALYSIS: Identify symptom clusters and temporal relationships
2. ANATOMICAL LOCALIZATION: Determine which body systems are affected
3. PATHOPHYSIOLOGICAL MECHANISMS: Consider underlying disease processes
4. EPIDEMIOLOGICAL FACTORS: Account for age, gender, and risk factors

**DIAGNOSTIC ASSESSMENT:**

1. **PRIMARY DIAGNOSIS**
   - Most likely condition based on symptom constellation
   - Clinical confidence level (70-95% range)
   - ICD-10 code if applicable
   - Supporting clinical evidence

2. **DISEASE PREDICTION & RISK ASSESSMENT**
   - Potential future conditions based on current symptoms and risk factors
   - Early warning indicators for developing diseases
   - Risk probability scores (0-100%) for each predicted condition
   - Timeline predictions for disease progression
   - Preventive intervention opportunities

3. **SEVERITY STRATIFICATION**
   - Classification: Mild/Moderate/Severe/Critical
   - Clinical severity indicators
   - Risk stratification factors
   - Urgency of medical attention needed

4. **DIFFERENTIAL DIAGNOSIS**
   - Top 4-5 alternative diagnoses ranked by probability
   - Key distinguishing features for each
   - Additional tests/symptoms needed to differentiate

5. **PATHOPHYSIOLOGY**
   - Underlying disease mechanism
   - Organ system involvement
   - Disease progression pathway

6. **PREDICTIVE INSIGHTS FOR PHYSICIANS**
   - Risk factors contributing to disease prediction
   - Early intervention recommendations
   - Monitoring parameters for disease prevention
   - Patient education priorities
   - Screening recommendations

7. **EVIDENCE-BASED TREATMENT PLAN**
   - First-line therapeutic interventions
   - Specific medications with dosing (when appropriate)
   - Non-pharmacological interventions
   - Timeline for expected improvement
   - Follow-up recommendations

8. **RED FLAG SYMPTOMS**
   - Warning signs requiring immediate medical attention
   - Emergency department criteria
   - When to call 911

9. **MONITORING AND PROGNOSIS**
   - Expected clinical course
   - Recovery timeline
   - Long-term outlook
   - Potential complications

10. **PREVENTION STRATEGIES**
   - Risk factor modification
   - Lifestyle interventions
   - Screening recommendations
   - Health maintenance

**MEDICAL DISCLAIMER:** This AI analysis is for educational purposes and clinical decision support only. It should never replace professional medical evaluation, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions.

Provide detailed, evidence-based analysis using current medical knowledge and clinical guidelines. Be thorough but maintain clinical precision.`;

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not found, using fallback diagnosis");
      const fallbackDiagnosis = generateAdvancedRuleBasedDiagnosis(
        symptoms,
        patientInfo,
      );
      return Response.json(fallbackDiagnosis);
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system: `You are an advanced medical AI with specialist-level knowledge across all medical disciplines including internal medicine, emergency medicine, family medicine, and subspecialties. You have been trained on:

- Current medical textbooks and clinical guidelines (Harrison's, UpToDate, Cochrane Reviews)
- Evidence-based medicine protocols and meta-analyses
- Differential diagnosis methodologies and clinical decision rules
- Treatment algorithms and clinical pathways
- Medical decision-making frameworks and risk calculators
- Severity scoring systems (APACHE, CURB-65, Wells Score, etc.)
- Clinical prediction rules and diagnostic criteria

Your analysis should reflect the clinical reasoning of an experienced physician while maintaining appropriate limitations. Use precise medical terminology, cite relevant clinical criteria when applicable, and provide comprehensive yet practical recommendations.

CRITICAL GUIDELINES:
- Base all assessments on evidence-based medicine and validated clinical criteria
- Use standardized clinical scoring systems and diagnostic criteria when applicable
- Provide specific, actionable recommendations with appropriate medical detail
- Clearly distinguish between different severity levels using clinical indicators
- Always emphasize the need for professional medical evaluation and appropriate urgency
- Consider patient safety as the highest priority in all recommendations
- Be thorough in differential diagnosis considerations with probability assessments
- Provide realistic prognosis and timeline expectations based on medical literature
- Include relevant ICD-10 codes and clinical terminology where appropriate
- Consider age, gender, and epidemiological factors in your assessment`,
    });

    // Parse the AI response and structure it
    const diagnosis = parseEnhancedAIResponse(text, symptoms, patientInfo);

    return Response.json(diagnosis);
  } catch (error) {
    console.error("AI Diagnosis API error:", error);

    // Fallback to enhanced rule-based diagnosis
    const fallbackDiagnosis = generateAdvancedRuleBasedDiagnosis(
      symptoms,
      patientInfo,
    );
    return Response.json(fallbackDiagnosis);
  }
}

function parseEnhancedAIResponse(
  aiText: string,
  symptoms: any[],
  patientInfo?: any,
) {
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
    distinguishingFeatures: string;
  }> = [];
  const redFlags: string[] = [];
  let prognosis = "";
  const prevention: string[] = [];
  let seekImmediateCare = false;
  let icdCode = "";
  const clinicalEvidence: string[] = [];
  const followUpPlan: string[] = [];
  const diseasePredictions: Array<{
    disease: string;
    riskScore: number;
    timeline: string;
    preventionMeasures: string[];
    earlyWarningSignsForDisease: string[];
  }> = [];
  const predictiveInsights: string[] = [];
  const riskFactors: string[] = [];

  // Enhanced parsing logic
  let currentSection = "";

  for (const line of lines) {
    const upperLine = line.toUpperCase();
    const trimmedLine = line.trim();

    // Identify sections with better pattern matching
    if (
      upperLine.includes("PRIMARY DIAGNOSIS") ||
      upperLine.includes("MOST LIKELY")
    ) {
      currentSection = "diagnosis";
      const confidenceMatch = line.match(/(\d+)%/);
      if (confidenceMatch) confidence = Number.parseInt(confidenceMatch[1]);

      const conditionMatch = line.match(
        /(?:diagnosis|condition)[:\-\s]*(.+?)(?:\s*\(|\s*with|\s*-|$)/i,
      );
      if (conditionMatch) condition = conditionMatch[1].trim();

      const icdMatch = line.match(/([A-Z]\d{2}(?:\.\d+)?)/);
      if (icdMatch) icdCode = icdMatch[1];
    } else if (
      upperLine.includes("SEVERITY") ||
      upperLine.includes("CLASSIFICATION")
    ) {
      currentSection = "severity";
      if (upperLine.includes("CRITICAL") || upperLine.includes("SEVERE"))
        severity = "severe";
      else if (upperLine.includes("MODERATE")) severity = "moderate";
      else if (upperLine.includes("MILD")) severity = "mild";
    } else if (
      upperLine.includes("TREATMENT") ||
      upperLine.includes("THERAPEUTIC")
    ) {
      currentSection = "treatment";
    } else if (upperLine.includes("DIFFERENTIAL")) {
      currentSection = "differential";
    } else if (
      upperLine.includes("RED FLAG") ||
      upperLine.includes("WARNING")
    ) {
      currentSection = "redflags";
    } else if (
      upperLine.includes("PROGNOSIS") ||
      upperLine.includes("EXPECTED COURSE")
    ) {
      currentSection = "prognosis";
    } else if (
      upperLine.includes("PREVENTION") ||
      upperLine.includes("RISK FACTOR")
    ) {
      currentSection = "prevention";
    } else if (
      upperLine.includes("FOLLOW-UP") ||
      upperLine.includes("MONITORING")
    ) {
      currentSection = "followup";
    } else if (
      upperLine.includes("CLINICAL EVIDENCE") ||
      upperLine.includes("SUPPORTING")
    ) {
      currentSection = "evidence";
    } else if (
      upperLine.includes("DISEASE PREDICTION") ||
      upperLine.includes("RISK ASSESSMENT")
    ) {
      currentSection = "prediction";
    } else if (
      upperLine.includes("PREDICTIVE INSIGHTS") ||
      upperLine.includes("PHYSICIANS")
    ) {
      currentSection = "insights";
    } else if (upperLine.includes("RISK FACTORS")) {
      currentSection = "riskfactors";
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
            const condName = content
              .replace(/\(\d+%\)/, "")
              .split("-")[0]
              .trim();
            const features = content.includes("-")
              ? content.split("-").slice(1).join("-").trim()
              : "";
            if (condName)
              differentialDiagnoses.push({
                condition: condName,
                probability: prob,
                distinguishingFeatures: features,
              });
            break;
          case "redflags":
            redFlags.push(content);
            break;
          case "prevention":
            prevention.push(content);
            break;
          case "followup":
            followUpPlan.push(content);
            break;
          case "evidence":
            clinicalEvidence.push(content);
            break;
          case "prediction":
            // Parse disease prediction entries
            const riskMatch = content.match(/(\d+)%/);
            const timelineMatch = content.match(
              /(?:in|within)\s+(\d+(?:-\d+)?\s*(?:days?|weeks?|months?|years?))/i,
            );
            const diseaseName = content.split("(")[0].split("-")[0].trim();
            if (diseaseName && riskMatch) {
              diseasePredictions.push({
                disease: diseaseName,
                riskScore: Number.parseInt(riskMatch[1]),
                timeline: timelineMatch ? timelineMatch[1] : "Variable",
                preventionMeasures: [],
                earlyWarningSignsForDisease: [],
              });
            }
            break;
          case "insights":
            predictiveInsights.push(content);
            break;
          case "riskfactors":
            riskFactors.push(content);
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

  // Enhanced emergency detection
  const emergencyKeywords = [
    "immediate",
    "emergency",
    "urgent",
    "critical",
    "severe",
    "911",
    "chest pain",
    "difficulty breathing",
    "stroke",
    "heart attack",
    "anaphylaxis",
    "sepsis",
  ];

  const highRiskConditions = [
    "myocardial infarction",
    "stroke",
    "pulmonary embolism",
    "aortic dissection",
    "meningitis",
    "sepsis",
    "anaphylaxis",
    "pneumothorax",
  ];

  if (
    emergencyKeywords.some((keyword) =>
      aiText.toLowerCase().includes(keyword),
    ) ||
    highRiskConditions.some((condition) =>
      aiText.toLowerCase().includes(condition),
    ) ||
    severity === "severe" ||
    severity === "critical" ||
    (confidence > 85 &&
      (condition.toLowerCase().includes("emergency") ||
        condition.toLowerCase().includes("acute")))
  ) {
    seekImmediateCare = true;
  }

  // Enhanced default values with medical precision
  if (treatment.length === 0) {
    treatment = [
      "Symptomatic supportive care with close monitoring",
      "Adequate rest (8-10 hours sleep) and increased fluid intake (2-3 liters/day)",
      "Over-the-counter analgesics as needed (acetaminophen 650mg q6h or ibuprofen 400mg q8h)",
      "Temperature monitoring and fever management if applicable",
      "Symptom diary to track progression and response to treatment",
      "Follow-up with primary care physician within 24-48 hours if symptoms persist",
    ];
  }

  if (recommendations.length === 0) {
    recommendations = [
      "Implement comprehensive treatment plan with adherence monitoring",
      "Daily symptom assessment and progression tracking",
      "Maintain optimal nutrition, hydration, and sleep hygiene",
      "Avoid known triggers and implement risk reduction strategies",
      "Seek immediate medical attention if red flag symptoms develop",
    ];
  }

  return {
    condition:
      condition.replace(/[^\w\s\-().]/g, "").trim() || "Medical Assessment",
    confidence: Math.min(Math.max(confidence, 70), 95),
    severity,
    icdCode,
    explanation:
      explanation.substring(0, 1500) + (explanation.length > 1500 ? "..." : ""),
    recommendations,
    treatment,
    differentialDiagnoses: differentialDiagnoses.slice(0, 5),
    redFlags: redFlags.slice(0, 6),
    prognosis:
      prognosis.trim() ||
      "Prognosis depends on adherence to treatment plan and individual patient factors. Most cases show improvement with appropriate medical care and monitoring.",
    prevention: prevention.slice(0, 6),
    clinicalEvidence: clinicalEvidence.slice(0, 4),
    followUpPlan: followUpPlan.slice(0, 4),
    diseasePredictions: diseasePredictions.slice(0, 5),
    predictiveInsights: predictiveInsights.slice(0, 6),
    riskFactors: riskFactors.slice(0, 5),
    seekImmediateCare,
    aiGenerated: true,
    timestamp: new Date().toISOString(),
    analysisQuality: "enhanced",
    predictionGenerated: true,
  };
}

function generateAdvancedRuleBasedDiagnosis(
  symptoms: any[],
  patientInfo?: any,
) {
  const symptomText = symptoms
    .map((s) =>
      typeof s === "string" ? s : `${s.name} ${s.description || ""}`,
    )
    .join(" ")
    .toLowerCase();

  const age = patientInfo?.age || 30;
  const gender = patientInfo?.gender || "unknown";

  // Enhanced emergency detection
  const emergencyPatterns = [
    {
      keywords: ["chest pain", "crushing", "pressure"],
      condition: "Acute Coronary Syndrome",
      severity: "critical",
    },
    {
      keywords: ["difficulty breathing", "shortness of breath", "dyspnea"],
      condition: "Respiratory Distress",
      severity: "severe",
    },
    {
      keywords: ["severe headache", "worst headache", "thunderclap"],
      condition: "Secondary Headache Disorder",
      severity: "severe",
    },
    {
      keywords: ["abdominal pain", "severe", "acute"],
      condition: "Acute Abdominal Pain",
      severity: "severe",
    },
  ];

  for (const pattern of emergencyPatterns) {
    if (pattern.keywords.every((keyword) => symptomText.includes(keyword))) {
      return createEmergencyDiagnosis(
        pattern.condition,
        symptomText,
        age,
        gender,
      );
    }
  }

  // Enhanced respiratory conditions
  if (
    (symptomText.includes("cough") && symptomText.includes("fever")) ||
    (symptomText.includes("sore throat") && symptomText.includes("congestion"))
  ) {
    return createRespiratoryDiagnosis(symptomText, age, gender);
  }

  // Gastrointestinal conditions
  if (
    symptomText.includes("nausea") ||
    symptomText.includes("vomiting") ||
    symptomText.includes("diarrhea")
  ) {
    return createGastrointestinalDiagnosis(symptomText, age, gender);
  }

  // Neurological conditions
  if (
    symptomText.includes("headache") ||
    symptomText.includes("dizziness") ||
    symptomText.includes("fatigue")
  ) {
    return createNeurologicalDiagnosis(symptomText, age, gender);
  }

  // Default comprehensive assessment
  return createGeneralAssessment(symptomText, age, gender);
}

function createEmergencyDiagnosis(
  condition: string,
  symptomText: string,
  age: number,
  gender: string,
) {
  const emergencyPredictions = getEmergencyDiseasePredictions(
    symptomText,
    age,
    gender,
  );

  return {
    condition: condition,
    confidence: 90,
    severity: "critical",
    icdCode: "R06.02", // Example ICD code
    explanation: `Based on the symptom presentation, this appears to be a serious medical condition requiring immediate evaluation. The combination of symptoms suggests potential ${condition.toLowerCase()} which requires urgent medical intervention.`,
    diseasePredictions: emergencyPredictions.predictions,
    predictiveInsights: emergencyPredictions.insights,
    riskFactors: emergencyPredictions.riskFactors,
    recommendations: [
      "IMMEDIATE EMERGENCY MEDICAL CARE - Call 911 or go to nearest Emergency Department",
      "Do not delay seeking medical attention",
      "Have someone drive you - do not drive yourself",
      "Bring list of current medications and medical history",
      "If symptoms worsen, call emergency services immediately",
    ],
    treatment: [
      "IMMEDIATE professional medical evaluation and intervention required",
      "Emergency department assessment and stabilization",
      "Diagnostic testing as determined by emergency physician",
      "Treatment based on confirmed diagnosis and clinical severity",
      "Continuous monitoring and specialist consultation as needed",
    ],
    differentialDiagnoses: [
      {
        condition: "Acute cardiac event",
        probability: 35,
        distinguishingFeatures: "Chest symptoms, risk factors",
      },
      {
        condition: "Pulmonary emergency",
        probability: 30,
        distinguishingFeatures: "Respiratory symptoms",
      },
      {
        condition: "Vascular emergency",
        probability: 20,
        distinguishingFeatures: "Systemic symptoms",
      },
      {
        condition: "Neurological emergency",
        probability: 15,
        distinguishingFeatures: "Neurological signs",
      },
    ],
    redFlags: [
      "Worsening or new severe symptoms",
      "Loss of consciousness or altered mental status",
      "Severe difficulty breathing or chest pain",
      "Signs of shock (rapid pulse, cold skin, confusion)",
      "Any life-threatening symptom progression",
    ],
    prognosis:
      "Prognosis depends on immediate medical intervention and underlying pathology. Early treatment significantly improves outcomes.",
    prevention: [
      "Regular cardiovascular risk assessment",
      "Management of chronic conditions",
      "Recognition of warning signs",
      "Emergency action plan",
    ],
    seekImmediateCare: true,
    aiGenerated: false,
    timestamp: new Date().toISOString(),
    analysisQuality: "enhanced",
    predictionGenerated: true,
  };
}

function createRespiratoryDiagnosis(
  symptomText: string,
  age: number,
  gender: string,
) {
  const hasFever = symptomText.includes("fever");
  const hasCough = symptomText.includes("cough");
  const severity = hasFever && hasCough ? "moderate" : "mild";

  return {
    condition: "Upper Respiratory Tract Infection",
    confidence: 85,
    severity: severity,
    icdCode: "J06.9",
    explanation:
      "Clinical presentation consistent with viral or bacterial upper respiratory infection affecting the nose, throat, and upper airways. Common condition with characteristic symptom pattern.",
    recommendations: [
      "Supportive care with symptom monitoring and rest",
      "Maintain adequate hydration (8-10 glasses water daily)",
      "Use humidifier or steam inhalation for congestion relief",
      "Monitor temperature and response to treatment",
      "Avoid close contact with others to prevent transmission",
    ],
    treatment: [
      "Rest and increased fluid intake (2-3 liters daily unless contraindicated)",
      "Acetaminophen 650mg every 6 hours or ibuprofen 400mg every 8 hours for fever/pain",
      "Throat lozenges or warm salt water gargles (1/2 tsp salt in 8oz warm water)",
      "Honey (1-2 teaspoons) for cough relief (avoid in children under 1 year)",
      "Humidified air or steam inhalation for nasal congestion",
      "Follow-up if no improvement in 7-10 days or symptoms worsen",
    ],
    differentialDiagnoses: [
      {
        condition: "Viral upper respiratory infection",
        probability: 65,
        distinguishingFeatures: "Self-limiting, gradual onset",
      },
      {
        condition: "Bacterial sinusitis",
        probability: 20,
        distinguishingFeatures: "Facial pain, purulent discharge",
      },
      {
        condition: "Allergic rhinitis",
        probability: 10,
        distinguishingFeatures: "Seasonal pattern, itching",
      },
      {
        condition: "Early pneumonia",
        probability: 5,
        distinguishingFeatures: "Lower respiratory symptoms",
      },
    ],
    redFlags: [
      "High fever over 103°F (39.4°C) or persistent fever >3 days",
      "Severe difficulty breathing or shortness of breath",
      "Chest pain or persistent productive cough",
      "Signs of dehydration or inability to maintain fluid intake",
      "Worsening symptoms after initial improvement",
    ],
    prognosis:
      "Excellent prognosis with typical resolution in 7-10 days. Most patients recover completely without complications with appropriate supportive care.",
    prevention: [
      "Hand hygiene and respiratory etiquette",
      "Avoid close contact with symptomatic individuals",
      "Annual influenza vaccination",
      "Adequate sleep and stress management",
      "Maintain good overall health and nutrition",
    ],
    seekImmediateCare: false,
    aiGenerated: false,
    timestamp: new Date().toISOString(),
    analysisQuality: "enhanced",
  };
}

function createGastrointestinalDiagnosis(
  symptomText: string,
  age: number,
  gender: string,
) {
  return {
    condition: "Acute Gastroenteritis",
    confidence: 82,
    severity: "mild",
    icdCode: "K59.1",
    explanation:
      "Symptoms consistent with acute gastroenteritis, likely viral in origin. Common self-limiting condition affecting the gastrointestinal tract.",
    recommendations: [
      "Maintain hydration with clear fluids and electrolyte replacement",
      "BRAT diet (Bananas, Rice, Applesauce, Toast) as tolerated",
      "Rest and avoid dairy products temporarily",
      "Monitor for signs of dehydration",
      "Gradual return to normal diet as symptoms improve",
    ],
    treatment: [
      "Oral rehydration with clear fluids (water, clear broths, electrolyte solutions)",
      "Small frequent meals starting with bland foods",
      "Anti-diarrheal medication (loperamide) if needed for symptom control",
      "Probiotics may help restore normal gut flora",
      "Avoid dairy, fatty, or spicy foods until recovery",
      "Medical evaluation if symptoms persist beyond 3-4 days",
    ],
    differentialDiagnoses: [
      {
        condition: "Viral gastroenteritis",
        probability: 70,
        distinguishingFeatures: "Self-limiting, recent exposure",
      },
      {
        condition: "Food poisoning",
        probability: 20,
        distinguishingFeatures: "Recent food exposure, acute onset",
      },
      {
        condition: "Bacterial gastroenteritis",
        probability: 8,
        distinguishingFeatures: "Bloody stools, high fever",
      },
      {
        condition: "Medication-related",
        probability: 2,
        distinguishingFeatures: "Recent antibiotic use",
      },
    ],
    redFlags: [
      "Severe dehydration (dizziness, dry mouth, decreased urination)",
      "Blood in vomit or stool",
      "High fever over 102°F (38.9°C)",
      "Severe abdominal pain or cramping",
      "Signs of severe dehydration or electrolyte imbalance",
    ],
    prognosis:
      "Good prognosis with typical resolution in 2-4 days. Most cases are self-limiting with supportive care.",
    prevention: [
      "Proper food safety and hygiene practices",
      "Hand washing before meals and after bathroom use",
      "Avoid contaminated food and water sources",
      "Proper food storage and preparation",
    ],
    seekImmediateCare: false,
    aiGenerated: false,
    timestamp: new Date().toISOString(),
    analysisQuality: "enhanced",
  };
}

function createNeurologicalDiagnosis(
  symptomText: string,
  age: number,
  gender: string,
) {
  return {
    condition: "Tension-Type Headache",
    confidence: 78,
    severity: "mild",
    icdCode: "G44.2",
    explanation:
      "Symptoms consistent with tension-type headache, the most common primary headache disorder. Often related to stress, fatigue, or muscle tension.",
    recommendations: [
      "Stress management and relaxation techniques",
      "Regular sleep schedule and adequate rest",
      "Identify and avoid potential triggers",
      "Regular meals and adequate hydration",
      "Gentle neck and shoulder exercises",
    ],
    treatment: [
      "Over-the-counter analgesics: acetaminophen 1000mg or ibuprofen 600mg as needed",
      "Cold or warm compress to head/neck area",
      "Relaxation techniques and stress reduction",
      "Regular sleep schedule (7-9 hours nightly)",
      "Adequate hydration and regular meals",
      "Consider preventive measures if headaches are frequent",
    ],
    differentialDiagnoses: [
      {
        condition: "Tension-type headache",
        probability: 60,
        distinguishingFeatures: "Bilateral, band-like pressure",
      },
      {
        condition: "Migraine headache",
        probability: 25,
        distinguishingFeatures: "Unilateral, throbbing, photophobia",
      },
      {
        condition: "Cervicogenic headache",
        probability: 10,
        distinguishingFeatures: "Neck pain, positional",
      },
      {
        condition: "Medication overuse headache",
        probability: 5,
        distinguishingFeatures: "Frequent analgesic use",
      },
    ],
    redFlags: [
      "Sudden severe headache ('worst headache of life')",
      "Headache with fever, neck stiffness, or rash",
      "Neurological symptoms (vision changes, weakness, confusion)",
      "Headache pattern change or increasing frequency/severity",
      "Headache after head trauma",
    ],
    prognosis:
      "Good prognosis with appropriate management. Most tension headaches respond well to simple treatments and lifestyle modifications.",
    prevention: [
      "Stress management and regular exercise",
      "Consistent sleep schedule",
      "Regular meals and adequate hydration",
      "Ergonomic workspace setup",
      "Limit caffeine and alcohol intake",
    ],
    seekImmediateCare: false,
    aiGenerated: false,
    timestamp: new Date().toISOString(),
    analysisQuality: "enhanced",
  };
}

function createGeneralAssessment(
  symptomText: string,
  age: number,
  gender: string,
) {
  return {
    condition: "General Health Assessment",
    confidence: 75,
    severity: "mild",
    icdCode: "Z00.00",
    explanation:
      "Based on the symptom presentation, this appears to be a general health concern requiring monitoring and potentially medical evaluation for proper diagnosis and management.",
    recommendations: [
      "Comprehensive symptom tracking and monitoring",
      "Maintain optimal hydration and nutrition",
      "Ensure adequate rest and sleep (7-9 hours)",
      "Consider lifestyle factors that may contribute to symptoms",
      "Schedule appropriate medical evaluation for persistent symptoms",
    ],
    treatment: [
      "Symptomatic care with close monitoring of progression",
      "Adequate rest and fluid intake",
      "Over-the-counter medications for symptom relief as appropriate",
      "Maintain symptom diary with dates, severity, and triggers",
      "Follow-up with healthcare provider if symptoms persist >5-7 days",
      "Seek medical evaluation for proper diagnosis and treatment plan",
    ],
    differentialDiagnoses: [
      {
        condition: "Viral syndrome",
        probability: 40,
        distinguishingFeatures: "Self-limiting, systemic symptoms",
      },
      {
        condition: "Stress-related symptoms",
        probability: 30,
        distinguishingFeatures: "Temporal relationship to stressors",
      },
      {
        condition: "Minor bacterial infection",
        probability: 20,
        distinguishingFeatures: "Localized symptoms, response to treatment",
      },
      {
        condition: "Allergic reaction",
        probability: 10,
        distinguishingFeatures: "Environmental triggers, seasonal pattern",
      },
    ],
    redFlags: [
      "Rapidly worsening or new severe symptoms",
      "High fever over 102°F (38.9°C)",
      "Severe pain or functional impairment",
      "Difficulty breathing or swallowing",
      "Any concerning or unusual symptom development",
    ],
    prognosis:
      "Generally good with appropriate monitoring and care. Most mild conditions resolve with supportive treatment and time.",
    prevention: [
      "Maintain healthy lifestyle with regular exercise",
      "Balanced nutrition and adequate hydration",
      "Stress management and adequate sleep",
      "Regular preventive healthcare and screenings",
      "Prompt attention to health concerns",
    ],
    seekImmediateCare: false,
    aiGenerated: false,
    timestamp: new Date().toISOString(),
    analysisQuality: "enhanced",
  };
}
