"use client";
import React, { useState, useEffect } from "react";


export default function DiagnosisForm({ onSuccess, editingDiagnosis, onCancelEdit }: any) {
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    symptoms: "",
    diagnosis: "",
    remarks: "",
    diagnosisDate: "",
    severity: "Mild",
  });
  const [existingPatientIds, setExistingPatientIds] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (editingDiagnosis) setFormData(editingDiagnosis);
  }, [editingDiagnosis]);

  useEffect(() => {
    // Fetch all diagnosis records to get existing patient IDs
    const fetchPatientIds = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/diagnosis`);
        const data = await res.json();
        setExistingPatientIds(data.map((d: any) => d.patientId));
      } catch (err) {
        console.error("Error fetching patient IDs:", err);
      }
    };
    fetchPatientIds();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on change
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!editingDiagnosis && existingPatientIds.includes(formData.patientId)) {
      setError("A record with this Patient ID already exists.");
      return;
    }

    if (formData.diagnosisDate) {
      const selectedDate = new Date(formData.diagnosisDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        setError("Diagnosis date cannot be in the future.");
        return;
      }
    }

    const url = editingDiagnosis
      ? `http://localhost:8000/api/diagnosis/${editingDiagnosis._id}`
      : `http://localhost:8000/api/diagnosis`;

    const method = editingDiagnosis ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({
        patientId: "",
        patientName: "",
        symptoms: "",
        diagnosis: "",
        remarks: "",
        diagnosisDate: "",
        severity: "Mild",
      });
      onSuccess();
      if (onCancelEdit) onCancelEdit();
    } else {
      alert("Failed to save diagnosis");
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-green-100"
    >
      <h2 className="text-2xl font-semibold text-green-700 mb-2">
        {editingDiagnosis ? "Edit Diagnosis" : "New Patient Diagnosis"}
      </h2>

      <input
        name="patientId"
        placeholder="Patient ID"
        value={formData.patientId}
        onChange={handleChange}
        className="w-full p-3 bg-green-50 rounded-lg border border-green-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
        required
        disabled={!!editingDiagnosis}
      />
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

      <input
        name="patientName"
        placeholder="Patient Name"
        value={formData.patientName}
        onChange={handleChange}
        className="w-full p-3 bg-green-50 rounded-lg border border-green-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
        required
      />

      <textarea
        name="symptoms"
        placeholder="Symptoms"
        value={formData.symptoms}
        onChange={handleChange}
        className="w-full p-3 bg-green-50 rounded-lg border border-green-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
        rows={2}
        required
      />

      <textarea
        name="diagnosis"
        placeholder="Diagnosis"
        value={formData.diagnosis}
        onChange={handleChange}
        className="w-full p-3 bg-green-50 rounded-lg border border-green-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
        rows={2}
        required
      />

      <textarea
        name="remarks"
        placeholder="Remarks"
        value={formData.remarks}
        onChange={handleChange}
        className="w-full p-3 bg-green-50 rounded-lg border border-green-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
        rows={2}
      />

      <input
        type="date"
        name="diagnosisDate"
        value={formData.diagnosisDate}
        onChange={handleChange}
        className="w-full p-3 bg-green-50 rounded-lg border border-green-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
        max={todayStr}
        required
      />

      <select
        name="severity"
        value={formData.severity}
        onChange={handleChange}
        className="w-full p-3 bg-green-50 rounded-lg border border-green-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
        required
      >
        <option value="Mild">Mild</option>
        <option value="Moderate">Moderate</option>
        <option value="Severe">Severe</option>
      </select>

      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow-md transition font-semibold"
        >
          {editingDiagnosis ? "Update" : "Save"}
        </button>
        {editingDiagnosis && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg font-semibold"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}


