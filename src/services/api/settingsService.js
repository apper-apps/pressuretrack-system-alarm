import { toast } from "react-toastify";
import React from "react";

class SettingsService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'setting_c';
  }

  async getUserSettings(userId = 1) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "target_sys_c" } },
          { field: { Name: "target_dia_c" } },
          { field: { Name: "alert_sys_c" } },
          { field: { Name: "alert_dia_c" } },
          { field: { Name: "smoothing_days_c" } },
          { field: { Name: "colour_scheme_c" } },
          { field: { Name: "user_c" } }
        ],
        where: [
          {
            FieldName: "user_c",
            Operator: "EqualTo",
            Values: [parseInt(userId)]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        // Return default settings if none found
        return this.getDefaultSettings();
      }

      if (!response.data || response.data.length === 0) {
        // Create default settings for user
        return this.createDefaultSettings(userId);
      }

      return response.data[0];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching user settings:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return this.getDefaultSettings();
    }
  }

  async updateUserSettings(userId = 1, settingsData) {
    try {
      // First try to get existing settings
      const existingSettings = await this.getUserSettings(userId);
      
      if (existingSettings.Id) {
        // Update existing settings
        const params = {
          records: [
            {
              Id: existingSettings.Id,
              Name: settingsData.Name || "User Settings",
              target_sys_c: settingsData.target_sys_c,
              target_dia_c: settingsData.target_dia_c,
              alert_sys_c: settingsData.alert_sys_c,
              alert_dia_c: settingsData.alert_dia_c,
              smoothing_days_c: settingsData.smoothing_days_c,
              colour_scheme_c: settingsData.colour_scheme_c || "default",
              user_c: parseInt(userId)
            }
          ]
        };

        const response = await this.apperClient.updateRecord(this.tableName, params);
        
        if (!response.success) {
          console.error(response.message);
          toast.error(response.message);
          return null;
        }

        if (response.results) {
          const successfulUpdates = response.results.filter(result => result.success);
          const failedUpdates = response.results.filter(result => !result.success);
          
          if (failedUpdates.length > 0) {
            console.error(`Failed to update settings ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
            
            failedUpdates.forEach(record => {
              record.errors?.forEach(error => {
                toast.error(`${error.fieldLabel}: ${error}`);
              });
              if (record.message) toast.error(record.message);
            });
          }
          
          return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
        }
      } else {
        // Create new settings
        return this.createUserSettings(userId, settingsData);
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating user settings:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  }

  async createUserSettings(userId, settingsData) {
    try {
      const params = {
        records: [
          {
            Name: settingsData.Name || "User Settings",
            target_sys_c: settingsData.target_sys_c,
            target_dia_c: settingsData.target_dia_c,
            alert_sys_c: settingsData.alert_sys_c,
            alert_dia_c: settingsData.alert_dia_c,
            smoothing_days_c: settingsData.smoothing_days_c,
            colour_scheme_c: settingsData.colour_scheme_c || "default",
            user_c: parseInt(userId)
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create settings ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating user settings:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  }

  async createDefaultSettings(userId) {
    const defaultSettings = {
      Name: "Default Settings",
      target_sys_c: 140,
      target_dia_c: 90,
      alert_sys_c: 180,
      alert_dia_c: 110,
      smoothing_days_c: 7,
      colour_scheme_c: "default"
    };

    return this.createUserSettings(userId, defaultSettings);
  }

  async resetToDefaults(userId = 1) {
    try {
      const defaultSettings = {
        Name: "Default Settings",
        target_sys_c: 140,
        target_dia_c: 90,
        alert_sys_c: 180,
        alert_dia_c: 110,
        smoothing_days_c: 7,
        colour_scheme_c: "default"
      };

      const result = await this.updateUserSettings(userId, defaultSettings);
      return result || defaultSettings;
    } catch (error) {
      return this.getDefaultSettings();
    }
  }

  getDefaultSettings() {
    return {
      Name: "Default Settings",
      target_sys_c: 140,
      target_dia_c: 90,
      alert_sys_c: 180,
      alert_dia_c: 110,
      smoothing_days_c: 7,
      colour_scheme_c: "default"
    };
  }
}

export const settingsService = new SettingsService();