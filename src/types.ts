import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'teacher';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  school?: string;
  photoUrl?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  isApproved: boolean;
}

export interface TeacherEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  date: Timestamp;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  isApproved: boolean;
}

export interface EducationalMaterial {
  id: string;
  title: string;
  fileUrl: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  isApproved: boolean;
}

export interface SiteSettings {
  id: string;
  vision: string;
  mission: string[];
  heroBackground: string;
  history?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  position: string;
  imageUrl: string;
  order: number;
}

export interface Documentation {
  id: string;
  title: string;
  description: string;
  imageUrls: string[];
  type?: 'photo' | 'video';
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  isApproved: boolean;
}

export type BestPracticeCategory = 'Metode Pembelajaran Kreatif' | 'Media Ajar Inovatif' | 'Administrasi & Modul' | 'Video Praktik Baik';
export type BestPracticeFileType = 'PDF' | 'DOCX' | 'PPT' | 'Folder' | 'Video' | 'Lainnya';

export interface BestPractice {
  id: string;
  title: string;
  description: string;
  driveUrl: string;
  imageUrl?: string;
  category: BestPracticeCategory;
  fileType: BestPracticeFileType;
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string;
  createdAt: Timestamp;
  isApproved: boolean;
  rating?: number;
  ratingCount?: number;
}

export interface BestPracticeRating {
  id: string;
  bestPracticeId: string;
  userId: string;
  rating: number;
  createdAt: Timestamp;
}

export interface BestPracticeComment {
  id: string;
  bestPracticeId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Timestamp;
}

export interface BestPracticeMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: Timestamp;
}
