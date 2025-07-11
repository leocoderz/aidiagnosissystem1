"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, Plus, Clock, MapPin, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Symptom {
  id: string
  name: string
  severity: number
  duration: string
  location: string
  description: string
  timestamp: string
}

interface MobileSymptomInputProps {
  onSymptomAdded: (symptom: Omit<Symptom, "id" | "timestamp">) => void
  symptoms?: Symptom[]
  onRemoveSymptom?: (id: string) => void
}

export default function MobileSymptomInput({
  onSymptomAdded,
  symptoms = [],
  onRemoveSymptom,
}: MobileSymptomInputProps) {
  const [newSymptom, setNewSymptom] = useState("")
  const [severity, setSeverity] = useState([5])
  const [duration, setDuration] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [isListening, setIsListening] = useState(false)
  const { toast } = useToast()

  const commonSymptoms = [
    "Headache",
    "Fever",
    "Cough",
    "Fatigue",
    "Nausea",
    "Dizziness",
    "Chest Pain",
    "Shortness of Breath",
    "Abdominal Pain",
    "Joint Pain",
    "Sore Throat",
    "Runny Nose",
    "Muscle Aches",
    "Loss of Appetite",
  ]

  const handleAddSymptom = () => {
    if (!newSymptom.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a symptom name",
        variant: "destructive",
      })
      return
    }

    const symptomData = {
      name: newSymptom,
      severity: severity[0],
      duration,
      location,
      description,
    }

    onSymptomAdded(symptomData)

    // Reset form
    setNewSymptom("")
    setSeverity([5])
    setDuration("")
    setLocation("")
    setDescription("")

    toast({
      title: "Symptom Added",
      description: `${newSymptom} has been recorded successfully`,
    })
  }

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Not supported",
        description: "Speech recognition not supported in this browser",
        variant: "destructive",
      })
      return
    }

    setIsListening(true)

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setDescription((prev) => prev + (prev ? " " : "") + transcript)
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)
      toast({
        title: "Voice input failed",
        description: "Please try again or type your description",
        variant: "destructive",
      })
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const handleRemoveSymptom = (id: string) => {
    if (onRemoveSymptom) {
      onRemoveSymptom(id)
      toast({
        title: "Symptom Removed",
        description: "Symptom has been deleted from your records",
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Symptom Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Symptom</CardTitle>
          <CardDescription>Record your symptoms for AI analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Add Buttons */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Common Symptoms</Label>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.slice(0, 6).map((symptom) => (
                <Button
                  key={symptom}
                  variant="outline"
                  size="sm"
                  onClick={() => setNewSymptom(symptom)}
                  className="text-xs h-8"
                >
                  {symptom}
                </Button>
              ))}
            </div>
          </div>

          {/* Symptom Name */}
          <div>
            <Label htmlFor="symptom">Symptom Name</Label>
            <Input
              id="symptom"
              value={newSymptom}
              onChange={(e) => setNewSymptom(e.target.value)}
              placeholder="e.g., Headache, Fever, Cough"
              className="mt-1"
            />
          </div>

          {/* Severity Slider */}
          <div>
            <Label>Severity: {severity[0]}/10</Label>
            <div className="px-2 py-4">
              <Slider value={severity} onValueChange={setSeverity} max={10} min={1} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Mild</span>
                <span>Severe</span>
              </div>
            </div>
          </div>

          {/* Duration and Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="How long?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Few minutes</SelectItem>
                  <SelectItem value="hours">Few hours</SelectItem>
                  <SelectItem value="1day">1 day</SelectItem>
                  <SelectItem value="2-3days">2-3 days</SelectItem>
                  <SelectItem value="week">About a week</SelectItem>
                  <SelectItem value="weeks">Several weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Body part"
                className="mt-1"
              />
            </div>
          </div>

          {/* Description with Voice Input */}
          <div>
            <Label htmlFor="description">Description</Label>
            <div className="relative mt-1">
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your symptom in detail..."
                rows={3}
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleVoiceInput}
                disabled={isListening}
              >
                <Mic className={`h-4 w-4 ${isListening ? "text-red-500" : ""}`} />
              </Button>
            </div>
          </div>

          <Button onClick={handleAddSymptom} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Symptom
          </Button>
        </CardContent>
      </Card>

      {/* Current Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Symptoms ({symptoms?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!symptoms || symptoms.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No symptoms recorded yet</p>
          ) : (
            <div className="space-y-3">
              {symptoms.map((symptom) => (
                <div key={symptom.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{symptom.name}</h4>
                        <Badge variant="outline">{symptom.severity}/10</Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {symptom.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{symptom.duration}</span>
                          </div>
                        )}
                        {symptom.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{symptom.location}</span>
                          </div>
                        )}
                        {symptom.description && <p className="mt-2 text-sm">{symptom.description}</p>}
                        <p className="text-xs text-gray-400">{new Date(symptom.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    {onRemoveSymptom && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSymptom(symptom.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
