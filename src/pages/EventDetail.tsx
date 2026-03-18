import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { TeacherEvent } from '../types';
import { formatDateTime, handleFirestoreError, OperationType } from '../utils';
import { ArrowLeft, Calendar, User, MapPin } from 'lucide-react';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<TeacherEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      const path = `events/${id}`;
      try {
        const docRef = doc(db, 'events', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent({ id: docSnap.id, ...docSnap.data() } as TeacherEvent);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Acara tidak ditemukan</h1>
        <Link to="/acara" className="inline-flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Acara
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-12">
      <Link to="/acara" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Acara
      </Link>

      <div className="space-y-12">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-8 text-sm text-slate-500 font-medium">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              {formatDateTime(event.date)}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-slate-400" />
              Oleh: {event.authorName}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-start gap-4">
            <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Deskripsi Acara</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button className="px-12 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all transform hover:scale-105 shadow-lg">
            Daftar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
