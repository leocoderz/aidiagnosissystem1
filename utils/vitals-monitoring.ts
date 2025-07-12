// Client-side vitals monitoring utility

// Vital signs thresholds for alerting
export const VITAL_THRESHOLDS = {
  heartRate: {
    min: 60,
    max: 100,
    criticalMin: 40,
    criticalMax: 130,
  },
  bloodPressure: {
    systolic: { min: 90, max: 140, criticalMin: 70, criticalMax: 180 },
    diastolic: { min: 60, max: 90, criticalMin: 40, criticalMax: 110 },
  },
  temperature: {
    min: 97.0,
    max: 99.5,
    criticalMin: 95.0,
    criticalMax: 103.0,
  },
  oxygenSaturation: {
    min: 95,
    criticalMin: 90,
  },
  stressLevel: {
    max: 70,
    criticalMax: 85,
  },
};

export interface VitalAlert {
  id: string;
  patientId: string;
  patientName: string;
  vital: string;
  value: any;
  threshold: any;
  severity: "warning" | "critical";
  timestamp: string;
  status: "active" | "acknowledged" | "resolved";
  message: string;
}

export interface WearableVitals {
  patientId: string;
  deviceId: string;
  timestamp: string;
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  temperature: number;
  oxygenSaturation: number;
  stressLevel: number;
  steps: number;
  calories: number;
  batteryLevel: number;
}

// Check if vitals are within safe ranges
export function checkVitalThresholds(
  vitals: WearableVitals,
  patientName: string,
): VitalAlert[] {
  const alerts: VitalAlert[] = [];
  const timestamp = new Date().toISOString();

  // Heart Rate Check
  if (
    vitals.heartRate < VITAL_THRESHOLDS.heartRate.criticalMin ||
    vitals.heartRate > VITAL_THRESHOLDS.heartRate.criticalMax
  ) {
    alerts.push({
      id: `hr_critical_${Date.now()}`,
      patientId: vitals.patientId,
      patientName,
      vital: "Heart Rate",
      value: vitals.heartRate,
      threshold: `${VITAL_THRESHOLDS.heartRate.criticalMin}-${VITAL_THRESHOLDS.heartRate.criticalMax} BPM`,
      severity: "critical",
      timestamp,
      status: "active",
      message: `Critical heart rate detected: ${vitals.heartRate} BPM. Immediate medical attention required.`,
    });
  } else if (
    vitals.heartRate < VITAL_THRESHOLDS.heartRate.min ||
    vitals.heartRate > VITAL_THRESHOLDS.heartRate.max
  ) {
    alerts.push({
      id: `hr_warning_${Date.now()}`,
      patientId: vitals.patientId,
      patientName,
      vital: "Heart Rate",
      value: vitals.heartRate,
      threshold: `${VITAL_THRESHOLDS.heartRate.min}-${VITAL_THRESHOLDS.heartRate.max} BPM`,
      severity: "warning",
      timestamp,
      status: "active",
      message: `Heart rate outside normal range: ${vitals.heartRate} BPM. Monitor closely.`,
    });
  }

  // Blood Pressure Check
  if (
    vitals.bloodPressure.systolic <
      VITAL_THRESHOLDS.bloodPressure.systolic.criticalMin ||
    vitals.bloodPressure.systolic >
      VITAL_THRESHOLDS.bloodPressure.systolic.criticalMax ||
    vitals.bloodPressure.diastolic <
      VITAL_THRESHOLDS.bloodPressure.diastolic.criticalMin ||
    vitals.bloodPressure.diastolic >
      VITAL_THRESHOLDS.bloodPressure.diastolic.criticalMax
  ) {
    alerts.push({
      id: `bp_critical_${Date.now()}`,
      patientId: vitals.patientId,
      patientName,
      vital: "Blood Pressure",
      value: `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`,
      threshold: `${VITAL_THRESHOLDS.bloodPressure.systolic.criticalMin}-${VITAL_THRESHOLDS.bloodPressure.systolic.criticalMax}/${VITAL_THRESHOLDS.bloodPressure.diastolic.criticalMin}-${VITAL_THRESHOLDS.bloodPressure.diastolic.criticalMax} mmHg`,
      severity: "critical",
      timestamp,
      status: "active",
      message: `Critical blood pressure: ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg. Emergency intervention needed.`,
    });
  } else if (
    vitals.bloodPressure.systolic <
      VITAL_THRESHOLDS.bloodPressure.systolic.min ||
    vitals.bloodPressure.systolic >
      VITAL_THRESHOLDS.bloodPressure.systolic.max ||
    vitals.bloodPressure.diastolic <
      VITAL_THRESHOLDS.bloodPressure.diastolic.min ||
    vitals.bloodPressure.diastolic >
      VITAL_THRESHOLDS.bloodPressure.diastolic.max
  ) {
    alerts.push({
      id: `bp_warning_${Date.now()}`,
      patientId: vitals.patientId,
      patientName,
      vital: "Blood Pressure",
      value: `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`,
      threshold: `${VITAL_THRESHOLDS.bloodPressure.systolic.min}-${VITAL_THRESHOLDS.bloodPressure.systolic.max}/${VITAL_THRESHOLDS.bloodPressure.diastolic.min}-${VITAL_THRESHOLDS.bloodPressure.diastolic.max} mmHg`,
      severity: "warning",
      timestamp,
      status: "active",
      message: `Blood pressure outside normal range: ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg.`,
    });
  }

  // Temperature Check
  if (
    vitals.temperature < VITAL_THRESHOLDS.temperature.criticalMin ||
    vitals.temperature > VITAL_THRESHOLDS.temperature.criticalMax
  ) {
    alerts.push({
      id: `temp_critical_${Date.now()}`,
      patientId: vitals.patientId,
      patientName,
      vital: "Temperature",
      value: vitals.temperature,
      threshold: `${VITAL_THRESHOLDS.temperature.criticalMin}-${VITAL_THRESHOLDS.temperature.criticalMax}°F`,
      severity: "critical",
      timestamp,
      status: "active",
      message: `Critical body temperature: ${vitals.temperature}°F. Immediate medical attention required.`,
    });
  } else if (
    vitals.temperature < VITAL_THRESHOLDS.temperature.min ||
    vitals.temperature > VITAL_THRESHOLDS.temperature.max
  ) {
    alerts.push({
      id: `temp_warning_${Date.now()}`,
      patientId: vitals.patientId,
      patientName,
      vital: "Temperature",
      value: vitals.temperature,
      threshold: `${VITAL_THRESHOLDS.temperature.min}-${VITAL_THRESHOLDS.temperature.max}°F`,
      severity: "warning",
      timestamp,
      status: "active",
      message: `Body temperature outside normal range: ${vitals.temperature}°F.`,
    });
  }

  // Oxygen Saturation Check
  if (vitals.oxygenSaturation < VITAL_THRESHOLDS.oxygenSaturation.criticalMin) {
    alerts.push({
      id: `spo2_critical_${Date.now()}`,
      patientId: vitals.patientId,
      patientName,
      vital: "Oxygen Saturation",
      value: vitals.oxygenSaturation,
      threshold: `>${VITAL_THRESHOLDS.oxygenSaturation.criticalMin}%`,
      severity: "critical",
      timestamp,
      status: "active",
      message: `Critical oxygen saturation: ${vitals.oxygenSaturation}%. Respiratory emergency.`,
    });
  } else if (vitals.oxygenSaturation < VITAL_THRESHOLDS.oxygenSaturation.min) {
    alerts.push({
      id: `spo2_warning_${Date.now()}`,
      patientId: vitals.patientId,
      patientName,
      vital: "Oxygen Saturation",
      value: vitals.oxygenSaturation,
      threshold: `>${VITAL_THRESHOLDS.oxygenSaturation.min}%`,
      severity: "warning",
      timestamp,
      status: "active",
      message: `Low oxygen saturation: ${vitals.oxygenSaturation}%. Monitor respiratory function.`,
    });
  }

  // Stress Level Check
  if (vitals.stressLevel > VITAL_THRESHOLDS.stressLevel.criticalMax) {
    alerts.push({
      id: `stress_critical_${Date.now()}`,
      patientId: vitals.patientId,
      patientName,
      vital: "Stress Level",
      value: vitals.stressLevel,
      threshold: `<${VITAL_THRESHOLDS.stressLevel.criticalMax}`,
      severity: "critical",
      timestamp,
      status: "active",
      message: `Extremely high stress level detected: ${vitals.stressLevel}. Potential cardiac risk.`,
    });
  } else if (vitals.stressLevel > VITAL_THRESHOLDS.stressLevel.max) {
    alerts.push({
      id: `stress_warning_${Date.now()}`,
      patientId: vitals.patientId,
      patientName,
      vital: "Stress Level",
      value: vitals.stressLevel,
      threshold: `<${VITAL_THRESHOLDS.stressLevel.max}`,
      severity: "warning",
      timestamp,
      status: "active",
      message: `Elevated stress level: ${vitals.stressLevel}. Recommend relaxation techniques.`,
    });
  }

  return alerts;
}

// Store alerts for doctor notifications (client-side only)
export function storeAlerts(alerts: VitalAlert[]) {
  if (typeof window === "undefined" || alerts.length === 0) return;

  try {
    const existingAlerts = JSON.parse(
      localStorage.getItem("medical_vitals_alerts") || "[]",
    );
    const updatedAlerts = [...existingAlerts, ...alerts];

    // Keep only last 100 alerts to prevent storage overflow
    const recentAlerts = updatedAlerts.slice(-100);
    localStorage.setItem("medical_vitals_alerts", JSON.stringify(recentAlerts));
  } catch (error) {
    console.error("Failed to store alerts:", error);
  }
}

// Update patient vitals in storage (client-side only)
export function updatePatientVitals(vitals: WearableVitals) {
  if (typeof window === "undefined") return;

  try {
    const existingPatients = JSON.parse(
      localStorage.getItem("mediai_all_patients") || "[]",
    );

    const patientIndex = existingPatients.findIndex(
      (p: any) => p.id === vitals.patientId,
    );
    if (patientIndex >= 0) {
      existingPatients[patientIndex].vitals = {
        heartRate: vitals.heartRate,
        bloodPressure: `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`,
        temperature: vitals.temperature,
        oxygenSaturation: vitals.oxygenSaturation,
        stressLevel: vitals.stressLevel,
        steps: vitals.steps,
        calories: vitals.calories,
        lastUpdated: vitals.timestamp,
      };

      existingPatients[patientIndex].lastVitalCheck = vitals.timestamp;
      localStorage.setItem(
        "mediai_all_patients",
        JSON.stringify(existingPatients),
      );
    }
  } catch (error) {
    console.error("Failed to update patient vitals:", error);
  }
}

// Get alerts for specific patient (client-side only)
export function getPatientAlerts(patientId: string): VitalAlert[] {
  if (typeof window === "undefined") return [];

  try {
    const alerts = JSON.parse(
      localStorage.getItem("medical_vitals_alerts") || "[]",
    );
    return alerts.filter(
      (alert: VitalAlert) =>
        alert.patientId === patientId && alert.status === "active",
    );
  } catch (error) {
    console.error("Failed to get patient alerts:", error);
    return [];
  }
}

// Process vitals and generate alerts (client-side only)
export function processVitals(
  vitals: WearableVitals,
  patientName: string,
): VitalAlert[] {
  if (typeof window === "undefined") return [];

  try {
    // Check thresholds and generate alerts
    const alerts = checkVitalThresholds(vitals, patientName);

    // Store alerts if any
    if (alerts.length > 0) {
      storeAlerts(alerts);
    }

    // Update patient vitals
    updatePatientVitals(vitals);

    // Store vitals history
    const vitalsHistory = JSON.parse(
      localStorage.getItem("vitals_history") || "[]",
    );
    vitalsHistory.push({
      ...vitals,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 1000 readings
    const recentHistory = vitalsHistory.slice(-1000);
    localStorage.setItem("vitals_history", JSON.stringify(recentHistory));

    return alerts;
  } catch (error) {
    console.error("Failed to process vitals:", error);
    return [];
  }
}
