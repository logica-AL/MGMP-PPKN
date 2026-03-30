import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Documentation as DocumentationType } from '../types';
import { formatDate, handleFirestoreError, OperationType, getDirectImageUrl, isVideoUrl, getEmbedVideoUrl, getVideoThumbnail } from '../utils';
import { Camera, Calendar, User, X, ChevronLeft, ChevronRight, Play, Globe } from 'lucide-react';

const Documentation: React.FC = () => {
  const [docs, setDocs] = useState<DocumentationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocumentationType | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'photo' | 'video'>('all');

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

  const filteredDocs = docs.filter(doc => {
    if (activeTab === 'photo') return !doc.type || doc.type === 'photo';
    if (activeTab === 'video') return doc.type === 'video';
    return true;
  });

  const openModal = (doc: DocumentationType) => {
    setSelectedDoc(doc);
    setActiveImageIndex(0);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedDoc?.imageUrls) {
      setActiveImageIndex((prev) => (prev + 1) % selectedDoc.imageUrls.length);
    }
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedDoc?.imageUrls) {
      setActiveImageIndex((prev) => (prev - 1 + selectedDoc.imageUrls.length) % selectedDoc.imageUrls.length);
    }
  };

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

      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'photo' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Galeri Foto
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'video' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Galeri Video
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => (
            <div 
              key={doc.id} 
              onClick={() => openModal(doc)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="h-64 overflow-hidden relative">
                {doc.type === 'video' ? (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                    <img
                      src={getVideoThumbnail(doc.imageUrls?.[0]) || `https://picsum.photos/seed/${doc.id}/800/600`}
                      alt={doc.title}
                      className="w-full h-full object-cover opacity-60"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={getDirectImageUrl(doc.imageUrls?.[0]) || `https://picsum.photos/seed/${doc.id}/800/600`}
                    alt={doc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center text-xs font-bold text-slate-900 shadow-sm">
                  <Camera className="w-3 h-3 mr-1" />
                  {doc.imageUrls?.length || 0} Media
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
          <div className="bg-white w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row">
            <button 
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white md:text-slate-900 md:bg-slate-100 md:hover:bg-slate-200 rounded-full transition-colors z-[70]"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-full md:w-2/3 h-[50vh] md:h-auto overflow-hidden bg-slate-900 relative flex flex-col">
              <div className="flex-grow relative group/modal flex items-center justify-center min-h-[300px]">
                {selectedDoc.type === 'video' ? (
                  <div className="w-full h-full bg-black flex items-center justify-center relative">
                    <iframe
                      src={getEmbedVideoUrl(selectedDoc.imageUrls?.[activeImageIndex]) || ''}
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      title={selectedDoc.title}
                    ></iframe>
                    <div className="absolute bottom-4 right-4 z-20">
                      <a 
                        href={selectedDoc.imageUrls?.[activeImageIndex]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all border border-white/10 flex items-center"
                      >
                        <Globe className="w-3 h-3 mr-2" />
                        Buka Video
                      </a>
                    </div>
                  </div>
                ) : (
                  <img
                    src={getDirectImageUrl(selectedDoc.imageUrls?.[activeImageIndex]) || `https://picsum.photos/seed/${selectedDoc.id}-${activeImageIndex}/1200/800`}
                    alt={selectedDoc.title}
                    className="w-full h-full object-contain bg-slate-900"
                    referrerPolicy="no-referrer"
                  />
                )}
                
                {selectedDoc.imageUrls && selectedDoc.imageUrls.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors opacity-0 group-hover/modal:opacity-100"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors opacity-0 group-hover/modal:opacity-100"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-bold">
                      {activeImageIndex + 1} / {selectedDoc.imageUrls.length}
                    </div>
                  </>
                )}
              </div>
              
              {selectedDoc.imageUrls && selectedDoc.imageUrls.length > 1 && (
                <div className="p-4 bg-white border-t border-slate-100 overflow-x-auto">
                  <div className="flex gap-2">
                    {selectedDoc.imageUrls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative ${activeImageIndex === idx ? 'border-blue-600' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        {selectedDoc.type === 'video' ? (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <Play className="w-6 h-6 text-white fill-white" />
                          </div>
                        ) : (
                          <img
                            src={getDirectImageUrl(url)}
                            alt={`Thumbnail ${idx}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-full md:w-1/3 p-8 md:p-10 overflow-y-auto flex flex-col bg-white">
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
