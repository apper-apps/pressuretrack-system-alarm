import usersData from "@/services/mockData/users.json";

class UsersService {
  constructor() {
    this.data = [...usersData];
  }

  async getUserProfile(userId = 1) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const user = this.data.find(item => item.Id === parseInt(userId));
    if (!user) {
      throw new Error("User not found");
    }
    return { ...user };
  }

  async updateUserProfile(userId = 1, profileData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.data.findIndex(item => item.Id === parseInt(userId));
    if (index === -1) {
      throw new Error("User not found");
    }
    
    // Calculate BMI if height and weight are provided
    let updatedProfile = { ...profileData };
    if (profileData.height_cm && profileData.weight_kg) {
      const heightInMeters = profileData.height_cm / 100;
      const bmi = profileData.weight_kg / (heightInMeters * heightInMeters);
      updatedProfile.bmi_cached = Math.round(bmi * 10) / 10;
    }
    
    const updatedUser = {
      ...this.data[index],
      profile: {
        ...this.data[index].profile,
        ...updatedProfile
      }
    };
    
    this.data[index] = updatedUser;
    return { ...updatedUser };
  }

  async calculateBMI(height_cm, weight_kg) {
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
  }

  getBMICategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }
}

export const usersService = new UsersService();