// System reset utility to clear all existing users and data

export function clearAllUsers() {
  if (typeof window === "undefined") return;

  try {
    // Clear all user-related data
    localStorage.removeItem("sympcare24_users");
    localStorage.removeItem("mediai_all_patients");
    localStorage.removeItem("medical_vitals_alerts");
    localStorage.removeItem("vitals_history");

    console.log("All existing users and patient data cleared");
  } catch (error) {
    console.error("Failed to clear user data:", error);
  }
}

export function resetToRealDevicesOnly() {
  if (typeof window === "undefined") return;

  clearAllUsers();

  // Clear any simulated device data
  localStorage.removeItem("simulated_devices");

  console.log("System reset to show only real connected devices");
}
