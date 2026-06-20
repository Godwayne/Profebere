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
