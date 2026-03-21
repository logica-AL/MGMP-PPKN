import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { TeacherEvent } from '../types';
import { formatDateTime, handleFirestoreError, OperationType } from '../utils';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Events: React.FC = () => {
  const [events, setEvents] = useState<TeacherEvent[]>([]);

  useEffect(() => {
    const path = 'events';
    const q = query(collection(db, path), where('isApproved', '==', true), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherEvent));
      setEvents(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Acara & Workshop</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Tingkatkan kompetensi Anda melalui berbagai pelatihan dan seminar pendidikan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4 flex-grow">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      {formatDateTime(event.date)}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                      {event.location}
                    </div>
                  </div>
                </div>
                <Link 
                  to={`/acara/${event.id}`}
                  className="inline-flex items-center px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Detail Acara <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12 text-slate-400">
            Belum ada acara mendatang.
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
