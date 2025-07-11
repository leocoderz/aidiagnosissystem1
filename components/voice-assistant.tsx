"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mic, MicOff, Send, User, Volume2, VolumeX, Stethoscope } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  isVoice?: boolean
  suggestions?: string[]
}

interface VoiceAssistantProps {
  onSymptomDetected?: (symptom: string) => void
  onEmergencyDetected?: () => void
}

export default function VoiceAssistant({ onSymptomDetected, onEmergencyDetected }: VoiceAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hello! I'm Dr. AI, your intelligent health assistant. I'm here to help you with:\n\n🩺 Symptom analysis and recording\n💊 Medication reminders and interactions\n📊 Health data interpretation\n🚨 Emergency assistance\n📋 Medical history tracking\n\nHow can I assist you with your health today?",
      timestamp: new Date(),
      suggestions: ["I have symptoms to report", "Check my vital signs", "Emergency help", "Medication questions"],
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()

      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        handleUserMessage(transcript, true)
      }

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false)
        toast({
          title: "Voice input error",
          description: "Please try again or type your message",
          variant: "destructive",
        })
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleUserMessage = async (content: string, isVoice = false) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
      isVoice,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(async () => {
      const response = await processMessage(content)
      setIsTyping(false)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Speak the response if it was a voice input
      if (isVoice) {
        speakResponse(response.content)
      }
    }, 1500)
  }

  const processMessage = async (message: string): Promise<{ content: string; suggestions?: string[] }> => {
    const lowerMessage = message.toLowerCase()

    // Emergency detection with immediate response
    if (
      lowerMessage.includes("emergency") ||
      lowerMessage.includes("help me") ||
      lowerMessage.includes("can't breathe") ||
      lowerMessage.includes("chest pain") ||
      lowerMessage.includes("severe pain") ||
      lowerMessage.includes("call 911") ||
      lowerMessage.includes("heart attack") ||
      lowerMessage.includes("stroke")
    ) {
      onEmergencyDetected?.()
      return {
        content:
          "🚨 **EMERGENCY DETECTED** 🚨\n\nI've immediately activated emergency protocols. If this is a life-threatening emergency:\n\n1. **Call 911 NOW**\n2. Stay calm and follow dispatcher instructions\n3. If possible, unlock your door for emergency responders\n4. I've notified your emergency contacts\n\nI'm here to guide you through this. What's your current situation?",
        suggestions: ["Call 911 now", "I'm having chest pain", "I can't breathe", "Someone else needs help"],
      }
    }

    // Detailed symptom analysis
    if (
      lowerMessage.includes("symptom") ||
      lowerMessage.includes("pain") ||
      lowerMessage.includes("hurt") ||
      lowerMessage.includes("feel sick") ||
      lowerMessage.includes("not feeling well") ||
      lowerMessage.includes("headache") ||
      lowerMessage.includes("fever") ||
      lowerMessage.includes("nausea")
    ) {
      const symptoms = extractSymptomsFromText(lowerMessage)
      if (symptoms.length > 0) {
        onSymptomDetected?.(symptoms[0])
        return {
          content: `I've recorded your symptom: **${symptoms[0]}**\n\nTo provide the most accurate analysis, I need more details:\n\n📊 **Severity**: Rate 1-10 (1=mild, 10=severe)\n⏰ **Duration**: How long have you had this?\n📍 **Location**: Where exactly do you feel it?\n🔄 **Pattern**: Constant, intermittent, or triggered by something?\n\nThis information helps me provide better medical insights and determine if you need immediate care.`,
          suggestions: [
            `Rate severity 1-10`,
            `It's been going on for...`,
            `The pain is located in...`,
            `It happens when I...`,
          ],
        }
      }
      return {
        content:
          "I understand you're experiencing symptoms. Let me help you document them properly.\n\n**Please describe:**\n• What you're feeling (pain, discomfort, etc.)\n• Where in your body\n• How severe (1-10 scale)\n• How long it's been happening\n• Any triggers or patterns\n\nExample: *'I have a throbbing headache in my temples, severity 7/10, started 3 hours ago after working on computer'*",
        suggestions: ["I have a headache", "My stomach hurts", "I feel dizzy", "I have chest pain"],
      }
    }

    // Medication management
    if (
      lowerMessage.includes("medication") ||
      lowerMessage.includes("medicine") ||
      lowerMessage.includes("pills") ||
      lowerMessage.includes("prescription") ||
      lowerMessage.includes("drug interaction")
    ) {
      return {
        content:
          "💊 **Medication Management**\n\nI can help you with:\n\n🔔 **Reminders**: Set up medication schedules\n⚠️ **Interactions**: Check for drug interactions\n📋 **Tracking**: Monitor adherence and side effects\n📊 **History**: Review your medication timeline\n🩺 **Guidance**: General medication information\n\n⚠️ **Important**: Never stop or change medications without consulting your healthcare provider.\n\nWhat specific medication help do you need?",
        suggestions: [
          "Set medication reminder",
          "Check drug interactions",
          "Side effects question",
          "Forgot to take medication",
        ],
      }
    }

    // Vital signs and health data
    if (
      lowerMessage.includes("heart rate") ||
      lowerMessage.includes("blood pressure") ||
      lowerMessage.includes("vitals") ||
      lowerMessage.includes("wearable") ||
      lowerMessage.includes("health data")
    ) {
      return {
        content:
          "📊 **Vital Signs Analysis**\n\nBased on your connected wearable devices:\n\n❤️ **Heart Rate**: Currently monitoring\n🩸 **Blood Pressure**: Latest readings available\n🌡️ **Temperature**: Body temperature tracking\n💨 **Respiratory Rate**: Breathing pattern analysis\n📈 **Trends**: 24-hour health patterns\n\n**Current Status**: All vitals within normal ranges\n\nWould you like me to explain any specific readings or set up custom alerts?",
        suggestions: ["Explain my heart rate", "Set up vital alerts", "Show health trends", "Check blood pressure"],
      }
    }

    // Health status and scoring
    if (
      lowerMessage.includes("how am i") ||
      lowerMessage.includes("health status") ||
      lowerMessage.includes("health score") ||
      lowerMessage.includes("overall health")
    ) {
      return {
        content:
          "🏥 **Your Health Overview**\n\n**Current Health Score**: 85/100 (Good)\n\n📈 **Positive Indicators**:\n• Stable vital signs\n• Regular activity levels\n• Good sleep patterns\n\n⚠️ **Areas for Attention**:\n• Recent symptom reports\n• Stress levels slightly elevated\n\n**Recommendations**:\n✅ Continue current exercise routine\n✅ Monitor stress levels\n✅ Maintain regular sleep schedule\n\nWould you like detailed analysis of any specific health metric?",
        suggestions: ["Analyze my sleep", "Check stress levels", "Review activity", "Health recommendations"],
      }
    }

    // Diagnosis and AI analysis
    if (
      lowerMessage.includes("diagnosis") ||
      lowerMessage.includes("what's wrong") ||
      lowerMessage.includes("analyze") ||
      lowerMessage.includes("ai analysis")
    ) {
      return {
        content:
          "🧠 **AI Medical Analysis**\n\nI can provide preliminary health assessments based on:\n\n📝 **Symptom Analysis**: Pattern recognition from your reported symptoms\n📊 **Vital Sign Correlation**: Integration with wearable data\n🔍 **Risk Assessment**: Identification of concerning patterns\n📚 **Medical Knowledge**: Evidence-based medical databases\n\n⚠️ **Important Disclaimer**: My analysis is for informational purposes only and doesn't replace professional medical diagnosis.\n\n**To proceed**: Please ensure you've recorded all current symptoms, then I can run a comprehensive analysis.",
        suggestions: [
          "Run AI analysis now",
          "Add more symptoms first",
          "Explain analysis process",
          "Get second opinion",
        ],
      }
    }

    // Wellness and prevention
    if (
      lowerMessage.includes("prevention") ||
      lowerMessage.includes("wellness") ||
      lowerMessage.includes("healthy") ||
      lowerMessage.includes("exercise") ||
      lowerMessage.includes("diet")
    ) {
      return {
        content:
          "🌟 **Wellness & Prevention**\n\n**Personalized Recommendations**:\n\n🏃‍♂️ **Exercise**: 150 min/week moderate activity\n🥗 **Nutrition**: Balanced diet with your health conditions in mind\n😴 **Sleep**: 7-9 hours quality sleep\n🧘‍♀️ **Stress Management**: Mindfulness and relaxation techniques\n💧 **Hydration**: 8 glasses of water daily\n🩺 **Preventive Care**: Regular check-ups and screenings\n\nBased on your health profile, I can create a personalized wellness plan. What area interests you most?",
        suggestions: ["Create exercise plan", "Nutrition guidance", "Sleep improvement", "Stress management"],
      }
    }

    // Greeting responses
    if (
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hi") ||
      lowerMessage.includes("hey") ||
      lowerMessage.includes("good morning") ||
      lowerMessage.includes("good afternoon")
    ) {
      const timeOfDay = new Date().getHours()
      const greeting = timeOfDay < 12 ? "Good morning" : timeOfDay < 18 ? "Good afternoon" : "Good evening"

      return {
        content: `${greeting}! 👋 I'm Dr. AI, your personal health assistant.\n\n**Today's Health Summary**:\n• No critical alerts\n• Vital signs stable\n• 2 symptoms tracked this week\n\n**I'm ready to help with**:\n🩺 Medical questions and symptom analysis\n💊 Medication management\n📊 Health data interpretation\n🚨 Emergency assistance\n\nWhat can I help you with today?`,
        suggestions: ["Check my health status", "I have new symptoms", "Medication questions", "Emergency help"],
      }
    }

    // Default comprehensive response
    return {
      content:
        "🤖 **Dr. AI at Your Service**\n\nI'm your comprehensive health assistant with advanced medical knowledge. Here's how I can help:\n\n🩺 **Medical Analysis**: Symptom assessment and preliminary diagnosis\n💊 **Medication Support**: Reminders, interactions, and guidance\n📊 **Health Monitoring**: Vital signs interpretation and trends\n🚨 **Emergency Response**: Immediate assistance and protocol activation\n📋 **Health Records**: Tracking and analysis of your medical history\n🔬 **Research**: Latest medical information and treatment options\n\n**Ask me anything about your health** - I'm here 24/7 to provide evidence-based medical guidance.\n\n*Remember: I complement but don't replace professional medical care.*",
      suggestions: [
        "Analyze my symptoms",
        "Check medication interactions",
        "Emergency protocols",
        "Health recommendations",
      ],
    }
  }

  const extractSymptomsFromText = (text: string): string[] => {
    const symptomKeywords = [
      "headache",
      "migraine",
      "fever",
      "cough",
      "nausea",
      "vomiting",
      "dizzy",
      "dizziness",
      "tired",
      "fatigue",
      "pain",
      "ache",
      "sore",
      "throat",
      "stomach",
      "chest",
      "back",
      "shortness of breath",
      "difficulty breathing",
      "heart palpitations",
      "diarrhea",
      "constipation",
      "rash",
      "itching",
      "swelling",
      "joint pain",
      "muscle pain",
    ]

    const foundSymptoms: string[] = []
    symptomKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        foundSymptoms.push(keyword.charAt(0).toUpperCase() + keyword.slice(1))
      }
    })

    return foundSymptoms
  }

  const speakResponse = (text: string) => {
    if ("speechSynthesis" in window) {
      setIsSpeaking(true)
      // Clean text for speech (remove markdown and emojis)
      const cleanText = text.replace(/[*#🩺💊📊🚨📋🔬🌟🏥❤️🩸🌡️💨📈⚠️✅🔔📝🔍📚🏃‍♂️🥗😴🧘‍♀️💧👋🤖]/gu, "")

      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const startListening = () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition not supported in this browser",
        variant: "destructive",
      })
      return
    }

    try {
      recognitionRef.current.start()
    } catch (error) {
      toast({
        title: "Voice Error",
        description: "Unable to start voice recognition",
        variant: "destructive",
      })
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const handleSendMessage = () => {
    handleUserMessage(inputMessage)
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleUserMessage(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
        <CardTitle className="flex items-center text-lg">
          <div className="p-2 bg-blue-600 rounded-full mr-3">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-blue-600 dark:text-blue-400">Dr. AI</span>
            <p className="text-sm font-normal text-gray-600 dark:text-gray-300">Your Intelligent Health Assistant</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <div
                  className={`flex items-start space-x-3 ${
                    message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={message.type === "user" ? "bg-blue-100" : "bg-green-100"}>
                      {message.type === "user" ? <User className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`flex-1 max-w-[85%] ${message.type === "user" ? "text-right" : ""}`}>
                    <div
                      className={`p-4 rounded-lg ${
                        message.type === "user"
                          ? "bg-blue-500 text-white ml-auto"
                          : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      {message.isVoice && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          🎤 Voice
                        </Badge>
                      )}
                    </div>

                    {/* Quick Suggestions */}
                    {message.suggestions && message.type === "assistant" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 bg-transparent"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  {message.type === "assistant" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={isSpeaking ? stopSpeaking : () => speakResponse(message.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-green-100">
                    <Stethoscope className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Dr. AI is analyzing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Dr. AI about your health..."
              className="flex-1"
              disabled={isTyping}
            />

            {isSupported && (
              <Button
                variant="outline"
                size="sm"
                onClick={isListening ? stopListening : startListening}
                className={isListening ? "bg-red-50 border-red-200" : ""}
                disabled={isTyping}
              >
                {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}

            <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {isListening && (
            <div className="mt-2 text-center">
              <Badge variant="destructive" className="animate-pulse">
                🎤 Listening...
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
