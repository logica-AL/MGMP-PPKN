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

  if (user?.email === 'logicafalfa21@gmail.com' && !user.emailVerified) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-10 space-y-6">
          <h1 className="text-2xl font-bold text-slate-900">Verifikasi Email Diperlukan</h1>
          <p className="text-slate-600">
            Anda masuk sebagai Super Admin, tetapi email Anda belum diverifikasi. 
            Silakan verifikasi email Anda untuk mengakses Dashboard Admin.
          </p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <TeacherDashboard />;
};

export default Dashboard;
