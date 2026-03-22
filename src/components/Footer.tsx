import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white/70 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <img
                src="https://lh3.googleusercontent.com/d/1jwoFQNLORP7hnnZqjoEoK27yavygL6Fb"
                alt="MGMP Logo"
                className="h-12 w-12 object-contain rounded-full border border-white/20 p-0.5 bg-white/10"
                referrerPolicy="no-referrer"
              />
              <div className="ml-3">
                <h3 className="text-white text-xl font-black leading-none tracking-tight">MGMP</h3>
                <p className="text-white/80 text-sm font-bold">Pendidikan Pancasila</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              Wadah kolaborasi dan peningkatan profesionalisme guru PPKN SMP Kabupaten Mojokerto. 
              Berkomitmen untuk mencetak generasi bangsa yang berkarakter Pancasila.
            </p>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Tautan Cepat</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/profil" className="hover:text-accent transition-colors">Profil</Link></li>
              <li><Link to="/acara" className="hover:text-accent transition-colors">Acara</Link></li>
              <li><Link to="/berita" className="hover:text-accent transition-colors">Berita</Link></li>
              <li><Link to="/materi" className="hover:text-accent transition-colors">Perangkat Pembelajaran</Link></li>
              <li><Link to="/praktik-baik" className="hover:text-accent transition-colors">Praktik Baik</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Kontak</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Kabupaten Mojokerto, Jawa Timur</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <a href="mailto:mgmppknmojokerto@gmail.com" className="hover:text-white transition-colors">mgmppknmojokerto@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-[10px] uppercase tracking-widest font-bold">
          <p>&copy; {new Date().getFullYear()} MGMP Pendidikan Pancasila SMP Kabupaten Mojokerto. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
