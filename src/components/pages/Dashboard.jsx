import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { submissionsService } from "@/services/api/submissionsService";
import { medicationsService } from "@/services/api/medicationsService";
import { settingsService } from "@/services/api/settingsService";
import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [submissionsData, medicationsData, settingsData] = await Promise.all([
        submissionsService.getAll(),
        medicationsService.getAll(),
        settingsService.getUserSettings()
      ]);
      
      setSubmissions(submissionsData);
      setMedications(medicationsData);
      setSettings(settingsData);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRecentReadings = () => {
    const recent = submissions
.sort((a, b) => {
const dateA = new Date(a.day_key_c);
        const dateB = new Date(b.day_key_c);
        if (isNaN(dateA) || isNaN(dateB)) return 0;
        return dateB - dateA;
      })
      .slice(0, 7);
    return recent;
  };

  const getReadingStatus = (systolic, diastolic) => {
    if (!settings) return "default";
    
    if (systolic >= settings.alertSys || diastolic >= settings.alertDia) {
      return "error";
    }
    if (systolic >= settings.targetSys || diastolic >= settings.targetDia) {
      return "warning";
    }
    return "success";
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "success": return "success";
      case "warning": return "warning";
      case "error": return "error";
      default: return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "success": return "Normal";
      case "warning": return "Elevated";
      case "error": return "High";
      default: return "Unknown";
    }
  };

  const calculateStats = () => {
    if (submissions.length === 0 || !settings) {
      return {
        averageSys: 0,
        averageDia: 0,
        averagePulse: 0,
        inTargetPercentage: 0,
        trend: null
      };
    }

const recent30Days = submissions.filter(s => {
      if (!s.day_key_c) return false;
      const submissionDate = new Date(s.day_key_c);
      if (isNaN(submissionDate)) return false;
      const thirtyDaysAgo = subDays(new Date(), 30);
      return submissionDate >= thirtyDaysAgo;
    });

    if (recent30Days.length === 0) {
      return {
        averageSys: 0,
        averageDia: 0,
        averagePulse: 0,
        inTargetPercentage: 0,
        trend: null
      };
    }

const totalSys = recent30Days.reduce((sum, s) => sum + (s.avg_sys_c || 0), 0);
    const totalDia = recent30Days.reduce((sum, s) => sum + (s.avg_dia_c || 0), 0);
    const totalPulse = recent30Days.reduce((sum, s) => sum + (s.avg_pulse_c || 0), 0);
    const pulseCount = recent30Days.filter(s => s.avg_pulse_c).length;
    
    const inTarget = recent30Days.filter(s => 
(s.avg_sys_c || 0) < settings.target_sys_c && (s.avg_dia_c || 0) < settings.target_dia_c
    ).length;

    // Calculate trend
    const recentWeek = recent30Days.slice(0, 7);
    const previousWeek = recent30Days.slice(7, 14);
    
    let trend = null;
    if (recentWeek.length > 0 && previousWeek.length > 0) {
const recentAvgSys = recentWeek.reduce((sum, s) => sum + (s.avg_sys_c || 0), 0) / recentWeek.length;
      const previousAvgSys = previousWeek.reduce((sum, s) => sum + (s.avg_sys_c || 0), 0) / previousWeek.length;
      
      if (recentAvgSys < previousAvgSys - 2) {
        trend = "down";
      } else if (recentAvgSys > previousAvgSys + 2) {
        trend = "up";
      }
    }

    return {
      averageSys: Math.round(totalSys / recent30Days.length),
      averageDia: Math.round(totalDia / recent30Days.length),
      averagePulse: pulseCount > 0 ? Math.round(totalPulse / pulseCount) : 0,
      inTargetPercentage: Math.round((inTarget / recent30Days.length) * 100),
      trend
    };
  };

  if (loading) {
    return <Loading variant="stats" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />;
  }

  const stats = calculateStats();
  const recentReadings = getRecentReadings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Monitor your blood pressure trends and progress</p>
        </div>
        <Button
          onClick={() => navigate("/add-reading")}
          icon="Plus"
          className="self-start lg:self-auto"
        >
          Add Reading
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Average Systolic"
          value={`${stats.averageSys}`}
          subtitle="Last 30 days (mmHg)"
          icon="Activity"
          variant={getReadingStatus(stats.averageSys, 0) === "success" ? "success" : getReadingStatus(stats.averageSys, 0) === "warning" ? "warning" : "error"}
          trend={stats.trend}
          trendValue={stats.trend ? (stats.trend === "down" ? "Improving" : "Rising") : undefined}
        />
        
        <StatCard
          title="Average Diastolic"
          value={`${stats.averageDia}`}
          subtitle="Last 30 days (mmHg)"
          icon="Heart"
          variant={getReadingStatus(0, stats.averageDia) === "success" ? "success" : getReadingStatus(0, stats.averageDia) === "warning" ? "warning" : "error"}
        />
        
        <StatCard
          title="Average Pulse"
          value={stats.averagePulse ? `${stats.averagePulse}` : "N/A"}
          subtitle="Last 30 days (bpm)"
          icon="Timer"
        />
        
        <StatCard
          title="Time in Target"
          value={`${stats.inTargetPercentage}%`}
          subtitle="NICE guidelines"
          icon="Target"
          variant={stats.inTargetPercentage >= 80 ? "success" : stats.inTargetPercentage >= 60 ? "warning" : "error"}
        />
      </div>

      {/* Recent Readings */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Readings</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/chart")}
            icon="BarChart3"
          >
            View Chart
          </Button>
        </div>

        {recentReadings.length === 0 ? (
          <Empty
            title="No readings yet"
            description="Start tracking your blood pressure by adding your first reading"
            icon="Activity"
            action={
              <Button
                onClick={() => navigate("/add-reading")}
                icon="Plus"
              >
                Add First Reading
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {recentReadings.map((submission) => {
const status = getReadingStatus(submission.avg_sys_c, submission.avg_dia_c);
              return (
                <div
                  key={submission.Id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
<span className="font-medium text-gray-900">
                        {submission.day_key_c && !isNaN(new Date(submission.day_key_c))
                          ? format(new Date(submission.day_key_c), "MMM dd, yyyy")
                          : "Unknown date"}
                      </span>
                      <span className="text-sm text-gray-500">
{submission.Tags || "No tags"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-center">
<div className="text-lg font-semibold text-gray-900">
                          {submission.avg_sys_c}/{submission.avg_dia_c}
                        </div>
                        <div className="text-xs text-gray-500">mmHg</div>
                      </div>
{submission.avg_pulse_c && (
                        <div className="text-center ml-4">
                          <div className="text-sm font-medium text-gray-700">
                            {submission.avgPulse}
                          </div>
                          <div className="text-xs text-gray-500">bpm</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant={getStatusBadgeVariant(status)}>
                      {getStatusText(status)}
                    </Badge>
                    <div className="text-sm text-gray-400">
                      {submission.readings?.length || 0} reading{(submission.readings?.length || 0) !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card hover className="cursor-pointer" onClick={() => navigate("/add-reading")}>
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-3 rounded-full">
              <ApperIcon name="Plus" className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Add Reading</h3>
              <p className="text-sm text-gray-600">Record new measurements</p>
            </div>
          </div>
        </Card>
        
        <Card hover className="cursor-pointer" onClick={() => navigate("/medications")}>
          <div className="flex items-center space-x-3">
            <div className="bg-success-100 p-3 rounded-full">
              <ApperIcon name="Pill" className="h-6 w-6 text-success-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Medications</h3>
              <p className="text-sm text-gray-600">Manage your medications</p>
            </div>
          </div>
        </Card>
        
        <Card hover className="cursor-pointer" onClick={() => navigate("/export")}>
          <div className="flex items-center space-x-3">
            <div className="bg-warning-100 p-3 rounded-full">
              <ApperIcon name="Download" className="h-6 w-6 text-warning-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Export Data</h3>
              <p className="text-sm text-gray-600">Download for your GP</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;