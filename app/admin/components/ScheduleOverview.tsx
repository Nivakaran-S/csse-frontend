'use client';

import { useState, useEffect } from 'react';
import { getAllSchedules } from '../../utils/api';
import ScheduleAssignmentModal from './ScheduleAssignmentModal';

interface Schedule {
  _id: string;
  staffId: {
    firstName: string;
    lastName: string;
    role: string;
  };
  departmentId: {
    name: string;
  };
  shiftDate: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface ScheduleOverviewProps {
  userId?: string;
}

export default function ScheduleOverview({ userId }: ScheduleOverviewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'month'>('month');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, [currentDate]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentDate);
      startDate.setDate(1);
      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);

      const response = await getAllSchedules({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      setSchedules(response.data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleScheduleCreated = () => {
    fetchSchedules();
  };

  const handleExport = () => {
    if (schedules.length === 0) {
      alert('No schedules to export');
      return;
    }

    // Prepare CSV data
    const csvHeaders = [
      'Staff Name',
      'Role',
      'Department',
      'Date',
      'Start Time',
      'End Time',
      'Shift Type',
      'Status',
      'Notes'
    ];

    const csvData = schedules.map(schedule => [
      `${schedule.staffId?.firstName || ''} ${schedule.staffId?.lastName || ''}`.trim(),
      schedule.staffId?.role || '',
      schedule.departmentId?.name || '',
      formatDate(schedule.shiftDate),
      formatTime(schedule.startTime),
      formatTime(schedule.endTime),
      schedule.shiftType,
      schedule.status,
      schedule.notes || ''
    ]);

    // Convert to CSV string
    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `schedules_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current month's days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getDate() === day && 
                     today.getMonth() === month && 
                     today.getFullYear() === year;
      days.push({
        date: day,
        isCurrentMonth: true,
        isToday
      });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  };

  const getSchedulesForDate = (date: number) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.shiftDate);
      return scheduleDate.getDate() === date && scheduleDate.getMonth() === currentDate.getMonth();
    });
  };

  const days = getDaysInMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Schedule Overview</h2>
      
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Today
          </button>
          
          <h3 className="text-xl font-semibold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Add Schedule
          </button>
          <button 
            onClick={handleExport}
            disabled={schedules.length === 0}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export
          </button>
          
          <div className="flex bg-gray-100 rounded-lg">
            {(['week', 'day', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 rounded-lg text-sm font-medium capitalize ${
                  viewMode === mode
                    ? 'bg-yellow-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="p-3 text-center font-medium text-gray-800 bg-gray-50">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => {
          const daySchedules = getSchedulesForDate(day.date);
          return (
            <div
              key={index}
              className={`p-3 min-h-[100px] border border-gray-200 ${
                !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900'
              } ${day.isToday ? 'bg-yellow-100 text-gray-900' : ''}`}
            >
              <div className="text-sm font-medium mb-1">{day.date}</div>
              {day.isCurrentMonth && daySchedules.length > 0 && (
                <div className="space-y-1">
                  {daySchedules.slice(0, 2).map((schedule) => (
                    <div
                      key={schedule._id}
                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded truncate"
                    >
                      {schedule.staffId.firstName} {schedule.staffId.lastName}
                    </div>
                  ))}
                  {daySchedules.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{daySchedules.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ScheduleAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleScheduleCreated}
        userId={userId}
      />
    </div>
  );
}
