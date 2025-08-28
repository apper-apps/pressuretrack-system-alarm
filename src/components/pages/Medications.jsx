import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { medicationsService } from "@/services/api/medicationsService";
import { format } from "date-fns";

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    dose: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: "",
    note: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await medicationsService.getAll();
      setMedications(data);
    } catch (err) {
      setError("Failed to load medications");
      console.error("Medications error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.dose.trim()) {
      toast.error("Name and dose are required");
      return;
    }

    setSubmitting(true);
    
    try {
      if (editingMedication) {
        await medicationsService.update(editingMedication.Id, formData);
        toast.success("Medication updated successfully!");
      } else {
        await medicationsService.create(formData);
        toast.success("Medication added successfully!");
      }
      
      await loadMedications();
      resetForm();
    } catch (error) {
      toast.error("Failed to save medication. Please try again.");
      console.error("Error saving medication:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (medication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      dose: medication.dose,
      startDate: medication.startDate,
      endDate: medication.endDate || "",
      note: medication.note || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (medication) => {
    if (!confirm(`Are you sure you want to delete ${medication.name}?`)) {
      return;
    }

    try {
      await medicationsService.delete(medication.Id);
      toast.success("Medication deleted successfully!");
      await loadMedications();
    } catch (error) {
      toast.error("Failed to delete medication. Please try again.");
      console.error("Error deleting medication:", error);
    }
  };

  const handleDiscontinue = async (medication) => {
    try {
      await medicationsService.update(medication.Id, {
        ...medication,
        endDate: format(new Date(), "yyyy-MM-dd")
      });
      toast.success("Medication discontinued!");
      await loadMedications();
    } catch (error) {
      toast.error("Failed to discontinue medication. Please try again.");
      console.error("Error discontinuing medication:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      dose: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
      note: ""
    });
    setEditingMedication(null);
    setShowForm(false);
  };

  const getMedicationStatus = (medication) => {
    if (!medication.endDate) return "active";
    
    const endDate = new Date(medication.endDate);
    const today = new Date();
    
    return endDate <= today ? "discontinued" : "active";
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "active": return "success";
      case "discontinued": return "default";
      default: return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active": return "Active";
      case "discontinued": return "Discontinued";
      default: return "Unknown";
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadMedications} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-600">Track your blood pressure medications and their effectiveness</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          className="self-start lg:self-auto"
        >
          Add Medication
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingMedication ? "Edit Medication" : "Add New Medication"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Medication Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Lisinopril"
                required
              />
              <Input
                label="Dose"
                name="dose"
                value={formData.dose}
                onChange={(e) => setFormData(prev => ({ ...prev, dose: e.target.value }))}
                placeholder="e.g., 10mg daily"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
              <Input
                label="End Date (optional)"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                helperText="Leave blank if still taking"
              />
            </div>
            
            <Textarea
              label="Notes (optional)"
              name="note"
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Any additional notes about this medication..."
              rows={3}
            />
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                icon="Check"
              >
                {editingMedication ? "Update Medication" : "Add Medication"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Medications List */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Medications</h2>
        
        {medications.length === 0 ? (
          <Empty
            title="No medications tracked"
            description="Start by adding your blood pressure medications to track their effectiveness"
            icon="Pill"
            action={
              <Button
                onClick={() => setShowForm(true)}
                icon="Plus"
              >
                Add First Medication
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {medications.map((medication) => {
              const status = getMedicationStatus(medication);
              return (
                <div
                  key={medication.Id}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{medication.name}</h3>
                      <Badge variant={getStatusBadgeVariant(status)}>
                        {getStatusText(status)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span><strong>Dose:</strong> {medication.dose}</span>
                        <span><strong>Started:</strong> {format(new Date(medication.startDate), "MMM dd, yyyy")}</span>
                        {medication.endDate && (
                          <span><strong>Ended:</strong> {format(new Date(medication.endDate), "MMM dd, yyyy")}</span>
                        )}
                      </div>
                      {medication.note && (
                        <p className="text-gray-500 mt-1">{medication.note}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(medication)}
                      icon="Edit"
                    >
                      Edit
                    </Button>
                    
                    {status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDiscontinue(medication)}
                        icon="StopCircle"
                      >
                        Discontinue
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(medication)}
                      icon="Trash2"
                      className="text-error-600 hover:text-error-700 hover:bg-error-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Medications;