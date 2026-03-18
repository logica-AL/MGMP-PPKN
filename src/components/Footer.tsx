import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">MGMP Pendidikan Pancasila</h3>
            <p className="text-sm leading-relaxed">
              Pendidikan Pancasila SMP Kabupaten Mojokerto. Wadah kolaborasi dan pengembangan profesionalisme guru.
            </p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profil" className="hover:text-white transition-colors">Profil</Link></li>
              <li><Link to="/acara" className="hover:text-white transition-colors">Acara</Link></li>
              <li><Link to="/berita" className="hover:text-white transition-colors">Berita</Link></li>
              <li><Link to="/materi" className="hover:text-white transition-colors">Materi</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Kontak</h4>
            <ul className="space-y-2 text-sm">
              <li>Alamat: Kabupaten Mojokerto, Jawa Timur</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} MGMP Pendidikan Pancasila SMP Kabupaten Mojokerto. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
