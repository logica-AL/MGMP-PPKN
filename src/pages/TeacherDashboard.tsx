import React, { useState } from 'react';
import { collection, addDoc, Timestamp, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { FileText, Calendar, BookOpen, Send, AlertCircle, CheckCircle, Camera, MessageSquare, Star, Trash2 } from 'lucide-react';
import { BestPractice, EducationalMaterial, NewsArticle, TeacherEvent, Documentation } from '../types';
import { formatDate } from '../utils';
import toast from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../utils';

const TeacherDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeForm, setActiveForm] = useState<'news' | 'event' | 'material' | 'documentation' | 'bestPractice' | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form States
  const [newsForm, setNewsForm] = useState({ title: '', content: '', imageUrl: '' });
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', location: '' });
  const [materialForm, setMaterialForm] = useState({ title: '', description: '', fileUrl: '' });
  const [docForm, setDocForm] = useState({ title: '', description: '', imageUrls: '' });
  const [bpForm, setBpForm] = useState({ 
    title: '', 
    description: '', 
    driveUrl: '', 
    imageUrl: '',
    category: 'Metode Pembelajaran Kreatif' as any,
    fileType: 'PDF' as any
  });

  const [myPractices, setMyPractices] = useState<BestPractice[]>([]);
  const [myMaterials, setMyMaterials] = useState<EducationalMaterial[]>([]);
  const [myNews, setMyNews] = useState<NewsArticle[]>([]);
  const [myEvents, setMyEvents] = useState<TeacherEvent[]>([]);
  const [myDocs, setMyDocs] = useState<Documentation[]>([]);

  React.useEffect(() => {
    if (!profile?.uid) return;

    const qBp = query(collection(db, 'best_practices'), where('authorId', '==', profile.uid));
    const unsubscribeBp = onSnapshot(qBp, (snapshot) => {
      setMyPractices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BestPractice)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'best_practices');
    });

    const qMat = query(collection(db, 'materials'), where('authorId', '==', profile.uid));
    const unsubscribeMat = onSnapshot(qMat, (snapshot) => {
      setMyMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EducationalMaterial)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'materials');
    });

    const qNews = query(collection(db, 'news'), where('authorId', '==', profile.uid));
    const unsubscribeNews = onSnapshot(qNews, (snapshot) => {
      setMyNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'news');
    });

    const qEvents = query(collection(db, 'events'), where('authorId', '==', profile.uid));
    const unsubscribeEvents = onSnapshot(qEvents, (snapshot) => {
      setMyEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherEvent)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
    });

    const qDocs = query(collection(db, 'documentation'), where('authorId', '==', profile.uid));
    const unsubscribeDocs = onSnapshot(qDocs, (snapshot) => {
      setMyDocs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Documentation)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'documentation');
    });

    return () => {
      unsubscribeBp();
      unsubscribeMat();
      unsubscribeNews();
      unsubscribeEvents();
      unsubscribeDocs();
    };
  }, [profile?.uid]);

  const handleDelete = async (coll: string, id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus konten ini?')) return;
    try {
      await deleteDoc(doc(db, coll, id));
      toast.success('Konten berhasil dihapus');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, coll);
    }
  };

  const resetForms = () => {
    setNewsForm({ title: '', content: '', imageUrl: '' });
    setEventForm({ title: '', description: '', date: '', location: '' });
    setMaterialForm({ title: '', description: '', fileUrl: '' });
    setDocForm({ title: '', description: '', imageUrls: '' });
    setBpForm({ 
      title: '', 
      description: '', 
      driveUrl: '', 
      imageUrl: '',
      category: 'Metode Pembelajaran Kreatif',
      fileType: 'PDF'
    });
    setSuccess(false);
  };

  const handleSubmitNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.isVerified) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'news'), {
        ...newsForm,
        authorId: profile.uid,
        authorName: profile.name,
        createdAt: Timestamp.now(),
        isApproved: false
      });
      setSuccess(true);
      toast.success('Berita berhasil dikirim untuk persetujuan');
      setNewsForm({ title: '', content: '', imageUrl: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'news');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.isVerified) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'events'), {
        ...eventForm,
        date: Timestamp.fromDate(new Date(eventForm.date)),
        authorId: profile.uid,
        authorName: profile.name,
        createdAt: Timestamp.now(),
        isApproved: false // Events require admin approval
      });
      setSuccess(true);
      toast.success('Acara berhasil dikirim untuk persetujuan');
      setEventForm({ title: '', description: '', date: '', location: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.isVerified) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'materials'), {
        ...materialForm,
        authorId: profile.uid,
        authorName: profile.name,
        createdAt: Timestamp.now(),
        isApproved: false // Materials require admin approval
      });
      setSuccess(true);
      toast.success('Perangkat Pembelajaran berhasil dikirim untuk persetujuan');
      setMaterialForm({ title: '', description: '', fileUrl: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'materials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDocumentation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.isVerified) return;
    setLoading(true);
    try {
      // Split URLs by comma, newline, semicolon or space and filter out empty strings
      const urls = docForm.imageUrls
        .split(/[\n,; ]+/)
        .map(url => url.trim())
        .filter(url => url !== '');

      if (urls.length === 0) {
        toast.error('Minimal satu URL foto diperlukan');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'documentation'), {
        title: docForm.title,
        description: docForm.description,
        imageUrls: urls,
        authorId: profile.uid,
        authorName: profile.name,
        createdAt: Timestamp.now(),
        isApproved: false
      });
      setSuccess(true);
      toast.success('Dokumentasi berhasil dikirim untuk persetujuan');
      setDocForm({ title: '', description: '', imageUrls: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'documentation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBestPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.isVerified) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'best_practices'), {
        ...bpForm,
        authorId: profile.uid,
        authorName: profile.name,
        createdAt: Timestamp.now(),
        isApproved: false
      });
      setSuccess(true);
      toast.success('Praktik Baik berhasil dikirim untuk persetujuan');
      setBpForm({ 
        title: '', 
        description: '', 
        driveUrl: '', 
        imageUrl: '',
        category: 'Metode Pembelajaran Kreatif',
        fileType: 'PDF'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'best_practices');
    } finally {
      setLoading(false);
    }
  };

  if (!profile?.isVerified) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-10 text-center space-y-6">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Menunggu Verifikasi</h1>
          <p className="text-slate-600 leading-relaxed">
            Akun Anda sedang menunggu verifikasi dari Admin. Anda belum bisa mengunggah konten saat ini.
            Silakan periksa kembali nanti.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Guru</h1>
        <p className="text-slate-500">Halo, {profile.name}. Apa yang ingin Anda bagikan hari ini?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => { setActiveForm('news'); setSuccess(false); }}
          className={`p-8 rounded-2xl border transition-all text-left space-y-4 ${activeForm === 'news' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
        >
          <FileText className={`w-8 h-8 ${activeForm === 'news' ? 'text-white' : 'text-slate-400'}`} />
          <div>
            <h3 className="font-bold text-lg">Berita</h3>
            <p className="text-sm opacity-70">Butuh persetujuan admin.</p>
          </div>
        </button>
        <button
          onClick={() => { setActiveForm('event'); setSuccess(false); }}
          className={`p-8 rounded-2xl border transition-all text-left space-y-4 ${activeForm === 'event' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
        >
          <Calendar className={`w-8 h-8 ${activeForm === 'event' ? 'text-white' : 'text-slate-400'}`} />
          <div>
            <h3 className="font-bold text-lg">Acara</h3>
            <p className="text-sm opacity-70">Langsung dipublikasikan.</p>
          </div>
        </button>
        <button
          onClick={() => { setActiveForm('material'); setSuccess(false); }}
          className={`p-8 rounded-2xl border transition-all text-left space-y-4 ${activeForm === 'material' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
        >
          <BookOpen className={`w-8 h-8 ${activeForm === 'material' ? 'text-white' : 'text-slate-400'}`} />
          <div>
            <h3 className="font-bold text-lg">Perangkat Pembelajaran</h3>
            <p className="text-sm opacity-70">Langsung dipublikasikan.</p>
          </div>
        </button>
        <button
          onClick={() => { setActiveForm('documentation'); setSuccess(false); }}
          className={`p-8 rounded-2xl border transition-all text-left space-y-4 ${activeForm === 'documentation' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
        >
          <Camera className={`w-8 h-8 ${activeForm === 'documentation' ? 'text-white' : 'text-slate-400'}`} />
          <div>
            <h3 className="font-bold text-lg">Dokumentasi</h3>
            <p className="text-sm opacity-70">Butuh persetujuan admin.</p>
          </div>
        </button>
        <button
          onClick={() => { setActiveForm('bestPractice'); setSuccess(false); }}
          className={`p-8 rounded-2xl border transition-all text-left space-y-4 ${activeForm === 'bestPractice' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
        >
          <MessageSquare className={`w-8 h-8 ${activeForm === 'bestPractice' ? 'text-white' : 'text-slate-400'}`} />
          <div>
            <h3 className="font-bold text-lg">Praktik Baik</h3>
            <p className="text-sm opacity-70">Butuh persetujuan admin.</p>
          </div>
        </button>
      </div>

      {success && (
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center text-emerald-700">
          <CheckCircle className="w-5 h-5 mr-3" />
          Konten berhasil diunggah! {(activeForm === 'news' || activeForm === 'documentation') && 'Menunggu persetujuan admin.'}
        </div>
      )}

      {activeForm === 'news' && (
        <form onSubmit={handleSubmitNews} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Unggah Berita Baru</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Judul Berita</label>
              <input
                type="text"
                required
                value={newsForm.title}
                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">URL Gambar (Wajib Google Drive)</label>
              <input
                type="text"
                required
                value={newsForm.imageUrl}
                onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="https://drive.google.com/..."
              />
              <p className="text-xs text-slate-500">Wajib menggunakan link dari Google Drive.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Konten / Narasi</label>
              <textarea
                required
                rows={6}
                value={newsForm.content}
                onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              ></textarea>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Mengirim...' : 'Kirim untuk Persetujuan'}
          </button>
        </form>
      )}

      {activeForm === 'event' && (
        <form onSubmit={handleSubmitEvent} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Unggah Acara Baru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Judul Acara</label>
              <input
                type="text"
                required
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tanggal & Waktu</label>
              <input
                type="datetime-local"
                required
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Lokasi / Link</label>
              <input
                type="text"
                required
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Deskripsi Singkat</label>
              <textarea
                required
                rows={3}
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              ></textarea>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Mengirim...' : 'Publikasikan Sekarang'}
          </button>
        </form>
      )}

      {activeForm === 'material' && (
        <form onSubmit={handleSubmitMaterial} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Unggah Perangkat Pembelajaran Baru</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Judul Perangkat</label>
              <input
                type="text"
                required
                value={materialForm.title}
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">URL File (Wajib Google Drive)</label>
              <input
                type="text"
                required
                value={materialForm.fileUrl}
                onChange={(e) => setMaterialForm({ ...materialForm, fileUrl: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="https://drive.google.com/..."
              />
              <p className="text-xs text-slate-500">Wajib menggunakan link dari Google Drive.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Deskripsi</label>
              <textarea
                rows={3}
                value={materialForm.description}
                onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              ></textarea>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Mengirim...' : 'Publikasikan Sekarang'}
          </button>
        </form>
      )}

      {activeForm === 'documentation' && (
        <form onSubmit={handleSubmitDocumentation} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Unggah Dokumentasi Baru</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Judul Kegiatan</label>
              <input
                type="text"
                required
                value={docForm.title}
                onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">URL Foto (Wajib Google Drive - Pisahkan dengan koma atau baris baru)</label>
              <textarea
                required
                rows={3}
                value={docForm.imageUrls}
                onChange={(e) => setDocForm({ ...docForm, imageUrls: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="https://drive.google.com/file/d/..."
              />
              <p className="text-xs text-slate-500">Wajib menggunakan link dari Google Drive.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Deskripsi Kegiatan</label>
              <textarea
                required
                rows={4}
                value={docForm.description}
                onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              ></textarea>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Mengirim...' : 'Kirim untuk Persetujuan'}
          </button>
        </form>
      )}

      {activeForm === 'bestPractice' && (
        <form onSubmit={handleSubmitBestPractice} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Bagikan Praktik Baik</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Judul Inovasi / Strategi</label>
                <input
                  type="text"
                  required
                  value={bpForm.title}
                  onChange={(e) => setBpForm({ ...bpForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Contoh: Metode Roleplay dalam Pembelajaran Norma"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kategori</label>
                <select
                  required
                  value={bpForm.category}
                  onChange={(e) => setBpForm({ ...bpForm, category: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Metode Pembelajaran Kreatif">Metode Pembelajaran Kreatif</option>
                  <option value="Media Ajar Inovatif">Media Ajar Inovatif</option>
                  <option value="Administrasi & Modul">Administrasi & Modul</option>
                  <option value="Video Praktik Baik">Video Praktik Baik</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Jenis File</label>
                <select
                  required
                  value={bpForm.fileType}
                  onChange={(e) => setBpForm({ ...bpForm, fileType: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="PDF">PDF</option>
                  <option value="DOCX">DOCX</option>
                  <option value="PPT">PPT</option>
                  <option value="Folder">Folder</option>
                  <option value="Video">Video</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">URL Referensi (Wajib Google Drive)</label>
                <input
                  type="text"
                  required
                  value={bpForm.driveUrl}
                  onChange={(e) => setBpForm({ ...bpForm, driveUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">URL Foto Sampul (Wajib Google Drive)</label>
                <input
                  type="text"
                  required
                  value={bpForm.imageUrl}
                  onChange={(e) => setBpForm({ ...bpForm, imageUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="https://drive.google.com/..."
                />
                <p className="text-[10px] text-slate-400">Wajib menggunakan link dari Google Drive.</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Deskripsi Singkat</label>
              <textarea
                required
                rows={4}
                value={bpForm.description}
                onChange={(e) => setBpForm({ ...bpForm, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Jelaskan secara singkat strategi atau inovasi yang Anda bagikan..."
              ></textarea>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Mengirim...' : 'Kirim untuk Persetujuan'}
          </button>
        </form>
      )}

      {/* My Content Section */}
      <div className="space-y-8 pt-12 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Konten Saya</h2>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
            Total: {myPractices.length + myMaterials.length + myNews.length + myEvents.length + myDocs.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Best Practices */}
          {myPractices.map(bp => (
            <div key={bp.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{bp.title}</h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bp.isApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {bp.isApproved ? 'Disetujui' : 'Menunggu'}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(bp.createdAt)}</span>
                    <div className="flex items-center text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400 mr-1" />
                      <span className="text-[10px] font-bold">{(bp.rating || 0).toFixed(1)} ({bp.ratingCount || 0})</span>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete('best_practices', bp.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          {/* Materials */}
          {myMaterials.map(mat => (
            <div key={mat.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{mat.title}</h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mat.isApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {mat.isApproved ? 'Disetujui' : 'Menunggu'}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(mat.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete('materials', mat.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          {/* News */}
          {myNews.map(news => (
            <div key={news.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{news.title}</h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${news.isApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {news.isApproved ? 'Disetujui' : 'Menunggu'}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(news.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete('news', news.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          {/* Events */}
          {myEvents.map(event => (
            <div key={event.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{event.title}</h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${event.isApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {event.isApproved ? 'Disetujui' : 'Menunggu'}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(event.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete('events', event.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          {/* Documentation */}
          {myDocs.map(doc => (
            <div key={doc.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-pink-50 text-pink-600 rounded-xl">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{doc.title}</h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.isApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {doc.isApproved ? 'Disetujui' : 'Menunggu'}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(doc.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete('documentation', doc.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          {myPractices.length + myMaterials.length + myNews.length + myEvents.length + myDocs.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm italic">Anda belum memiliki konten yang diunggah.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default TeacherDashboard;
