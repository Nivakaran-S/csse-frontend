// app/utils/api.ts - COMPLETE MERGED VERSION

import axios from 'axios';
import { PaymentRequest, PaymentResponse, PaymentHistoryResponse } from '../../types/payment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Configure axios to include credentials (cookies) with every request
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for logging and debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error('Network error - please check your connection'));
    } else {
      // Something else happened
      return Promise.reject(new Error('An unexpected error occurred'));
    }
  }
);

// ============================================
// AUTHENTICATION
// ============================================

export const checkAuth = async () => {
  return api.get('/check-cookie');
};

export const logout = async () => {
  return api.post('/logout');
};

export const login = async (credentials: {
  userName: string;
  password: string;
}) => {
  return api.post('/user/login', credentials);
};

// ============================================
// USER REGISTRATION
// ============================================

export const registerDoctor = async (doctorData: any) => {
  return api.post('/user/register/doctor', doctorData);
};

export const registerPatient = async (patientData: any) => {
  return api.post('/user/register/patient', patientData);
};

export const registerAdmin = async (adminData: any) => {
  return api.post('/user/register/admin', adminData);
};

// ============================================
// USER MANAGEMENT
// ============================================

export const getAllUsers = async () => {
  return api.get('/user');
};

export const updatePatient = async (patientData: any) => {
  return api.post('/user/update/patient', patientData);
};

export const updateDoctor = async (doctorData: any) => {
  return api.post('/user/update/doctor', doctorData);
};

export const updateAdmin = async (adminData: any) => {
  return api.post('/user/update/admin', adminData);
};

// ============================================
// PATIENT
// ============================================

export const getPatientById = async (patientId: string) => {
  return api.get(`/patient/${patientId}`);
};

// ============================================
// DOCTORS
// ============================================

export const getAllDoctors = async () => {
  return api.get('/doctor/doctors');
};

export const getDoctorsByDepartment = async (department: string) => {
  return api.get(`/doctor/doctors/department/${department}`);
};

export const getDoctorById = async (doctorId: string) => {
  return api.get(`/doctor/${doctorId}`);
};

export const getAvailableSlots = async (doctorId: string, date: string) => {
  return api.get(`/doctor/doctors/${doctorId}/slots`, {
    params: { date }
  });
};

// ============================================
// DEPARTMENTS
// ============================================

export const getAllDepartments = async () => {
  const response = await api.get('/department');
  return { data: response.data };
};

export const createDepartment = async (departmentData: {
  name: string;
  description: string;
}) => {
  return api.post('/department', departmentData);
};

// ============================================
// STAFF MANAGEMENT
// ============================================

export const getAllStaff = async () => {
  return api.get('/staff');
};

export const createStaff = async (staffData: any) => {
  return api.post('/staff', staffData);
};

export const updateStaff = async (id: string, staffData: any) => {
  return api.put(`/staff/${id}`, staffData);
};

export const deleteStaff = async (id: string) => {
  return api.delete(`/staff/${id}`);
};

// ============================================
// SCHEDULES
// ============================================

export const getAllSchedules = async (params?: any) => {
  return api.get('/schedule', { params });
};

export const createSchedule = async (scheduleData: any) => {
  console.log('API: Creating schedule with data:', scheduleData);
  
  try {
    const response = await api.post('/schedule', scheduleData);
    console.log('API: Schedule created successfully:', response.data);
    return response;
  } catch (error: any) {
    console.error('API: Error creating schedule:', error);
    console.error('API: Error response:', error.response?.data);
    throw error;
  }
};

export const updateSchedule = async (id: string, scheduleData: any) => {
  return api.put(`/schedule/${id}`, scheduleData);
};

export const deleteSchedule = async (id: string) => {
  return api.delete(`/schedule/${id}`);
};

export const getAvailableStaff = async (params: any) => {
  return api.get('/schedule/available-staff', { params });
};

// ============================================
// APPOINTMENTS
// ============================================

export const createAppointment = async (appointmentData: {
  patientId: string;
  doctorId: string;
  department: string;
  date: string;
  timeSlot: string;
  patientDetails: {
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    reasonForVisit?: string;
    preferredLanguage?: string;
  };
}) => {
  return api.post('/appointment', appointmentData);
};

export const getAllAppointments = async () => {
  return api.get('/appointment');
};

export const getAppointmentsByPatientId = async (patientId: string) => {
  return api.get(`/appointment/patient/${patientId}`);
};

export const getAppointmentsByEmail = async (email: string) => {
  return api.get(`/appointment/patient/email/${encodeURIComponent(email)}`);
};

export const getAppointmentsByDoctor = async (doctorId: string) => {
  return api.get(`/appointment/doctor/${doctorId}`);
};

// ============================================
// PAYMENT API
// ============================================

export const paymentApi = {
  /**
   * Process a payment
   */
  async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment history for user
   */
  async getPaymentHistory(): Promise<PaymentHistoryResponse> {
    try {
      const response = await api.get('/payments/user');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify cash payment (admin action)
   */
  async verifyCashPayment(transactionId: string, finalStatus: 'Processed' | 'Failed'): Promise<PaymentResponse> {
    try {
      const response = await api.put('/payments/verify', {
        transactionId,
        finalStatus
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// ============================================
// USER API
// ============================================

export const userApi = {
  /**
   * Get current user details
   */
  async getCurrentUser(userId: string): Promise<any> {
    try {
      const response = await api.get(`/user/current/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;