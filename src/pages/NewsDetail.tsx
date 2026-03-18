import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { NewsArticle } from '../types';
import { formatDate, handleFirestoreError, OperationType, getDirectImageUrl } from '../utils';
import { ArrowLeft, Calendar, User } from 'lucide-react';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      const path = `news/${id}`;
      try {
        const docRef = doc(db, 'news', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() } as NewsArticle);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Berita tidak ditemukan</h1>
        <Link to="/berita" className="inline-flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Berita
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-12">
      <Link to="/berita" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Berita
      </Link>

      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 font-medium">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              {formatDate(article.createdAt)}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-slate-400" />
              {article.authorName}
            </div>
          </div>
        </div>

        <div className="aspect-video rounded-3xl overflow-hidden shadow-lg">
          <img
            src={getDirectImageUrl(article.imageUrl) || `https://picsum.photos/seed/${article.id}/1200/800`}
            alt={article.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="prose prose-slate prose-lg max-w-none">
          {article.content.split('\n').map((paragraph, index) => (
            <p key={index} className="text-slate-600 leading-relaxed mb-6">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
