import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import Checkbox from "@/components/atoms/Checkbox";
import Card from "@/components/atoms/Card";
import ReadingInput from "@/components/molecules/ReadingInput";
import { submissionsService } from "@/services/api/submissionsService";
import { format } from "date-fns";

const ReadingForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    position: "sitting",
    arm: "left",
    tags: [],
    checklist: [],
    note: "",
    ...initialData
  });

  const [readings, setReadings] = useState([
    { sequence: 1, systolic: "", diastolic: "", pulse: "", isCollapsed: false },
    { sequence: 2, systolic: "", diastolic: "", pulse: "", isCollapsed: true },
    { sequence: 3, systolic: "", diastolic: "", pulse: "", isCollapsed: true },
    ...(initialData?.readings || [])
  ]);

  const [loading, setLoading] = useState(false);

  const tagOptions = [
    { value: "morning", label: "Morning" },
    { value: "evening", label: "Evening" },
    { value: "pre-meds", label: "Pre-medication" },
    { value: "post-exercise", label: "Post-exercise" }
  ];

  const checklistItems = [
    { value: "seated-5min", label: "Seated for 5+ minutes" },
    { value: "feet-floor", label: "Feet flat on floor" },
    { value: "arm-supported", label: "Arm supported at heart level" },
    { value: "no-talking", label: "No talking during measurement" },
    { value: "bladder-empty", label: "Bladder emptied beforehand" }
  ];

  const handleReadingChange = (sequence, field, value) => {
    setReadings(prev => prev.map(reading =>
      reading.sequence === sequence
        ? { ...reading, [field]: value }
        : reading
    ));
  };

  const toggleReadingCollapse = (sequence) => {
    setReadings(prev => prev.map(reading =>
      reading.sequence === sequence
        ? { ...reading, isCollapsed: !reading.isCollapsed }
        : reading
    ));
  };

  const handleTagChange = (tagValue, checked) => {
    setFormData(prev => ({
      ...prev,
      tags: checked
        ? [...prev.tags, tagValue]
        : prev.tags.filter(tag => tag !== tagValue)
    }));
  };

  const handleChecklistChange = (checklistValue, checked) => {
    setFormData(prev => ({
      ...prev,
      checklist: checked
        ? [...prev.checklist, checklistValue]
        : prev.checklist.filter(item => item !== checklistValue)
    }));
  };

  const validateForm = () => {
    const validReadings = readings.filter(r => r.systolic && r.diastolic);
    
    if (validReadings.length === 0) {
      toast.error("Please enter at least one complete reading");
      return false;
    }

    // Validate systolic > diastolic for each reading
    for (const reading of validReadings) {
      if (parseInt(reading.systolic) <= parseInt(reading.diastolic)) {
        toast.error(`Reading ${reading.sequence}: Systolic must be greater than diastolic`);
        return false;
      }
    }

    // Soft bounds with warnings
    for (const reading of validReadings) {
      const sys = parseInt(reading.systolic);
      const dia = parseInt(reading.diastolic);
      
      if (sys < 70 || sys > 250 || dia < 40 || dia > 150) {
        toast.warning(`Reading ${reading.sequence} values seem unusual. Please double-check.`);
      }
    }

    return true;
  };

  const calculateAverages = (validReadings) => {
    const totalSys = validReadings.reduce((sum, r) => sum + parseInt(r.systolic), 0);
    const totalDia = validReadings.reduce((sum, r) => sum + parseInt(r.diastolic), 0);
    const totalPulse = validReadings
      .filter(r => r.pulse)
      .reduce((sum, r) => sum + parseInt(r.pulse), 0);
    
    const pulseCount = validReadings.filter(r => r.pulse).length;

    return {
      avgSys: Math.round(totalSys / validReadings.length),
      avgDia: Math.round(totalDia / validReadings.length),
      avgPulse: pulseCount > 0 ? Math.round(totalPulse / pulseCount) : null
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const validReadings = readings.filter(r => r.systolic && r.diastolic);
      const averages = calculateAverages(validReadings);
      
      const submissionDate = new Date(formData.datetime);
      const dayKey = format(submissionDate, "yyyy-MM-dd");

      const submissionData = {
        dayKey,
        submittedAt: formData.datetime,
        position: formData.position,
        arm: formData.arm,
        tags: formData.tags,
        checklist: formData.checklist,
        note: formData.note,
        readings: validReadings.map(r => ({
          sequence: r.sequence,
          systolic: parseInt(r.systolic),
          diastolic: parseInt(r.diastolic),
          pulse: r.pulse ? parseInt(r.pulse) : null,
          includeInAverage: true
        })),
        ...averages
      };

      if (initialData?.Id) {
        await submissionsService.update(initialData.Id, submissionData);
        toast.success("Reading updated successfully!");
      } else {
        await submissionsService.create(submissionData);
        toast.success("Reading submitted successfully!");
      }

      if (onSave) onSave();
    } catch (error) {
      toast.error("Failed to save reading. Please try again.");
      console.error("Error saving reading:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData?.Id ? "Edit Reading" : "Add New Reading"}
          </h2>
          <div className="text-sm text-gray-500">
            {format(new Date(formData.datetime), "MMM dd, yyyy 'at' h:mm a")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date & Time"
            type="datetime-local"
            name="datetime"
            value={formData.datetime}
            onChange={(e) => setFormData(prev => ({ ...prev, datetime: e.target.value }))}
            required
          />
        </div>
      </Card>

      {/* Readings */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Blood Pressure Readings</h3>
        <div className="space-y-4">
          {readings.map(reading => (
            <ReadingInput
              key={reading.sequence}
              sequence={reading.sequence}
              systolic={reading.systolic}
              diastolic={reading.diastolic}
              pulse={reading.pulse}
              onChange={handleReadingChange}
              isCollapsed={reading.isCollapsed}
              onToggle={() => toggleReadingCollapse(reading.sequence)}
            />
          ))}
        </div>
      </Card>

      {/* Measurement Context */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Measurement Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Position"
            name="position"
            value={formData.position}
            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            required
          >
            <option value="sitting">Sitting</option>
            <option value="standing">Standing</option>
            <option value="lying">Lying down</option>
          </Select>

          <Select
            label="Arm Used"
            name="arm"
            value={formData.arm}
            onChange={(e) => setFormData(prev => ({ ...prev, arm: e.target.value }))}
            required
          >
            <option value="left">Left arm</option>
            <option value="right">Right arm</option>
          </Select>
        </div>

        {/* Tags */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tags (optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tagOptions.map(tag => (
              <Checkbox
                key={tag.value}
                name={`tag-${tag.value}`}
                label={tag.label}
                checked={formData.tags.includes(tag.value)}
                onChange={(e) => handleTagChange(tag.value, e.target.checked)}
              />
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preparation Checklist
          </label>
          <div className="space-y-3">
            {checklistItems.map(item => (
              <Checkbox
                key={item.value}
                name={`checklist-${item.value}`}
                label={item.label}
                checked={formData.checklist.includes(item.value)}
                onChange={(e) => handleChecklistChange(item.value, e.target.checked)}
              />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <Textarea
            label="Medication Notes (optional)"
            name="note"
            value={formData.note}
            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
            placeholder="Any relevant notes about medications, symptoms, or circumstances..."
            rows={3}
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          loading={loading}
          icon="Check"
        >
          {initialData?.Id ? "Update Reading" : "Save Reading"}
        </Button>
      </div>
    </form>
  );
};

export default ReadingForm;