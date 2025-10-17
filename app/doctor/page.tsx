"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DoctorNavigation from "./components/DoctorNavigation";
import Sidebar from "./components/Sidebar";
import DiagnosisForm from "./components/Diagnosis/DiagnosisForm";
import DiagnosisList from "./components/Diagnosis/DiagnosisList";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function DiagnosisSection() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingDiagnosis, setEditingDiagnosis] = useState<any>(null);

  const refreshList = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="space-y-6">
      <DiagnosisForm
        onSuccess={refreshList}
        editingDiagnosis={editingDiagnosis}
        onCancelEdit={() => setEditingDiagnosis(null)}
      />
      <DiagnosisList key={refreshKey} onEdit={(d: any) => setEditingDiagnosis(d)} />
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // ✅ FIXED: Use consistent /api/check-cookie endpoint
      const response = await fetch(`${API_BASE_URL}/api/check-cookie`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      
      if (data.role !== "Doctor") {
        router.push("/login");
        return;
      }

      // ✅ FIXED: Use correct endpoint /api/doctor/:id
      const doctorResponse = await fetch(`${API_BASE_URL}/api/doctor/${data.id}`, {
        credentials: 'include',
      });

      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json();
        const doctor = doctorData[0]; // First element is the doctor details
        
        setUser({
          id: data.id,
          role: data.role,
          firstName: doctor?.firstName,
          lastName: doctor?.lastName,
          email: doctor?.email,
          phoneNumber: doctor?.phoneNumber,
          gender: doctor?.gender
        });
      } else {
        setUser({
          id: data.id,
          role: data.role,
        });
      }
    } catch (error) {
      console.error("Authentication error:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-4">Loading...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-green-500 text-white">
      {/* Header */}
      <DoctorNavigation user={user} setActiveTab={setActiveTab} />

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 p-8 ml-[18vw] min-h-[90vh] mt-[10vh] overflow-y-auto bg-[#1D1D1D]">
  {activeTab === "overview" && (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-4">Welcome, Dr. {user?.firstName} {user?.lastName}</h1>
      <p>Active Tab: {activeTab}</p>
    </div>
  )}

  {activeTab === "diagnosis" && (
    <DiagnosisSection />
  )}
</main>

      </div>
    </div>
  );
}