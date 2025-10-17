// ============================================
// API UTILITY FUNCTIONS (app/utils/api.ts)
// ============================================

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Configure axios to include credentials (cookies) with every request
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
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

export const createDepartment = async (departmentData: {
  name: string;
  description: string;
}) => {
  return api.post('/department', departmentData);
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

export const getAppointmentsByDoctorAndDate = async (doctorId: string, date: string) => {
  return api.get(`/appointment/doctor/${doctorId}/date/${date}`);
};

// ============================================
// USERS
// ============================================

export const login = async (credentials: {
  userName: string;
  password: string;
}) => {
  return api.post('/user/login', credentials);
};

export const registerDoctor = async (doctorData: any) => {
  return api.post('/user/register/doctor', doctorData);
};

export const registerPatient = async (patientData: any) => {
  return api.post('/user/register/patient', patientData);
};

export const getAllUsers = async () => {
  return api.get('/user');
};

export const updatePatient = async (patientData: any) => {
  return api.put('/update/patient', patientData);
};

export const updateDoctor = async (doctorData: any) => {
  return api.put('/update/doctor', doctorData);
};

// ============================================
// PATIENT
// ============================================

export const getPatientById = async (patientId: string) => {
  return api.get(`/patient/${patientId}`);
};

// ============================================
// STAFF
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
  return api.post('/schedule', scheduleData);
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
// PAYMENTS - CORRECTED ENDPOINTS
// ============================================

export const processPayment = async (paymentData: {
  method: 'Coverage' | 'CreditCard' | 'Cash';
  details: any;
}) => {
  return api.post('/payments', paymentData);
};

export const getPaymentsByUserId = async (userId: string) => {
  return api.get('/payments/user');
};

export const verifyCashPayment = async (transactionId: string, finalStatus: 'Processed' | 'Failed') => {
  return api.put('/payments/verify', {
    transactionId,
    finalStatus
  });
};

// ============================================
// CASH PAYMENT RECEIPTS - CORRECTED ENDPOINTS
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

export const getAllCashPaymentReceipts = async () => {
  return api.get('/cash-receipts/admin/all');
};

export const updateCashPaymentReceiptStatus = async (receiptId: string, status: string, adminNotes?: string, reviewedBy?: string) => {
  return api.put('/cash-receipts/admin/status', {
    receiptId,
    status,
    adminNotes,
    reviewedBy
  });
};

// ============================================
// COVERAGE APPLICATIONS - CORRECTED ENDPOINTS
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

export const getAllCoverageApplications = async () => {
  return api.get('/coverage/admin/applications');
};

export const updateCoverageStatus = async (applicationId: string, status: string, adminNotes?: string, approvedBy?: string) => {
  return api.put('/coverage/admin/status', {
    applicationId,
    status,
    adminNotes,
    approvedBy
  });
};

// ============================================
// DIAGNOSIS - CORRECTED ENDPOINTS
// ============================================

export const createDiagnosis = async (diagnosisData: any) => {
  return api.post('/diagnosis', diagnosisData);
};

export const getDiagnoses = async () => {
  return api.get('/diagnosis');
};

export const updateDiagnosis = async (diagnosisId: string, diagnosisData: any) => {
  return api.put(`/diagnosis/${diagnosisId}`, diagnosisData);
};

export const deleteDiagnosis = async (diagnosisId: string) => {
  return api.delete(`/diagnosis/${diagnosisId}`);
};

export default api;
