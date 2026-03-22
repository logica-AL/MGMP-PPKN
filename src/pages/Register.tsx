import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserPlus, AlertCircle, Globe } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create profile
      const isAdminEmail = email === 'logicafalfa21@gmail.com';
      const path = `profiles/${user.uid}`;
      
      try {
        await setDoc(doc(db, 'profiles', user.uid), {
          uid: user.uid,
          email: user.email,
          name: name,
          school: school,
          role: isAdminEmail ? 'admin' : 'teacher',
          isVerified: isAdminEmail ? true : false,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }

      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah terdaftar. Gunakan email lain.');
      } else {
        setError('Terjadi kesalahan saat pendaftaran. Silakan coba lagi.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user.email) {
        throw new Error('Email tidak ditemukan dari akun Google Anda.');
      }

      // Check if profile exists, if not create one
      const profileRef = doc(db, 'profiles', user.uid);
      const snap = await getDoc(profileRef);
      
      if (!snap.exists()) {
        const isAdminEmail = user.email === 'logicafalfa21@gmail.com';
        const profileData = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || 'User',
          role: isAdminEmail ? 'admin' : 'teacher',
          isVerified: isAdminEmail ? true : false,
          school: ''
        };
        
        try {
          await setDoc(profileRef, profileData);
        } catch (err: any) {
          handleFirestoreError(err, OperationType.CREATE, `profiles/${user.uid}`);
        }
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Pendaftaran dibatalkan. Silakan coba lagi.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignore this one
      } else {
        setError('Gagal mendaftar dengan Google. Silakan coba lagi.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-32">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-10 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary"></div>

        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img
              src="https://lh3.googleusercontent.com/d/1jwoFQNLORP7hnnZqjoEoK27yavygL6Fb"
              alt="MGMP Logo"
              className="h-20 w-20 object-contain rounded-full border-2 border-slate-100 p-1 bg-white shadow-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-3xl font-black text-primary tracking-tight">Daftar Akun MGMP</h2>
          <p className="text-slate-500 mt-2 font-medium">Bergabunglah dengan komunitas guru Pendidikan Pancasila.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-600 text-sm font-medium">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                placeholder="Nama Lengkap Anda"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Asal Sekolah</label>
              <input
                type="text"
                required
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                placeholder="Nama Sekolah Anda"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                placeholder="nama@email.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                placeholder="Minimal 6 karakter"
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center uppercase tracking-widest text-sm"
            >
              {loading ? 'Memproses...' : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Daftar Sekarang
                </>
              )}
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="bg-white px-4 text-slate-400">Atau daftar dengan</span>
            </div>
          </div>

          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full py-4 bg-white border-2 border-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm"
          >
            <Globe className="w-5 h-5 mr-3 text-blue-600" />
            Google Account
          </button>
        </div>

        <div className="text-center text-sm text-slate-500 font-medium">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary font-black hover:underline">
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
