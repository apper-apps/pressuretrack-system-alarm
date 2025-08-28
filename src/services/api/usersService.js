import { toast } from "react-toastify";

class UsersService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'user_profile_c';
  }

  async getUserProfile(userId = 1) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "email_c" } },
          { field: { Name: "age_c" } },
          { field: { Name: "sex_c" } },
          { field: { Name: "height_cm_c" } },
          { field: { Name: "weight_kg_c" } },
          { field: { Name: "bmi_cached_c" } },
          { field: { Name: "gp_name_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, userId, params);
      
      if (!response || !response.data) {
        // Create default profile if not found
        return this.createDefaultProfile(userId);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching user profile:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return this.createDefaultProfile(userId);
    }
  }

  async createDefaultProfile(userId) {
    try {
      const params = {
        records: [
          {
            Name: `User Profile ${userId}`,
            email_c: "user@example.com",
            age_c: null,
            sex_c: "",
            height_cm_c: null,
            weight_kg_c: null,
            bmi_cached_c: null,
            gp_name_c: ""
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return this.getDefaultProfile();
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0 ? successfulRecords[0].data : this.getDefaultProfile();
      }

      return this.getDefaultProfile();
    } catch (error) {
      return this.getDefaultProfile();
    }
  }

  getDefaultProfile() {
    return {
      Name: "User Profile",
      email_c: "user@example.com",
      age_c: null,
      sex_c: "",
      height_cm_c: null,
      weight_kg_c: null,
      bmi_cached_c: null,
      gp_name_c: ""
    };
  }

  async updateUserProfile(userId = 1, profileData) {
    try {
      // Calculate BMI if height and weight are provided
      let updatedProfile = { ...profileData };
      if (profileData.height_cm_c && profileData.weight_kg_c) {
        const heightInMeters = profileData.height_cm_c / 100;
        const bmi = profileData.weight_kg_c / (heightInMeters * heightInMeters);
        updatedProfile.bmi_cached_c = Math.round(bmi * 10) / 10;
      }

      const params = {
        records: [
          {
            Id: parseInt(userId),
            Name: updatedProfile.Name || `User Profile ${userId}`,
            email_c: updatedProfile.email_c,
            age_c: updatedProfile.age_c,
            sex_c: updatedProfile.sex_c,
            height_cm_c: updatedProfile.height_cm_c,
            weight_kg_c: updatedProfile.weight_kg_c,
            bmi_cached_c: updatedProfile.bmi_cached_c,
            gp_name_c: updatedProfile.gp_name_c
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
          console.error(`Failed to update user profile ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating user profile:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  }

  async calculateBMI(height_cm, weight_kg) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!height_cm || !weight_kg) {
        throw new Error("Height and weight are required for BMI calculation");
      }
      
      const heightInMeters = height_cm / 100;
      const bmi = weight_kg / (heightInMeters * heightInMeters);
      
      return {
        bmi: Math.round(bmi * 10) / 10,
        category: this.getBMICategory(bmi)
      };
    } catch (error) {
      throw error;
    }
  }

  getBMICategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }
}

export const usersService = new UsersService();