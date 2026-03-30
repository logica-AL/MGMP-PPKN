import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import { auth, OperationType, FirestoreErrorInfo, handleFirestoreError } from './firebase';

export { OperationType, handleFirestoreError };
export type { FirestoreErrorInfo };

export function getDirectImageUrl(url: string): string {
  if (!url) return '';
  
  // Handle Google Drive links
  // Pattern: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // Pattern: https://drive.google.com/open?id=FILE_ID
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  
  return url;
}

export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv', '.wmv'];
  const lowerUrl = url.toLowerCase();
  
  // 1. Check for youtube (including shorts) - Always video
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return true;
  
  // 2. Check for other video platforms - Always video
  if (lowerUrl.includes('vimeo.com') || lowerUrl.includes('dailymotion.com')) return true;

  // 3. Check common video extensions
  if (videoExtensions.some(ext => lowerUrl.includes(ext))) return true;
  
  // 4. Google Drive detection
  if (lowerUrl.includes('drive.google.com') || lowerUrl.includes('docs.google.com')) {
    // Check for common video keywords in the URL or if it's explicitly a video file
    if (lowerUrl.includes('video') || lowerUrl.includes('mp4') || lowerUrl.includes('mov')) return true;
    return false;
  }

  return false;
}

export function getEmbedVideoUrl(url: string): string | null {
  if (!url) return null;

  // Handle YouTube (including shorts)
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/;
  const ytMatch = url.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=0`;
  }

  // Handle Google Drive
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const driveMatch = url.match(driveRegex);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  // Handle Vimeo
  const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  return url;
}

export function getVideoThumbnail(url: string): string | null {
  if (!url) return null;

  // Handle YouTube (including shorts)
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/;
  const ytMatch = url.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }

  // Handle Google Drive
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const driveMatch = url.match(driveRegex);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w800`;
  }

  return null;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | Timestamp) {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, 'dd MMMM yyyy', { locale: id });
}

export function formatDateTime(date: Date | Timestamp) {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, 'dd MMMM yyyy, HH:mm', { locale: id });
}
