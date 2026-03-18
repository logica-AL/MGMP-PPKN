import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'teacher';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  school?: string;
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
  imageUrl: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  isApproved: boolean;
}
