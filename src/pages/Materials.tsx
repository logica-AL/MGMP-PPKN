import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { EducationalMaterial } from '../types';
import { useAuth } from '../AuthContext';
import { FileText, Download, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../utils';

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<EducationalMaterial[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const path = 'materials';
    const q = query(collection(db, path), where('isApproved', '==', true), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EducationalMaterial));
      setMaterials(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Materi Pembelajaran</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Dapatkan akses ke berbagai dokumen dan materi pembelajaran untuk mendukung kegiatan mengajar Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {materials.length > 0 ? (
          materials.map((material) => (
            <div key={material.id} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col group">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2">
                {material.title}
              </h3>
              <p className="text-slate-500 text-sm mb-8 flex-grow">
                Diunggah oleh: {material.authorName}
              </p>
              
              {user ? (
                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Unduh Materi
                </a>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 text-slate-400 text-sm font-bold rounded-lg cursor-not-allowed"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Masuk untuk Unduh
                </Link>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-slate-400">
            Belum ada materi yang tersedia.
          </div>
        )}
      </div>
    </div>
  );
};

export default Materials;
