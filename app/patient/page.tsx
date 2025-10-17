"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import PatientNavigation from "./components/PatientNavigation";
import AppointmentPage from "./pages/appointmentPage";
import DisplayAppointments from "./pages/DisplayAppointments";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // ✅ Consistent endpoint usage
      const response = await fetch(`${API_BASE_URL}/api/check-cookie`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('response', response);

      if (!response.ok) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      
      if (data.role !== "Patient") {
        router.push("/login");
        return;
      }

      // ✅ FIXED: Use correct endpoint /api/patient/:id
      const patientResponse = await fetch(`${API_BASE_URL}/api/patient/${data.id}`, {
        credentials: 'include',
      });

      if (patientResponse.ok) {
        const patientData = await patientResponse.json();
        const patient = patientData[0]; // First element is the patient details
        
        setUser({
          id: data.id,
          role: data.role,
          firstName: patient?.firstName,
          lastName: patient?.lastName,
          email: patient?.email,
          phoneNumber: patient?.phoneNumber,
          gender: patient?.gender
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
    <div className="min-h-screen bg-white text-white">
      {/* Header */}
      <PatientNavigation user={user} setActiveTab={setActiveTab} />

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 p-8 ml-[18vw] min-h-[90vh] mt-[10vh] overflow-y-auto bg-white">
          {activeTab === 'booking' && <AppointmentPage setActiveTab={setActiveTab} />}
          {activeTab === 'appointment' && <DisplayAppointments setActiveTab={setActiveTab} />}
          {activeTab === 'overview' && (
            <div className="text-black">
              <h1 className="text-3xl font-bold mb-4">Welcome, {user?.firstName} {user?.lastName}</h1>
              <p>Active Tab: {activeTab}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}