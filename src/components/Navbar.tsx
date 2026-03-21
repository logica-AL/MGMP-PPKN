import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';
import { cn } from '../utils';

const Navbar: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Profil', path: '/profil' },
    { name: 'Pengurus', path: '/pengurus' },
    { name: 'Acara', path: '/acara' },
    { name: 'Berita', path: '/berita' },
    { name: 'Materi', path: '/materi' },
    { name: 'Dokumentasi', path: '/dokumentasi' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src="https://lh3.googleusercontent.com/d/1jwoFQNLORP7hnnZqjoEoK27yavygL6Fb"
                alt="MGMP Logo"
                className="h-10 w-10 object-contain rounded-full border-2 border-slate-100 p-0.5 bg-white"
                referrerPolicy="no-referrer"
              />
              <div className="ml-3 flex flex-col">
                <span className="text-xl font-bold text-slate-900 leading-none">MGMP PPKN</span>
                <span className="text-[10px] font-medium text-slate-500 hidden sm:block uppercase tracking-tight">
                  SMP MOJOKERTO
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-200">
                <Link
                  to="/dashboard"
                  className="flex items-center text-slate-600 hover:text-slate-900 text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4 mr-1" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-slate-600 hover:text-red-600 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={cn("md:hidden", isOpen ? "block" : "hidden")}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b border-slate-200">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-900 hover:bg-slate-50"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
