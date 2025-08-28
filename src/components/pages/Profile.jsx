import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { usersService } from "@/services/api/usersService";
import { settingsService } from "@/services/api/settingsService";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState({
    age: "",
    sex: "",
    height_cm: "",
    weight_kg: "",
    gp_name: ""
  });
  const [settingsData, setSettingsData] = useState({
    targetSys: "",
    targetDia: "",
    alertSys: "",
    alertDia: "",
    smoothingDays: ""
  });
  const [saving, setSaving] = useState(false);
  const [calculatedBMI, setCalculatedBMI] = useState(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    if (profileData.height_cm && profileData.weight_kg) {
      calculateBMI();
    }
  }, [profileData.height_cm, profileData.weight_kg]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [userData, settingsData] = await Promise.all([
        usersService.getUserProfile(),
        settingsService.getUserSettings()
      ]);
      
      setUser(userData);
      setSettings(settingsData);
      
      setProfileData({
        age: userData.profile?.age || "",
        sex: userData.profile?.sex || "",
        height_cm: userData.profile?.height_cm || "",
        weight_kg: userData.profile?.weight_kg || "",
        gp_name: userData.profile?.gp_name || ""
      });
      
      setSettingsData({
        targetSys: settingsData.targetSys || "",
        targetDia: settingsData.targetDia || "",
        alertSys: settingsData.alertSys || "",
        alertDia: settingsData.alertDia || "",
        smoothingDays: settingsData.smoothingDays || ""
      });
    } catch (err) {
      setError("Failed to load profile data");
      console.error("Profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = async () => {
    try {
      const bmiData = await usersService.calculateBMI(
        parseFloat(profileData.height_cm),
        parseFloat(profileData.weight_kg)
      );
      setCalculatedBMI(bmiData);
    } catch (error) {
      setCalculatedBMI(null);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    
    try {
      const updatedUser = await usersService.updateUserProfile(user.Id, profileData);
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    
    try {
      const updatedSettings = await settingsService.updateUserSettings(user.Id, settingsData);
      setSettings(updatedSettings);
      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings. Please try again.");
      console.error("Error updating settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm("Are you sure you want to reset all settings to NICE guidelines defaults?")) {
      return;
    }

    setSaving(true);
    
    try {
      const defaultSettings = await settingsService.resetToDefaults(user.Id);
      setSettings(defaultSettings);
      setSettingsData({
        targetSys: defaultSettings.targetSys,
        targetDia: defaultSettings.targetDia,
        alertSys: defaultSettings.alertSys,
        alertDia: defaultSettings.alertDia,
        smoothingDays: defaultSettings.smoothingDays
      });
      toast.success("Settings reset to defaults!");
    } catch (error) {
      toast.error("Failed to reset settings. Please try again.");
      console.error("Error resetting settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadProfileData} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile & Settings</h1>
        <p className="text-gray-600">
          Manage your personal information and customize your blood pressure targets
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Age"
              type="number"
              name="age"
              value={profileData.age}
              onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value }))}
              placeholder="32"
              min="18"
              max="120"
            />
            <Select
              label="Sex"
              name="sex"
              value={profileData.sex}
              onChange={(e) => setProfileData(prev => ({ ...prev, sex: e.target.value }))}
            >
              <option value="">Select sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Height (cm)"
              type="number"
              name="height_cm"
              value={profileData.height_cm}
              onChange={(e) => setProfileData(prev => ({ ...prev, height_cm: e.target.value }))}
              placeholder="175"
              min="120"
              max="250"
            />
            <Input
              label="Weight (kg)"
              type="number"
              name="weight_kg"
              value={profileData.weight_kg}
              onChange={(e) => setProfileData(prev => ({ ...prev, weight_kg: e.target.value }))}
              placeholder="70"
              min="30"
              max="300"
            />
          </div>

          {calculatedBMI && (
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-sm font-medium text-primary-900">BMI: </span>
                  <span className="text-lg font-bold text-primary-800">{calculatedBMI.bmi}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-primary-900">Category: </span>
                  <span className="text-sm text-primary-700">{calculatedBMI.category}</span>
                </div>
              </div>
            </div>
          )}
          
          <Input
            label="GP Name (optional)"
            name="gp_name"
            value={profileData.gp_name}
            onChange={(e) => setProfileData(prev => ({ ...prev, gp_name: e.target.value }))}
            placeholder="Dr. Sarah Johnson"
          />
          
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={saving}
              icon="Check"
            >
              Update Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Blood Pressure Targets */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Blood Pressure Targets</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            icon="RotateCcw"
          >
            Reset to NICE Defaults
          </Button>
        </div>
        
        <form onSubmit={handleSettingsSubmit} className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
            <h3 className="font-medium text-blue-900 mb-2">NICE Guidelines (Default)</h3>
            <p className="text-sm text-blue-700">
              Target: &lt;140/90 mmHg for adults under 80, &lt;150/90 for adults over 80.
              High alert: ≥180/110 mmHg requires immediate medical attention.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Target Systolic (mmHg)"
              type="number"
              name="targetSys"
              value={settingsData.targetSys}
              onChange={(e) => setSettingsData(prev => ({ ...prev, targetSys: e.target.value }))}
              placeholder="140"
              min="100"
              max="200"
              helperText="Your target systolic pressure"
            />
            <Input
              label="Target Diastolic (mmHg)"
              type="number"
              name="targetDia"
              value={settingsData.targetDia}
              onChange={(e) => setSettingsData(prev => ({ ...prev, targetDia: e.target.value }))}
              placeholder="90"
              min="60"
              max="120"
              helperText="Your target diastolic pressure"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Alert Systolic (mmHg)"
              type="number"
              name="alertSys"
              value={settingsData.alertSys}
              onChange={(e) => setSettingsData(prev => ({ ...prev, alertSys: e.target.value }))}
              placeholder="180"
              min="140"
              max="250"
              helperText="High pressure alert threshold"
            />
            <Input
              label="Alert Diastolic (mmHg)"
              type="number"
              name="alertDia"
              value={settingsData.alertDia}
              onChange={(e) => setSettingsData(prev => ({ ...prev, alertDia: e.target.value }))}
              placeholder="110"
              min="90"
              max="150"
              helperText="High pressure alert threshold"
            />
          </div>
          
          <Input
            label="Moving Average Days"
            type="number"
            name="smoothingDays"
            value={settingsData.smoothingDays}
            onChange={(e) => setSettingsData(prev => ({ ...prev, smoothingDays: e.target.value }))}
            placeholder="7"
            min="3"
            max="30"
            helperText="Number of days for trend calculation"
          />
          
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={saving}
              icon="Check"
            >
              Update Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Profile;