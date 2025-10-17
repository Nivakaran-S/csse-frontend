"use client";
import React, { useState, useEffect } from "react";
import DiagnosisCount from "./DiagnosisCount";

const SEVERITY_OPTIONS = [
  { label: "All", value: "" },
  { label: "Mild", value: "mild" },
  { label: "Moderate", value: "moderate" },
  { label: "Severe", value: "severe" },
];

export default function DiagnosisList({ onEdit }: any) {
  const [diagnoses, setDiagnoses] = useState([]);
  const [severityFilter, setSeverityFilter] = useState("");

  const fetchDiagnoses = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diagnosis`);
      const data = await res.json();
      setDiagnoses(data);
    } catch (err) {
      console.error("Error fetching diagnoses:", err);
    }
  };

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this diagnosis?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diagnosis/${id}`, {
        method: "DELETE",
      });
      fetchDiagnoses();
    } catch (err) {
      console.error("Error deleting diagnosis:", err);
    }
  };

  // Filter diagnoses by severity
  const filteredDiagnoses = diagnoses.filter((d: any) => {
    const severity =
      d.severityType?.toLowerCase() ||
      d.severity?.toLowerCase() ||
      "";
    return !severityFilter || severity === severityFilter;
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6 text-gray-900">
      <div className="flex items-center justify-between mb-4">
        <DiagnosisCount count={diagnoses.length} />

        <h2 className="text-2xl font-semibold text-green-700">Diagnosis Records</h2>

        <div>
          <label htmlFor="severity-filter" className="mr-2 text-gray-700 font-medium">
            Filter by Severity:
          </label>
          <select
            id="severity-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-green-50 text-gray-800 px-3 py-2 rounded border border-green-300 focus:ring-2 focus:ring-green-400"
          >
            {SEVERITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredDiagnoses.length === 0 ? (
        <p className="text-gray-600">
          No diagnosis records
          {severityFilter
            ? ` for "${SEVERITY_OPTIONS.find((o) => o.value === severityFilter)?.label}"`
            : ""}
          .
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-green-100 text-green-900">
                <th className="p-2 border border-green-200">Patient ID</th>
                <th className="p-2 border border-green-200">Patient Name</th>
                <th className="p-2 border border-green-200">Symptoms</th>
                <th className="p-2 border border-green-200">Diagnosis</th>
                <th className="p-2 border border-green-200">Remarks</th>
                <th className="p-2 border border-green-200">Diagnosis Date</th>
                <th className="p-2 border border-green-200">Severity</th>
                <th className="p-2 border border-green-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDiagnoses.map((d: any) => {
                const severity =
                  d.severityType?.toLowerCase() ||
                  d.severity?.toLowerCase() ||
                  "";

                let colorClass = "";
                if (severity === "severe")
                  colorClass = "bg-red-100 text-red-800 border border-red-300";
                else if (severity === "moderate")
                  colorClass = "bg-yellow-100 text-yellow-800 border border-yellow-300";
                else if (severity === "mild")
                  colorClass = "bg-green-100 text-green-800 border border-green-300";
                else colorClass = "bg-gray-100 text-gray-700 border border-gray-300";

                return (
                  <tr
                    key={d._id}
                    className="hover:bg-green-50 transition-colors"
                  >
                    <td className="p-2 border border-green-200">{d.patientId}</td>
                    <td className="p-2 border border-green-200 font-medium">
                      {d.patientName}
                    </td>
                    <td className="p-2 border border-green-200">{d.symptoms}</td>
                    <td className="p-2 border border-green-200">{d.diagnosis}</td>
                    <td className="p-2 border border-green-200">{d.remarks || "—"}</td>
                    <td className="p-2 border border-green-200">
                      {d.diagnosisDate
                        ? new Date(d.diagnosisDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-2 border border-green-200 text-center">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${colorClass}`}
                      >
                        {severity
                          ? severity.charAt(0).toUpperCase() + severity.slice(1)
                          : "—"}
                      </span>
                    </td>
                    <td className="p-2 border border-green-200 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onEdit(d)}
                          className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 px-3 py-1 rounded-lg text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(d._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
