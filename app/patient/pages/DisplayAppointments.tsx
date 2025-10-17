'use client'
import React, { useState, useEffect } from 'react';
import { getAppointmentsByPatientId, checkAuth } from '../../utils/api';

interface Appointment {
  _id: string;
  doctorId: string;
  department: string;
  date: string;
  timeSlot: string;
  status: string;
  patientDetails: {
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    reasonForVisit?: string;
    preferredLanguage?: string;
  };
  createdAt: string;
}

export default function DisplayAppointments ({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientId, setPatientId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch logged-in user and their appointments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Check authentication and get patient ID
        const authResponse = await checkAuth();
        
        if (authResponse.data.role !== 'Patient') {
          setError('Only patients can view appointments.');
          return;
        }

        const userId = authResponse.data.id;
        setPatientId(userId);
        setIsAuthenticated(true);

        // 2. Fetch appointments for this patient
        const appointmentsResponse = await getAppointmentsByPatientId(userId);
        setAppointments(appointmentsResponse.data.appointments);
        
      } catch (err: any) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401) {
          setError('Please login to view your appointments.');
        } else {
          setError('Failed to load appointments. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isPastAppointment = (dateString: string, timeSlot: string) => {
    try {
      const appointmentDate = new Date(dateString);
      const [hours, minutes] = timeSlot.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes));
      return appointmentDate < new Date();
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Separate upcoming and past appointments
  const upcomingAppointments = appointments.filter(
    apt => !isPastAppointment(apt.date, apt.timeSlot)
  );
  const pastAppointments = appointments.filter(
    apt => isPastAppointment(apt.date, apt.timeSlot)
  );

  return (
    <div className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">My Appointments</h2>
        <p className="text-gray-600 mt-2">
          View and manage your scheduled appointments
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Appointments Yet</h3>
          <p className="text-gray-600 mb-6">You haven't booked any appointments.</p>
          <button
            onClick={() => window.location.href = '/book-appointment'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Book an Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Upcoming Appointments ({upcomingAppointments.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {appointment.department}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Doctor ID: {appointment.doctorId}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">{appointment.timeSlot}</span>
                      </div>
                    </div>

                    {appointment.patientDetails.reasonForVisit && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-gray-500 mb-1">Reason for Visit:</p>
                        <p className="text-sm text-gray-700">{appointment.patientDetails.reasonForVisit}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Booked on {new Date(appointment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Past Appointments ({pastAppointments.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50 opacity-75"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {appointment.department}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Doctor ID: {appointment.doctorId}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">{appointment.timeSlot}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}