'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { AppointmentForm, PatientDetails, Department, Doctor } from '../../types/appointment';
import { 
  createAppointment, 
  getAllDepartments, 
  getDoctorsByDepartment,
  getAvailableSlots 
} from '../../utils/api';


const steps = [
  { number: 1, title: 'Department' },
  { number: 2, title: 'Schedule' },
  { number: 3, title: 'Details' },
  { number: 4, title: 'Confirm' },
];


// Step Indicator Component
const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="mb-8">
    <div className="flex items-start justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                currentStep > step.number
                  ? 'bg-[#6f9556] text-white'
                  : currentStep === step.number
                  ? 'bg-[#6f9556] text-white '
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <span
              className={`text-xs mt-2 font-medium whitespace-nowrap ${
                currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {step.title}
            </span>
          </div>


          {index < steps.length - 1 && (
            <div className="flex-1 flex items-center pt-[20px] px-2">
              <div
                className={`h-[2px] w-full transition-all ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                }`}
              ></div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);


// Summary Panel Component (for Step 3 only)
const SummaryPanel = ({
  form,
  selectedDoctor,
}: {
  form: AppointmentForm;
  selectedDoctor: string;
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not selected';
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-[#f5d709] text-black opacity-80  rounded-xl p-6 sticky top-4">
      <h3 className="text-2xl font-bold mb-6">Appointment Summary</h3>
      
      <div className="space-y-0">
      

        {/* Doctor */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-start space-x-3">
           
            <div className="flex-1">
              <p className=" text-lg">Dr. {selectedDoctor}</p>
              <p>{form.department}</p>
            </div>
          </div>
        </div>

        {/* Date */}
        <div className=" mt-[5px] rounded-lg px-4">
          <div className="flex items-start space-x-3">
           
            <div className="flex-1">
              <p className=" text-md">{formatDate(form.date)}</p>
            </div>
          </div>
        </div>

        {/* Time */}
        <div className=" rounded-lg px-4">
          <div className="flex items-start space-x-3">
            
            <div className="flex-1">
              <p className=" text-md">{form.timeSlot}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Step 1: Department Selection
const DepartmentStep = ({ 
  form, 
  setForm,
  departments,
  loading
}: { 
  form: AppointmentForm; 
  setForm: React.Dispatch<React.SetStateAction<AppointmentForm>>;
  departments: Department[];
  loading: boolean;
}) => (
  <div className="space-y-6 text-black">
    <div className="text-center mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Choose a Department
      </h3>
      <p className="text-sm text-gray-600">
        Choose the medical department for your appointment
      </p>
    </div>
    
    {loading ? (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading departments...</p>
      </div>
    ) : departments.length === 0 ? (
      <div className="text-center py-8">
        <p className="text-gray-600">No departments available. Please contact support.</p>
      </div>
    ) : (
      <div className="grid grid-cols-4 gap-4">
        {departments.map((dept) => (
          <button
            key={dept._id}
            onClick={() => setForm({ ...form, department: dept.name })}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              form.department === dept.name
                ? 'border-[#f5d709] bg-blue-50 shadow-md'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">{dept.name}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {dept.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
);


// Step 2: Schedule Selection
const ScheduleStep = ({
  form,
  handleChange,
  setForm,
  selectedDoctor,
  handleDoctorSelection,
  doctors,
  availableSlots,
  loadingDoctors,
  loadingSlots
}: {
  form: AppointmentForm;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setForm: React.Dispatch<React.SetStateAction<AppointmentForm>>;
  selectedDoctor: string;
  handleDoctorSelection: (doctor: Doctor) => void;
  doctors: Doctor[];
  availableSlots: string[];
  loadingDoctors: boolean;
  loadingSlots: boolean;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const handleDateSelect = (day: number) => {
    if (!form.doctorId) return;
    
    const selectedDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) return;

    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setForm({ ...form, date: formattedDate, timeSlot: '' });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isDateSelected = (day: number) => {
    if (!form.date) return false;
    const selectedDate = new Date(form.date);
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === month && 
           selectedDate.getFullYear() === year;
  };

  const isDateDisabled = (day: number) => {
    const dateToCheck = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateToCheck < today || !form.doctorId;
  };

  const filteredDoctors = doctors.filter((doc) => {
    const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
    const specialization = (doc.specialization || doc.department || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || specialization.includes(query);
  });

  return (
    <div className="space-y-6 rounded-[5px] px-[40px] py-[50px] bg-[#d7fe9f] text-black">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Pick Doctor & Time
        </h3>
        <p className="text-sm text-gray-600">
          Select your preferred doctor, date, and time
        </p>
      </div>

      <div className='grid grid-cols-2 gap-8'>
        {/* Left Column - Calendar and Time Slots */}
        <div className="space-y-6">
          {/* Calendar */}
          <div>
            <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={previousMonth}
                  disabled={!form.doctorId}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="font-semibold text-lg">
                  {monthNames[month]} {year}
                </h3>
                <button
                  type="button"
                  onClick={nextMonth}
                  disabled={!form.doctorId}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {[...Array(startingDayOfWeek)].map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square"></div>
                ))}
                
                {/* Days of the month */}
                {[...Array(daysInMonth)].map((_, index) => {
                  const day = index + 1;
                  const disabled = isDateDisabled(day);
                  const selected = isDateSelected(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      disabled={disabled}
                      className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                        ${selected 
                          ? 'bg-[#f5d709] text-black shadow-md' 
                          : disabled 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            {!form.doctorId && (
              <p className="text-xs text-gray-500 mt-2">Please select a doctor first to enable date selection</p>
            )}
          </div>

          {/* Time Slot Selection */}
          <div className='bg-white border-2 border-gray-300 px-[15px] py-[15px] rounded-[8px]'>
            <label className="block text-md font-medium text-gray-700 mb-2">
              Choose a Time Slot
              {loadingSlots && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
            </label>
            {!form.date ? (
              <div className="bg-white rounded-lg p-6 border-2 border-gray-300 text-center">
                <p className="text-sm text-gray-500">Please select a date first</p>
              </div>
            ) : loadingSlots ? (
              <div className="bg-white rounded-lg p-6 border-2 border-gray-300 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  No available slots for this date. Please choose another date.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 min-h-[200px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setForm({ ...form, timeSlot: slot })}
                      className={`p-3 rounded-lg border-2 transition-all font-medium ${
                        form.timeSlot === slot
                          ? 'border-[#f5d709] bg-[#f5d709] shadow-md text-black'
                          : 'border-gray-300 hover:border-[#f5d709]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Doctor Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Doctor
          </label>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d709] focus:border-[#f5d709] bg-white"
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {loadingDoctors ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Loading doctors...</p>
            </div>
          ) : doctors.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No doctors available in this department.</p>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border-2 border-gray-300">
              <p className="text-sm text-gray-500">No doctors found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredDoctors.map((doc) => (
                <button
                  key={doc._id}
                  type="button"
                  onClick={() => handleDoctorSelection(doc)}
                  className={`w-full p-4 rounded-lg cursor-pointer border-2 transition-all text-left ${
                    selectedDoctor === `${doc.firstName} ${doc.lastName}`
                      ? 'border-[#f5d709] bg-white shadow-md'
                      : 'border-gray-300 hover:border-[#f5d709] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">Dr. {doc.firstName} {doc.lastName}</h4>
                      <p className="text-sm text-gray-600">{doc.specialization || doc.department}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Available: {doc.workingDays?.join(', ') || 'Weekdays'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// Step 3: Patient Details
const DetailsStep = ({
  patientDetails,
  handlePatientDetailsChange
}: {
  patientDetails: PatientDetails;
  handlePatientDetailsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}) => (
  <div className="space-y-5 text-black">
    <div className="text-center mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Patient Information
      </h3>
      <p className="text-sm text-gray-600">
        Please provide your contact and visit details
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Full Name <span className="text-red-500">*</span>
      </label>
      <input
        name="fullName"
        type="text"
        value={patientDetails.fullName}
        onChange={handlePatientDetailsChange}
        placeholder="Enter your full name"
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Email Address <span className="text-red-500">*</span>
      </label>
      <input
        name="email"
        type="email"
        value={patientDetails.email}
        onChange={handlePatientDetailsChange}
        placeholder="your.email@example.com"
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Phone Number <span className="text-red-500">*</span>
      </label>
      <input
        name="phone"
        type="tel"
        value={patientDetails.phone}
        onChange={handlePatientDetailsChange}
        placeholder="+1 (555) 000-0000"
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Address
      </label>
      <textarea
        name="address"
        value={patientDetails.address}
        onChange={handlePatientDetailsChange}
        placeholder="Enter your address"
        rows={3}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Reason for Visit
      </label>
      <textarea
        name="reasonForVisit"
        value={patientDetails.reasonForVisit}
        onChange={handlePatientDetailsChange}
        placeholder="Briefly describe the reason for your visit"
        rows={3}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Preferred Language
      </label>
      <select
        name="preferredLanguage"
        value={patientDetails.preferredLanguage}
        onChange={handlePatientDetailsChange}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="English">English</option>
        <option value="Spanish">Spanish</option>
        <option value="French">French</option>
        <option value="German">German</option>
        <option value="Chinese">Chinese</option>
        <option value="Hindi">Hindi</option>
        <option value="Tamil">Tamil</option>
      </select>
    </div>
    <div>
      <input 
      type='checkbox'
      required
      />
      <label className="text-sm text-gray-600 ml-2">
        I agree to share my data with the clinic for appointment purposes.
      </label>
    </div>
  </div>
);


// Step 4: Confirmation
const ConfirmationStep = ({
  message,
  form,
  selectedDoctor,
  patientDetails,
  handleSubmit,
  confirmationNumber,
  isSubmitting
}: {
  message: string;
  form: AppointmentForm;
  selectedDoctor: string;
  patientDetails: PatientDetails;
  handleSubmit: () => void;
  confirmationNumber: string;
  isSubmitting: boolean;
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString + 'T00:00:00');
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

  return (
    <div className="space-y-6 text-black">
      {!message ? (
        <>
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Confirm Your Appointment
            </h3>
            <p className="text-sm text-gray-600">
              Please review your appointment details
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="border-b pb-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Appointment Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-semibold">{form.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-semibold">Dr. {selectedDoctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">{formatDate(form.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">{form.timeSlot}</span>
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Patient Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold">{patientDetails.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{patientDetails.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold">{patientDetails.phone}</span>
                </div>
                {patientDetails.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-semibold text-right max-w-xs">
                      {patientDetails.address}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-semibold">
                    {patientDetails.preferredLanguage}
                  </span>
                </div>
              </div>
            </div>

            {patientDetails.reasonForVisit && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Reason for Visit
                </h4>
                <p className="text-gray-700">{patientDetails.reasonForVisit}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-3 cursor-pointer rounded-lg transition text-black ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#f5d709]  text-black'
            }`}
          >
            {isSubmitting ? 'Booking...' : 'Confirm & Book Appointment'}
          </button>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Appointment Confirmed!
          </h3>
          <p className="text-gray-600 mb-6">
            Your appointment has been successfully booked.
          </p>
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-800 mb-4">
              Appointment Summary
            </h4>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">Confirmation:</span>
                <span className="font-semibold">#{confirmationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-semibold">
                  {formatDate(form.date)} at {form.timeSlot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-semibold">Dr. {selectedDoctor}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            A confirmation email has been sent to{' '}
            <span className="font-semibold">{patientDetails.email}</span>
          </p>
        </div>
      )}
    </div>
  );
};


// Main Component
export default function AppointmentFormComponent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<AppointmentForm>({
    patientId: '',
    doctorId: '',
    department: '',
    date: '',
    timeSlot: '',
  });

  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    reasonForVisit: '',
    preferredLanguage: 'English',
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState<string>('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const confirmationNumber = useMemo(() => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }, []);

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      setIsLoadingAuth(true);
      try {
        const response = await fetch('http://localhost:8000/api/check-cookie', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Not authenticated');
        }

        const data = await response.json();
        
        if (data.role !== 'Patient') {
          setError('Only patients can book appointments. Please login as a patient.');
          return;
        }

        setLoggedInUserId(data.id);
        setForm(prev => ({ ...prev, patientId: data.id }));
        
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Please login to book an appointment.');
      } finally {
        setIsLoadingAuth(false);
      }
    };

    fetchLoggedInUser();
  }, []);

  useEffect(() => {
    if (!loggedInUserId) return;

    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const res = await getAllDepartments();
        setDepartments(res.data.departments);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments. Please refresh the page.');
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [loggedInUserId]);

  useEffect(() => {
    if (!form.department) {
      setDoctors([]);
      return;
    }

    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await getDoctorsByDepartment(form.department);
        setDoctors(res.data.doctors);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to load doctors. Please try again.');
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [form.department]);

  useEffect(() => {
    if (!form.doctorId || !form.date) {
      setAvailableSlots([]);
      return;
    }

    const fetchAvailableSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await getAvailableSlots(form.doctorId, form.date);
        setAvailableSlots(res.data.availableSlots);
      } catch (err) {
        console.error('Error fetching available slots:', err);
        setError('Failed to load available time slots. Please try again.');
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [form.doctorId, form.date]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handlePatientDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setPatientDetails({ ...patientDetails, [e.target.name]: e.target.value });
    setError('');
  };

  const handleDoctorSelection = (doctor: Doctor) => {
    setSelectedDoctor(`${doctor.firstName} ${doctor.lastName}`);
    setForm({ ...form, doctorId: doctor.doctorId, timeSlot: '' });
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const validateStep = () => {
    if (currentStep === 1 && !form.department) {
      setError('Please select a department');
      return false;
    }
    if (currentStep === 2) {
      if (!form.doctorId) {
        setError('Please select a doctor');
        return false;
      }
      if (!form.date) {
        setError('Please select a date');
        return false;
      }
      if (!form.timeSlot) {
        setError('Please select a time slot');
        return false;
      }
    }
    if (currentStep === 3) {
      if (!patientDetails.fullName || !patientDetails.email || !patientDetails.phone) {
        setError('Please fill in all required fields');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(patientDetails.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!form.patientId || !loggedInUserId) {
      setError('Patient ID is missing. Please login again.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const appointmentData = {
        patientId: loggedInUserId,
        doctorId: form.doctorId,
        department: form.department,
        date: form.date,
        timeSlot: form.timeSlot,
        patientDetails
      };

      console.log('Submitting appointment with patientId:', loggedInUserId);

      const res = await createAppointment(appointmentData);
      setMessage('Appointment booked successfully!');
      console.log('Appointment created:', res.data);
    } catch (err: any) {
      console.error('Error booking appointment:', err);
      setError(err.response?.data?.error || 'Error booking appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!loggedInUserId && !isLoadingAuth) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-6">{error || 'Please login to book an appointment.'}</p>
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

  return (
    <div className="max-w-7xl mx-auto mt-10 p-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Make an Appointment</h2>
        <p className="text-gray-600 mt-2">
          Complete the steps below to schedule your visit
        </p>
      </div>
      
      <StepIndicator currentStep={currentStep} />
      
      {/* Conditional Layout: Show grid only for Step 3 */}
      {currentStep === 3 ? (
        <div className="grid grid-cols-3 gap-8 mt-8">
          {/* Left Side - Summary Panel (only in Step 3) */}
          <div className="col-span-1">
            <SummaryPanel 
              form={form} 
              selectedDoctor={selectedDoctor}
            />
          </div>

          {/* Right Side - Details Form */}
          <div className="col-span-2 bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <DetailsStep
              patientDetails={patientDetails}
              handlePatientDetailsChange={handlePatientDetailsChange}
            />
          </div>
        </div>
      ) : (
        /* Full width for other steps */
        <div className="max-w-5xl mx-auto mt-8 bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <DepartmentStep 
                form={form} 
                setForm={setForm} 
                departments={departments}
                loading={loadingDepartments}
              />
            )}
            {currentStep === 2 && (
              <ScheduleStep
                form={form}
                handleChange={handleChange}
                setForm={setForm}
                selectedDoctor={selectedDoctor}
                handleDoctorSelection={handleDoctorSelection}
                doctors={doctors}
                availableSlots={availableSlots}
                loadingDoctors={loadingDoctors}
                loadingSlots={loadingSlots}
              />
            )}
            {currentStep === 4 && (
              <ConfirmationStep
                message={message}
                form={form}
                selectedDoctor={selectedDoctor}
                patientDetails={patientDetails}
                handleSubmit={handleSubmit}
                confirmationNumber={confirmationNumber}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-5xl mx-auto">
          <p className="text-red-600 text-center text-sm">{error}</p>
        </div>
      )}

      {currentStep < 4 && (
        <div className={`flex gap-4 mt-8 ${currentStep === 3 ? 'max-w-7xl' : 'max-w-5xl'} mx-auto`}>
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 px-6 py-3 cursor-pointer border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
            >
              ← Previous
            </button>
          )}
          <button
            onClick={nextStep}
            className={`flex-1 px-6 py-3 bg-[#f5d709] cursor-pointer text-black rounded-lg hover:bg-[#e5c708] transition  ${
              currentStep === 1 ? 'w-full' : ''
            }`}
          >
            {currentStep === 3 ? 'Review Appointment' : 'Continue →'}
          </button>
        </div>
      )}
    </div>
  );
}
