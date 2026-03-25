import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';
import { cn, getDirectImageUrl } from '../utils';

const Navbar: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    { name: 'Perangkat Pembelajaran', path: '/materi' },
    { name: 'Praktik Baik', path: '/praktik-baik' },
    { name: 'Dokumentasi', path: '/dokumentasi' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 flex justify-center">
      <div className="w-full max-w-7xl glass-nav rounded-2xl px-4 sm:px-6 lg:px-8 shadow-2xl">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src="https://lh3.googleusercontent.com/d/1jwoFQNLORP7hnnZqjoEoK27yavygL6Fb"
                alt="MGMP Logo"
                className="h-10 w-10 object-contain rounded-full border border-white/20 p-0.5 bg-white/10 backdrop-blur-sm"
                referrerPolicy="no-referrer"
              />
              <div className="ml-3 flex flex-col">
                <span className="text-lg font-black text-white leading-none tracking-tight">MGMP</span>
                <span className="text-xs font-bold text-white/90 leading-tight">Pendidikan Pancasila</span>
                <span className="text-[8px] font-semibold text-white/60 hidden sm:block uppercase tracking-wider">
                  SMP Kabupaten Mojokerto
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-[11px] transition-colors uppercase tracking-wider",
                  isActive(link.path)
                    ? "text-white font-black border-b-2 border-accent"
                    : "text-white/70 hover:text-white font-medium"
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-3 ml-2 pl-4 border-l border-white/10">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 group"
                >
                  {profile?.photoUrl ? (
                    <img 
                      src={getDirectImageUrl(profile.photoUrl) || ''} 
                      alt={profile.name}
                      className="w-8 h-8 rounded-full object-cover border border-white/20"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                      <User className="w-4 h-4 text-white/60" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white leading-none group-hover:text-accent transition-colors">{profile?.name}</span>
                    <span className="text-[8px] text-white/50 font-medium">Dashboard</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-white/70 hover:text-red-400 text-[10px] font-bold uppercase tracking-wider"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-1.5 border border-white/20 text-[10px] font-bold uppercase tracking-wider rounded-full text-white bg-white/10 hover:bg-white/20 transition-colors"
              >
                <LogIn className="w-3 h-3 mr-2" />
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={cn("lg:hidden absolute top-20 left-4 right-4", isOpen ? "block" : "hidden")}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass-nav rounded-2xl shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-md text-sm transition-colors uppercase tracking-wider",
                isActive(link.path)
                  ? "text-white font-black bg-white/10"
                  : "text-white/70 hover:text-white hover:bg-white/10 font-medium"
              )}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-bold text-white/70 hover:text-white hover:bg-white/10 uppercase tracking-wider"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-bold text-red-400 hover:bg-red-400/10 uppercase tracking-wider"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-bold text-white hover:bg-white/10 uppercase tracking-wider"
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
