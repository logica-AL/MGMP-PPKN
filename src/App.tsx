import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profil from './pages/Profil';
import Staff from './pages/Staff';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Materials from './pages/Materials';
import Documentation from './pages/Documentation';
import BestPractices from './pages/BestPractices';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './utils';
import { Toaster } from 'react-hot-toast';

const BootstrapAdmin: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    const checkAdmin = async () => {
      const adminEmails = ['logicafalfa21@gmail.com', 'mgmppknmojokerto@gmail.com'];
      if (user && user.email && adminEmails.includes(user.email)) {
        const profileRef = doc(db, 'profiles', user.uid);
        try {
          const snap = await getDoc(profileRef);
          if (!snap.exists()) {
            await setDoc(profileRef, {
              uid: user.uid,
              email: user.email,
              name: 'Super Admin',
              role: 'admin',
              isVerified: true,
              school: 'MGMP Kabupaten Mojokerto'
            });
          } else if (snap.data().role !== 'admin') {
            await setDoc(profileRef, { role: 'admin', isVerified: true }, { merge: true });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `profiles/${user.uid}`);
        }
      }
    };
    checkAdmin();
  }, [user]);

  return null;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profil" element={<Profil />} />
      <Route path="/pengurus" element={<Staff />} />
      <Route path="/acara" element={<Events />} />
      <Route path="/acara/:id" element={<EventDetail />} />
      <Route path="/berita" element={<News />} />
      <Route path="/berita/:id" element={<NewsDetail />} />
      <Route path="/materi" element={<Materials />} />
      <Route path="/praktik-baik" element={<BestPractices />} />
      <Route path="/dokumentasi" element={<Documentation />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <BootstrapAdmin />
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </AuthProvider>
  );
}
