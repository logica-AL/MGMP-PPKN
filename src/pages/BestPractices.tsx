import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp, limit, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { BestPractice, BestPracticeMessage, BestPracticeCategory, BestPracticeComment } from '../types';
import { formatDate, handleFirestoreError, OperationType } from '../utils';
import { Send, MessageSquare, ExternalLink, User, Clock, AlertCircle, FileText, Folder, Video, FileCode, FileQuestion, Copy, ChevronDown, ChevronUp, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES: BestPracticeCategory[] = [
  'Metode Pembelajaran Kreatif',
  'Media Ajar Inovatif',
  'Administrasi & Modul',
  'Video Praktik Baik'
];

const BestPractices: React.FC = () => {
  const { user, profile } = useAuth();
  const [practices, setPractices] = useState<BestPractice[]>([]);
  const [messages, setMessages] = useState<BestPracticeMessage[]>([]);
  const [comments, setComments] = useState<Record<string, BestPracticeComment[]>>({});
  const [activeCategory, setActiveCategory] = useState<BestPracticeCategory | 'Semua'>('Semua');
  const [newMessage, setNewMessage] = useState('');
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const ratingsPath = 'best_practice_ratings';
      const qRatings = query(collection(db, ratingsPath), where('userId', '==', user.uid));
      const unsubscribeRatings = onSnapshot(qRatings, (snapshot) => {
        const ratings: Record<string, number> = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          ratings[data.bestPracticeId] = data.rating;
        });
        setUserRatings(ratings);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, ratingsPath);
      });
      return () => unsubscribeRatings();
    }
  }, [user]);

  useEffect(() => {
    // Fetch Best Practices
    const practicesPath = 'best_practices';
    const qPractices = query(
      collection(db, practicesPath),
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribePractices = onSnapshot(qPractices, (snapshot) => {
      setPractices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BestPractice)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, practicesPath);
    });

    // Fetch Chat Messages
    const messagesPath = 'best_practice_messages';
    const qMessages = query(
      collection(db, messagesPath),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BestPracticeMessage)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, messagesPath);
    });

    // Fetch Comments
    const commentsPath = 'best_practice_comments';
    const qComments = query(
      collection(db, commentsPath),
      orderBy('createdAt', 'asc')
    );

    const unsubscribeComments = onSnapshot(qComments, (snapshot) => {
      const commentsData: Record<string, BestPracticeComment[]> = {};
      snapshot.docs.forEach(doc => {
        const comment = { id: doc.id, ...doc.data() } as BestPracticeComment;
        if (!commentsData[comment.bestPracticeId]) {
          commentsData[comment.bestPracticeId] = [];
        }
        commentsData[comment.bestPracticeId].push(comment);
      });
      setComments(commentsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, commentsPath);
    });

    return () => {
      unsubscribePractices();
      unsubscribeMessages();
      unsubscribeComments();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'best_practice_messages'), {
        userId: user.uid,
        userName: profile.name,
        message: newMessage.trim(),
        createdAt: Timestamp.now()
      });
      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'best_practice_messages');
      toast.error('Gagal mengirim pesan');
    }
  };

  const handleSendComment = async (practiceId: string) => {
    const content = newComments[practiceId];
    if (!user || !profile || !content?.trim()) return;

    try {
      await addDoc(collection(db, 'best_practice_comments'), {
        bestPracticeId: practiceId,
        userId: user.uid,
        userName: profile.name,
        content: content.trim(),
        createdAt: Timestamp.now()
      });
      setNewComments(prev => ({ ...prev, [practiceId]: '' }));
      toast.success('Komentar terkirim');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'best_practice_comments');
      toast.error('Gagal mengirim komentar');
    }
  };

  const handleRate = async (practiceId: string, rating: number) => {
    if (!user) {
      toast.error('Silakan masuk untuk memberikan rating');
      return;
    }

    if (userRatings[practiceId]) {
      toast.error('Anda sudah memberikan rating untuk materi ini');
      return;
    }

    try {
      const practiceRef = doc(db, 'best_practices', practiceId);
      const practiceDoc = await getDoc(practiceRef);
      
      if (!practiceDoc.exists()) return;

      const data = practiceDoc.data() as BestPractice;
      
      const currentRating = data.rating || 0;
      const currentCount = data.ratingCount || 0;
      
      const newCount = currentCount + 1;
      const newRating = ((currentRating * currentCount) + rating) / newCount;

      await updateDoc(practiceRef, {
        rating: newRating,
        ratingCount: newCount
      });

      await addDoc(collection(db, 'best_practice_ratings'), {
        bestPracticeId: practiceId,
        userId: user.uid,
        rating: rating,
        createdAt: Timestamp.now()
      });

      toast.success('Rating berhasil disimpan');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'best_practice_ratings');
      toast.error('Gagal memberikan rating');
    }
  };

  const StarRating: React.FC<{ practiceId: string, authorId: string, currentRating?: number, ratingCount?: number }> = ({ practiceId, authorId, currentRating = 0, ratingCount = 0 }) => {
    const userRating = userRatings[practiceId];

    return (
      <div className="flex flex-col space-y-1">
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(practiceId, star)}
              disabled={!!userRating}
              className={`transition-colors ${
                star <= (userRating || Math.round(currentRating))
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300 hover:text-amber-200'
              } ${userRating ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <Star className="w-4 h-4" />
            </button>
          ))}
          <span className="text-[10px] font-bold text-slate-400 ml-1">
            {currentRating.toFixed(1)} ({ratingCount})
          </span>
        </div>
      </div>
    );
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-8 h-8 text-red-500" />;
      case 'DOCX': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'PPT': return <FileText className="w-8 h-8 text-orange-500" />;
      case 'Folder': return <Folder className="w-8 h-8 text-yellow-500" />;
      case 'Video': return <Video className="w-8 h-8 text-purple-500" />;
      default: return <FileCode className="w-8 h-8 text-slate-400" />;
    }
  };

  const getCopyUrl = (url: string) => {
    if (url.includes('/view')) {
      return url.replace('/view', '/copy');
    }
    if (url.includes('/edit')) {
      return url.replace('/edit', '/copy');
    }
    return url;
  };

  const getDirectImageUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
  };

  const filteredPractices = activeCategory === 'Semua' 
    ? practices 
    : practices.filter(p => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-12">
        {/* Header - Proportional & Modern */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold text-slate-900 tracking-tight"
          >
            Praktik Baik
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 leading-relaxed"
          >
            Wadah kolaborasi untuk berbagi strategi dan inovasi pembelajaran yang berdampak positif. 
            Temukan referensi mengajar yang seru, replikasi keberhasilannya, dan mari berdiskusi untuk kemajuan pendidikan bersama.
          </motion.p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setActiveCategory('Semua')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === 'Semua' 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Best Practices List */}
          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
                ))}
              </div>
            ) : filteredPractices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPractices.map((practice) => (
                  <motion.div 
                    layout
                    key={practice.id} 
                    id={`practice-${practice.id}`}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all flex flex-col"
                  >
                    {practice.imageUrl && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <img 
                          src={getDirectImageUrl(practice.imageUrl) || ''} 
                          alt={practice.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                            {practice.category}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        {!practice.imageUrl && (
                          <div className="p-3 bg-slate-50 rounded-2xl">
                            {getFileIcon(practice.fileType)}
                          </div>
                        )}
                        {!practice.imageUrl && (
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full">
                            {practice.category}
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 line-clamp-2">{practice.title}</h3>
                        <div className="flex flex-wrap items-center justify-between mt-1 gap-2">
                          <p className="text-slate-500 text-xs flex items-center">
                            <User className="w-3 h-3 mr-1" /> {practice.authorName} • <Clock className="w-3 h-3 mx-1" /> {formatDate(practice.createdAt)}
                          </p>
                          <StarRating 
                            practiceId={practice.id} 
                            authorId={practice.authorId}
                            currentRating={practice.rating} 
                            ratingCount={practice.ratingCount} 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className={`text-slate-600 text-sm leading-relaxed ${!expandedDescriptions[practice.id] ? 'line-clamp-3' : ''}`}>
                          {practice.description}
                        </p>
                        {practice.description && practice.description.length > 150 && (
                          <button 
                            onClick={() => setExpandedDescriptions(prev => ({ ...prev, [practice.id]: !prev[practice.id] }))}
                            className="text-blue-600 text-xs font-bold hover:underline flex items-center"
                          >
                            {expandedDescriptions[practice.id] ? (
                              <>Sembunyikan <ChevronUp className="w-3 h-3 ml-1" /></>
                            ) : (
                              <>Selengkapnya <ChevronDown className="w-3 h-3 ml-1" /></>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <a 
                          href={practice.driveUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 mr-2" /> Buka di Drive
                        </a>
                        <a 
                          href={getCopyUrl(practice.driveUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-4 py-2 bg-white text-slate-900 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <Copy className="w-3 h-3 mr-2" /> Buat Salinan
                        </a>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-slate-50/50 border-t border-slate-100">
                      <button 
                        onClick={() => setExpandedComments(prev => ({ ...prev, [practice.id]: !prev[practice.id] }))}
                        className="w-full px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        <span className="flex items-center">
                          <MessageSquare className="w-3 h-3 mr-2" />
                          {comments[practice.id]?.length || 0} Diskusi
                        </span>
                        {expandedComments[practice.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <AnimatePresence>
                        {expandedComments[practice.id] && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 space-y-4">
                              <div className="max-h-40 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                                {comments[practice.id]?.map(comment => (
                                  <div key={comment.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-[10px] font-bold text-slate-900">{comment.userName}</span>
                                      <span className="text-[10px] text-slate-400">{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">{comment.content}</p>
                                  </div>
                                ))}
                                {(!comments[practice.id] || comments[practice.id].length === 0) && (
                                  <p className="text-center text-[10px] text-slate-400 py-4 italic">Belum ada diskusi untuk materi ini.</p>
                                )}
                              </div>

                              {user ? (
                                <div className="flex space-x-2">
                                  <input 
                                    type="text"
                                    value={newComments[practice.id] || ''}
                                    onChange={(e) => setNewComments(prev => ({ ...prev, [practice.id]: e.target.value }))}
                                    placeholder="Tulis diskusi..."
                                    className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                                  />
                                  <button 
                                    onClick={() => handleSendComment(practice.id)}
                                    disabled={!newComments[practice.id]?.trim()}
                                    className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                  >
                                    <Send className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <p className="text-[10px] text-center text-slate-400">Masuk untuk ikut berdiskusi.</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl p-20 text-center">
                <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Materi</h3>
                <p className="text-slate-500">Belum ada praktik baik di kategori ini.</p>
              </div>
            )}
          </div>

          {/* Diskusi Populer Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden sticky top-8">
              <div className="p-5 border-b border-amber-100 bg-amber-50/50">
                <h2 className="font-black text-slate-900 uppercase tracking-wider text-sm">Diskusi Populer</h2>
              </div>

              <div className="p-5 space-y-6">
                {practices
                  .filter(p => comments[p.id]?.length > 0)
                  .sort((a, b) => (comments[b.id]?.length || 0) - (comments[a.id]?.length || 0))
                  .slice(0, 5)
                  .map((practice) => {
                    const practiceComments = comments[practice.id] || [];
                    const lastComment = practiceComments[practiceComments.length - 1];
                    const participants = Array.from(new Set(practiceComments.map(c => c.userName))).slice(0, 4);

                    return (
                      <div key={practice.id} className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          <button 
                            onClick={() => {
                              setActiveCategory('Semua');
                              setExpandedComments(prev => ({ ...prev, [practice.id]: true }));
                              // Scroll to the practice card
                              document.getElementById(`practice-${practice.id}`)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-sm font-bold text-slate-900 text-left hover:text-blue-600 transition-colors leading-tight"
                          >
                            {practice.title}
                          </button>
                        </div>

                        <div className="pl-5 space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="flex -space-x-2">
                              {participants.map((name, i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600">
                                  {String(name).charAt(0)}
                                </div>
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">Recents topics</span>
                          </div>

                          {lastComment && (
                            <div className="relative pl-4 border-l-2 border-slate-100 space-y-2">
                              <div className="flex items-start space-x-2">
                                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                  {String(lastComment.userName).charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                                    "{lastComment.content}"
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-[10px]">
                                <span className="text-slate-400">Recent replied</span>
                                <div className="flex items-center space-x-1">
                                  <div className="w-4 h-4 rounded-full bg-slate-200" />
                                  <span className="font-bold text-slate-700">{lastComment.userName}</span>
                                  <span className="text-slate-400">{formatDate(lastComment.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                
                {practices.filter(p => comments[p.id]?.length > 0).length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-8 italic">Belum ada diskusi populer.</p>
                )}
              </div>
            </div>

            {/* Chat Section - Global (Moved below Popular Discussions) */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-[400px] flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-slate-600" />
                  <h2 className="font-bold text-slate-900 text-xs">Diskusi Publik</h2>
                </div>
                <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[8px] font-bold rounded-full uppercase">Live</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 scrollbar-thin">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.userId === user?.uid ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center space-x-2 mb-0.5">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{msg.userName}</span>
                    </div>
                    <div className={`max-w-[90%] p-2 rounded-xl text-[11px] leading-relaxed ${
                      msg.userId === user?.uid 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-slate-100 bg-white">
                {user ? (
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Pesan..."
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </form>
                ) : (
                  <p className="text-[10px] text-center text-slate-400">Masuk untuk chat.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestPractices;
