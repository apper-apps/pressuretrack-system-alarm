import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ReadingForm from "@/components/organisms/ReadingForm";
import ApperIcon from "@/components/ApperIcon";
import { submissionsService } from "@/services/api/submissionsService";
import { format } from "date-fns";

const Readings = () => {
  const navigate = useNavigate();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingReading, setEditingReading] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    loadReadings();
  }, []);

  const loadReadings = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await submissionsService.getAll();
      setReadings(data);
    } catch (err) {
      setError("Failed to load readings");
      console.error("Readings error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getReadingStatus = (systolic, diastolic) => {
    if (systolic >= 180 || diastolic >= 120) {
      return "crisis";
    } else if (systolic >= 140 || diastolic >= 90) {
      return "high";
    } else if (systolic >= 130 || diastolic >= 80) {
      return "elevated";
    } else if (systolic >= 120) {
      return "elevated";
    } else {
      return "normal";
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "normal":
        return "success";
      case "elevated":
        return "warning";
      case "high":
      case "crisis":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "normal":
        return "Normal";
      case "elevated":
        return "Elevated";
      case "high":
        return "High";
      case "crisis":
        return "Crisis";
      default:
        return "Unknown";
    }
  };

  const handleEdit = async (reading) => {
    try {
      // Get full reading details
      const fullReading = await submissionsService.getById(reading.Id);
      if (fullReading) {
        setEditingReading({
          ...fullReading,
          datetime: fullReading.submitted_at_c || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          position: fullReading.position_c || "sitting",
          arm: fullReading.arm_c || "left",
          tags: fullReading.Tags ? fullReading.Tags.split(',').filter(Boolean) : [],
          checklist: fullReading.checklist_c ? fullReading.checklist_c.split(',').filter(Boolean) : [],
          note: fullReading.note_c || "",
          readings: fullReading.readings?.map(r => ({
            sequence: r.sequence_c,
            systolic: r.systolic_c?.toString() || "",
            diastolic: r.diastolic_c?.toString() || "",
            pulse: r.pulse_c?.toString() || "",
            isCollapsed: false
          })) || []
        });
        setShowEditForm(true);
      }
    } catch (error) {
      toast.error("Failed to load reading details");
      console.error("Error loading reading:", error);
    }
  };

  const handleDelete = async (reading) => {
    if (!confirm(`Are you sure you want to delete this reading from ${reading.day_key_c}?`)) {
      return;
    }

    try {
      await submissionsService.delete(reading.Id);
      toast.success("Reading deleted successfully!");
      await loadReadings();
    } catch (error) {
      toast.error("Failed to delete reading. Please try again.");
      console.error("Error deleting reading:", error);
    }
  };

  const handleEditSave = async () => {
    await loadReadings();
    setShowEditForm(false);
    setEditingReading(null);
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setEditingReading(null);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadReadings} />;
  }

  if (showEditForm && editingReading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={handleEditCancel}
            icon="ArrowLeft"
          >
            Back to Readings
          </Button>
        </div>
        <ReadingForm
          initialData={editingReading}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Readings</h1>
          <p className="text-gray-600">View and manage your blood pressure readings</p>
        </div>
        <Button
          onClick={() => navigate("/add-reading")}
          icon="Plus"
          className="self-start lg:self-auto"
        >
          Add Reading
        </Button>
      </div>

      {/* Readings List */}
      <Card>
        {readings.length === 0 ? (
          <Empty
            title="No readings found"
            description="Start by adding your first blood pressure reading to track your health"
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
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Readings</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Average</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Context</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((reading) => {
                    const status = getReadingStatus(reading.avg_sys_c, reading.avg_dia_c);
                    return (
                      <tr key={reading.Id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {reading.day_key_c && !isNaN(new Date(reading.day_key_c))
                                ? format(new Date(reading.day_key_c), "MMM dd, yyyy")
                                : "Unknown date"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reading.submitted_at_c && !isNaN(new Date(reading.submitted_at_c))
                                ? format(new Date(reading.submitted_at_c), "h:mm a")
                                : "Unknown time"}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            {reading.readings?.slice(0, 3).map((r, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">{r.systolic_c}/{r.diastolic_c}</span>
                                {r.pulse_c && <span className="text-gray-500 ml-2">({r.pulse_c})</span>}
                              </div>
                            ))}
                            {reading.readings?.length > 3 && (
                              <div className="text-sm text-gray-500">
                                +{reading.readings.length - 3} more
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium">
                            {reading.avg_sys_c}/{reading.avg_dia_c}
                          </div>
                          {reading.avg_pulse_c && (
                            <div className="text-sm text-gray-500">
                              Pulse: {reading.avg_pulse_c}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={getStatusBadgeVariant(status)}>
                            {getStatusText(status)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">
                            <div>{reading.position_c || "Unknown"} • {reading.arm_c || "Unknown"} arm</div>
                            {reading.Tags && (
                              <div className="text-gray-500 mt-1">
                                {reading.Tags.split(',').filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(reading)}
                              icon="Edit"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(reading)}
                              icon="Trash2"
                              className="text-error-600 hover:text-error-700 hover:bg-error-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {readings.map((reading) => {
                const status = getReadingStatus(reading.avg_sys_c, reading.avg_dia_c);
                return (
                  <div
                    key={reading.Id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {reading.day_key_c && !isNaN(new Date(reading.day_key_c))
                            ? format(new Date(reading.day_key_c), "MMM dd, yyyy")
                            : "Unknown date"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reading.submitted_at_c && !isNaN(new Date(reading.submitted_at_c))
                            ? format(new Date(reading.submitted_at_c), "h:mm a")
                            : "Unknown time"}
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(status)}>
                        {getStatusText(status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Average Reading</div>
                        <div className="font-medium text-lg">
                          {reading.avg_sys_c}/{reading.avg_dia_c}
                        </div>
                        {reading.avg_pulse_c && (
                          <div className="text-sm text-gray-500">
                            Pulse: {reading.avg_pulse_c}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Context</div>
                        <div className="text-sm">
                          {reading.position_c || "Unknown"} • {reading.arm_c || "Unknown"} arm
                        </div>
                        {reading.Tags && (
                          <div className="text-sm text-gray-500 mt-1">
                            {reading.Tags.split(',').filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {reading.readings?.length || 0} reading{reading.readings?.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(reading)}
                          icon="Edit"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(reading)}
                          icon="Trash2"
                          className="text-error-600 hover:text-error-700"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Readings;