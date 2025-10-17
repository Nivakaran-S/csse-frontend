// app/patient/utils/api.ts

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ============================================
// AUTHENTICATION
// ============================================

export const checkAuth = async () => {
  return api.get('/check-cookie');
};

export const logout = async () => {
  return api.post('/logout');
};

// ============================================
// DEPARTMENTS
// ============================================

export const getAllDepartments = async () => {
  return api.get('/department');
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

export const getAvailableSlots = async (doctorId: string, date: string) => {
  return api.get(`/doctor/doctors/${doctorId}/slots`, {
    params: { date }
  });
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

export const getAppointmentsByPatientId = async (patientId: string) => {
  return api.get(`/appointment/patient/${patientId}`);
};

// ============================================
// PAYMENTS
// ============================================

export const processPayment = async (paymentData: {
  method: 'Coverage' | 'CreditCard' | 'Cash';
  details: any;
}) => {
  return api.post('/payments', paymentData);
};

export const getPaymentsByUserId = async () => {
  return api.get('/payments/user');
};

// ============================================
// COVERAGE APPLICATIONS
// ============================================

export const applyForCoverage = async (coverageData: {
  userId: string;
  policyId: string;
  provider: string;
  coverageType: string;
}) => {
  return api.post('/coverage/apply', coverageData);
};

export const getCoverageStatus = async (userId: string) => {
  return api.get(`/coverage/status/${userId}`);
};

// ============================================
// CASH PAYMENT RECEIPTS
// ============================================

export const submitCashPaymentReceipt = async (receiptData: {
  userId: string;
  patientName: string;
  patientId: string;
  patientEmail: string;
  patientPhone: string;
  amount: number;
  depositReference: string;
  bankName: string;
  branchName: string;
  depositDate: string;
  transactionId: string;
  receiptNumber: string;
  notes?: string;
  paymentSlipUrl?: string;
}) => {
  return api.post('/cash-receipts/submit', receiptData);
};

export const getUserCashPaymentReceipts = async (userId: string) => {
  return api.get(`/cash-receipts/user/${userId}`);
};

// ============================================
// PAYMENT API OBJECT (for compatibility)
// ============================================

export const paymentApi = {
  async processPayment(paymentData: any) {
    return processPayment(paymentData);
  },

  async getPaymentHistory() {
    return getPaymentsByUserId();
  },

  async verifyCashPayment(transactionId: string, finalStatus: 'Processed' | 'Failed') {
    return api.put('/payments/verify', {
      transactionId,
      finalStatus
    });
  }
};

// ============================================
// USER API OBJECT (for compatibility)
// ============================================

export const userApi = {
  async getCurrentUser(userId: string) {
    return api.get(`/patient/${userId}`);
  }
};

export default api;