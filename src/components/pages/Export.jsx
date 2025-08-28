import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { submissionsService } from "@/services/api/submissionsService";
import { medicationsService } from "@/services/api/medicationsService";
import { usersService } from "@/services/api/usersService";
import { format, subDays } from "date-fns";

const Export = () => {
  const [submissions, setSubmissions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    format: "csv",
    dateRange: "30",
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    includeReadings: true,
    includeMedications: true,
    includeNotes: true
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    updateDateRange();
  }, [exportConfig.dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [submissionsData, medicationsData, userData] = await Promise.all([
        submissionsService.getAll(),
        medicationsService.getAll(),
        usersService.getUserProfile()
      ]);
      
      setSubmissions(submissionsData);
      setMedications(medicationsData);
      setUser(userData);
    } catch (err) {
      setError("Failed to load export data");
      console.error("Export error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateDateRange = () => {
    const now = new Date();
    let startDate;

    switch (exportConfig.dateRange) {
      case "7":
        startDate = subDays(now, 7);
        break;
      case "30":
        startDate = subDays(now, 30);
        break;
      case "90":
        startDate = subDays(now, 90);
        break;
      case "180":
        startDate = subDays(now, 180);
        break;
      case "all":
        startDate = new Date(2020, 0, 1);
        break;
      default:
        return; // Custom range - don't update
    }

    setExportConfig(prev => ({
      ...prev,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(now, "yyyy-MM-dd")
    }));
  };

  const getFilteredSubmissions = () => {
    return submissions.filter(submission => {
if (!submission.dayKey || !exportConfig.startDate || !exportConfig.endDate) return false;
      
      const submissionDate = new Date(submission.dayKey);
      const start = new Date(exportConfig.startDate);
      const end = new Date(exportConfig.endDate);
      
      if (isNaN(submissionDate) || isNaN(start) || isNaN(end)) return false;
      
      return submissionDate >= start && submissionDate <= end;
    }).sort((a, b) => {
      const dateA = new Date(a.dayKey);
      const dateB = new Date(b.dayKey);
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return dateA - dateB;
    });
  };

  const generateCSV = () => {
    const filteredSubmissions = getFilteredSubmissions();
    const csvRows = [];

    // CSV Headers
    const headers = [
      "Date",
      "Time",
      "Reading_Sequence",
      "Systolic_mmHg",
      "Diastolic_mmHg",
      "Pulse_bpm",
      "Position",
      "Arm",
      "Tags",
      "Daily_Avg_Sys",
      "Daily_Avg_Dia",
      "Daily_Avg_Pulse"
    ];

    if (exportConfig.includeNotes) {
      headers.push("Notes");
    }

    csvRows.push(headers.join(","));

    // Data rows
    filteredSubmissions.forEach(submission => {
      if (submission.readings && submission.readings.length > 0) {
        submission.readings.forEach(reading => {
          const row = [
submission.dayKey,
            submission.submittedAt && !isNaN(new Date(submission.submittedAt))
              ? format(new Date(submission.submittedAt), "HH:mm")
              : "Unknown time",
            reading.sequence,
            reading.systolic,
            reading.diastolic,
            reading.pulse || "",
            submission.position,
            submission.arm,
            `"${submission.tags.join("; ")}"`,
            submission.avgSys,
            submission.avgDia,
            submission.avgPulse || ""
          ];

          if (exportConfig.includeNotes) {
            row.push(`"${submission.note || ""}"`);
          }

          csvRows.push(row.join(","));
        });
      } else {
        // Submission without readings
        const row = [
submission.dayKey,
          submission.submittedAt && !isNaN(new Date(submission.submittedAt))
            ? format(new Date(submission.submittedAt), "HH:mm")
            : "Unknown time",
          "",
          "",
          "",
          "",
          submission.position,
          submission.arm,
          `"${submission.tags.join("; ")}"`,
          submission.avgSys,
          submission.avgDia,
          submission.avgPulse || ""
        ];

        if (exportConfig.includeNotes) {
          row.push(`"${submission.note || ""}"`);
        }

        csvRows.push(row.join(","));
      }
    });

    return csvRows.join("\n");
  };

  const generatePDF = () => {
    const filteredSubmissions = getFilteredSubmissions();
const activeMedications = medications.filter(med => {
      if (!med.endDate) return true;
      const endDate = new Date(med.endDate);
      const startDate = new Date(exportConfig.startDate);
      if (isNaN(endDate) || isNaN(startDate)) return true;
      return endDate >= startDate;
    });

let pdfContent = `BLOOD PRESSURE MONITORING REPORT
Generated: ${format(new Date(), "MMMM dd, yyyy")}
Period: ${exportConfig.startDate && !isNaN(new Date(exportConfig.startDate))
  ? format(new Date(exportConfig.startDate), "MMM dd, yyyy")
  : "Unknown start"} - ${exportConfig.endDate && !isNaN(new Date(exportConfig.endDate))
  ? format(new Date(exportConfig.endDate), "MMM dd, yyyy")
  : "Unknown end"}

PATIENT INFORMATION:
`;

    if (user?.profile) {
      const profile = user.profile;
      pdfContent += `Age: ${profile.age || "Not specified"}
Sex: ${profile.sex || "Not specified"}
Height: ${profile.height_cm ? `${profile.height_cm} cm` : "Not specified"}
Weight: ${profile.weight_kg ? `${profile.weight_kg} kg` : "Not specified"}
BMI: ${profile.bmi_cached ? profile.bmi_cached : "Not calculated"}
GP: ${profile.gp_name || "Not specified"}
`;
    }

    if (exportConfig.includeMedications && activeMedications.length > 0) {
      pdfContent += `\nCURRENT MEDICATIONS:
`;
      activeMedications.forEach(med => {
pdfContent += `- ${med.name} (${med.dose}) - Started: ${med.startDate && !isNaN(new Date(med.startDate))
          ? format(new Date(med.startDate), "MMM dd, yyyy")
          : "Unknown date"}
`;
        if (med.note) {
          pdfContent += `  Note: ${med.note}
`;
        }
      });
    }

    pdfContent += `\nBLOOD PRESSURE READINGS:
`;

    if (filteredSubmissions.length === 0) {
      pdfContent += "No readings available for selected period.";
    } else {
filteredSubmissions.forEach(submission => {
        pdfContent += `\nDate: ${submission.dayKey && !isNaN(new Date(submission.dayKey))
          ? format(new Date(submission.dayKey), "MMM dd, yyyy")
          : "Unknown date"}
Daily Average: ${submission.avgSys}/${submission.avgDia} mmHg`;
        
        if (submission.avgPulse) {
          pdfContent += ` (Pulse: ${submission.avgPulse} bpm)`;
        }
        
        pdfContent += `
Position: ${submission.position}, Arm: ${submission.arm}
Tags: ${submission.tags.join(", ") || "None"}
`;

        if (exportConfig.includeReadings && submission.readings) {
          pdfContent += "Individual readings:\n";
          submission.readings.forEach(reading => {
            pdfContent += `  Reading ${reading.sequence}: ${reading.systolic}/${reading.diastolic} mmHg`;
            if (reading.pulse) {
              pdfContent += ` (Pulse: ${reading.pulse} bpm)`;
            }
            pdfContent += "\n";
          });
        }

        if (exportConfig.includeNotes && submission.note) {
          pdfContent += `Notes: ${submission.note}
`;
        }
      });
    }

    return pdfContent;
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      let content, filename, mimeType;

      if (exportConfig.format === "csv") {
        content = generateCSV();
        filename = `blood-pressure-data-${format(new Date(), "yyyy-MM-dd")}.csv`;
        mimeType = "text/csv";
      } else {
        content = generatePDF();
        filename = `blood-pressure-report-${format(new Date(), "yyyy-MM-dd")}.txt`;
        mimeType = "text/plain";
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${exportConfig.format.toUpperCase()} exported successfully!`);
    } catch (error) {
      toast.error("Failed to export data. Please try again.");
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  const filteredSubmissions = getFilteredSubmissions();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Export Data</h1>
        <p className="text-gray-600">
          Export your blood pressure data for sharing with your healthcare provider
        </p>
      </div>

      {/* Export Configuration */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Settings</h2>
        
        <div className="space-y-4">
          {/* Format Selection */}
          <Select
            label="Export Format"
            name="format"
            value={exportConfig.format}
            onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value }))}
          >
            <option value="csv">CSV (Detailed Data)</option>
            <option value="pdf">PDF Report (GP Summary)</option>
          </Select>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Date Range"
              name="dateRange"
              value={exportConfig.dateRange}
              onChange={(e) => setExportConfig(prev => ({ ...prev, dateRange: e.target.value }))}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="180">Last 180 days</option>
              <option value="all">All time</option>
              <option value="custom">Custom range</option>
            </Select>
            
            {exportConfig.dateRange === "custom" && (
              <>
                <Input
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={exportConfig.startDate}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, startDate: e.target.value }))}
                />
                <Input
                  label="End Date"
                  type="date"
                  name="endDate"
                  value={exportConfig.endDate}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </>
            )}
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Include in Export</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportConfig.includeReadings}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, includeReadings: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Individual readings</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportConfig.includeMedications}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, includeMedications: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Medication history</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportConfig.includeNotes}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, includeNotes: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Notes and comments</span>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Preview</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-2 rounded-full">
                <ApperIcon name={exportConfig.format === "csv" ? "FileSpreadsheet" : "FileText"} className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {exportConfig.format === "csv" ? "CSV Data File" : "PDF Report"}
                </h3>
                <p className="text-sm text-gray-600">
{filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? "s" : ""} from{" "}
                  {exportConfig.startDate && !isNaN(new Date(exportConfig.startDate))
                    ? format(new Date(exportConfig.startDate), "MMM dd")
                    : "unknown start"} to {exportConfig.endDate && !isNaN(new Date(exportConfig.endDate))
                    ? format(new Date(exportConfig.endDate), "MMM dd, yyyy")
                    : "unknown end"}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">File size estimate</div>
              <div className="font-medium text-gray-900">
                {exportConfig.format === "csv" ? "~2-5 KB" : "~10-20 KB"}
              </div>
            </div>
          </div>

          {/* Data Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-800">{filteredSubmissions.length}</div>
              <div className="text-sm text-primary-600">Submissions</div>
            </div>
            
            <div className="text-center p-4 bg-success-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800">
                {filteredSubmissions.reduce((sum, s) => sum + (s.readings?.length || 0), 0)}
              </div>
              <div className="text-sm text-green-600">Readings</div>
            </div>
            
            <div className="text-center p-4 bg-warning-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-800">
                {medications.filter(med => !med.endDate || new Date(med.endDate) >= new Date(exportConfig.startDate)).length}
              </div>
              <div className="text-sm text-orange-600">Medications</div>
            </div>
            
            <div className="text-center p-4 bg-error-50 rounded-lg">
              <div className="text-2xl font-bold text-red-800">
{(() => {
                  if (!exportConfig.startDate || !exportConfig.endDate) return "0";
                  const start = new Date(exportConfig.startDate);
                  const end = new Date(exportConfig.endDate);
                  if (isNaN(start) || isNaN(end)) return "0";
                  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                })()}
              </div>
              <div className="text-sm text-red-600">Days</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Export Action */}
      <div className="flex justify-center">
        <Button
          onClick={handleExport}
          loading={exporting}
          icon="Download"
          size="lg"
          disabled={filteredSubmissions.length === 0}
        >
          {exporting ? "Generating..." : `Export ${exportConfig.format.toUpperCase()}`}
        </Button>
      </div>

      {filteredSubmissions.length === 0 && (
        <div className="text-center py-8">
          <ApperIcon name="FileX" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No data available for the selected date range.</p>
        </div>
      )}
    </div>
  );
};

export default Export;