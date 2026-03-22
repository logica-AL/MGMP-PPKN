import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { StaffMember } from '../types';
import { getDirectImageUrl, handleFirestoreError, OperationType } from '../utils';

const Staff: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    const path = 'staff';
    const q = query(collection(db, path), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffMember));
      setStaff(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Struktur Kepengurusan</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Para profesional yang berdedikasi untuk menjalankan roda organisasi dan melayani komunitas guru.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {staff.length > 0 ? (
          staff.map((member) => (
            <div key={member.id} className="text-center group">
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div className="absolute inset-0 bg-slate-100 rounded-full group-hover:scale-105 transition-transform duration-300"></div>
                <img
                  src={getDirectImageUrl(member.imageUrl) || `https://picsum.photos/seed/${member.id}/400/400`}
                  alt={member.name}
                  className="relative w-full h-full object-cover rounded-full shadow-sm border-4 border-white"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
              <p className="text-slate-500 font-medium text-sm uppercase tracking-wider mt-1">
                {member.position}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-4 text-center py-12 text-slate-400">
            Data pengurus belum tersedia.
          </div>
        )}
      </div>
    </div>
  );
};

export default Staff;
