import settingsData from "@/services/mockData/settings.json";

class SettingsService {
  constructor() {
    this.data = [...settingsData];
  }

  async getUserSettings(userId = 1) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const settings = this.data.find(item => item.userId === parseInt(userId));
    if (!settings) {
      // Return default settings if none found
      return {
        userId: parseInt(userId),
        targetSys: 140,
        targetDia: 90,
        alertSys: 180,
        alertDia: 110,
        smoothingDays: 7,
        colourScheme: {
          primary: "#1976D2",
          success: "#4CAF50",
          warning: "#FF9800",
          error: "#F44336"
        }
      };
    }
    return { ...settings };
  }

  async updateUserSettings(userId = 1, settingsData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.data.findIndex(item => item.userId === parseInt(userId));
    
    if (index === -1) {
      // Create new settings if none exist
      const newSettings = {
        userId: parseInt(userId),
        ...settingsData
      };
      this.data.push(newSettings);
      return { ...newSettings };
    }
    
    const updatedSettings = {
      ...this.data[index],
      ...settingsData,
      userId: parseInt(userId)
    };
    
    this.data[index] = updatedSettings;
    return { ...updatedSettings };
  }

  async resetToDefaults(userId = 1) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const defaultSettings = {
      userId: parseInt(userId),
      targetSys: 140,
      targetDia: 90,
      alertSys: 180,
      alertDia: 110,
      smoothingDays: 7,
      colourScheme: {
        primary: "#1976D2",
        success: "#4CAF50",
        warning: "#FF9800",
        error: "#F44336"
      }
    };
    
    const index = this.data.findIndex(item => item.userId === parseInt(userId));
    
    if (index === -1) {
      this.data.push(defaultSettings);
    } else {
      this.data[index] = defaultSettings;
    }
    
    return { ...defaultSettings };
  }
}

export const settingsService = new SettingsService();