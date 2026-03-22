import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, addDoc, setDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, NewsArticle, StaffMember, TeacherEvent, EducationalMaterial, SiteSettings, Documentation } from '../types';
import { useAuth } from '../AuthContext';
import { Check, X, Trash2, Plus, UserCheck, FileText, Users as UsersIcon, Calendar, BookOpen, Settings as SettingsIcon, Camera } from 'lucide-react';
import { formatDate, handleFirestoreError, OperationType, getDirectImageUrl } from '../utils';

const AdminDashboard: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [pendingTeachers, setPendingTeachers] = useState<UserProfile[]>([]);
  const [pendingNews, setPendingNews] = useState<NewsArticle[]>([]);
  const [pendingEvents, setPendingEvents] = useState<TeacherEvent[]>([]);
  const [pendingMaterials, setPendingMaterials] = useState<EducationalMaterial[]>([]);
  const [pendingDocs, setPendingDocs] = useState<Documentation[]>([]);
  const [allNews, setAllNews] = useState<NewsArticle[]>([]);
  const [allEvents, setAllEvents] = useState<TeacherEvent[]>([]);
  const [allMaterials, setAllMaterials] = useState<EducationalMaterial[]>([]);
  const [allDocs, setAllDocs] = useState<Documentation[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'verification' | 'moderation' | 'staff' | 'users' | 'all-news' | 'all-events' | 'all-materials' | 'all-docs' | 'settings'>('verification');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New Staff Form State
  const [newStaff, setNewStaff] = useState({ name: '', position: '', imageUrl: '', order: 0 });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    vision: '',
    mission: '',
    history: ''
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!isAdmin) return;

    // Pending Teachers
    const pathTeachers = 'profiles';
    const qTeachers = query(collection(db, pathTeachers), where('isVerified', '==', false), where('role', '==', 'teacher'));
    const unsubTeachers = onSnapshot(qTeachers, (snap) => {
      setPendingTeachers(snap.docs.map(doc => doc.data() as UserProfile));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, pathTeachers);
    });

    // Pending News
    const pathNews = 'news';
    const qPendingNews = query(collection(db, pathNews), where('isApproved', '==', false));
    const unsubPendingNews = onSnapshot(qPendingNews, (snap) => {
      setPendingNews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, pathNews);
    });

    // Pending Events
    const pathEvents = 'events';
    const qPendingEvents = query(collection(db, pathEvents), where('isApproved', '==', false));
    const unsubPendingEvents = onSnapshot(qPendingEvents, (snap) => {
      setPendingEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherEvent)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, pathEvents);
    });

    // Pending Materials
    const pathMaterials = 'materials';
    const qPendingMaterials = query(collection(db, pathMaterials), where('isApproved', '==', false));
    const unsubPendingMaterials = onSnapshot(qPendingMaterials, (snap) => {
      setPendingMaterials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EducationalMaterial)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, pathMaterials);
    });

    // All News
    const qAllNews = query(collection(db, pathNews), orderBy('createdAt', 'desc'));
    const unsubAllNews = onSnapshot(qAllNews, (snap) => {
      setAllNews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, pathNews);
    });

    // All Events
    const qEvents = query(collection(db, pathEvents), orderBy('date', 'desc'));
    const unsubEvents = onSnapshot(qEvents, (snap) => {
      setAllEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherEvent)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, pathEvents);
    });

    // All Materials
    const qMaterials = query(collection(db, pathMaterials), orderBy('createdAt', 'desc'));
    const unsubMaterials = onSnapshot(qMaterials, (snap) => {
      setAllMaterials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EducationalMaterial)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, pathMaterials);
    });

    // Pending Documentation
    const pathDocs = 'documentation';
    const qPendingDocs = query(collection(db, pathDocs), where('isApproved', '==', false));
    const unsubPendingDocs = onSnapshot(qPendingDocs, (snap) => {
      setPendingDocs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Documentation)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, pathDocs);
    });

    // All Documentation
    const qAllDocs = query(collection(db, pathDocs), orderBy('createdAt', 'desc'));
    const unsubAllDocs = onSnapshot(qAllDocs, (snap) => {
      setAllDocs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Documentation)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, pathDocs);
    });

    // Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'main'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SiteSettings;
        setSettings({ id: snap.id, ...data });
        setSettingsForm({
          vision: data.vision || '',
          mission: data.mission?.join('\n') || '',
          history: data.history || ''
        });
      }
    });

    // Staff
    const pathStaff = 'staff';
    const qStaff = query(collection(db, pathStaff), orderBy('order', 'asc'));
    const unsubStaff = onSnapshot(qStaff, (snap) => {
      setStaff(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffMember)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, pathStaff);
    });

    // All Users
    const pathUsers = 'profiles';
    const qUsers = query(collection(db, pathUsers));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      setAllUsers(snap.docs.map(doc => doc.data() as UserProfile));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, pathUsers);
    });

    return () => {
      unsubTeachers();
      unsubPendingNews();
      unsubPendingEvents();
      unsubPendingMaterials();
      unsubAllNews();
      unsubEvents();
      unsubMaterials();
      unsubPendingDocs();
      unsubAllDocs();
      unsubStaff();
      unsubUsers();
      unsubSettings();
    };
  }, [isAdmin]);

  const handleVerifyTeacher = async (uid: string, accept: boolean) => {
    const path = `profiles/${uid}`;
    const profileRef = doc(db, 'profiles', uid);
    try {
      if (accept) {
        await updateDoc(profileRef, { isVerified: true });
        showToast('Guru berhasil diverifikasi');
      } else {
        showToast('Guru ditolak', 'error');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      showToast('Gagal memproses verifikasi', 'error');
    }
  };

  const handleApproveNews = async (id: string, approve: boolean) => {
    const path = `news/${id}`;
    const newsRef = doc(db, 'news', id);
    try {
      if (approve) {
        await updateDoc(newsRef, { isApproved: true });
        showToast('Berita berhasil disetujui');
      } else {
        await deleteDoc(newsRef);
        showToast('Berita dihapus');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      showToast('Gagal memproses berita', 'error');
    }
  };

  const handleApproveEvent = async (id: string, approve: boolean) => {
    const path = `events/${id}`;
    const eventRef = doc(db, 'events', id);
    try {
      if (approve) {
        await updateDoc(eventRef, { isApproved: true });
        showToast('Acara berhasil disetujui');
      } else {
        await deleteDoc(eventRef);
        showToast('Acara dihapus');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      showToast('Gagal memproses acara', 'error');
    }
  };

  const handleApproveMaterial = async (id: string, approve: boolean) => {
    const path = `materials/${id}`;
    const materialRef = doc(db, 'materials', id);
    try {
      if (approve) {
        await updateDoc(materialRef, { isApproved: true });
        showToast('Perangkat Pembelajaran berhasil disetujui');
      } else {
        await deleteDoc(materialRef);
        showToast('Perangkat Pembelajaran dihapus');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      showToast('Gagal memproses perangkat pembelajaran', 'error');
    }
  };

  const handleApproveDocumentation = async (id: string, approve: boolean) => {
    const path = `documentation/${id}`;
    const docRef = doc(db, 'documentation', id);
    try {
      if (approve) {
        await updateDoc(docRef, { isApproved: true });
        showToast('Dokumentasi berhasil disetujui');
      } else {
        await deleteDoc(docRef);
        showToast('Dokumentasi dihapus');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      showToast('Gagal memproses dokumentasi', 'error');
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = 'settings/main';
    try {
      const missionArray = settingsForm.mission.split('\n').filter(m => m.trim() !== '');
      await setDoc(doc(db, 'settings', 'main'), {
        vision: settingsForm.vision,
        mission: missionArray,
        history: settingsForm.history
      }, { merge: true });
      showToast('Pengaturan berhasil diperbarui');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      showToast('Gagal memperbarui pengaturan', 'error');
    }
  };

  const handleDeleteContent = async (collectionName: string, id: string) => {
    const path = `${collectionName}/${id}`;
    try {
      await deleteDoc(doc(db, collectionName, id));
      showToast('Data berhasil dihapus');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      showToast('Gagal menghapus data', 'error');
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = 'staff';
    try {
      await addDoc(collection(db, path), {
        ...newStaff,
        order: Number(newStaff.order)
      });
      setNewStaff({ name: '', position: '', imageUrl: '', order: 0 });
      showToast('Pengurus berhasil ditambahkan');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      showToast('Gagal menambahkan pengurus', 'error');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    const path = `staff/${id}`;
    try {
      await deleteDoc(doc(db, 'staff', id));
      showToast('Pengurus berhasil dihapus');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      showToast('Gagal menghapus pengurus', 'error');
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (uid === profile?.uid) {
      showToast('Anda tidak dapat menghapus akun Anda sendiri', 'error');
      return;
    }
    
    const path = `profiles/${uid}`;
    try {
      await deleteDoc(doc(db, 'profiles', uid));
      showToast('User berhasil dihapus');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      showToast('Gagal menghapus user', 'error');
    }
  };

  const handleToggleAdmin = async (uid: string, currentRole: string) => {
    if (uid === profile?.uid) {
      showToast('Anda tidak dapat mengubah role Anda sendiri', 'error');
      return;
    }
    
    const path = `profiles/${uid}`;
    const newRole = currentRole === 'admin' ? 'teacher' : 'admin';
    try {
      await updateDoc(doc(db, 'profiles', uid), { role: newRole });
      showToast(`User berhasil diubah menjadi ${newRole}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      showToast('Gagal mengubah role user', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Admin</h1>
          <p className="text-slate-500 mt-1">Selamat datang kembali, {profile?.name}</p>
        </div>
        <div className="flex flex-wrap bg-white p-1 rounded-lg border border-slate-200 shadow-sm gap-1">
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'verification' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <UserCheck className="w-4 h-4 inline-block mr-2" />
            Verifikasi Guru
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'moderation' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileText className="w-4 h-4 inline-block mr-2" />
            Moderasi Konten
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <SettingsIcon className="w-4 h-4 inline-block mr-2" />
            Pengaturan Situs
          </button>
          <button
            onClick={() => setActiveTab('all-news')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'all-news' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileText className="w-4 h-4 inline-block mr-2" />
            Semua Berita
          </button>
          <button
            onClick={() => setActiveTab('all-events')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'all-events' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Calendar className="w-4 h-4 inline-block mr-2" />
            Semua Acara
          </button>
          <button
            onClick={() => setActiveTab('all-materials')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'all-materials' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <BookOpen className="w-4 h-4 inline-block mr-2" />
            Semua Perangkat
          </button>
          <button
            onClick={() => setActiveTab('all-docs')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'all-docs' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Camera className="w-4 h-4 inline-block mr-2" />
            Semua Dokumentasi
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'staff' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <UsersIcon className="w-4 h-4 inline-block mr-2" />
            Kelola Pengurus
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <UsersIcon className="w-4 h-4 inline-block mr-2" />
            Daftar User
          </button>
        </div>
      </div>

      {activeTab === 'verification' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Antrean Verifikasi Guru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Sekolah</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingTeachers.length > 0 ? (
                  pendingTeachers.map((teacher) => (
                    <tr key={teacher.uid} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{teacher.name}</td>
                      <td className="px-6 py-4 text-slate-500">{teacher.school || '-'}</td>
                      <td className="px-6 py-4 text-slate-500">{teacher.email}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleVerifyTeacher(teacher.uid, true)}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleVerifyTeacher(teacher.uid, false)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada guru yang menunggu verifikasi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'moderation' && (
        <div className="space-y-8">
          {/* News Moderation */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Moderasi Berita</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Judul</th>
                    <th className="px-6 py-4">Penulis</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingNews.length > 0 ? (
                    pendingNews.map((news) => (
                      <tr key={news.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{news.title}</td>
                        <td className="px-6 py-4 text-slate-500">{news.authorName}</td>
                        <td className="px-6 py-4 text-slate-500">{formatDate(news.createdAt)}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleApproveNews(news.id, true)}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproveNews(news.id, false)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        Tidak ada berita yang menunggu persetujuan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Events Moderation */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Moderasi Acara</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Judul</th>
                    <th className="px-6 py-4">Penulis</th>
                    <th className="px-6 py-4">Tanggal Acara</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingEvents.length > 0 ? (
                    pendingEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{event.title}</td>
                        <td className="px-6 py-4 text-slate-500">{event.authorName}</td>
                        <td className="px-6 py-4 text-slate-500">{formatDate(event.date)}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleApproveEvent(event.id, true)}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproveEvent(event.id, false)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        Tidak ada acara yang menunggu persetujuan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Materials Moderation */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Moderasi Perangkat Pembelajaran</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Judul</th>
                    <th className="px-6 py-4">Penulis</th>
                    <th className="px-6 py-4">Tanggal Upload</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingMaterials.length > 0 ? (
                    pendingMaterials.map((material) => (
                      <tr key={material.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{material.title}</td>
                        <td className="px-6 py-4 text-slate-500">{material.authorName}</td>
                        <td className="px-6 py-4 text-slate-500">{formatDate(material.createdAt)}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleApproveMaterial(material.id, true)}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproveMaterial(material.id, false)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        Tidak ada materi yang menunggu persetujuan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Documentation Moderation */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Moderasi Dokumentasi</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Foto</th>
                    <th className="px-6 py-4">Judul</th>
                    <th className="px-6 py-4">Penulis</th>
                    <th className="px-6 py-4">Tanggal Upload</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingDocs.length > 0 ? (
                    pendingDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2 overflow-hidden">
                            {doc.imageUrls?.slice(0, 3).map((url, idx) => (
                              <img
                                key={idx}
                                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                                src={getDirectImageUrl(url)}
                                alt=""
                                referrerPolicy="no-referrer"
                              />
                            ))}
                            {doc.imageUrls?.length > 3 && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 ring-2 ring-white">
                                +{doc.imageUrls.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">{doc.title}</td>
                        <td className="px-6 py-4 text-slate-500">{doc.authorName}</td>
                        <td className="px-6 py-4 text-slate-500">{formatDate(doc.createdAt)}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleApproveDocumentation(doc.id, true)}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproveDocumentation(doc.id, false)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        Tidak ada dokumentasi yang menunggu persetujuan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Pengaturan Situs</h2>
          <form onSubmit={handleUpdateSettings} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Visi</label>
              <textarea
                required
                value={settingsForm.vision}
                onChange={(e) => setSettingsForm({ ...settingsForm, vision: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[100px]"
                placeholder="Masukkan visi organisasi..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Misi (Satu per baris)</label>
              <textarea
                required
                value={settingsForm.mission}
                onChange={(e) => setSettingsForm({ ...settingsForm, mission: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[150px]"
                placeholder="Masukkan misi organisasi, pisahkan dengan baris baru..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Sejarah Singkat</label>
              <textarea
                value={settingsForm.history}
                onChange={(e) => setSettingsForm({ ...settingsForm, history: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[150px]"
                placeholder="Masukkan sejarah singkat organisasi..."
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>
      )}

      {activeTab === 'all-news' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Semua Berita</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Judul</th>
                  <th className="px-6 py-4">Penulis</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allNews.map((news) => (
                  <tr key={news.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{news.title}</td>
                    <td className="px-6 py-4 text-slate-500">{news.authorName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${news.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {news.isApproved ? 'Aktif' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteContent('news', news.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'all-events' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Semua Acara</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Judul</th>
                  <th className="px-6 py-4">Penulis</th>
                  <th className="px-6 py-4">Tanggal Acara</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{event.title}</td>
                    <td className="px-6 py-4 text-slate-500">{event.authorName}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(event.date)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteContent('events', event.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'all-materials' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Semua Perangkat Pembelajaran</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Judul</th>
                  <th className="px-6 py-4">Penulis</th>
                  <th className="px-6 py-4">Tanggal Upload</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{material.title}</td>
                    <td className="px-6 py-4 text-slate-500">{material.authorName}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(material.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteContent('materials', material.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'all-docs' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Semua Dokumentasi</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Judul</th>
                  <th className="px-6 py-4">Penulis</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{doc.title}</td>
                    <td className="px-6 py-4 text-slate-500">{doc.authorName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${doc.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {doc.isApproved ? 'Aktif' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteContent('documentation', doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Tambah Pengurus Baru</h2>
            <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Nama</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Jabatan</label>
                <input
                  type="text"
                  required
                  value={newStaff.position}
                  onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">URL Foto (Wajib Google Drive)</label>
                <input
                  type="text"
                  value={newStaff.imageUrl}
                  onChange={(e) => setNewStaff({ ...newStaff, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="https://drive.google.com/..."
                />
                <p className="text-[10px] text-slate-400">Wajib menggunakan link dari Google Drive.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Urutan</label>
                <input
                  type="number"
                  required
                  value={newStaff.order}
                  onChange={(e) => setNewStaff({ ...newStaff, order: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Daftar Pengurus</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Urutan</th>
                    <th className="px-6 py-4">Foto</th>
                    <th className="px-6 py-4">Nama</th>
                    <th className="px-6 py-4">Jabatan</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-500">{member.order}</td>
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                          <img 
                            src={getDirectImageUrl(member.imageUrl) || `https://picsum.photos/seed/${member.id}/100/100`} 
                            alt={member.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => (e.currentTarget.src = `https://picsum.photos/seed/${member.id}/100/100`)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{member.name}</td>
                      <td className="px-6 py-4 text-slate-500">{member.position}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteStaff(member.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Daftar Pengguna</h2>
            <p className="text-xs text-slate-400 mt-1">* Password tidak dapat ditampilkan demi keamanan.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Sekolah</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                    <td className="px-6 py-4 text-slate-500">{user.school || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {user.isVerified ? 'Terverifikasi' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {user.uid !== profile?.uid && (
                        <>
                          <button
                            onClick={() => handleToggleAdmin(user.uid, user.role)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.role === 'admin' 
                                ? 'text-amber-600 hover:bg-amber-50' 
                                : 'text-purple-600 hover:bg-purple-50'
                            }`}
                            title={user.role === 'admin' ? 'Jadikan Guru' : 'Jadikan Admin'}
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.uid)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
