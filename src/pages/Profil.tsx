import React, { useEffect, useState } from 'react';
import { Target, Eye, History, Music } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { SiteSettings } from '../types';
import { handleFirestoreError, OperationType } from '../utils';

const Profil: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const path = 'settings/main';
    const unsubscribe = onSnapshot(doc(db, 'settings', 'main'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings({ id: snapshot.id, ...snapshot.data() } as SiteSettings);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, []);

  const vision = settings?.vision || "Menjadi wadah MGMP yang inovatif dan profesional dalam mewujudkan pendidik yang berkarakter Pancasila di Kabupaten Mojokerto.";
  const mission = settings?.mission || [
    "Meningkatkan kompetensi guru dalam pengajaran Pendidikan Pancasila.",
    "Memfasilitasi kolaborasi dan berbagi praktik baik antar guru SMP di Kabupaten Mojokerto.",
    "Mendorong pemanfaatan teknologi dalam proses pembelajaran Pendidikan Pancasila.",
    "Mengembangkan materi pembelajaran yang kreatif dan relevan."
  ];
  const history = settings?.history || "MGMP Pendidikan Pancasila SMP Kabupaten Mojokerto dibentuk sebagai sarana komunikasi dan pengembangan diri bagi guru-guru Pendidikan Pancasila di wilayah Kabupaten Mojokerto. Kami berkomitmen untuk terus berinnovasi demi kemajuan pendidikan karakter bangsa.";

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-24">
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Tentang Kami</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          MGMP Pendidikan Pancasila SMP Kabupaten Mojokerto adalah wadah bagi para pendidik untuk berkolaborasi, berbagi ilmu, dan meningkatkan profesionalisme dalam pengajaran Pendidikan Pancasila.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="p-10 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Visi</h2>
          <p className="text-slate-600 leading-relaxed">
            {vision}
          </p>
        </div>
        <div className="p-10 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Misi</h2>
          <ul className="space-y-4 text-slate-600 list-disc list-inside">
            {mission.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sejarah Singkat</h2>
        </div>
        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
          <p>
            {history}
          </p>
        </div>
      </section>

      {/* Mars MGMP Section */}
      <section className="space-y-10">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
            <Music className="w-5 h-5" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Mars MGMP</h2>
        </div>
        
        <div className="relative group overflow-hidden rounded-3xl bg-slate-900 p-1 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-emerald-500/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative bg-slate-900 rounded-[22px] overflow-hidden aspect-video md:aspect-[21/9]">
            <iframe
              src="https://drive.google.com/file/d/1fE0g1oF6DLc2Op2w619_Wcgg7zy7LCvt/preview"
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay"
              title="Mars MGMP"
            />
          </div>
          
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Mars MGMP Pendidikan Pancasila</h3>
                <p className="text-slate-400 text-sm">Kabupaten Mojokerto</p>
              </div>
              <a 
                href="https://drive.google.com/file/d/1fE0g1oF6DLc2Op2w619_Wcgg7zy7LCvt/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-all backdrop-blur-sm border border-white/10"
              >
                Buka di Drive
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profil;
