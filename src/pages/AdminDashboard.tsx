import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Lock, Key, LogOut, BookOpen, Layers, Rss, Camera, Mail, BarChart2, Plus, Edit2, Trash2, 
  Check, X, Eye, FileText, CheckCircle, Tag, Calendar, ShieldAlert 
} from 'lucide-react';
import { 
  auth 
} from '../firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Publication, BlogPost, Project, GalleryImage, ContactMessage 
} from '../types';
import { 
  addPublication, updatePublication, deletePublication,
  addProject, updateProject, deleteProject,
  addBlogPost, updateBlogPost, deleteBlogPost,
  addGalleryImage, deleteGalleryImage,
  fetchMessages, updateMessageReadStatus, deleteMessage 
} from '../services/db';

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

  // Active Admin Tabs
  // 'publications' | 'projects' | 'blog' | 'gallery' | 'messages' | 'analytics'
  const [activeTab, setActiveTab] = useState<string>('analytics');

  // Modals Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'pub' | 'proj' | 'blog' | 'gal' | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);

  // Forms Fields State
  const [pubForm, setPubForm] = useState({
    title: '', authors: '', type: 'journal' as any, publisher: '', year: new Date().getFullYear(), link: '', description: ''
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
    return () => unsubscribe();
  }, []);

  // Fetch Message Inbox
  useEffect(() => {
    if (isLoggedIn) {
      loadMessages();
    }
  }, [isLoggedIn]);

  const loadMessages = async () => {
    setMessagesLoading(true);
    const msgs = await fetchMessages();
    setMessages(msgs);
    setMessagesLoading(false);
  };

  // Login handler
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const testEmail = 'admin@okorie.edu.ng';
    const testPassword = 'Password123';

    if (email === testEmail && password === testPassword) {
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

  // ==========================================
  // MESSAGE HANDLERS
  // ==========================================
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

  // ==========================================
  // MODAL CREATION/MANAGEMENT
  // ==========================================
  const openAddModal = (type: 'pub' | 'proj' | 'blog' | 'gal') => {
    setModalType(type);
    setEditItem(null);
    setIsModalOpen(true);
    
    // Reset inputs
    setPubForm({ title: '', authors: 'Prof. Ebere Okorie', type: 'journal', publisher: '', year: new Date().getFullYear(), link: '', description: '' });
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
        description: item.description || ''
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
          await updatePublication({ id: editItem.id, ...pubForm, dateAdded: editItem.dateAdded || new Date().toISOString() });
        } else {
          await addPublication({ ...pubForm, dateAdded: new Date().toISOString() });
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

  // ==========================================
  // UNRESTRICTED ACCESS PORT
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12 px-6 text-left animate-fade-in space-y-8 select-none">
        
        {/* Credentials hints card */}
        <div id="credential_advisor" className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex items-start space-x-3.5">
          <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-600 block font-sans">Master Testing Credentials (Sandbox Portal)</span>
            <span className="text-xs text-slate-600 block">
              For immediate full-stack testing in this workspace:
            </span>
            <div className="text-[11px] font-mono text-slate-700 bg-white/70 p-2 rounded-lg border border-amber-500/10 mt-1 select-all space-y-0.5">
              <div>Email: <strong className="text-amber-800">admin@okorie.edu.ng</strong></div>
              <div>Password: <strong className="text-amber-800">Password123</strong></div>
            </div>
            <span className="text-[10px] text-slate-400 block pt-1 italic">
              * Supports dual-path: logs automatically fallback to sandbox simulation.
            </span>
          </div>
        </div>

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
              <div className="text-xs text-red-650 bg-red-50 border border-red-200 p-3 rounded-lg leading-relaxed">
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
                  placeholder="admin@okorie.edu.ng"
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
                  placeholder="Password123"
                  className="w-full pl-3 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>
            </div>

            <button 
              id="admin_login_submit"
              type="submit"
              disabled={authLoading}
              className="w-full inline-flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-lg transition shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>Authenticate and Enter</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate quick admin totals
  const unreadMessagesCount = messages.filter(m => !m.read).length;

  return (
    <div className="grid md:grid-cols-12 gap-8 text-left animate-fade-in py-4">
      
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
              { id: 'publications', label: 'My Publications', icon: BookOpen, count: publications.length },
              { id: 'projects', label: 'Research Projects', icon: Layers, count: projects.length },
              { id: 'blog', label: 'News & Blog', icon: Rss, count: blogPosts.length },
              { id: 'gallery', label: 'Event Gallery', icon: Camera, count: galleryImages.length },
              { id: 'messages', label: 'Inquiries Inbox', icon: Mail, count: unreadMessagesCount, hasBadge: true },
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
      <div className="md:col-span-9 space-y-6">
        
        {/* TAB: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-250 pb-3">
              <h3 className="font-serif text-2xl font-bold text-slate-900">Consolidated Stats</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { title: "Publications", value: publications.length, desc: "Books & Articles", color: "bg-blue-500 text-white" },
                { title: "Research Projects", value: projects.length, desc: "Studies & Grants", color: "bg-amber-500 text-slate-950 font-bold" },
                { title: "Articles Injected", value: blogPosts.length, desc: "News & Remarks", color: "bg-emerald-500 text-white" },
                { title: "Unread Letters", value: unreadMessagesCount, desc: "Pending Replies", color: unreadMessagesCount > 0 ? "bg-red-500 text-white" : "bg-slate-500 text-white" },
              ].map((card, i) => (
                <div key={i} className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs space-y-2">
                  <span className="text-slate-500 text-xs font-semibold block">{card.title}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-slate-900">{card.value}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block">{card.desc}</span>
                </div>
              ))}
            </div>

            {/* Quick action helper card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <h4 className="font-serif font-bold text-lg text-slate-900">Speed Creation Center</h4>
                <p className="text-slate-500 text-xs sm:max-w-md">Instantly inject a publication record, write an announcement, and sync updates directly to visitors.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => openAddModal('pub')} className="bg-[#0f172a] hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1 cursor-pointer">
                  <Plus className="h-4.5 w-4.5 text-amber-400" />
                  <span>Publication</span>
                </button>
                <button onClick={() => openAddModal('blog')} className="bg-[#0f172a] hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1 cursor-pointer">
                  <Plus className="h-4.5 w-4.5 text-amber-400" />
                  <span>Blog Post</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PUBLICATIONS */}
        {activeTab === 'publications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-serif text-2xl font-bold text-slate-900">Manage Publications</h3>
              <button 
                onClick={() => openAddModal('pub')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>Add Publication</span>
              </button>
            </div>

            <div className="space-y-3">
              {publications.map(pub => (
                <div key={pub.id} className="bg-white p-4 rounded-xl border border-slate-150 flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700">
                        {pub.type}
                      </span>
                      <span className="text-xs text-slate-400 font-bold font-mono">{pub.year}</span>
                    </div>
                    <h4 className="font-serif font-bold text-slate-900 text-sm line-clamp-1">{pub.title}</h4>
                    <p className="text-xs text-slate-500 italic max-w-lg truncate">{pub.publisher}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => openEditModal('pub', pub)}
                      className="p-2 border border-slate-200 hover:border-amber-500 hover:text-amber-600 rounded-lg transition"
                      title="Edit publications details"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem('pub', pub.id)}
                      className="p-2 border border-slate-200 hover:border-red-500 hover:text-red-650 rounded-lg transition"
                      title="Deletes publication"
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
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-serif text-2xl font-bold text-slate-900">Manage Research Projects</h3>
              <button 
                onClick={() => openAddModal('proj')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>Add Research</span>
              </button>
            </div>

            <div className="space-y-3">
              {projects.map(proj => (
                <div key={proj.id} className="bg-white p-4 rounded-xl border border-slate-150 flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full font-mono ${
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
                      className="p-2 border border-slate-200 hover:border-amber-500 hover:text-amber-600 rounded-lg transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem('proj', proj.id)}
                      className="p-2 border border-slate-200 hover:border-red-500 hover:text-red-500 rounded-lg transition"
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
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-serif text-2xl font-bold text-slate-900">Manage Blog & News Posts</h3>
              <button 
                onClick={() => openAddModal('blog')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>Write News Post</span>
              </button>
            </div>

            <div className="space-y-3">
              {blogPosts.map(post => (
                <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-150 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt={post.title} referrerPolicy="no-referrer" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="space-y-1">
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
                      className="p-2 border border-slate-200 hover:border-amber-500 hover:text-amber-600 rounded-lg transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem('blog', post.id)}
                      className="p-2 border border-slate-200 hover:border-red-500 hover:text-red-500 rounded-lg transition"
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
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-serif text-2xl font-bold text-slate-900">Manage Media Gallery</h3>
              <button 
                onClick={() => openAddModal('gal')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>Add Gallery Image</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map(img => (
                <div key={img.id} className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
                  <div className="relative aspect-video bg-slate-150">
                    <img src={img.imageUrl} alt={img.caption} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400">
                        <span className="text-amber-600">{img.category}</span>
                        <span>{img.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium line-clamp-2 pt-1">{img.caption}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteItem('gal', img.id)}
                      className="w-full inline-flex items-center justify-center space-x-1 border border-slate-200 hover:border-red-500 hover:text-red-550 py-2 rounded-lg text-xs font-semibold mt-2 cursor-pointer"
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
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-serif text-2xl font-bold text-slate-900">Inquiries Inbox</h3>
            </div>

            <div className="space-y-4">
              {messagesLoading ? (
                <div className="text-center py-10 text-xs text-slate-400 leading-relaxed font-mono">Syncing inbox messages...</div>
              ) : messages.length > 0 ? (
                messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`bg-white border rounded-2xl p-6 transition shadow-xs flex flex-col sm:flex-row gap-6 items-start justify-between ${
                      msg.read ? 'border-slate-150 bg-slate-50/50' : 'border-amber-200 bg-white shadow-sm ring-1 ring-amber-400/10'
                    }`}
                  >
                    <div className="space-y-2 flex-grow">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                          msg.read ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {msg.read ? 'read' : 'unread'}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">{msg.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({msg.email})</span>
                      </div>

                      <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base">{msg.subject}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg font-light mt-1">
                        {msg.message}
                      </p>
                      
                      <div className="text-[10px] font-mono text-slate-400 font-medium">
                        Received: {new Date(msg.date).toLocaleDateString()} {new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                      <button 
                        onClick={() => handleToggleRead(msg.id, msg.read)}
                        className={`p-2 border rounded-lg transition text-xs font-semibold flex items-center space-x-1 cursor-pointer ${
                          msg.read 
                            ? 'border-slate-200 hover:border-amber-500 hover:text-amber-600 text-slate-500' 
                            : 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100'
                        }`}
                        title={msg.read ? "Mark as unread" : "Mark as read"}
                      >
                        <Check className="h-4 w-4" />
                        <span>{msg.read ? "Mark Unread" : "Mark Read"}</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteMsg(msg.id)}
                        className="p-2 border border-slate-200 hover:border-red-500 hover:text-red-500 rounded-lg text-slate-400 transition"
                        title="Delete letter"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl py-12 px-6 text-center border border-slate-100 text-slate-500 space-y-2">
                  <Mail className="h-10 w-10 mx-auto text-slate-300" />
                  <p className="font-serif text-lg font-semibold">Inbox Empty</p>
                  <p className="text-xs">Incoming correspondences submitted from the portal will land here automatically.</p>
                </div>
              )}
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
                    <label className="text-[10px] font-bold uppercase text-slate-500">Publication Title *</label>
                    <input 
                      id="pub_title"
                      type="text" required value={pubForm.title} onChange={e => setPubForm({...pubForm, title: e.target.value})}
                      placeholder="e.g. Sociology of local microfinance systems..."
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Collaborating Authors</label>
                      <input 
                        id="pub_authors"
                        type="text" value={pubForm.authors} onChange={e => setPubForm({...pubForm, authors: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-255 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Publication Year *</label>
                      <input 
                        id="pub_year"
                        type="number" required value={pubForm.year} onChange={e => setPubForm({...pubForm, year: parseInt(e.target.value) || 2026})}
                        className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Format Category</label>
                      <select 
                        id="pub_format"
                        value={pubForm.type} onChange={e => setPubForm({...pubForm, type: e.target.value as any})}
                        className="w-full bg-slate-50 px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      >
                        <option value="book">Book (Monograph)</option>
                        <option value="journal">Journal Paper</option>
                        <option value="conference">Conference Presentation</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Publisher / Journal Title *</label>
                      <input 
                        id="pub_publisher"
                        type="text" required value={pubForm.publisher} onChange={e => setPubForm({...pubForm, publisher: e.target.value})}
                        placeholder="e.g. University of Uyo Press"
                        className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Full Text PDF Link (Optional URL)</label>
                    <input 
                      id="pub_link"
                      type="url" value={pubForm.link} onChange={e => setPubForm({...pubForm, link: e.target.value})}
                      placeholder="https://example.com/scholarly-pdf"
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Abstract Paper Summary</label>
                    <textarea 
                      id="pub_desc"
                      rows={4} value={pubForm.description} onChange={e => setPubForm({...pubForm, description: e.target.value})}
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
                    <label className="text-[10px] font-bold uppercase text-slate-500">Research Study Title *</label>
                    <input 
                      id="proj_title"
                      type="text" required value={projForm.title} onChange={e => setProjForm({...projForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Investigator Role *</label>
                      <input 
                        id="proj_role"
                        type="text" required value={projForm.role} onChange={e => setProjForm({...projForm, role: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Status</label>
                      <select 
                        id="proj_status"
                        value={projForm.status} onChange={e => setProjForm({...projForm, status: e.target.value as any})}
                        className="w-full bg-slate-50 px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      >
                        <option value="ongoing">Ongoing Fieldwork</option>
                        <option value="completed">Completed / Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Livelihood Timeline *</label>
                      <input 
                        id="proj_timeline"
                        type="text" required value={projForm.timeline} onChange={e => setProjForm({...projForm, timeline: e.target.value})}
                        placeholder="e.g., 2024 - Present"
                        className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Research Grant / Funding Agent</label>
                      <input 
                        id="proj_funding"
                        type="text" value={projForm.funding} onChange={e => setProjForm({...projForm, funding: e.target.value})}
                        placeholder="e.g. TetFund Grant Award"
                        className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Detailed Scope Description *</label>
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
                    <label className="text-[10px] font-bold uppercase text-slate-500">Article Title *</label>
                    <input 
                      id="blog_title"
                      type="text" required value={blogForm.title} onChange={e => setBlogForm({...blogForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Topic Category</label>
                      <select 
                        id="blog_category"
                        value={blogForm.category} onChange={e => setBlogForm({...blogForm, category: e.target.value})}
                        className="w-full bg-slate-50 px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      >
                        <option value="Announcements">Announcements</option>
                        <option value="Academic Notes">Academic Notes</option>
                        <option value="Conferences">Conferences</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Banner Web Image URL</label>
                      <input 
                        id="blog_img_url"
                        type="url" value={blogForm.imageUrl} onChange={e => setBlogForm({...blogForm, imageUrl: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Brief Excerpt *</label>
                    <input 
                      id="blog_excerpt"
                      type="text" required value={blogForm.excerpt} onChange={e => setBlogForm({...blogForm, excerpt: e.target.value})}
                      placeholder="Include a 1-2 sentence hook paragraph..."
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Full Narrative Content (Use double linebreaks for paragraphs) *</label>
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
                    <label className="text-[10px] font-bold uppercase text-slate-500">Asset image URL *</label>
                    <input 
                      id="gal_img_url"
                      type="url" required value={galForm.imageUrl} onChange={e => setGalForm({...galForm, imageUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Caption Description *</label>
                    <input 
                      id="gal_caption"
                      type="text" required value={galForm.caption} onChange={e => setGalForm({...galForm, caption: e.target.value})}
                      placeholder="e.g. Academic keynotes with delegates of UniUyo Sociology department..."
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Display Category</label>
                    <select 
                      id="gal_category"
                      value={galForm.category} onChange={e => setGalForm({...galForm, category: e.target.value})}
                      className="w-full bg-slate-50 px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="Lectures">Lectures</option>
                      <option value="Conferences">Conferences</option>
                      <option value="Fieldwork">Fieldwork</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Submit panel */}
              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  id="admin_modal_submit"
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold shadow transition cursor-pointer"
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
