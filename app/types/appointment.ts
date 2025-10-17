export interface AppointmentForm {
  patientId: string;
  doctorId: string;
  department: string;
  date: string;
  timeSlot: string;
}

export interface PatientDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  reasonForVisit: string;
  preferredLanguage: string;
}

export interface Department {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  doctorId: string;
  department: string;
  specialization: string;
  availableTimeSlots: string[];
  workingDays: string[];
  isActive: boolean;
}

export interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  department: string;
  date: string;
  timeSlot: string;
  status: string;
  patientDetails: PatientDetails;
  createdAt: string;
  updatedAt: string;
}
