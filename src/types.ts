export interface Publication {
  id: string;
  title: string;
  authors: string;
  type: 'book' | 'journal' | 'article' | 'conference';
  publisher: string;
  year: number;
  link?: string;
  description?: string;
  dateAdded: string;
  isPaid?: boolean;
  price?: number; // In NGN
  downloadUrl?: string; // Content viewable/downloadable after purchase
  likesCount?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  likedPublications?: string[]; // Array of pub IDs
  purchasedPublications?: string[]; // Array of purchased pub IDs
  createdAt: string;
  isAdmin?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'purchase' | 'donation';
  amount: number;
  publicationId?: string; // present if type === 'purchase'
  publicationTitle?: string; // present if type === 'purchase'
  message?: string; // present if type === 'donation'
  status: 'pending' | 'success' | 'failed';
  reference: string;
  date: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  publicationId: string;
  publicationTitle: string;
  text: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  category: string;
  imageUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  status: 'ongoing' | 'completed';
  role: string;
  description: string;
  funding?: string;
  timeline: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string;
  date: string;
  category?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}
