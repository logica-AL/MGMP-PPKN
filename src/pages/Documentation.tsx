import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Documentation as DocumentationType } from '../types';
import { formatDate, handleFirestoreError, OperationType, getDirectImageUrl } from '../utils';
import { Camera, Calendar, User, X } from 'lucide-react';

const Documentation: React.FC = () => {
  const [docs, setDocs] = useState<DocumentationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocumentationType | null>(null);

  useEffect(() => {
    const path = 'documentation';
    const q = query(
      collection(db, path),
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DocumentationType));
      setDocs(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Dokumentasi Kegiatan</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Kumpulan foto dan dokumentasi kegiatan MGMP Pendidikan Pancasila SMP Kabupaten Mojokerto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {docs.length > 0 ? (
          docs.map((doc) => (
            <div 
              key={doc.id} 
              onClick={() => setSelectedDoc(doc)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="h-64 overflow-hidden relative">
                <img
                  src={getDirectImageUrl(doc.imageUrl) || `https://picsum.photos/seed/${doc.id}/800/600`}
                  alt={doc.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center text-xs font-bold text-slate-900 shadow-sm">
                  <Camera className="w-3 h-3 mr-1" />
                  Foto
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(doc.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {doc.authorName}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                  {doc.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-20 text-slate-400">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Belum ada dokumentasi yang tersedia.</p>
          </div>
        )}
      </div>

      {/* Modal Detail Dokumentasi */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setSelectedDoc(null)}
          ></div>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row">
            <button 
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white md:text-slate-900 md:bg-slate-100 md:hover:bg-slate-200 rounded-full transition-colors z-20"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-full md:w-3/5 h-64 md:h-auto overflow-hidden bg-slate-100">
              <img
                src={getDirectImageUrl(selectedDoc.imageUrl) || `https://picsum.photos/seed/${selectedDoc.id}/1200/800`}
                alt={selectedDoc.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="w-full md:w-2/5 p-8 md:p-10 overflow-y-auto flex flex-col">
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(selectedDoc.createdAt)}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {selectedDoc.authorName}
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 leading-tight">
                {selectedDoc.title}
              </h2>

              <div className="prose prose-slate prose-sm max-w-none">
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {selectedDoc.description}
                </p>
              </div>

              <div className="mt-auto pt-10">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Kontributor</p>
                  <p className="text-sm font-bold text-slate-900">{selectedDoc.authorName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documentation;
