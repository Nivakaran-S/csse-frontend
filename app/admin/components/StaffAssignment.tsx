'use client';

import { useState, useEffect } from 'react';
import { getAllStaff, getAllDepartments } from '../../utils/api';
import ScheduleAssignmentModal from './ScheduleAssignmentModal';

interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  department: {
    _id: string;
    name: string;
  };
  isActive: boolean;
}

interface Department {
  _id: string;
  name: string;
}

interface StaffAssignmentProps {
  userId?: string;
}

export default function StaffAssignment({ userId }: StaffAssignmentProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffResponse, departmentsResponse] = await Promise.all([
        getAllStaff(),
        getAllDepartments()
      ]);
      setStaff(staffResponse.data || []);
      setDepartments(departmentsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setStaff([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = selectedDepartment
    ? staff.filter(member => member.department._id === selectedDepartment)
    : staff;

  const handleAssign = (staffId: string) => {
    setSelectedStaffId(staffId);
    setIsModalOpen(true);
  };

  const handleScheduleCreated = () => {
    // Refresh data if needed
    fetchData();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Staff Assignment</h2>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading staff members...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Staff Assignment</h2>
      
      {/* Department Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Department
        </label>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
        >
          <option value="">All Departments</option>
          {Array.isArray(departments) && departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Available Staff</h3>
        
        {filteredStaff.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No staff members found
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredStaff.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {member.firstName[0]}{member.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {member.role} • {member.department.name}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleAssign(member._id)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ScheduleAssignmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStaffId('');
        }}
        onSuccess={handleScheduleCreated}
        selectedStaffId={selectedStaffId}
        userId={userId}
      />
    </div>
  );
}
