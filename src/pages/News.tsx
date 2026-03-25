import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { NewsArticle } from '../types';
import { formatDate, getDirectImageUrl, handleFirestoreError, OperationType } from '../utils';
import { Link } from 'react-router-dom';

const News: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const path = 'news';
    const q = query(
      collection(db, path),
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle));
      setNews(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-16">
      <Helmet>
        <title>Berita Pendidikan - MGMP Pendidikan Pancasila Mojokerto</title>
        <meta name="description" content="Kumpulan berita dan artikel informatif seputar dunia pendidikan, keguruan, dan kegiatan MGMP Pendidikan Pancasila SMP Kabupaten Mojokerto." />
        <link rel="canonical" href={`${window.location.origin}/berita`} />
      </Helmet>
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Berita Pendidikan</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Kumpulan berita dan artikel informatif seputar dunia pendidikan dan keguruan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.length > 0 ? (
          news.map((article) => (
            <article key={article.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group">
              <div className="h-56 overflow-hidden">
                <img
                  src={getDirectImageUrl(article.imageUrl) || `https://picsum.photos/seed/${article.id}/800/600`}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                  <span>{formatDate(article.createdAt)}</span>
                  <span>Oleh: {article.authorName}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-4 mb-8">
                  {article.content}
                </p>
                <div className="mt-auto">
                  <Link
                    to={`/berita/${article.id}`}
                    className="inline-flex items-center text-sm font-bold text-slate-900 hover:underline"
                  >
                    Baca Selengkapnya &rarr;
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-slate-400">
            Belum ada berita yang dipublikasikan.
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
