import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { submissionsService } from "@/services/api/submissionsService";
import { medicationsService } from "@/services/api/medicationsService";
import { format, isAfter, isBefore, parseISO, subDays } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import ChartToggle from "@/components/molecules/ChartToggle";
import DateRangePicker from "@/components/molecules/DateRangePicker";
import Card from "@/components/atoms/Card";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";

const PressureChart = () => {
  const [submissions, setSubmissions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartToggles, setChartToggles] = useState({
    reading1: true,
    reading2: true,
    reading3: true,
    dailyAverage: true,
    movingAverage: false,
    targetBand: true,
    medicationMarkers: true
  });
  const [dateRange, setDateRange] = useState("30");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [beforeAfterView, setBeforeAfterView] = useState({
    active: false,
    medicationId: "",
    windowDays: 30
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [submissionsData, medicationsData] = await Promise.all([
        submissionsService.getAll(),
        medicationsService.getAll()
      ]);
      setSubmissions(submissionsData);
      setMedications(medicationsData);
    } catch (error) {
      console.error("Error loading chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    const now = new Date();
    let startDate, endDate = now;

if (dateRange === "custom" && customRange.start && customRange.end) {
        startDate = new Date(customRange.start);
        endDate = new Date(customRange.end);
        if (isNaN(startDate)) startDate = subDays(new Date(), 30);
        if (isNaN(endDate)) endDate = new Date();
      } else {
        startDate = subDays(new Date(), 30);
        endDate = new Date();
      }
    } else if (dateRange === "all") {
      startDate = new Date(2020, 0, 1); // Far past date
    } else {
      const days = parseInt(dateRange);
      startDate = subDays(now, days);
    }

    return submissions.filter(submission => {
if (!submission.day_key_c) return false;
      const submissionDate = new Date(submission.day_key_c);
      if (isNaN(submissionDate)) return false;
      return isAfter(submissionDate, startDate) && isBefore(submissionDate, endDate);
    }).sort((a, b) => {
const dateA = new Date(a.day_key_c);
      const dateB = new Date(b.day_key_c);
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return dateA - dateB;
    });
  };

  const prepareChartData = () => {
    const filteredData = getFilteredData();
    const series = [];
const categories = filteredData.map(s => s.day_key_c);

    // Individual reading series
    if (chartToggles.reading1) {
      series.push({
        name: "Reading 1 - Systolic",
        type: "line",
data: filteredData.map(s => {
const reading1 = s.readings?.find(r => r.sequence_c === 1);
          return reading1 ? reading1.systolic_c : null;
        })
      });
      series.push({
        name: "Reading 1 - Diastolic",
type: "line",
        data: filteredData.map(s => {
const reading1 = s.readings?.find(r => r.sequence_c === 1);
          return reading1 ? reading1.diastolic_c : null;
        })
      });
    }

    if (chartToggles.reading2) {
      series.push({
        name: "Reading 2 - Systolic",
type: "line",
        data: filteredData.map(s => {
const reading2 = s.readings?.find(r => r.sequence_c === 2);
          return reading2 ? reading2.systolic_c : null;
        })
      });
      series.push({
name: "Reading 2 - Diastolic",
        type: "line",
data: filteredData.map(s => {
const reading2 = s.readings?.find(r => r.sequence_c === 2);
          return reading2 ? reading2.diastolic_c : null;
        })
      });
    }

    if (chartToggles.reading3) {
      series.push({
name: "Reading 3 - Systolic",
        type: "line",
data: filteredData.map(s => {
const reading3 = s.readings?.find(r => r.sequence_c === 3);
          return reading3 ? reading3.systolic_c : null;
        })
      });
      series.push({
        name: "Reading 3 - Diastolic",
        type: "line",
        data: filteredData.map(s => {
const reading3 = s.readings?.find(r => r.sequence_c === 3);
          return reading3 ? reading3.diastolic_c : null;
        })
      });
    }

    // Daily average
    if (chartToggles.dailyAverage) {
      series.push({
        name: "Daily Average - Systolic",
        type: "line",
data: filteredData.map(s => s.avg_sys_c || null)
      });
      series.push({
        name: "Daily Average - Diastolic",
        type: "line",
data: filteredData.map(s => s.avg_dia_c || null)
      });
    }

    // 7-day moving average
    if (chartToggles.movingAverage && filteredData.length >= 7) {
      const movingAvgSys = [];
      const movingAvgDia = [];
      
      for (let i = 0; i < filteredData.length; i++) {
        if (i < 6) {
          movingAvgSys.push(null);
          movingAvgDia.push(null);
        } else {
const window = filteredData.slice(i - 6, i + 1);
const avgSys = window.reduce((sum, s) => sum + (s.avg_sys_c || 0), 0) / window.length;
          const avgDia = window.reduce((sum, s) => sum + (s.avg_dia_c || 0), 0) / window.length;
          movingAvgSys.push(Math.round(avgSys));
          movingAvgDia.push(Math.round(avgDia));
        }
      }

      series.push({
        name: "7-Day Average - Systolic",
        type: "line",
        data: movingAvgSys
      });
      series.push({
        name: "7-Day Average - Diastolic",
        type: "line",
        data: movingAvgDia
      });
    }

    return { series, categories };
  };

  const chartOptions = {
    chart: {
      type: "line",
      height: 400,
      zoom: { enabled: true },
      toolbar: { show: true }
    },
    stroke: {
      curve: "smooth",
      width: 2
    },
    colors: ["#1976D2", "#0B5394", "#00ACC1", "#26C6DA", "#4CAF50", "#66BB6A", "#FF9800", "#FFB74D"],
    xaxis: {
      categories: prepareChartData().categories,
      type: "datetime"
    },
    yaxis: {
      title: { text: "Blood Pressure (mmHg)" },
      min: 60,
      max: 200
    },
    tooltip: {
      x: { format: "MMM dd, yyyy" },
      y: { formatter: (val) => val ? `${val} mmHg` : "No data" }
    },
    grid: {
      strokeDashArray: 3,
      borderColor: "#e0e4e7"
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center"
    }
  };

  const toggleChart = (key) => {
    setChartToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </Card>
    );
  }

  const { series, categories } = prepareChartData();

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">Blood Pressure Trends</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBeforeAfterView(prev => ({ ...prev, active: !prev.active }))}
              className={beforeAfterView.active ? "bg-primary-50 border-primary-300 text-primary-700" : ""}
            >
              <ApperIcon name="GitCompare" className="h-4 w-4 mr-1" />
              Before/After
            </Button>
          </div>
        </div>

        {/* Date Range Picker */}
        <DateRangePicker
          activeRange={dateRange}
          onRangeChange={setDateRange}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />

        {/* Before/After Controls */}
        {beforeAfterView.active && (
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h3 className="font-medium text-primary-900 mb-3">Compare Before/After Medication</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medication
                </label>
                <select
                  value={beforeAfterView.medicationId}
                  onChange={(e) => setBeforeAfterView(prev => ({ ...prev, medicationId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select medication</option>
                  {medications.map(med => (
                    <option key={med.Id} value={med.Id}>{med.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Window Size
                </label>
                <select
                  value={beforeAfterView.windowDays}
                  onChange={(e) => setBeforeAfterView(prev => ({ ...prev, windowDays: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="w-full">
          {series.length > 0 ? (
            <ReactApexChart
              options={chartOptions}
              series={series}
              type="line"
              height={400}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <ApperIcon name="BarChart3" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No data available for selected range</p>
              </div>
            </div>
          )}
        </div>

        {/* Chart Toggles */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Display Options</h3>
          <div className="flex flex-wrap gap-2">
            <ChartToggle
              label="Reading 1"
              isActive={chartToggles.reading1}
              onToggle={() => toggleChart("reading1")}
              color="primary"
            />
            <ChartToggle
              label="Reading 2"
              isActive={chartToggles.reading2}
              onToggle={() => toggleChart("reading2")}
              color="success"
            />
            <ChartToggle
              label="Reading 3"
              isActive={chartToggles.reading3}
              onToggle={() => toggleChart("reading3")}
              color="warning"
            />
            <ChartToggle
              label="Daily Average"
              isActive={chartToggles.dailyAverage}
              onToggle={() => toggleChart("dailyAverage")}
              color="error"
            />
            <ChartToggle
              label="7-Day Moving Average"
              isActive={chartToggles.movingAverage}
              onToggle={() => toggleChart("movingAverage")}
              color="primary"
            />
            <ChartToggle
              label="Target Band"
              isActive={chartToggles.targetBand}
              onToggle={() => toggleChart("targetBand")}
              color="success"
            />
            <ChartToggle
              label="Medication Markers"
              isActive={chartToggles.medicationMarkers}
              onToggle={() => toggleChart("medicationMarkers")}
              color="warning"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PressureChart;