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
  schoolName?: string;
  faculty?: string;
  department?: string;
  regNumber?: string;
  phoneNumber?: string;
  country?: string;
  state?: string;
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

export interface DonationSettings {
  enabled: boolean;
  title: string;
  description: string;
  suggestedAmounts: number[];
}

export interface PaymentKeys {
  paystackPublicKey: string;
  paystackSecretKey: string;
  opayPublicKey?: string;
  opaySecretKey?: string;
  activeGateway: 'paystack' | 'opay';
  paymentSystemsEnabled: boolean;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'journal' | 'article' | 'publication' | 'blog' | 'project';
  title: string;
  dateAdded: string;
}

export interface CMSBlock {
  id: string;
  type: 'hero' | 'text' | 'features';
  heading?: string;
  subheading?: string;
  content?: string;
  image?: string;
  order: number;
}

export interface CMSPage {
  slug: string;
  title: string;
  blocks: CMSBlock[];
  profileImage?: string;
  heroInstitution?: string;
  heroTitle?: string;
  heroSubheading?: string;
  heroDescription?: string;
  metaTags?: {
    description?: string;
    keywords?: string;
  };
}

export interface AdminSimCredentials {
  email: string;
  passwordHash: string;
}

export interface LiveChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatConfig {
  welcomeMessage: string;
  suggestions: string[];
  assistantName: string;
  chatbotEnabled: boolean;
}

export interface HomepageAd {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  description: string;
  isActive: boolean;
  dateCreated: string;
}


