import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { 
  Lock, Key, LogOut, BookOpen, Layers, Rss, Camera, Mail, BarChart2, Plus, Edit2, Trash2, 
  Check, X, Eye, FileText, CheckCircle, Tag, Calendar, ShieldAlert, CreditCard, 
  MessageSquare, Sparkles, AlertCircle, Heart, ArrowRight, ShieldCheck, Download, Send
} from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { Publication, BlogPost, Project, GalleryImage, ContactMessage, Transaction, Comment } from '../types';
import { 
  addPublication, updatePublication, deletePublication,
  addProject, updateProject, deleteProject,
  addBlogPost, updateBlogPost, deleteBlogPost,
  addGalleryImage, deleteGalleryImage,
  fetchMessages, updateMessageReadStatus, deleteMessage,
  fetchAllTransactions, fetchAllComments, updateCommentStatus, deleteComment,
  fetchDonationSettings, updateDonationSettings,
  fetchPaymentKeys, updatePaymentKeys,
  fetchCMSPage, saveCMSPage,
  fetchAdminCredentials, updateAdminCredentials,
  fetchChatConfig, saveChatConfig, fetchChatMessages, subscribeToChatMessages, logChatMessage
} from '../services/db';

import { DonationSettings, PaymentKeys, CMSPage, CMSBlock, AdminSimCredentials, LiveChatMessage, ChatConfig } from '../types';

interface AdminDashboardProps {
  publications: Publication[];
  projects: Project[];
  blogPosts: BlogPost[];
  galleryImages: GalleryImage[];
  onRefreshData: () => void;
}

export default function AdminDashboard({ 
  publications, 
  projects, 
  blogPosts, 
  galleryImages,
  onRefreshData 
}: AdminDashboardProps) {

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLocalSim, setIsAdminLocalSim] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Messages Inbox
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // E-commerce & Comments Moderating
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [moderationLoading, setModerationLoading] = useState(false);

  // Dynamic configuration, payment gates, and CMS state variables
  const [donationSettings, setDonationSettings] = useState<DonationSettings | null>(null);
  const [paymentKeys, setPaymentKeys] = useState<PaymentKeys | null>(null);
  const [cmsPage, setCmsPage] = useState<CMSPage | null>(null);
  const [selectedCmsSlug, setSelectedCmsSlug] = useState<string>('home');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Customizable Admin Simulation credentials state
  const [adminCreds, setAdminCreds] = useState<AdminSimCredentials>({ email: 'admin@okorie.edu.ng', passwordHash: 'Password123' });
  const [adminCredsForm, setAdminCredsForm] = useState({ email: '', password: '' });
  const [showCreds, setShowCreds] = useState(false);
  const [showSecretFormPassword, setShowSecretFormPassword] = useState(false);

  // Active Admin Tabs
  // 'analytics' | 'publications' | 'projects' | 'blog' | 'gallery' | 'messages' | 'transactions' | 'comments'
  const [activeTab, setActiveTab] = useState<string>('analytics');

  // Live Chat Management State
  const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [adminReplyText, setAdminReplyText] = useState<string>('');
  const [chatLoading, setChatLoading] = useState(false);

  const adminChatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adminChatBottomRef.current) {
      adminChatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, selectedSessionId, activeTab]);

  // Modals Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'pub' | 'proj' | 'blog' | 'gal' | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);

  // Forms Fields State
  const [pubForm, setPubForm] = useState({
    title: '', authors: '', type: 'journal' as any, publisher: '', year: new Date().getFullYear(), 
    link: '', description: '', isPaid: false, price: 5000, downloadUrl: ''
  });
  const [projForm, setProjForm] = useState({
    title: '', status: 'ongoing' as any, role: 'Principal Investigator', description: '', funding: '', timeline: ''
  });
  const [blogForm, setBlogForm] = useState({
    title: '', content: '', excerpt: '', category: 'Announcements', imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600'
  });
  const [galForm, setGalForm] = useState({
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600', caption: '', category: 'Lectures'
  });

  // Load and synchronize Admin Credentials
  const syncAdminCredentials = async () => {
    try {
      const creds = await fetchAdminCredentials();
      if (creds) {
        setAdminCreds(creds);
        setAdminCredsForm({ email: creds.email, password: creds.passwordHash });
      }
    } catch (err) {
      console.warn("Failed retrieving customizable admin credentials:", err);
    }
  };

  // Observe Auth Sign-ins
  useEffect(() => {
    // Check if double-path local simulation session exists
    const simSession = sessionStorage.getItem('okorie_admin_sim');
    if (simSession === 'true') {
      setIsLoggedIn(true);
      setIsAdminLocalSim(true);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setIsAdminLocalSim(false);
      }
    });

    syncAdminCredentials();

    return () => unsubscribe();
  }, []);

  // Fetch Message Inbox & E-commerce metrics
  useEffect(() => {
    if (isLoggedIn) {
      loadMessages();
      loadEcomAndFeedbackData();
      loadDonationSettings();
      loadPaymentKeys();
      loadCmsPage(selectedCmsSlug);
      loadChatConfigAndMessages();
    }
  }, [isLoggedIn, selectedCmsSlug]);

  // Real-time live chat messages subscription hook
  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubscribe = subscribeToChatMessages((msgs) => {
      setChatMessages(msgs);
      
      // Auto-select the first active session if none is selected
      setSelectedSessionId((currentId) => {
        if (currentId) return currentId;
        if (msgs.length > 0) {
          const sessionLatestMsgMap = new Map<string, string>();
          msgs.forEach((m) => {
            const existing = sessionLatestMsgMap.get(m.sessionId);
            if (!existing || m.timestamp > existing) {
              sessionLatestMsgMap.set(m.sessionId, m.timestamp);
            }
          });
          const sortedSessions = Array.from(sessionLatestMsgMap.entries())
            .sort((a, b) => b[1].localeCompare(a[1]));
          if (sortedSessions.length > 0) {
            return sortedSessions[0][0];
          }
        }
        return '';
      });
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  const loadChatConfigAndMessages = async () => {
    setChatLoading(true);
    try {
      const configData = await fetchChatConfig();
      setChatConfig(configData);
      
      const messagesData = await fetchChatMessages();
      setChatMessages(messagesData);
      
      if (messagesData.length > 0 && !selectedSessionId) {
        // Group by sessionId and sort sessions by the latest message timestamp
        const sessionLatestMsgMap = new Map<string, string>();
        messagesData.forEach(m => {
          const existing = sessionLatestMsgMap.get(m.sessionId);
          if (!existing || m.timestamp > existing) {
            sessionLatestMsgMap.set(m.sessionId, m.timestamp);
          }
        });
        const sortedSessions = Array.from(sessionLatestMsgMap.entries())
          .sort((a, b) => b[1].localeCompare(a[1]));
        if (sortedSessions.length > 0) {
          setSelectedSessionId(sortedSessions[0][0]);
        }
      }
    } catch (err) {
      console.error("Error loading Chat configuration or logs:", err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSaveChatConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatConfig) return;
    setChatLoading(false); // don't set global block loading, just run
    try {
      await saveChatConfig(chatConfig);
      setSaveSuccessMessage("Live Chat Portal settings saved securely!");
      setTimeout(() => setSaveSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedSessionId) return;

    const messageText = adminReplyText;
    setAdminReplyText(''); // clear input instantly for great responsiveness

    try {
      await logChatMessage({
        sessionId: selectedSessionId,
        role: 'assistant',
        content: messageText,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to post administrative chat reply:", err);
    }
  };

  const loadDonationSettings = async () => {
    try {
      const settings = await fetchDonationSettings();
      setDonationSettings(settings);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPaymentKeys = async () => {
    try {
      const keys = await fetchPaymentKeys();
      setPaymentKeys(keys);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCmsPage = async (slug: string) => {
    setSettingsLoading(true);
    try {
      let page = await fetchCMSPage(slug);
      if (!page) {
        const defaultBlocks: CMSBlock[] = [];
        if (slug === 'home') {
          defaultBlocks.push(
            { id: 'b1', type: 'hero', heading: 'Prof. Ebere Okorie', subheading: 'Department of Sociology & Anthropology', content: 'Professor of Criminology & Sociology. Welcome to the portal.', order: 1 },
            { id: 'b2', type: 'text', heading: 'Research Pillars', content: 'Pioneering investigations into grass-root family therapy, community surveillance programs, and Akwa Ibom frontiers.', order: 2 }
          );
        } else if (slug === 'about') {
          defaultBlocks.push(
            { id: 'b1', type: 'hero', heading: 'About Prof. Okorie', subheading: 'Educational Leadership Resume', content: 'Academic track records detailing more than 25 years of service, supervising postgraduates and crafting public security policies.', order: 1 },
            { id: 'b2', type: 'text', heading: 'Scholarly Background', content: 'Details on Departmental and Advisory appointments at UNIDEP, TetFund, and federal levels.', order: 2 }
          );
        } else {
          defaultBlocks.push(
            { id: 'b1', type: 'text', heading: `${slug.toUpperCase()} Header`, content: 'Configure custom section-blocks for this academic page', order: 1 }
          );
        }
        page = {
          slug,
          title: slug.charAt(0).toUpperCase() + slug.slice(1) + " Page Schema",
          blocks: defaultBlocks,
          metaTags: {
            description: `Professor Ebere Okorie Academic Portal – ${slug}`,
            keywords: `criminology, sociology, research, nigeria, ${slug}`
          }
        };
        await saveCMSPage(slug, page);
      }
      setCmsPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadMessages = async () => {
    setMessagesLoading(true);
    const msgs = await fetchMessages();
    setMessages(msgs);
    setMessagesLoading(false);
  };

  const loadEcomAndFeedbackData = async () => {
    setModerationLoading(true);
    try {
      const [allTxns, allComments] = await Promise.all([
        fetchAllTransactions(),
        fetchAllComments()
      ]);
      setTransactions(allTxns || []);
      setComments(allComments || []);
    } catch (err) {
      console.error("Error logging admin metadata:", err);
    } finally {
      setModerationLoading(false);
    }
  };

  const handleSaveDonationSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!donationSettings) return;
    setSettingsLoading(true);
    try {
      await updateDonationSettings(donationSettings);
      setSaveSuccessMessage("Donation settings saved successfully!");
      setTimeout(() => setSaveSuccessMessage(''), 4000);
    } catch (err: any) {
      alert("Error saving donation settings: " + err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSavePaymentKeys = async (e: FormEvent) => {
    e.preventDefault();
    if (!paymentKeys) return;
    setSettingsLoading(true);
    try {
      await updatePaymentKeys(paymentKeys);
      setSaveSuccessMessage("Payment settings stored securely in FireStore.");
      setTimeout(() => setSaveSuccessMessage(''), 4000);
    } catch (err: any) {
      alert("Error saving payment credentials: " + err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveAdminCreds = async (e: FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      const updatedCreds = {
        email: adminCredsForm.email,
        passwordHash: adminCredsForm.password
      };
      await updateAdminCredentials(updatedCreds);
      setAdminCreds(updatedCreds);
      setSaveSuccessMessage("Administrative custom credentials updated successfully in FireStore.");
      setTimeout(() => setSaveSuccessMessage(''), 4000);
    } catch (err: any) {
      alert("Error saving administrative credentials: " + err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveCmsPage = async () => {
    if (!cmsPage) return;
    setSettingsLoading(true);
    try {
      await saveCMSPage(selectedCmsSlug, cmsPage);
      setSaveSuccessMessage(`${selectedCmsSlug.toUpperCase()} page sections locked & published live.`);
      setTimeout(() => setSaveSuccessMessage(''), 4000);
    } catch (err: any) {
      alert("Error publishing CMS layout: " + err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleAddCmsBlock = () => {
    if (!cmsPage) return;
    const newBlock: CMSBlock = {
      id: "b_" + Date.now(),
      type: "text",
      heading: "New Section Title",
      subheading: "",
      content: "Enter your custom academic content or research summary here.",
      order: cmsPage.blocks.length + 1
    };
    setCmsPage({
      ...cmsPage,
      blocks: [...cmsPage.blocks, newBlock]
    });
  };

  const handleUpdateCmsBlock = (blockId: string, updatedFields: Partial<CMSBlock>) => {
    if (!cmsPage) return;
    const updatedBlocks = cmsPage.blocks.map(b => b.id === blockId ? { ...b, ...updatedFields } : b);
    setCmsPage({ ...cmsPage, blocks: updatedBlocks });
  };

  const handleDeleteCmsBlock = (blockId: string) => {
    if (!cmsPage) return;
    const filteredBlocks = cmsPage.blocks.filter(b => b.id !== blockId);
    setCmsPage({ ...cmsPage, blocks: filteredBlocks });
  };

  // Login handler
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (email === adminCreds.email && password === adminCreds.passwordHash) {
      // Local Master Simulation override
      sessionStorage.setItem('okorie_admin_sim', 'true');
      setIsLoggedIn(true);
      setIsAdminLocalSim(true);
      setAuthLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoggedIn(true);
      setIsAdminLocalSim(false);
    } catch (err: any) {
      console.warn("Firebase Auth login failed, checking alternative sim credential:", err.message);
      setAuthError('Authentication failed. Use the quick testing credentials provided above.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    sessionStorage.removeItem('okorie_admin_sim');
    setIsAdminLocalSim(false);
    setIsLoggedIn(false);
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  // MESSAGE HANDLERS
  const handleToggleRead = async (id: string, currentRead: boolean) => {
    await updateMessageReadStatus(id, !currentRead);
    loadMessages();
  };

  const handleDeleteMsg = async (id: string) => {
    if (window.confirm("Delete this incoming message permanently?")) {
      await deleteMessage(id);
      loadMessages();
    }
  };

  // COMMENT MODERATION HANDLERS
  const handleCommentStatusModify = async (id: string, nextStatus: 'approved' | 'rejected') => {
    await updateCommentStatus(id, nextStatus);
    loadEcomAndFeedbackData();
  };

  const handleCommentDelete = async (id: string) => {
    if (window.confirm("Permanently erase student comment?")) {
      await deleteComment(id);
      loadEcomAndFeedbackData();
    }
  };

  // ==========================================
  // MODAL CREATION/MANAGEMENT
  // ==========================================
  const openAddModal = (type: 'pub' | 'proj' | 'blog' | 'gal') => {
    setModalType(type);
    setEditItem(null);
    setIsModalOpen(true);
    
    // Reset inputs
    setPubForm({ 
      title: '', authors: 'Prof. Ebere Okorie', type: 'journal', publisher: '', 
      year: new Date().getFullYear(), link: '', description: '', isPaid: false, price: 5000, downloadUrl: '' 
    });
    setProjForm({ title: '', status: 'ongoing', role: 'Principal Investigator', description: '', funding: '', timeline: '2026 - Present' });
    setBlogForm({ title: '', content: '', excerpt: '', category: 'Announcements', imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600' });
    setGalForm({ imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600', caption: '', category: 'Lectures' });
  };

  const openEditModal = (type: 'pub' | 'proj' | 'blog', item: any) => {
    setModalType(type);
    setEditItem(item);
    setIsModalOpen(true);

    if (type === 'pub') {
      setPubForm({
        title: item.title,
        authors: item.authors,
        type: item.type,
        publisher: item.publisher,
        year: item.year,
        link: item.link || '',
        description: item.description || '',
        isPaid: item.isPaid || false,
        price: item.price || 5000,
        downloadUrl: item.downloadUrl || ''
      });
    } else if (type === 'proj') {
      setProjForm({
        title: item.title,
        status: item.status,
        role: item.role,
        description: item.description,
        funding: item.funding || '',
        timeline: item.timeline
      });
    } else if (type === 'blog') {
      setBlogForm({
        title: item.title,
        content: item.content,
        excerpt: item.excerpt,
        category: item.category,
        imageUrl: item.imageUrl || ''
      });
    }
  };

  const handleSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'pub') {
        if (editItem) {
          await updatePublication({ 
            id: editItem.id, 
            ...pubForm, 
            dateAdded: editItem.dateAdded || new Date().toISOString(),
            likesCount: editItem.likesCount || 0
          });
        } else {
          await addPublication({ 
            ...pubForm, 
            dateAdded: new Date().toISOString(),
            likesCount: 0 
          });
        }
      } else if (modalType === 'proj') {
        if (editItem) {
          await updateProject({ id: editItem.id, ...projForm });
        } else {
          await addProject({ ...projForm });
        }
      } else if (modalType === 'blog') {
        if (editItem) {
          await updateBlogPost({ id: editItem.id, ...blogForm, date: editItem.date || new Date().toISOString().split('T')[0] });
        } else {
          await addBlogPost({ ...blogForm, date: new Date().toISOString().split('T')[0] });
        }
      } else if (modalType === 'gal') {
        await addGalleryImage({ ...galForm, date: new Date().toISOString().split('T')[0] });
      }

      setIsModalOpen(false);
      onRefreshData();
    } catch (err) {
      console.error("Form submit error", err);
    }
  };

  const handleDeleteItem = async (type: 'pub' | 'proj' | 'blog' | 'gal', id: string) => {
    if (window.confirm("Are you sure you want to delete this resource permanently?")) {
      try {
        if (type === 'pub') await deletePublication(id);
        else if (type === 'proj') await deleteProject(id);
        else if (type === 'blog') await deleteBlogPost(id);
        else if (type === 'gal') await deleteGalleryImage(id);
        
        onRefreshData();
      } catch (err) {
        console.error("Delete error", err);
      }
    }
  };

  // Consolidated Math Metrics
  const unreadMessagesCount = messages.filter(m => !m.read).length;
  const pendingCommentsCount = comments.filter(c => c.status === 'pending').length;
  
  // Sales Total revenues
  const successfulTxns = transactions.filter(t => t.status === 'success');
  const totalBookSales = successfulTxns
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDonations = successfulTxns
    .filter(t => t.type === 'donation')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalLikesAcrossWorks = publications.reduce((sum, p) => sum + (p.likesCount || 0), 0);

  // Login Barrier check
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12 px-6 text-left animate-fade-in space-y-8 select-none">
        
        <div className="bg-white border border-slate-150 rounded-3xl p-8 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-slate-900">Admin Authentication</h3>
            <p className="text-slate-500 text-xs px-2">Access scholarly controls to add or edit publications, blog posts, or gallery items</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="text-xs text-red-655 bg-red-50 border border-red-200 p-3 rounded-lg leading-relaxed">
                {authError}
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Email</label>
              <div className="relative">
                <input 
                  id="admin_email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter administrator email"
                  className="w-full pl-3 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Key Password</label>
              <div className="relative">
                <input 
                  id="admin_password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full pl-3 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>
            </div>

            <button 
              id="admin_login_submit"
              type="submit"
              disabled={authLoading}
              className="w-full inline-flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-lg transition shadow-md hover:shadow-lg cursor-pointer animate-pulse"
            >
              <span>Authenticate and Enter</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-12 gap-8 text-left animate-fade-in py-4 text-slate-800">
      
      {/* Sidebar Nav (3 Cols) */}
      <div className="md:col-span-3 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-serif font-bold text-slate-900 text-sm">Prof. Okorie</h4>
              <span className="text-[10px] uppercase font-mono font-bold text-amber-600">
                {isAdminLocalSim ? "Simulated Access" : "Database Server Connected"}
              </span>
            </div>
            <button 
              id="admin_logout_btn"
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
              title="Logout consoles"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>

          <nav className="flex flex-col space-y-1 font-sans text-xs sm:text-sm">
            {[
              { id: 'analytics', label: 'Consolidated Stats', icon: BarChart2 },
              { id: 'publications', label: 'Publications Library', icon: BookOpen, count: publications.length },
              { id: 'projects', label: 'Research Projects', icon: Layers, count: projects.length },
              { id: 'blog', label: 'News & Blog', icon: Rss, count: blogPosts.length },
              { id: 'gallery', label: 'Event Gallery', icon: Camera, count: galleryImages.length },
              { id: 'messages', label: 'Inquiries Inbox', icon: Mail, count: unreadMessagesCount, hasBadge: true },
              { id: 'transactions', label: 'Purchase Ledger', icon: CreditCard, count: successfulTxns.length },
              { id: 'comments', label: 'Comments Queue', icon: MessageSquare, count: pendingCommentsCount, hasBadge: true },
              { id: 'donationsSettings', label: 'Donation Settings', icon: Heart },
              { id: 'paymentGateway', label: 'Payment Gateway', icon: ShieldCheck },
              { id: 'adminCredentials', label: 'Admin Security', icon: Key },
              { id: 'pageCMS', label: 'CMS Page Builder', icon: Sparkles },
              { id: 'liveChat', label: 'Live Chat Center', icon: MessageSquare, count: Array.from(new Set(chatMessages.map(m => m.sessionId))).length },
            ].map(navItem => (
              <button
                key={navItem.id}
                onClick={() => setActiveTab(navItem.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors font-medium cursor-pointer ${
                  activeTab === navItem.id 
                    ? 'bg-amber-500 text-slate-950 font-bold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <navItem.icon className="h-4 w-4" />
                  <span>{navItem.label}</span>
                </div>
                {navItem.count !== undefined && navItem.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold ${
                    activeTab === navItem.id 
                      ? 'bg-white text-slate-950 border border-slate-900/10' 
                      : (navItem.hasBadge ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600')
                  }`}>
                    {navItem.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Console Area (9 Cols) */}
      <div className="md:col-span-9 space-y-6 bg-white border border-slate-150 p-6 md:p-8 rounded-2xl shadow-xs">
        
        {/* TAB: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">Governance & Analytics</h3>
                <p className="text-xs text-slate-500">Live indicators mapped directly to system registries.</p>
              </div>
              <button
                onClick={loadEcomAndFeedbackData}
                disabled={moderationLoading}
                className="cursor-pointer text-[10px] uppercase font-mono font-bold bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded text-navy"
              >
                {moderationLoading ? "Refreshing..." : "Re-sync ledger"}
              </button>
            </div>

            {/* Micro analytics grid cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#fdfcf9] border border-slate-150 p-5 rounded-xl">
                <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Paper sales</span>
                <span className="font-serif text-2xl font-bold text-navy block mt-1">₦{totalBookSales.toLocaleString()}</span>
                <span className="text-[10px] text-green-700 font-medium block mt-1 font-mono">
                  {successfulTxns.filter(t => t.type === 'purchase').length} Units Vetted
                </span>
              </div>
              <div className="bg-[#fdfcf9] border border-slate-150 p-5 rounded-xl">
                <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Total donations</span>
                <span className="font-serif text-2xl font-bold text-navy block mt-1">₦{totalDonations.toLocaleString()}</span>
                <span className="text-[10px] text-gold font-medium block mt-1 font-mono">
                  {successfulTxns.filter(t => t.type === 'donation').length} Philanthropists
                </span>
              </div>
              <div className="bg-[#fdfcf9] border border-slate-150 p-5 rounded-xl">
                <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Likes & bookmarks</span>
                <span className="font-serif text-2xl font-bold text-navy block mt-1">{totalLikesAcrossWorks}</span>
                <span className="text-[10px] text-rose-600 font-medium block mt-1 font-mono flex items-center gap-1">
                  <Heart className="h-3 w-3 fill-rose-600" /> Interaction Density
                </span>
              </div>
              <div className="bg-[#fdfcf9] border border-slate-150 p-5 rounded-xl">
                <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Feedback comments</span>
                <span className="font-serif text-2xl font-bold text-navy block mt-1">{comments.length}</span>
                <span className="text-[10px] text-amber-700 font-medium block mt-1 font-mono">
                  {pendingCommentsCount} Pending Moderation
                </span>
              </div>
            </div>

            {/* Quick action helper card */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center sm:text-left">
                <h4 className="font-serif font-bold text-base text-slate-900">Database Injection Desk</h4>
                <p className="text-slate-500 text-xs sm:max-w-md">Dynamically key in research materials, toggle monetization boundaries, and configure downloads.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => openAddModal('pub')} className="bg-[#0f172a] hover:bg-slate-800 text-gold hover:text-white font-semibold font-mono text-[10px] px-4 py-2.5 rounded-lg flex items-center space-x-1 cursor-pointer">
                  <Plus className="h-4.5 w-4.5 text-gold" />
                  <span>Publication</span>
                </button>
                <button onClick={() => openAddModal('blog')} className="bg-[#0f172a] hover:bg-slate-800 text-gold hover:text-white font-semibold font-mono text-[10px] px-4 py-2.5 rounded-lg flex items-center space-x-1 cursor-pointer">
                  <Plus className="h-4.5 w-4.5 text-gold" />
                  <span>News Post</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PUBLICATIONS */}
        {activeTab === 'publications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-250 pb-3">
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">Research & Textbook Registry</h3>
                <p className="text-xs text-slate-500">Manage all books, journal drafts, and pricing parameters.</p>
              </div>
              <button 
                onClick={() => openAddModal('pub')}
                className="bg-navy hover:bg-gold hover:text-navy text-gold text-xs px-4 py-2.5 font-mono uppercase font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>Add Publication</span>
              </button>
            </div>

            <div className="space-y-3">
              {publications.map(pub => (
                <div key={pub.id} className="bg-white p-4 border border-slate-150 flex justify-between items-center gap-4 hover:shadow-sm transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700">
                        {pub.type}
                      </span>
                      {pub.isPaid ? (
                        <span className="text-[9px] uppercase font-bold font-mono px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800">
                          ₦{pub.price?.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase font-bold font-mono px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800">
                          Free
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-bold font-mono">{pub.year}</span>
                    </div>
                    <h4 className="font-serif font-bold text-slate-900 text-sm line-clamp-1">{pub.title}</h4>
                    <p className="text-xs text-slate-500 italic max-w-lg truncate">{pub.authors} &bull; {pub.publisher}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => openEditModal('pub', pub)}
                      className="p-2 border border-slate-200 hover:border-amber-500 hover:text-amber-600 rounded(lg) transition"
                      title="Edit details"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem('pub', pub.id)}
                      className="p-2 border border-slate-200 hover:border-red-500 hover:text-red-650 rounded(lg) transition"
                      title="Delete monograph"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-250 pb-3">
              <h3 className="font-serif text-2xl font-bold text-slate-900">Manage Research Projects</h3>
              <button 
                onClick={() => openAddModal('proj')}
                className="bg-navy text-gold hover:bg-gold hover:text-navy text-xs px-4 py-2.5 font-mono uppercase font-bold flex items-center space-x-1 cursor-pointer animate-pulse"
              >
                <Plus className="h-5 w-5" />
                <span>Add Research</span>
              </button>
            </div>

            <div className="space-y-3">
              {projects.map(proj => (
                <div key={proj.id} className="bg-white p-4 border border-slate-150 flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 font-mono ${
                        proj.status === 'ongoing' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {proj.status}
                      </span>
                      <span className="text-xs text-slate-400 font-bold font-mono">{proj.timeline}</span>
                    </div>
                    <h4 className="font-serif font-bold text-slate-900 text-sm line-clamp-1">{proj.title}</h4>
                    <p className="text-xs text-slate-500 font-medium truncate max-w-lg">{proj.role} {proj.funding ? `| ${proj.funding}` : ''}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => openEditModal('proj', proj)}
                      className="p-2 border border-slate-200 hover:border-amber-500 hover:text-amber-600 rounded(lg) transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem('proj', proj.id)}
                      className="p-2 border border-slate-200 hover:border-red-500 hover:text-red-500 rounded(lg) transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: NEWS BLOG */}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-250 pb-3">
              <h3 className="font-serif text-2xl font-bold text-slate-900">Manage Blog & News Posts</h3>
              <button 
                onClick={() => openAddModal('blog')}
                className="bg-navy text-gold hover:bg-gold hover:text-navy text-xs px-4 py-2.5 font-mono uppercase font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>Write News Post</span>
              </button>
            </div>

            <div className="space-y-3">
              {blogPosts.map(post => (
                <div key={post.id} className="bg-white p-4 border border-slate-150 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt={post.title} referrerPolicy="no-referrer" className="w-12 h-12 rounded(lg) object-cover shrink-0" />
                    )}
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-bold text-amber-600 font-mono">{post.category}</span>
                        <span className="text-[10px] text-slate-400 font-bold font-mono">{post.date}</span>
                      </div>
                      <h4 className="font-serif font-bold text-slate-900 text-sm line-clamp-1">{post.title}</h4>
                      <p className="text-xs text-slate-500 truncate max-w-sm">{post.excerpt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => openEditModal('blog', post)}
                      className="p-2 border border-slate-200 hover:border-amber-500 hover:text-amber-600 rounded(lg) transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem('blog', post.id)}
                      className="p-2 border border-slate-200 hover:border-red-500 hover:text-red-500 rounded(lg) transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: GALLERY */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-250 pb-3">
              <h3 className="font-serif text-2xl font-bold text-slate-900">Manage Media Gallery</h3>
              <button 
                onClick={() => openAddModal('gal')}
                className="bg-navy text-gold hover:bg-gold hover:text-navy text-xs px-4 py-2.5 font-mono uppercase font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>Add Gallery Image</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map(img => (
                <div key={img.id} className="bg-white border border-slate-150 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
                  <div className="relative aspect-video bg-slate-150">
                    <img src={img.imageUrl} alt={img.caption} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400">
                        <span className="text-gold font-bold">{img.category}</span>
                        <span>{img.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium line-clamp-2 pt-1">{img.caption}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteItem('gal', img.id)}
                      className="w-full inline-flex items-center justify-center space-x-1 border border-slate-200 hover:border-red-500 hover:text-red-550 py-2 text-xs font-semibold mt-2 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Asset</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: MESSAGES INBOX */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-250 pb-3">
              <h3 className="font-serif text-2xl font-bold text-slate-900">Inquiries Inbox</h3>
            </div>

            <div className="space-y-4">
              {messagesLoading ? (
                <div className="text-center py-10 text-xs text-slate-400 font-mono">Syncing inbox messages...</div>
              ) : messages.length > 0 ? (
                messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`border p-5 transition flex flex-col sm:flex-row gap-6 items-start justify-between ${
                      msg.read ? 'border-slate-150 bg-slate-50/50' : 'border-amber-200 bg-[#fdfcf9] shadow-xs'
                    }`}
                  >
                    <div className="space-y-2 flex-grow text-left">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded font-mono ${
                          msg.read ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-700 border border-red-100 font-bold'
                        }`}>
                          {msg.read ? 'read' : 'unread'}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">{msg.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({msg.email})</span>
                      </div>

                      <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base">{msg.subject}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed bg-[#fdfcf9] border border-slate-150 p-3 font-light mt-1">
                        {msg.message}
                      </p>
                      
                      <div className="text-[10px] font-mono text-slate-400 font-medium">
                        Received: {new Date(msg.date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                      <button 
                        onClick={() => handleToggleRead(msg.id, msg.read)}
                        className={`p-2 border transition text-xs font-semibold flex items-center space-x-1 cursor-pointer ${
                          msg.read 
                            ? 'border-slate-200 hover:border-amber-500 hover:text-amber-600 text-slate-500' 
                            : 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100'
                        }`}
                      >
                        <Check className="h-4 w-4" />
                        <span>{msg.read ? "Mark Unread" : "Mark Read"}</span>
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm("Delete this inquiry Permanently?")) {
                            await deleteMessage(msg.id);
                            loadMessages();
                          }
                        }}
                        className="p-2 border border-slate-200 hover:border-red-500 hover:text-red-500 text-slate-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white py-12 px-6 text-center border border-slate-150 text-slate-500 space-y-2">
                  <Mail className="h-10 w-10 mx-auto text-slate-300" />
                  <p className="font-serif text-lg font-semibold">Inbox Empty</p>
                  <p className="text-xs">Incoming correspondences submitted from the portal will land here automatically.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: TRANSACTIONS LEDGER */}
        {activeTab === 'transactions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-250 pb-3">
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">Financial Ledger Transcripts</h3>
                <p className="text-xs text-slate-500">View and audit all digital checkouts, donations, and payments.</p>
              </div>
              <button 
                onClick={loadEcomAndFeedbackData}
                className="cursor-pointer text-[10px] uppercase font-mono font-bold bg-slate-100 border border-slate-200 py-1.5 px-3"
              >
                Sync ledger
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-200 text-center text-slate-400">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="font-mono text-xs">No transactions have been logged onto database registries yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 font-mono text-[9px] uppercase tracking-wider text-slate-400">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Reference ID</th>
                      <th className="py-2.5">Contributor Details</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5">Donation Note</th>
                      <th className="py-2.5">Sum</th>
                      <th className="py-2.5">Vetting</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="py-3 text-slate-500 font-mono text-[10px]">
                          {new Date(t.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 font-mono text-[10px] text-navy font-bold">
                          {t.reference}
                        </td>
                        <td className="py-3">
                          <span className="block font-medium text-slate-900">{t.userName}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">{t.userEmail}</span>
                        </td>
                        <td className="py-3 font-mono text-[10px] uppercase font-bold text-[#002147]/80">
                          {t.type === 'purchase' ? 'Licensing Buy' : 'Outreach Support'}
                        </td>
                        <td className="py-3 max-w-[150px] truncate italic text-slate-500" title={t.message}>
                          {t.message || '—'}
                        </td>
                        <td className="py-3 font-semibold text-slate-900">
                          ₦{t.amount.toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-bold border ${
                            t.status === 'success' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: COMMENTS QUEUE */}
        {activeTab === 'comments' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-250 pb-3">
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">Moderation Desk</h3>
                <p className="text-xs text-slate-500">Approve or reject student commentary to prevent spam.</p>
              </div>
              <button 
                onClick={loadEcomAndFeedbackData}
                className="cursor-pointer text-[10px] uppercase font-mono font-bold bg-slate-100 border border-slate-200 py-1.5 px-3"
              >
                Sync comments
              </button>
            </div>

            {comments.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-200 text-center text-slate-400">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="font-mono text-xs">Comments registry completely clear.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map(c => (
                  <div key={c.id} className="p-4 border border-slate-150 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-1.5 text-left flex-grow">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider ${
                          c.status === 'approved' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : c.status === 'rejected'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'
                        }`}>
                          {c.status}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">{c.userName}</span>
                        <span className="text-[10px] font-mono text-slate-400">on {new Date(c.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono italic">Under monograph: "{c.publicationTitle}"</p>
                      <p className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed bg-[#fdfcf9] border border-slate-150 p-2.5">
                        "{c.text}"
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 self-end md:self-center">
                      {c.status !== 'approved' && (
                        <button
                          onClick={() => handleCommentStatusModify(c.id, 'approved')}
                          className="cursor-pointer p-1.5 border border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded"
                          title="Vouch & Approve Comment"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {c.status !== 'rejected' && (
                        <button
                          onClick={() => handleCommentStatusModify(c.id, 'rejected')}
                          className="cursor-pointer p-1.5 border border-red-200 text-red-800 bg-red-50 hover:bg-red-105 rounded"
                          title="Reject comment"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleCommentDelete(c.id)}
                        className="cursor-pointer p-1.5 border border-slate-200 hover:border-red-500 text-slate-400 hover:text-red-500 rounded"
                        title="Delete remark"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: DONATION SETTINGS */}
        {activeTab === 'donationsSettings' && donationSettings && (
          <form onSubmit={handleSaveDonationSettings} className="space-y-6 animate-fade-in text-left">
            <div className="flex justify-between items-center border-b border-slate-250 pb-3">
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">Donation Settings</h3>
                <p className="text-xs text-slate-500">Configure public funding options on the academic platform.</p>
              </div>
              <button 
                type="submit"
                className="cursor-pointer bg-amber-500 text-slate-950 font-bold px-4 py-2 hover:bg-amber-600 rounded-lg text-xs font-mono"
              >
                Save Settings
              </button>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 bg-emerald-55 text-emerald-800 border border-emerald-200 text-xs font-mono flex items-center space-x-2 rounded-lg bg-emerald-50">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
              <div className="flex items-center space-x-3 bg-white p-3 border border-slate-150 rounded-lg">
                <input 
                  type="checkbox" 
                  id="donation_enabled" 
                  checked={donationSettings.enabled} 
                  onChange={e => setDonationSettings({ ...donationSettings, enabled: e.target.checked })}
                  className="h-4.5 w-4.5 text-amber-500 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="donation_enabled" className="text-sm font-semibold text-slate-900 cursor-pointer selection:bg-transparent">
                  Enable Public Contributions / Research Donations Form
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Donation Title *</label>
                <input 
                  type="text" 
                  required 
                  value={donationSettings.title} 
                  onChange={e => setDonationSettings({ ...donationSettings, title: e.target.value })}
                  placeholder="e.g. Support Academic Research & Fieldwork"
                  className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Suggested Base Amounts (Commas Separated) *</label>
                <input 
                  type="text" 
                  required 
                  value={donationSettings.suggestedAmounts.join(', ')} 
                  onChange={e => {
                    const cleanNums = e.target.value.split(',')
                      .map(s => parseFloat(s.trim()))
                      .filter(n => !isNaN(n));
                    setDonationSettings({ ...donationSettings, suggestedAmounts: cleanNums });
                  }}
                  placeholder="e.g. 5000, 10000, 20000, 50000"
                  className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-sm focus:outline-none focus:font-bold focus:border-amber-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 font-mono italic">Amounts are in Nigerian Naira (₦). Ensure values are valid numbers.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Donation Call-To-Action Content Message *</label>
                <textarea 
                  required 
                  rows={4}
                  value={donationSettings.description} 
                  onChange={e => setDonationSettings({ ...donationSettings, description: e.target.value })}
                  placeholder="Write a message explaining what these grants support..."
                  className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>
            </div>
          </form>
        )}

        {/* TAB: SECURE PAYMENT GATEWAY KEY PANEL */}
        {activeTab === 'paymentGateway' && paymentKeys && (
          <form onSubmit={handleSavePaymentKeys} className="space-y-6 animate-fade-in text-left">
            <div className="flex justify-between items-center border-b border-slate-250 pb-3">
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">Payment Gateway Panel</h3>
                <p className="text-xs text-slate-500">Configure key keys securely inside Cloud database fallback state.</p>
              </div>
              <button 
                type="submit"
                className="cursor-pointer bg-amber-500 text-slate-950 font-bold px-4 py-2 hover:bg-amber-600 rounded-lg text-xs font-mono"
              >
                Secure Keys
              </button>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 bg-emerald-55 text-emerald-800 border border-emerald-200 text-xs font-mono flex items-center space-x-2 rounded-lg bg-emerald-50">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Active Gateway Channel</label>
                  <select 
                    value={paymentKeys.activeGateway} 
                    onChange={e => setPaymentKeys({ ...paymentKeys, activeGateway: e.target.value as any })}
                    className="w-full bg-white px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500 font-mono font-bold"
                  >
                    <option value="paystack">Paystack Payments (Standard)</option>
                    <option value="opay">OPay Wallet Transfer API</option>
                  </select>
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <div className="flex items-center space-x-3 bg-white p-3 border border-slate-150 rounded-lg min-h-[38px]">
                    <input 
                      type="checkbox" 
                      id="ecom_enabled" 
                      checked={paymentKeys.paymentSystemsEnabled} 
                      onChange={e => setPaymentKeys({ ...paymentKeys, paymentSystemsEnabled: e.target.checked })}
                      className="h-4.5 w-4.5 text-amber-500 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="ecom_enabled" className="text-sm font-semibold text-slate-900 cursor-pointer selection:bg-transparent">
                      Enable Payment Systems Portal-wide
                    </label>
                  </div>
                </div>
              </div>

              {/* Paystack Panel */}
              <div className="border border-slate-200 bg-white p-4 rounded-xl space-y-4">
                <h4 className="font-serif font-bold text-slate-900 text-sm border-b border-slate-100 pb-1.5 flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
                  <span>Paystack Credentials</span>
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Paystack Public Key</label>
                    <input 
                      type="text" 
                      placeholder="pk_test_..."
                      required={paymentKeys.activeGateway === 'paystack'}
                      value={paymentKeys.paystackPublicKey} 
                      onChange={e => setPaymentKeys({ ...paymentKeys, paystackPublicKey: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Paystack Secret Key</label>
                    <input 
                      type="password" 
                      placeholder="sk_test_..."
                      required={paymentKeys.activeGateway === 'paystack'}
                      value={paymentKeys.paystackSecretKey} 
                      onChange={e => setPaymentKeys({ ...paymentKeys, paystackSecretKey: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="p-3 bg-slate-50 text-[10px] text-slate-550 border border-slate-150 font-mono flex flex-col space-y-1 rounded-lg">
                  <span className="font-bold">Paystack Webhook Endpoint:</span>
                  <span className="bg-white px-2 py-1 rounded border border-slate-200 select-all cursor-pointer">
                    {window.location.origin}/api/webhook/paystack
                  </span>
                </div>
              </div>

              {/* OPay Panel */}
              <div className="border border-slate-200 bg-white p-4 rounded-xl space-y-4">
                <h4 className="font-serif font-bold text-slate-900 text-sm border-b border-slate-100 pb-1.5 flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>OPay Wallet API Credentials</span>
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">OPay Public Key</label>
                    <input 
                      type="text" 
                      placeholder="OPay Public Key"
                      value={paymentKeys.opayPublicKey || ''} 
                      onChange={e => setPaymentKeys({ ...paymentKeys, opayPublicKey: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">OPay Secret Key</label>
                    <input 
                      type="password" 
                      placeholder="OPay Secret Key"
                      value={paymentKeys.opaySecretKey || ''} 
                      onChange={e => setPaymentKeys({ ...paymentKeys, opaySecretKey: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="p-3 bg-slate-50 text-[10px] text-slate-550 border border-slate-150 font-mono flex flex-col space-y-1 rounded-lg">
                  <span className="font-bold">OPay Webhook Endpoint:</span>
                  <span className="bg-white px-2 py-1 rounded border border-slate-200 select-all cursor-pointer">
                    {window.location.origin}/api/webhook/opay
                  </span>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* TAB: ADMIN SECURITY DETAILS */}
        {activeTab === 'adminCredentials' && (
          <form onSubmit={handleSaveAdminCreds} className="space-y-6 animate-fade-in text-left">
            <div className="flex justify-between items-center border-b border-slate-250 pb-3">
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">Admin Credentials Management</h3>
                <p className="text-xs text-slate-500">Update the administrative simulation credentials stored securely in Firestore.</p>
              </div>
              <button 
                type="submit"
                disabled={settingsLoading}
                className="cursor-pointer bg-amber-500 text-slate-950 font-bold px-4 py-2 hover:bg-amber-600 rounded-lg text-xs font-mono"
              >
                {settingsLoading ? "Saving Keys..." : "Update Credentials"}
              </button>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 bg-emerald-55 text-emerald-800 border border-emerald-200 text-xs font-mono flex items-center space-x-2 rounded-lg bg-emerald-50 animate-fade-in animate-duration-300">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider block">Custom Administrative Email *</label>
                <input 
                  type="email" 
                  required 
                  value={adminCredsForm.email} 
                  onChange={e => setAdminCredsForm({ ...adminCredsForm, email: e.target.value })}
                  placeholder="admin@okorie.edu.ng"
                  className="w-full px-3 py-2 bg-white border border-slate-250 focus:border-amber-500 outline-none rounded-lg text-sm transition-all text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider block">Secured Sandbox Password *</label>
                <div className="relative">
                  <input 
                    type={showSecretFormPassword ? "text" : "password"} 
                    required 
                    value={adminCredsForm.password} 
                    onChange={e => setAdminCredsForm({ ...adminCredsForm, password: e.target.value })}
                    placeholder="Enter security password"
                    className="w-full pl-3 pr-10 py-2 bg-white border border-slate-250 focus:border-amber-500 outline-none rounded-lg text-sm transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretFormPassword(!showSecretFormPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-mono italic font-serif">
                  Take absolute control of your admin login. Updates are reflected instantly on the main admin gateway portal.
                </p>
              </div>
            </div>
          </form>
        )}

        {/* TAB: CMS PAGE SECTION BUILDER */}
        {activeTab === 'pageCMS' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-250 pb-3 gap-3">
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">CMS Page Block Builder</h3>
                <p className="text-xs text-slate-500">Edit page text sections, layouts, structure and SEO tags dynamically.</p>
              </div>
              <button 
                onClick={handleSaveCmsPage}
                disabled={settingsLoading || !cmsPage}
                className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 text-xs font-mono flex items-center space-x-1.5 self-end tracking-tight rounded-lg"
              >
                <Sparkles className="h-4 w-4" />
                <span>Lock & Publish Page</span>
              </button>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 bg-emerald-55 text-emerald-800 border border-emerald-200 text-xs font-mono flex items-center space-x-2 rounded-lg bg-emerald-50">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 border border-slate-150 p-4 rounded-xl">
              <div className="flex-1 space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-500 font-mono">Selector Platform Page</label>
                <select 
                  id="cms_slug_selector"
                  value={selectedCmsSlug} 
                  onChange={e => setSelectedCmsSlug(e.target.value)}
                  className="w-full bg-white px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500 font-mono font-bold"
                >
                  <option value="home">Homepage Layout CMS</option>
                  <option value="about">About Biography Page CMS</option>
                  <option value="publications">Publications Tab CMS Header</option>
                  <option value="blog">Research News CMS Header</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddCmsBlock}
                disabled={!cmsPage}
                className="bg-white shrink-0 hover:bg-slate-50 border border-slate-250 text-slate-700 text-xs px-3.5 py-2 hover:text-slate-950 flex items-center justify-center space-x-1 rounded-lg font-mono self-end cursor-pointer h-[38px]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Section Block</span>
              </button>
            </div>

            {settingsLoading || !cmsPage ? (
              <div className="py-20 border border-amber-100 rounded-xl bg-amber-50/20 text-center animate-pulse">
                <Sparkles className="h-8 w-8 mx-auto text-amber-550 mb-2" />
                <span className="font-mono text-xs text-amber-700">Configuring page block nodes from Firestore registry...</span>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Profile Header Image Customization */}
                {(selectedCmsSlug === 'home' || selectedCmsSlug === 'about') && (
                  <div className="border border-amber-200 bg-amber-50/15 p-4 rounded-xl space-y-4">
                    <h4 className="font-serif font-bold text-slate-900 text-sm border-b border-amber-100 pb-1.5 flex items-center space-x-1.5">
                      <Sparkles className="h-4 w-4 text-amber-600 animate-pulse" />
                      <span>{selectedCmsSlug === 'home' ? 'Homepage Profile Photo Customization' : 'Biography Page Profile Photo Customization'}</span>
                    </h4>
                    
                    <div className="grid sm:grid-cols-3 gap-4 items-center">
                      {/* Left: Preview */}
                      <div className="flex flex-col items-center justify-center border border-slate-200 p-2 bg-white rounded-lg">
                        <span className="text-[8px] font-bold uppercase text-slate-400 font-mono mb-1">Image Preview</span>
                        {cmsPage.profileImage ? (
                          <img 
                            src={cmsPage.profileImage} 
                            alt="Custom Profile" 
                            className="w-24 h-28 object-cover rounded shadow-md border border-amber-300"
                          />
                        ) : (
                          <div className="w-24 h-28 bg-slate-100 border border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-center p-1">
                            <span className="text-[9px] text-slate-400 font-mono">Running Default Photo</span>
                          </div>
                        )}
                        {cmsPage.profileImage && (
                          <button
                            type="button"
                            onClick={() => setCmsPage({ ...cmsPage, profileImage: undefined })}
                            className="mt-2 text-[9px] font-mono uppercase bg-rose-50 text-rose-600 hover:bg-rose-100 px-2 py-0.5 rounded cursor-pointer border border-rose-200"
                          >
                            Reset Default
                          </button>
                        )}
                      </div>

                      {/* Right: Upload controls */}
                      <div className="sm:col-span-2 space-y-3 text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Method A: Direct Image web URL</label>
                          <input 
                            type="text"
                            value={cmsPage.profileImage || ''}
                            onChange={e => setCmsPage({ ...cmsPage, profileImage: e.target.value })}
                            placeholder="https://example.com/mypicture.jpg"
                            className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1 font-sans">
                          <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Method B: Local Direct File Upload</label>
                          <div className="border border-dashed border-slate-350 rounded-lg p-3 bg-white text-center relative hover:bg-slate-50 transition cursor-pointer">
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 800000) {
                                    alert("Image is too large! Please choose an image smaller than 800KB for optimization.");
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      setCmsPage({
                                        ...cmsPage,
                                        profileImage: event.target.result as string
                                      });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center space-y-1 pointer-events-none">
                              <span className="text-[10px] font-semibold text-amber-700">Click to Select or Drag Image Here</span>
                              <span className="text-[8px] text-slate-400 font-mono">Accepts JPG, JPEG, PNG (Max 800KB)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Homepage Hero Banner text elements customization */}
                {selectedCmsSlug === 'home' && (
                  <div className="border border-slate-200 bg-white p-4 rounded-xl space-y-4 text-left">
                    <h4 className="font-serif font-bold text-slate-900 text-sm border-b border-slate-100 pb-1.5 flex items-center space-x-1.5">
                      <Sparkles className="h-4 w-4 text-amber-550 shrink-0" />
                      <span>Homepage Hero Text Customization</span>
                    </h4>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Hero Institution Tag</label>
                        <input 
                          type="text"
                          value={cmsPage.heroInstitution || ''}
                          onChange={e => setCmsPage({ ...cmsPage, heroInstitution: e.target.value })}
                          placeholder="University of Uyo, Nigeria"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-amber-500 font-sans"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Hero Title / Name Heading</label>
                        <input 
                          type="text"
                          value={cmsPage.heroTitle || ''}
                          onChange={e => setCmsPage({ ...cmsPage, heroTitle: e.target.value })}
                          placeholder="Prof. Ebere Okorie"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-amber-500 font-sans"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Hero Academic Subheading (e.g. Professor of Sociology)</label>
                      <input 
                        type="text"
                        value={cmsPage.heroSubheading || ''}
                        onChange={e => setCmsPage({ ...cmsPage, heroSubheading: e.target.value })}
                        placeholder="Professor of Sociology and Anthropology"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-amber-500 font-sans"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Hero Brief Biography Summary</label>
                      <textarea 
                        rows={3}
                        value={cmsPage.heroDescription || ''}
                        onChange={e => setCmsPage({ ...cmsPage, heroDescription: e.target.value })}
                        placeholder="Brief summary paragraph describing his research domains and department..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-gold font-sans"
                      />
                    </div>
                  </div>
                )}
                
                {/* Meta Tags Configuration */}
                <div className="border border-slate-200 bg-white p-4 rounded-xl space-y-4">
                  <h4 className="font-serif font-bold text-slate-900 text-sm border-b border-slate-100 pb-1.5 flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span>Search Engine Optimization (SEO Meta Tags)</span>
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Meta SEO Description</label>
                      <input 
                        type="text" 
                        required
                        value={cmsPage.metaTags?.description || ''} 
                        onChange={e => setCmsPage({
                          ...cmsPage,
                          metaTags: { ...(cmsPage.metaTags || {}), description: e.target.value }
                        })}
                        placeholder="Search result snippet overview..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Meta Search Keywords (Commas Separated)</label>
                      <input 
                        type="text" 
                        required
                        value={cmsPage.metaTags?.keywords || ''} 
                        onChange={e => setCmsPage({
                          ...cmsPage,
                          metaTags: { ...(cmsPage.metaTags || {}), keywords: e.target.value }
                        })}
                        placeholder="sociology, criminology, research..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Blocks List */}
                <div className="space-y-4">
                  {cmsPage.blocks.length === 0 ? (
                    <div className="py-12 border border-dashed border-slate-200 text-center text-slate-400">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 text-slate-300 animate-pulse" />
                      <p className="font-mono text-xs">No section blocks configured for this slug. Click 'Add Section Block' ABOVE to create one.</p>
                    </div>
                  ) : (
                    cmsPage.blocks.map((block, index) => (
                      <div key={block.id} className="border border-slate-200 p-4 rounded-xl bg-slate-50 space-y-4 relative">
                        <div className="flex justify-between items-center border-b border-rose-50 pb-2">
                          <span className="font-mono font-bold text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                            Block {index + 1}: {block.type} section
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (index === 0) return;
                                const updatedBlocks = [...cmsPage.blocks];
                                const temp = updatedBlocks[index];
                                updatedBlocks[index] = updatedBlocks[index - 1];
                                updatedBlocks[index - 1] = temp;
                                setCmsPage({ ...cmsPage, blocks: updatedBlocks });
                              }}
                              disabled={index === 0}
                              className="p-1 border border-slate-200 bg-white rounded hover:bg-slate-100 disabled:opacity-40 cursor-pointer text-xs font-mono"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (index === cmsPage.blocks.length - 1) return;
                                const updatedBlocks = [...cmsPage.blocks];
                                const temp = updatedBlocks[index];
                                updatedBlocks[index] = updatedBlocks[index + 1];
                                updatedBlocks[index + 1] = temp;
                                setCmsPage({ ...cmsPage, blocks: updatedBlocks });
                              }}
                              disabled={index === cmsPage.blocks.length - 1}
                              className="p-1 border border-slate-200 bg-white rounded hover:bg-slate-100 disabled:opacity-40 cursor-pointer text-xs font-mono"
                              title="Move Down"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCmsBlock(block.id)}
                              className="p-1 border border-rose-300 text-rose-600 bg-white hover:bg-rose-50 rounded cursor-pointer"
                              title="Remove Section Block"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-slate-500 font-mono">Layout Block Type</label>
                            <select 
                              value={block.type} 
                              onChange={e => handleUpdateCmsBlock(block.id, { type: e.target.value as any })}
                              className="w-full bg-white px-2 py-1.5 border border-slate-250 rounded text-xs focus:outline-none focus:border-amber-500"
                            >
                              <option value="hero">Hero Segment (Jumbotron)</option>
                              <option value="text">Markdown/Text Body</option>
                              <option value="cta">Call-To-Action highlight card</option>
                            </select>
                          </div>
                          
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[9px] font-bold uppercase text-slate-500 font-mono">Primary Title heading *</label>
                            <input 
                              type="text" 
                              required
                              value={block.heading} 
                              onChange={e => handleUpdateCmsBlock(block.id, { heading: e.target.value })}
                              placeholder="e.g. Leading Sociological Research Initiatives"
                              className="w-full px-2 py-1.5 bg-white border border-slate-250 rounded text-xs focus:outline-none focus:border-amber-500 font-bold"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase text-slate-500 font-mono">Secondary Subheading label (Optional)</label>
                          <input 
                            type="text" 
                            value={block.subheading || ''} 
                            onChange={e => handleUpdateCmsBlock(block.id, { subheading: e.target.value })}
                            placeholder="e.g. Advancing Community Policing"
                            className="w-full px-2 py-1.5 bg-white border border-slate-250 rounded text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase text-slate-500 font-mono">Visual Content text body (Markdown Supported) *</label>
                          <textarea 
                            rows={3}
                            required
                            value={block.content} 
                            onChange={e => handleUpdateCmsBlock(block.id, { content: e.target.value })}
                            placeholder="Write your research body paragraphs..."
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-250 rounded text-xs font-sans focus:outline-none focus:border-amber-500"
                          />
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB: LIVE CHAT CENTER */}
        {activeTab === 'liveChat' && (
          <div className="space-y-6 animate-fade-in text-left font-sans">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-250 pb-3 gap-3">
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">Live Chat Center & Configuration</h3>
                <p className="text-xs text-slate-500">Monitor active visitor conversations, inspect Gemini-buffered logs, and customize assistant parameters.</p>
              </div>
              <button 
                type="button"
                onClick={loadChatConfigAndMessages}
                className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 font-bold px-3 py-1.5 text-xs font-mono flex items-center space-x-1.5 rounded-lg border border-slate-200"
              >
                <span>Synchronize Conversation Logs</span>
              </button>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 bg-emerald-55 text-emerald-800 border border-emerald-200 text-xs font-mono flex items-center space-x-2 rounded-lg bg-emerald-50">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            {/* PART 1: CHATBOT CONFIG SHEET */}
            {chatConfig && (
              <form onSubmit={handleSaveChatConfig} className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <Sparkles className="h-4.5 w-4.5 text-amber-550 mr-1 shrink-0 animate-pulse" />
                    <span>Live Assistant Configuration</span>
                  </h4>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox"
                      id="chatbot_toggle"
                      checked={chatConfig.chatbotEnabled}
                      onChange={e => setChatConfig({ ...chatConfig, chatbotEnabled: e.target.checked })}
                      className="h-4 w-4 text-amber-600 border-slate-350 rounded focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="chatbot_toggle" className="text-xs font-bold text-slate-700 font-mono cursor-pointer select-none">
                      {chatConfig.chatbotEnabled ? "WIDGET ONLINE" : "WIDGET DISCONNECTED"}
                    </label>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Assistant Display Title / Role</label>
                    <input 
                      type="text"
                      required
                      value={chatConfig.assistantName}
                      onChange={e => setChatConfig({ ...chatConfig, assistantName: e.target.value })}
                      placeholder="Scholarly Portal Assistant"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Automated Initial Greeting</label>
                    <input 
                      type="text"
                      required
                      value={chatConfig.welcomeMessage}
                      onChange={e => setChatConfig({ ...chatConfig, welcomeMessage: e.target.value })}
                      placeholder="Welcome greeting..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Suggestion Action Chips (Editable Quick Inquiries)</label>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {chatConfig.suggestions?.map((sug, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5">
                        <span className="text-[11px] font-mono text-slate-400 font-bold">#{idx + 1}</span>
                        <input 
                          type="text"
                          value={sug}
                          onChange={e => {
                            const updated = [...(chatConfig.suggestions || [])];
                            updated[idx] = e.target.value;
                            setChatConfig({ ...chatConfig, suggestions: updated });
                          }}
                          placeholder={`Quick question chip #${idx + 1}`}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="cursor-pointer bg-slate-900 hover:bg-slate-950 text-gold px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg border border-gold/10"
                  >
                    Save Config Settings
                  </button>
                </div>
              </form>
            )}

            {/* PART 2: DUAL-COLUMN LIVE MESSAGES MONITOR BOX */}
            <div className="grid md:grid-cols-12 gap-6 items-stretch">
              
              {/* Columns A: Sessions Sidebar (5 cols) */}
              <div className="md:col-span-4 border border-slate-200 rounded-2xl overflow-hidden flex flex-col bg-slate-50 h-[480px]">
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-3">
                  <h5 className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-500 text-left">Active Visitor Lanes</h5>
                </div>
                
                <div className="flex-1 overflow-y-auto divide-y divide-slate-150">
                  {(() => {
                    // Group messages by session
                    const sessionsMap = new Map<string, LiveChatMessage[]>();
                    chatMessages.forEach(msg => {
                      if (!sessionsMap.has(msg.sessionId)) {
                        sessionsMap.set(msg.sessionId, []);
                      }
                      sessionsMap.get(msg.sessionId)!.push(msg);
                    });

                    // Sort sessions by the latest message timestamp
                    const sortedSessions = Array.from(sessionsMap.entries()).sort((a, b) => {
                      const latestA = [...a[1]].sort((x, y) => y.timestamp.localeCompare(x.timestamp))[0]?.timestamp || '';
                      const latestB = [...b[1]].sort((x, y) => y.timestamp.localeCompare(x.timestamp))[0]?.timestamp || '';
                      return latestB.localeCompare(latestA);
                    });

                    if (sortedSessions.length === 0) {
                      return (
                        <div className="py-12 px-4 text-center text-slate-400 text-xs">
                          <MessageSquare className="h-6 w-6 mx-auto mb-1.5 opacity-40 text-slate-400" />
                          <span>No buffer conversations logged yet. Open the chatbot to initiate first contact.</span>
                        </div>
                      );
                    }

                    return sortedSessions.map(([sessId, msgs]) => {
                      const sortedMsgs = [...msgs].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
                      const lastMsg = sortedMsgs[0];
                      const userMsgCount = msgs.filter(m => m.role === 'user').length;
                      const isActive = selectedSessionId === sessId;

                      return (
                        <button
                          key={sessId}
                          type="button"
                          onClick={() => setSelectedSessionId(sessId)}
                          className={`w-full p-4 text-left transition-colors flex flex-col space-y-1 focus:outline-none cursor-pointer border-l-4 ${
                            isActive 
                              ? 'bg-amber-100/50 border-amber-500' 
                              : 'bg-white border-transparent hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[10px] font-bold text-slate-700">LANE #{sessId.substr(5, 5).toUpperCase()}</span>
                            <span className="text-[8px] text-slate-400 font-mono uppercase">
                              {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 font-medium truncate w-full">{lastMsg.content}</p>
                          <div className="flex items-center justify-between text-[9px] text-slate-400">
                            <span>{msgs.length} messages logged</span>
                            {userMsgCount > 0 && (
                              <span className="bg-slate-150 text-slate-600 px-1.5 py-0.5 rounded font-mono font-semibold">User: {userMsgCount}</span>
                            )}
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Columns B: Selected Session Timeline Box (8 cols) */}
              <div className="md:col-span-8 border border-slate-200 rounded-2xl overflow-hidden flex flex-col bg-white h-[480px]">
                {selectedSessionId ? (
                  (() => {
                    const activeSessionMessages = chatMessages
                      .filter(m => m.sessionId === selectedSessionId)
                      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

                    return (
                      <>
                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center text-xs">
                          <span className="font-mono text-[10px] text-slate-500 font-bold flex items-center">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
                            ACTIVE SESSION: {selectedSessionId.toUpperCase()}
                          </span>
                          <span className="text-[9px] font-mono text-slate-405 uppercase text-slate-400">
                            Total buffered logs: {activeSessionMessages.length}
                          </span>
                        </div>

                        {/* Message log window */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fcfbfa]/60">
                          {activeSessionMessages.map((msg) => (
                            <div 
                              key={msg.id}
                              className={`flex flex-col max-w-[85%] ${
                                msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                              }`}
                            >
                              <div className="flex items-center space-x-1 mb-0.5 text-[9px] text-slate-400 font-mono uppercase">
                                <span>{msg.role === 'user' ? 'Anonymous Visitor' : (chatConfig?.assistantName || 'Academic Assistant')}</span>
                              </div>
                              <div 
                                className={`p-3 rounded-xl leading-relaxed text-left text-xs ${
                                  msg.role === 'user' 
                                    ? 'bg-slate-900 text-white rounded-tr-none' 
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                                }`}
                              >
                                <p className="whitespace-pre-line font-medium">{msg.content}</p>
                              </div>
                              <span className="text-[8px] text-slate-400 font-mono mt-0.5 uppercase">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>
                          ))}
                          <div ref={adminChatBottomRef} />
                        </div>

                        {/* Interactive Admin Reply Box */}
                        <form 
                          onSubmit={handleSendAdminReply}
                          className="border-t border-slate-200 bg-slate-50 p-3 flex items-center space-x-2 shrink-0"
                        >
                          <input 
                            type="text"
                            value={adminReplyText}
                            onChange={(e) => setAdminReplyText(e.target.value)}
                            placeholder={`Reply to LANE #${selectedSessionId.substr(5, 5).toUpperCase()} as Assistant...`}
                            className="flex-1 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 px-3.5 py-2.5 focus:outline-none focus:border-amber-500 placeholder:text-slate-400 font-sans shadow-2xs"
                          />
                          <button 
                            type="submit"
                            disabled={!adminReplyText.trim()}
                            className="cursor-pointer bg-slate-900 border border-slate-800 hover:bg-slate-950 text-gold px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Reply</span>
                          </button>
                        </form>
                      </>
                    );
                  })()
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400">
                    <MessageSquare className="h-10 w-10 mb-2 opacity-30 animate-bounce" />
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">No active conversation lane selected</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ==========================================
          DYNAMIC FORMS MODAL SHEET
      ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in select-none">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl p-6 sm:p-8 relative mt-10 mb-10 max-h-[90vh] overflow-y-auto border border-slate-200 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <h4 className="font-serif font-bold text-slate-900 text-lg">
                {editItem ? "Modify Academic Record" : `Add New ${modalType === 'pub' ? 'Publication' : modalType === 'proj' ? 'Research Study' : modalType === 'blog' ? 'Blog Post' : 'Gallery Asset'}`}
              </h4>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="space-y-4 text-left">
              
              {/* SPECIAL FORM: PUBLICITY */}
              {modalType === 'pub' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Publication Title *</label>
                    <input 
                      id="pub_title"
                      type="text" required value={pubForm.title} onChange={e => setPubForm({...pubForm, title: e.target.value})}
                      placeholder="e.g. Sociology of local microfinance systems..."
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Collaborating Authors</label>
                      <input 
                        id="pub_authors"
                        type="text" value={pubForm.authors} onChange={e => setPubForm({...pubForm, authors: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Publication Year *</label>
                      <input 
                        id="pub_year"
                        type="number" required value={pubForm.year} onChange={e => setPubForm({...pubForm, year: parseInt(e.target.value) || 2026})}
                        className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Format Category</label>
                      <select 
                        id="pub_format"
                        value={pubForm.type} onChange={e => setPubForm({...pubForm, type: e.target.value as any})}
                        className="w-full bg-slate-50 px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500 font-mono"
                      >
                        <option value="book">Book (Monograph)</option>
                        <option value="journal">Journal Paper</option>
                        <option value="conference">Conference Presentation</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Publisher Title *</label>
                      <input 
                        id="pub_publisher"
                        type="text" required value={pubForm.publisher} onChange={e => setPubForm({...pubForm, publisher: e.target.value})}
                        placeholder="e.g. University of Uyo Press"
                        className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">External URL (Fallback Link)</label>
                    <input 
                      id="pub_link"
                      type="url" value={pubForm.link} onChange={e => setPubForm({...pubForm, link: e.target.value})}
                      placeholder="https://example.com/scholarly-pdf"
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* MONETIZATION GATEWAY PARAMETERS */}
                  <div className="p-3.5 bg-amber-500/5 border border-amber-500/25 space-y-3">
                    <span className="font-mono text-[9px] uppercase font-black text-amber-700 tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> Monetization Settings
                    </span>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={pubForm.isPaid}
                        onChange={(e) => setPubForm({ ...pubForm, isPaid: e.target.checked })}
                        className="h-4 w-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                        id="toggle-ispaid"
                      />
                      <label htmlFor="toggle-ispaid" className="text-xs font-bold text-slate-700 select-none cursor-pointer">
                        Charge for Access Keys (Paid Publication)
                      </label>
                    </div>

                    {pubForm.isPaid && (
                      <div className="grid sm:grid-cols-2 gap-3 animate-slide-up-faint pt-1">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-500 font-mono font-bold">Naira price (NGN)</label>
                          <input
                            type="number"
                            value={pubForm.price}
                            onChange={(e) => setPubForm({ ...pubForm, price: Number(e.target.value) || 5000 })}
                            min="100"
                            placeholder="5000"
                            className="w-full bg-white px-2.5 py-1.5 border border-slate-250 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-500 font-mono">Secure PDF Download URL</label>
                          <input
                            type="url"
                            value={pubForm.downloadUrl}
                            onChange={(e) => setPubForm({ ...pubForm, downloadUrl: e.target.value })}
                            placeholder="https://example.com/secure-textbook.pdf"
                            className="w-full bg-white px-2.5 py-1.5 border border-slate-250 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Abstract Paper Summary</label>
                    <textarea 
                      id="pub_desc"
                      rows={3} value={pubForm.description} onChange={e => setPubForm({...pubForm, description: e.target.value})}
                      placeholder="Include the short overview/abstract of the paper here..."
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* SPECIAL FORM: PROJECT */}
              {modalType === 'proj' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Research Study Title *</label>
                    <input 
                      id="proj_title"
                      type="text" required value={projForm.title} onChange={e => setProjForm({...projForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Investigator Role *</label>
                      <input 
                        id="proj_role"
                        type="text" required value={projForm.role} onChange={e => setProjForm({...projForm, role: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono font-bold">Status</label>
                      <select 
                        id="proj_status"
                        value={projForm.status} onChange={e => setProjForm({...projForm, status: e.target.value as any})}
                        className="w-full bg-slate-50 px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500 font-mono"
                      >
                        <option value="ongoing">Ongoing Fieldwork</option>
                        <option value="completed">Completed / Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Livelihood Timeline *</label>
                      <input 
                        id="proj_timeline"
                        type="text" required value={projForm.timeline} onChange={e => setProjForm({...projForm, timeline: e.target.value})}
                        placeholder="e.g., 2024 - Present"
                        className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Grant Funding Agent</label>
                      <input 
                        id="proj_funding"
                        type="text" value={projForm.funding} onChange={e => setProjForm({...projForm, funding: e.target.value})}
                        placeholder="e.g. TetFund Grant Award"
                        className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Detailed Scope Description *</label>
                    <textarea 
                      id="proj_desc"
                      rows={4} required value={projForm.description} onChange={e => setProjForm({...projForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* SPECIAL FORM: BLOG */}
              {modalType === 'blog' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Article Title *</label>
                    <input 
                      id="blog_title"
                      type="text" required value={blogForm.title} onChange={e => setBlogForm({...blogForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Topic Category</label>
                      <select 
                        id="blog_category"
                        value={blogForm.category} onChange={e => setBlogForm({...blogForm, category: e.target.value})}
                        className="w-full bg-slate-50 px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500 font-mono"
                      >
                        <option value="Announcements">Announcements</option>
                        <option value="Academic Notes">Academic Notes</option>
                        <option value="Conferences">Conferences</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 font-mono font-bold">Banner Web Image URL</label>
                      <input 
                        id="blog_img_url"
                        type="url" value={blogForm.imageUrl} onChange={e => setBlogForm({...blogForm, imageUrl: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono font-bold">Brief Excerpt *</label>
                    <input 
                      id="blog_excerpt"
                      type="text" required value={blogForm.excerpt} onChange={e => setBlogForm({...blogForm, excerpt: e.target.value})}
                      placeholder="Include a 1-2 sentence hook paragraph..."
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Full Narrative Content *</label>
                    <textarea 
                      id="blog_content"
                      rows={6} required value={blogForm.content} onChange={e => setBlogForm({...blogForm, content: e.target.value})}
                      placeholder="Write your scholarly write-up, reflections or departmental notices..."
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500 resize-none font-sans"
                    />
                  </div>
                </div>
              )}

              {/* SPECIAL FORM: GALLERY */}
              {modalType === 'gal' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Asset image URL *</label>
                    <input 
                      id="gal_img_url"
                      type="url" required value={galForm.imageUrl} onChange={e => setGalForm({...galForm, imageUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Caption Description *</label>
                    <input 
                      id="gal_caption"
                      type="text" required value={galForm.caption} onChange={e => setGalForm({...galForm, caption: e.target.value})}
                      placeholder="e.g. Academic keynotes with delegates of UniUyo Sociology department..."
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 font-mono">Display Category</label>
                    <select 
                      id="gal_category"
                      value={galForm.category} onChange={e => setGalForm({...galForm, category: e.target.value})}
                      className="w-full bg-slate-50 px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500 font-mono"
                    >
                      <option value="Lectures">Lectures</option>
                      <option value="Conferences">Conferences</option>
                      <option value="Fieldwork">Fieldwork</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Submit panel */}
              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 font-mono text-xs">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  id="admin_modal_submit"
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-605 text-slate-950 font-bold rounded-lg shadow transition cursor-pointer"
                >
                  Save Record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
