import React from "react";
import ReadingForm from "@/components/organisms/ReadingForm";
import { useNavigate } from "react-router-dom";

const AddReading = () => {
  const navigate = useNavigate();

const handleSave = () => {
    // Navigate back to dashboard after successful save
    navigate("/");
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ReadingForm
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default AddReading;