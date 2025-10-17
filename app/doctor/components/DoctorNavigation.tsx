"use client";
import React from "react";

export default function DoctorNavigation({ user, setActiveTab }: any) {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md border-b border-green-200 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-bold text-green-700">
          Doctor Portal
        </h1>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("overview")}
            className="text-gray-700 hover:text-green-600 font-medium"
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("diagnosis")}
            className="text-gray-700 hover:text-green-600 font-medium"
          >
            Diagnoses
          </button>
          <div className="flex items-center gap-3 border-l pl-4 border-gray-300">
            <span className="text-sm text-gray-600">
              {user?.firstName} {user?.lastName}
            </span>
            <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold">
              {user?.firstName?.[0]?.toUpperCase() || "D"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}