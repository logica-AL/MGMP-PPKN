import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { NewsArticle, SiteSettings } from '../types';
import { formatDate, handleFirestoreError, OperationType, getDirectImageUrl } from '../utils';
import { ArrowRight, BookOpen, Calendar, Users } from 'lucide-react';

const Home: React.FC = () => {
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const path = 'news';
    const q = query(
      collection(db, path),
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsubscribeNews = onSnapshot(q, (snapshot) => {
      const news = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle));
      setLatestNews(news);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    const settingsPath = 'settings/main';
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'main'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings({ id: snapshot.id, ...snapshot.data() } as SiteSettings);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, settingsPath);
    });

    return () => {
      unsubscribeNews();
      unsubscribeSettings();
    };
  }, []);

  const heroBg = settings?.heroBackground || "https://drive.google.com/file/d/1YlpLa1aba-q0gGyVzLVoL7m5D028fHWR/view?usp=sharing";

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900 pt-20 pb-32 md:pb-48">
        <div className="absolute inset-0">
          <img
            src={getDirectImageUrl(heroBg)}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-slate-50"></div>
        </div>
        
        <div className="relative z-30 max-w-5xl mx-auto text-center px-4">
          <div className="mb-10 flex justify-center animate-fade-in">
            <img
              src="https://lh3.googleusercontent.com/d/1jwoFQNLORP7hnnZqjoEoK27yavygL6Fb"
              alt="MGMP Logo Large"
              className="h-40 w-40 object-contain rounded-full border-4 border-white/30 p-1 bg-white/10 backdrop-blur-md drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="space-y-4 mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-lg">MGMP</h2>
            <h1 className="text-5xl md:text-8xl font-black text-white mb-4 tracking-tight drop-shadow-2xl">
              Pendidikan Pancasila
            </h1>
            <p className="text-2xl md:text-4xl font-serif italic text-white/90 drop-shadow-md">
              SMP Se-kabupaten Mojokerto
            </p>
            <div className="w-24 h-1 bg-accent mx-auto my-6 rounded-full shadow-[0_0_10px_rgba(184,134,11,0.5)]"></div>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-sm">
              Wadah kolaborasi dan peningkatan profesionalisme guru PPKN SMP Kabupaten Mojokerto.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/register"
              className="btn-gold w-full sm:w-auto px-10 py-4 font-bold rounded-xl text-lg uppercase tracking-widest"
            >
              Gabung Sekarang
            </Link>
            <Link
              to="/profil"
              className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-bold rounded-xl text-lg hover:bg-white/20 transition-all uppercase tracking-widest"
            >
              Tentang Kami
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-card p-10 rounded-3xl group hover:-translate-y-2 transition-all duration-500">
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                <BookOpen className="w-8 h-8" />
              </div>
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3308/3308395.png" 
                alt="3D Book" 
                className="w-20 h-20 object-contain drop-shadow-xl group-hover:scale-110 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-primary">Perangkat Pembelajaran</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              Akses dokumen dan perangkat pembelajaran yang disusun oleh guru-guru berpengalaman.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-10 rounded-3xl group hover:-translate-y-2 transition-all duration-500">
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center shadow-inner">
                <Calendar className="w-8 h-8" />
              </div>
              <img 
                src="https://cdn-icons-png.flaticon.com/512/4341/4341764.png" 
                alt="3D Building" 
                className="w-20 h-20 object-contain drop-shadow-xl group-hover:scale-110 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-accent">Workshop & Acara</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              Ikuti berbagai pelatihan dan seminar untuk meningkatkan kompetensi pedagogik dan profesional.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-10 rounded-3xl group hover:-translate-y-2 transition-all duration-500">
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 bg-slate-800/10 text-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
                <Users className="w-8 h-8" />
              </div>
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3050/3050525.png" 
                alt="3D Community" 
                className="w-20 h-20 object-contain drop-shadow-xl group-hover:scale-110 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-800">Komunitas Guru</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              Terhubung dengan Guru pengampu mata pelajaran Pendidikan Pancasila SMP Se-Kabupaten Mojokerto.
            </p>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Berita Terbaru</h2>
            <p className="text-slate-500 mt-2">Informasi terkini seputar dunia pendidikan.</p>
          </div>
          <Link to="/berita" className="text-slate-900 font-semibold flex items-center hover:underline">
            Lihat Semua <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestNews.length > 0 ? (
            latestNews.map((news) => (
              <article key={news.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 group">
                <div className="h-48 overflow-hidden">
                  <img
                    src={getDirectImageUrl(news.imageUrl) || `https://picsum.photos/seed/${news.id}/800/600`}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {formatDate(news.createdAt)}
                  </span>
                  <h3 className="text-xl font-bold mt-2 mb-4 line-clamp-2 text-slate-900 group-hover:text-blue-600 transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-6">
                    {news.content}
                  </p>
                  <Link
                    to={`/berita/${news.id}`}
                    className="text-slate-900 text-sm font-bold flex items-center hover:underline"
                  >
                    Baca Selengkapnya <ArrowRight className="ml-1 w-3 h-3" />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-slate-400">
              Belum ada berita terbaru.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
