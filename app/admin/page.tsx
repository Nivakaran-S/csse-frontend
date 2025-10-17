'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import ScheduleOverview from './components/ScheduleOverview';
import StaffAssignment from './components/StaffAssignment';
import SchedulePreview from './components/SchedulePreview';

interface User {
  role: string;
  id: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule-staff');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/check-cookie', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.role === 'Admin') {
          setUser(userData);
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} onLogout={handleLogout} />
      
      <div className="flex">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 p-6">
          {activeTab === 'schedule-staff' && (
            <div className="space-y-6">
              <ScheduleOverview userId={user?.id} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StaffAssignment userId={user?.id} />
                <SchedulePreview />
              </div>
            </div>
          )}
          
          {activeTab === 'staff-management' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Staff Management</h2>
              <p className="text-gray-600">Staff management functionality will be implemented here.</p>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings</h2>
              <p className="text-gray-600">Settings functionality will be implemented here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
