import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';

const Dashboard: React.FC = () => {
  const { user, profile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <TeacherDashboard />;
};

export default Dashboard;
