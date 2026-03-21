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
    });

    return () => {
      unsubscribeNews();
      unsubscribeSettings();
    };
  }, []);

  const heroBg = settings?.heroBackground || "https://drive.google.com/file/d/1YlpLa1aba-q0gGyVzLVoL7m5D028fHWR/view?usp=sharing";

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 opacity-40">
          <img
            src={getDirectImageUrl(heroBg)}
            alt="Hero Background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <div className="mb-8 flex justify-center">
            <img
              src="https://lh3.googleusercontent.com/d/1jwoFQNLORP7hnnZqjoEoK27yavygL6Fb"
              alt="MGMP Logo Large"
              className="h-32 w-32 object-contain rounded-full border-4 border-white p-1 bg-white/20 backdrop-blur-sm drop-shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            MGMP PPKN SMP MOJOKERTO
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Wadah kolaborasi dan peningkatan profesionalisme guru PPKN SMP Kabupaten Mojokerto.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3 bg-white text-slate-900 font-semibold rounded-md hover:bg-slate-100 transition-colors"
            >
              Gabung Sekarang
            </Link>
            <Link
              to="/profil"
              className="w-full sm:w-auto px-8 py-3 bg-transparent border border-white text-white font-semibold rounded-md hover:bg-white/10 transition-colors"
            >
              Tentang Kami
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="p-8 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Materi</h3>
            <p className="text-slate-600 leading-relaxed">
              Akses dokumen dan materi pembelajaran yang disusun oleh guru-guru berpengalaman.
            </p>
          </div>
          <div className="p-8 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Workshop & Acara</h3>
            <p className="text-slate-600 leading-relaxed">
              Ikuti berbagai pelatihan dan seminar untuk meningkatkan kompetensi pedagogik dan profesional.
            </p>
          </div>
          <div className="p-8 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Komunitas Guru</h3>
            <p className="text-slate-600 leading-relaxed">
              Terhubung dengan Guru pengampu mata pelajaran Pendidikan Pancasila SMP Se-Kabupaten Mojokerto.
            </p>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
