import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { Publication, Transaction, Comment, FavoriteItem, BlogPost } from '../types';
import { fetchUserTransactions, fetchAllComments, fetchPublications, fetchUserFavorites, removeFavorite, updateUserProfile, fetchBlogPosts } from '../services/db';
import { 
  User as UserIcon, BookOpen, Heart, MessageSquare, CreditCard, 
  Download, ArrowRight, Calendar, Bookmark, CheckCircle2, AlertTriangle, ExternalLink,
  Newspaper, Sparkles, Book, Info
} from 'lucide-react';

export default function UserDashboard() {
  const { profile, logout, refreshProfile } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'downloads' | 'likes' | 'comments' | 'ledger' | 'profile'>('overview');

  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    schoolName: '',
    faculty: '',
    department: '',
    regNumber: '',
    phoneNumber: '',
    country: '',
    state: ''
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName || '',
        schoolName: profile.schoolName || '',
        faculty: profile.faculty || '',
        department: profile.department || '',
        regNumber: profile.regNumber || '',
        phoneNumber: profile.phoneNumber || '',
        country: profile.country || '',
        state: profile.state || ''
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    setProfileSuccess('');
    try {
      const updatedProfile = {
        ...profile,
        displayName: profileForm.displayName,
        schoolName: profileForm.schoolName,
        faculty: profileForm.faculty,
        department: profileForm.department,
        regNumber: profileForm.regNumber,
        phoneNumber: profileForm.phoneNumber,
        country: profileForm.country,
        state: profileForm.state
      };
      await updateUserProfile(updatedProfile);
      await refreshProfile();
      setProfileSuccess('Academic profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      console.error("Profile update failed", err);
      window.alert("Failed to update profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [viewingPub, setViewingPub] = useState<Publication | null>(null);

  const loadDashboardData = async () => {
    if (!profile) return;
    try {
      const [allPubs, userTxns, allComments, userFavs, allBlogs] = await Promise.all([
        fetchPublications(),
        fetchUserTransactions(profile.uid),
        fetchAllComments(),
        fetchUserFavorites(profile.uid),
        fetchBlogPosts()
      ]);

      setPublications(allPubs);
      setTransactions(userTxns || []);
      setFavorites(userFavs || []);
      setBlogPosts(allBlogs || []);
      
      // Filter user comments
      const userComments = allComments.filter(c => c.userId === profile.uid);
      setComments(userComments);
    } catch (err) {
      console.error("Error loading dashboard utilities", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  const handleRemoveFavoriteItem = async (favId: string) => {
    try {
      if (!profile) return;
      await removeFavorite(favId, profile.uid);
      setFavorites(prev => prev.filter(f => f.id !== favId));
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  if (!profile) {
    return (
      <div className="py-12 border border-navy/10 max-w-lg mx-auto bg-white p-6 justify-center text-center">
        <p className="text-sm text-navy/70 mb-4">Please log in to view academic dashboard assets.</p>
      </div>
    );
  }

  // Purchased Publications filter
  const purchasedIds = profile.purchasedPublications || [];
  const purchasedPubs = publications.filter(p => purchasedIds.includes(p.id) || !p.isPaid); // also let free ones show in downloads if liked or if desired

  // Filter specific purchases to be absolutely sure
  const actualPurchases = publications.filter(p => purchasedIds.includes(p.id));

  // Liked Publications
  const likedIds = profile.likedPublications || [];
  const likedPubs = publications.filter(p => likedIds.includes(p.id));

  // Donations ledger sums
  const totalDonations = transactions
    .filter(t => t.type === 'donation' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const formattedDate = profile.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently';

  const handleOpenViewer = (pub: Publication) => {
    setViewingPub(pub);
    setPdfViewerOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Top Profile Banner */}
      <div id="dashboard-hero" className="bg-[#f0ece3] border border-navy/10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 border-r border-t border-gold/25 transform rotate-45 translate-x-12 -translate-y-12" />
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-navy text-gold flex items-center justify-center font-serif text-2xl font-bold">
            {profile.displayName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-navy uppercase tracking-tight">{profile.displayName}</h1>
            <div className="flex items-center gap-3 mt-1 font-mono text-[10px] text-navy/60 uppercase">
              <span className="bg-gold/20 text-navy font-bold px-2 py-0.5 rounded-none border border-gold/30">
                {profile.isAdmin ? "Administrator Elite" : "Vetted Scholar Member"}
              </span>
              <span>Joined {formattedDate}</span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="cursor-pointer font-mono text-[10px] uppercase font-bold text-red-700 border border-red-200 hover:bg-red-50 px-4 py-2 transition duration-300 bg-white"
        >
          De-authenticate Account
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="h-8 w-8 border-3 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs text-navy/60">Fetching portal telemetry ledger...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Rails */}
          <div className="md:col-span-3 flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`cursor-pointer w-full text-left px-4 py-3 font-mono text-xs uppercase tracking-wider flex items-center justify-between transition ${
                activeTab === 'overview' ? 'bg-navy text-gold font-bold' : 'bg-white border border-navy/5 text-navy/70 hover:bg-[#fbf9f4]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <UserIcon className="h-4 w-4" />
                <span>Overview Matrix</span>
              </span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              onClick={() => setActiveTab('downloads')}
              className={`cursor-pointer w-full text-left px-4 py-3 font-mono text-xs uppercase tracking-wider flex items-center justify-between transition ${
                activeTab === 'downloads' ? 'bg-navy text-gold font-bold' : 'bg-white border border-navy/5 text-navy/70 hover:bg-[#fbf9f4]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4" />
                <span>Library Access ({actualPurchases.length})</span>
              </span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`cursor-pointer w-full text-left px-4 py-3 font-mono text-xs uppercase tracking-wider flex items-center justify-between transition ${
                activeTab === 'likes' ? 'bg-navy text-gold font-bold' : 'bg-white border border-navy/5 text-navy/70 hover:bg-[#fbf9f4]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Heart className="h-4 w-4" />
                <span>Bookmarks ({likedPubs.length})</span>
              </span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`cursor-pointer w-full text-left px-4 py-3 font-mono text-xs uppercase tracking-wider flex items-center justify-between transition ${
                activeTab === 'comments' ? 'bg-navy text-gold font-bold' : 'bg-white border border-navy/5 text-navy/70 hover:bg-[#fbf9f4]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4" />
                <span>Feedback History ({comments.length})</span>
              </span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`cursor-pointer w-full text-left px-4 py-3 font-mono text-xs uppercase tracking-wider flex items-center justify-between transition ${
                activeTab === 'ledger' ? 'bg-navy text-gold font-bold' : 'bg-white border border-navy/5 text-navy/70 hover:bg-[#fbf9f4]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4" />
                <span>Payment Records ({transactions.length})</span>
              </span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`cursor-pointer w-full text-left px-4 py-3 font-mono text-xs uppercase tracking-wider flex items-center justify-between transition ${
                activeTab === 'profile' ? 'bg-navy text-gold font-bold' : 'bg-white border border-navy/5 text-navy/70 hover:bg-[#fbf9f4]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <UserIcon className="h-4 w-4" />
                <span>Scholar Profile</span>
              </span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Right Console Grid panels */}
          <div className="md:col-span-9 bg-white border border-navy/10 p-6 md:p-8 shadow-xs">
            
            {/* OVERVIEW PANEL */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-lg text-navy uppercase tracking-tight mb-1">Scholar Profile Matrix</h3>
                  <p className="text-slate-500 text-xs">A comprehensive operational overview of your academic identity and support status.</p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-[#fcfbf7] border border-navy/5 p-4 flex flex-col justify-between">
                    <span className="font-mono text-[9px] uppercase text-navy/50 tracking-wider">Purchased Studies</span>
                    <span className="font-serif text-3xl font-bold text-navy mt-2">{actualPurchases.length}</span>
                    <span className="text-[10px] text-gold/80 block mt-2 font-mono">Unlock rate: {Math.round(publications.length ? (actualPurchases.length/publications.length)*100 : 0)}%</span>
                  </div>
                  <div className="bg-[#fcfbf7] border border-navy/5 p-4 flex flex-col justify-between">
                    <span className="font-mono text-[9px] uppercase text-navy/50 tracking-wider">Scholarly Comments</span>
                    <span className="font-serif text-3xl font-bold text-navy mt-2">{comments.length}</span>
                    <span className="text-[10px] text-green-700 block mt-2 font-mono">
                      Approved: {comments.filter(c => c.status === 'approved').length}
                    </span>
                  </div>
                  <div className="bg-[#fcfbf7] border border-navy/5 p-4 flex flex-col justify-between">
                    <span className="font-mono text-[9px] uppercase text-navy/50 tracking-wider">Support Donations</span>
                    <span className="font-serif text-2xl font-bold text-navy mt-2">₦{totalDonations.toLocaleString()}</span>
                    <span className="text-[10px] text-gold block mt-2 font-mono">Academic Philanthropy</span>
                  </div>
                </div>

                {/* HOME AT A GLANCE PORTAL FEED */}
                <div className="border-t border-navy/5 pt-6 space-y-6">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-gold" />
                    <h4 className="font-serif font-bold text-base text-navy uppercase tracking-tight">Home At A Glance</h4>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* news feed / chronicles */}
                    <div className="bg-[#fdfcf9] border border-navy/5 p-5 space-y-4 rounded-xs">
                      <div className="flex items-center justify-between border-b border-navy/5 pb-2">
                        <span className="font-serif font-bold text-xs text-navy uppercase tracking-wider flex items-center gap-1.5">
                          <Newspaper className="h-4 w-4 text-gold" />
                          <span>Latest Portal Chronicles</span>
                        </span>
                        <span className="font-mono text-[9px] text-navy/40 font-bold">News & Announcements</span>
                      </div>
                      
                      {blogPosts.length === 0 ? (
                        <div className="text-center py-6 text-xs text-navy/50 font-mono">No chronicles have been published yet.</div>
                      ) : (
                        <div className="space-y-4">
                          {blogPosts.slice(0, 2).map(post => (
                            <div key={post.id} className="group space-y-2 text-left">
                              <div className="flex items-center gap-2 text-[9px] font-mono text-navy/40 font-bold uppercase">
                                <span className="text-amber-700">{post.category}</span>
                                <span>&bull;</span>
                                <span>{post.date}</span>
                              </div>
                              <h5 className="font-serif font-bold text-navy text-xs group-hover:text-amber-700 transition line-clamp-1">{post.title}</h5>
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                              <button 
                                onClick={() => setSelectedPost(post)}
                                className="cursor-pointer text-[9px] font-mono font-bold text-navy/80 hover:text-navy hover:underline flex items-center gap-1 uppercase"
                              >
                                <span>Read announcement</span>
                                <ArrowRight className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* recent library monographs */}
                    <div className="bg-[#fdfcf9] border border-navy/5 p-5 space-y-4 rounded-xs">
                      <div className="flex items-center justify-between border-b border-navy/5 pb-2">
                        <span className="font-serif font-bold text-xs text-navy uppercase tracking-wider flex items-center gap-1.5">
                          <Book className="h-4 w-4 text-gold" />
                          <span>Suggested Studies</span>
                        </span>
                        <span className="font-mono text-[9px] text-navy/40 font-bold">New Publications</span>
                      </div>

                      {publications.length === 0 ? (
                        <div className="text-center py-6 text-xs text-navy/50 font-mono">No publications available in library catalog.</div>
                      ) : (
                        <div className="space-y-4">
                          {publications.slice(0, 2).map(pub => (
                            <div key={pub.id} className="space-y-1.5 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono font-bold uppercase bg-navy/5 text-navy/60 px-1.5 py-0.5 rounded-none">
                                  {pub.type}
                                </span>
                                <span className="font-mono text-[9px] font-bold text-amber-700">
                                  {pub.isPaid ? `₦${pub.price?.toLocaleString()}` : 'Free Access'}
                                </span>
                              </div>
                              <h5 className="font-serif font-bold text-navy text-xs line-clamp-1" title={pub.title}>{pub.title}</h5>
                              <p className="text-[10px] text-slate-400 font-medium truncate">{pub.authors} ({pub.year})</p>
                              <button 
                                onClick={() => setActiveTab('downloads')}
                                className="cursor-pointer text-[9px] font-mono font-bold text-navy/80 hover:text-navy hover:underline flex items-center gap-1 uppercase"
                              >
                                <span>Access in library</span>
                                <ArrowRight className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PROFILE PANEL */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-lg text-navy uppercase tracking-tight mb-1">Scholar Profile Matrix</h3>
                  <p className="text-slate-500 text-xs">Manage your academic identity, institution details, and account configuration parameters.</p>
                </div>

                <div className="pt-6 border-t border-navy/5 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-navy uppercase">Academic Institution Details</h4>
                      <p className="text-slate-500 text-[11px] mt-0.5">Please provide your school, faculty, department, registration number, and location parameters.</p>
                    </div>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="cursor-pointer bg-white hover:bg-[#fbf9f4] border border-navy/20 px-3 py-1 text-xs uppercase font-mono font-bold text-navy transition"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {profileSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{profileSuccess}</span>
                    </div>
                  )}

                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-slate-600 font-mono text-[10px] uppercase font-bold">Full Name</label>
                          <input
                            type="text"
                            required
                            value={profileForm.displayName}
                            onChange={e => setProfileForm({ ...profileForm, displayName: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 focus:border-amber-500 focus:outline-none bg-white text-navy font-sans"
                            placeholder="e.g. John Doe"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-slate-600 font-mono text-[10px] uppercase font-bold">Name of School</label>
                          <input
                            type="text"
                            value={profileForm.schoolName}
                            onChange={e => setProfileForm({ ...profileForm, schoolName: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 focus:border-amber-500 focus:outline-none bg-white text-navy font-sans"
                            placeholder="e.g. University of Uyo"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-slate-600 font-mono text-[10px] uppercase font-bold">Faculty</label>
                          <input
                            type="text"
                            value={profileForm.faculty}
                            onChange={e => setProfileForm({ ...profileForm, faculty: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 focus:border-amber-500 focus:outline-none bg-white text-navy font-sans"
                            placeholder="e.g. Social Sciences"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-slate-600 font-mono text-[10px] uppercase font-bold">Department</label>
                          <input
                            type="text"
                            value={profileForm.department}
                            onChange={e => setProfileForm({ ...profileForm, department: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 focus:border-amber-500 focus:outline-none bg-white text-navy font-sans"
                            placeholder="e.g. Sociology and Anthropology"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-slate-600 font-mono text-[10px] uppercase font-bold">Registration Number</label>
                          <input
                            type="text"
                            value={profileForm.regNumber}
                            onChange={e => setProfileForm({ ...profileForm, regNumber: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 focus:border-amber-500 focus:outline-none bg-white text-navy font-sans"
                            placeholder="e.g.UU/19/SS/SOC/001"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-slate-600 font-mono text-[10px] uppercase font-bold">Phone Number</label>
                          <input
                            type="tel"
                            value={profileForm.phoneNumber}
                            onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 focus:border-amber-500 focus:outline-none bg-white text-navy font-sans"
                            placeholder="e.g. +234 800 000 0000"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-slate-600 font-mono text-[10px] uppercase font-bold">Country</label>
                          <input
                            type="text"
                            value={profileForm.country}
                            onChange={e => setProfileForm({ ...profileForm, country: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 focus:border-amber-500 focus:outline-none bg-white text-navy font-sans"
                            placeholder="e.g. Nigeria"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-slate-600 font-mono text-[10px] uppercase font-bold">State</label>
                          <input
                            type="text"
                            value={profileForm.state}
                            onChange={e => setProfileForm({ ...profileForm, state: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 focus:border-amber-500 focus:outline-none bg-white text-navy font-sans"
                            placeholder="e.g. Akwa Ibom"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 pt-2">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="cursor-pointer bg-navy text-white hover:bg-gold hover:text-navy px-4 py-2 font-mono uppercase text-[10px] font-bold transition disabled:opacity-50"
                        >
                          {savingProfile ? 'Saving...' : 'Save Profile'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="cursor-pointer border border-navy/20 text-navy hover:bg-[#fbf9f4] px-4 py-2 font-mono uppercase text-[10px] font-bold transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-[#fdfcf9] border border-navy/5 flex flex-col justify-between">
                          <span className="text-[9px] uppercase text-slate-400 font-mono font-bold tracking-wider">Name of School</span>
                          <span className="font-medium text-navy block mt-1">
                            {profile.schoolName || <span className="italic text-slate-400">Not Provided</span>}
                          </span>
                        </div>
                        <div className="p-3 bg-[#fdfcf9] border border-navy/5 flex flex-col justify-between">
                          <span className="text-[9px] uppercase text-slate-400 font-mono font-bold tracking-wider">Faculty</span>
                          <span className="font-medium text-navy block mt-1">
                            {profile.faculty || <span className="italic text-slate-400">Not Provided</span>}
                          </span>
                        </div>
                        <div className="p-3 bg-[#fdfcf9] border border-navy/5 flex flex-col justify-between">
                          <span className="text-[9px] uppercase text-slate-400 font-mono font-bold tracking-wider">Department</span>
                          <span className="font-medium text-navy block mt-1">
                            {profile.department || <span className="italic text-slate-400">Not Provided</span>}
                          </span>
                        </div>
                        <div className="p-3 bg-[#fdfcf9] border border-navy/5 flex flex-col justify-between">
                          <span className="text-[9px] uppercase text-slate-400 font-mono font-bold tracking-wider">Registration Number</span>
                          <span className="font-mono text-navy block mt-1">
                            {profile.regNumber || <span className="italic text-slate-400">Not Provided</span>}
                          </span>
                        </div>
                        <div className="p-3 bg-[#fdfcf9] border border-[#002147]/5 flex flex-col justify-between">
                          <span className="text-[9px] uppercase text-slate-400 font-mono font-bold tracking-wider">Phone Number</span>
                          <span className="font-medium text-[#002147] block mt-1">
                            {profile.phoneNumber || <span className="italic text-slate-400">Not Provided</span>}
                          </span>
                        </div>
                        <div className="p-3 bg-[#fdfcf9] border border-[#002147]/5 flex flex-col justify-between">
                          <span className="text-[9px] uppercase text-slate-400 font-mono font-bold tracking-wider">Country &amp; State</span>
                          <span className="font-medium text-[#002147] block mt-1">
                            {profile.country || profile.state ? (
                              <span>
                                {profile.state ? `${profile.state}, ` : ''}
                                {profile.country || ''}
                              </span>
                            ) : (
                              <span className="italic text-slate-400">Not Provided</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 text-xs pt-2">
                        <div className="p-3 bg-slate-50 border border-slate-200">
                          <span className="text-[9px] uppercase text-slate-400 block font-mono font-bold">User ID Key</span>
                          <span className="font-mono text-[10px] text-slate-500 block mt-1 truncate select-all">{profile.uid}</span>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200">
                          <span className="text-[9px] uppercase text-slate-400 block font-mono font-bold">E-Mail Endpoint</span>
                          <span className="font-medium text-slate-500 block mt-1 truncate">{profile.email}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DOWNLOADS/LIBRARY */}
            {activeTab === 'downloads' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-lg text-navy uppercase tracking-tight mb-1">Scholar Library Access</h3>
                  <p className="text-slate-500 text-xs">Your purchased monographs and publications. Click any item to access full drafts.</p>
                </div>

                {purchasedPubs.length === 0 ? (
                  <div className="py-12 border border-dashed border-navy/15 text-center bg-[#fdfcf9]">
                    <BookOpen className="h-8 w-8 text-navy/40 mx-auto mb-2" />
                    <p className="font-mono text-xs text-navy/70 uppercase">No active acquisitions on record.</p>
                    <p className="text-[11px] text-slate-500 mt-1">Paid papers are added instantenously here post-purchase.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-navy/10">
                    {purchasedPubs.map(pub => (
                      <div key={pub.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50 border border-green-200 text-green-800 text-[9px] font-mono uppercase mb-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Unlocked Access
                          </span>
                          <h4 className="font-serif font-bold text-sm text-navy">{pub.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 font-mono">Publisher: {pub.publisher} &bull; {pub.year}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenViewer(pub)}
                            className="cursor-pointer px-3 py-1.5 bg-navy text-[#fdfcf9] hover:bg-gold hover:text-navy font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 transition"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Read Online</span>
                          </button>
                          {pub.downloadUrl && (
                            <a
                              href={pub.downloadUrl}
                              target="_blank"
                              rel="noreferrer referrer"
                              className="px-3 py-1.5 border border-navy/20 hover:border-navy text-navy font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 transition"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download PDF</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* LIKED PUBLICATIONS & DEPLOYED FAVORITES */}
            {activeTab === 'likes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-lg text-navy uppercase tracking-tight mb-1">Bookmarked Research</h3>
                  <p className="text-slate-500 text-xs">Curated publications you have liked on the site for direct references.</p>
                </div>

                {likedPubs.length === 0 ? (
                  <div className="py-8 border border-dashed border-navy/15 text-center bg-[#fdfcf9]">
                    <Heart className="h-8 w-8 text-navy/40 mx-auto mb-2" />
                    <p className="font-mono text-xs text-navy/70 uppercase">No bookmarks mapped.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-navy/5">
                    {likedPubs.map(pub => (
                      <div key={pub.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-3">
                        <Bookmark className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-serif font-bold text-sm text-navy hover:text-gold transition">
                            {pub.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 leading-normal font-mono">{pub.authors} &bull; {pub.year}</p>
                          {pub.isPaid && !purchasedIds.includes(pub.id) && (
                            <span className="inline-block mt-1 bg-amber-50 text-amber-800 text-[9px] font-mono border border-amber-200 px-1.5">
                              Premium (₦{pub.price?.toLocaleString()})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* DEDICATED FAVORITES SYSTEM SECTION */}
                <div className="pt-6 border-t border-navy/10 space-y-4">
                  <div>
                    <h3 className="font-serif font-bold text-base text-navy uppercase tracking-tight mb-1">Durable Starred Favorites</h3>
                    <p className="text-slate-500 text-xs">Starred entries persisted directly onto our Firebase firestore data servers.</p>
                  </div>
                  
                  {favorites.length === 0 ? (
                    <div className="py-6 border border-dashed border-navy/10 text-center bg-[#fdfcf9]">
                      <Bookmark className="h-6 w-6 text-navy/35 mx-auto mb-1.5 animate-pulse" />
                      <p className="font-mono text-[9px] uppercase text-navy/60">No stored favorites on remote server.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {favorites.map(fav => {
                        return (
                          <div key={fav.id} className="p-4 bg-white border border-navy/10 shadow-xs flex flex-col justify-between space-y-2 rounded text-left">
                            <div>
                              <span className="text-[9px] uppercase font-mono font-bold text-[#D4AF37] tracking-widest bg-amber-50 px-2 py-0.5 border border-amber-100">
                                {fav.contentType || 'Publication'}
                              </span>
                              <h4 className="font-serif font-bold text-xs text-navy mt-1 line-clamp-2">
                                {fav.title}
                              </h4>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-navy/5">
                              <span className="font-mono text-[9px] text-slate-400">Added {new Date(fav.createdAt).toLocaleDateString()}</span>
                              <button
                                onClick={() => handleRemoveFavoriteItem(fav.id)}
                                className="cursor-pointer font-mono text-[9px] uppercase font-bold text-rose-600 hover:text-rose-800"
                              >
                                Remove Favorite
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* FEEDBACK HISTORY */}
            {activeTab === 'comments' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-lg text-navy uppercase tracking-tight mb-1">Editorial Feedback History</h3>
                  <p className="text-slate-500 text-xs">Your commentary and scholarly opinions posted on the publication assets. Status rules prevent spam.</p>
                </div>

                {comments.length === 0 ? (
                  <div className="py-12 border border-dashed border-navy/15 text-center bg-[#fdfcf9]">
                    <MessageSquare className="h-8 w-8 text-navy/40 mx-auto mb-2" />
                    <p className="font-mono text-xs text-navy/70 uppercase">No comment logs returned.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map(c => (
                      <div key={c.id} className="p-4 bg-[#fdfcf9] border border-navy/5 space-y-2">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <span className="font-serif font-bold text-xs text-navy block truncate max-w-sm">
                            Under: "{c.publicationTitle}"
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-mono uppercase ${
                            c.status === 'approved' 
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                              : c.status === 'rejected' 
                              ? 'bg-red-50 border border-red-200 text-red-800' 
                              : 'bg-amber-50 border border-amber-200 text-amber-800'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs italic text-navy/80 leading-relaxed bg-white border border-navy/5 p-2 font-sans">
                          "{c.text}"
                        </p>
                        <span className="block text-[9px] text-slate-500 font-mono text-right">
                          Submitted on {new Date(c.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* LEDGER/TRANSACTION HISTORY */}
            {activeTab === 'ledger' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-lg text-navy uppercase tracking-tight mb-1">Financial Ledgers</h3>
                  <p className="text-slate-500 text-xs">Audited transactions, acquisitions, and donations processed via the Paystack system under your identity.</p>
                </div>

                {transactions.length === 0 ? (
                  <div className="py-12 border border-dashed border-navy/15 text-center bg-[#fdfcf9]">
                    <CreditCard className="h-8 w-8 text-navy/40 mx-auto mb-2" />
                    <p className="font-mono text-xs text-navy/70 uppercase">No ledger balances found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-navy/10 font-mono text-[10px] text-navy/60 uppercase">
                          <th className="py-2.5">Ref ID</th>
                          <th className="py-2.5">Date</th>
                          <th className="py-2.5">Category</th>
                          <th className="py-2.5">Amount</th>
                          <th className="py-2.5">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy/5 font-sans">
                        {transactions.map(t => (
                          <tr key={t.id} className="hover:bg-navy/[0.01]">
                            <td className="py-3 font-mono text-[10px] text-navy/80 truncate max-w-[80px]" title={t.reference}>
                              {t.reference}
                            </td>
                            <td className="py-3 text-slate-500">
                              {new Date(t.date).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              <span className="block font-medium text-navy text-xs">
                                {t.type === 'purchase' ? 'Publication Purchase' : 'Philanthropy Support'}
                              </span>
                              {t.publicationTitle && (
                                <span className="block text-[10px] text-slate-400 truncate max-w-[150px]">
                                  {t.publicationTitle}
                                </span>
                              )}
                            </td>
                            <td className="py-3 font-semibold text-navy">
                              ₦{t.amount.toLocaleString()}
                            </td>
                            <td className="py-3">
                              <span className={`inline-block px-2 py-0.5 text-[8px] font-mono uppercase ${
                                t.status === 'success' 
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                  : t.status === 'failed' 
                                  ? 'bg-red-50 text-red-850 border border-red-200' 
                                  : 'bg-amber-50 text-amber-850 border border-amber-200'
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

          </div>

        </div>
      )}

      {/* PDF Mock document viewer modal */}
      {pdfViewerOpen && viewingPub && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left">
          <div className="bg-[#fdfcf9] border border-navy/20 shadow-2xl max-w-3xl w-full h-[85vh] flex flex-col relative animate-slide-up">
            <div className="absolute top-0 inset-x-0 h-[4px] bg-gold" />
            
            {/* Modal Header */}
            <div className="p-5 border-b border-navy/10 flex justify-between items-start gap-4">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-gold block font-bold">Academic Reader Engine</span>
                <h3 className="font-serif font-bold text-base text-navy uppercase leading-snug mt-1">{viewingPub.title}</h3>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">Author(s): {viewingPub.authors} &bull; University of Uyo Publishing</p>
              </div>
              <button
                onClick={() => setPdfViewerOpen(false)}
                className="cursor-pointer font-mono text-xs uppercase font-bold text-navy hover:text-gold px-2 py-1 border border-navy/20 self-start"
              >
                Close
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6 font-serif leading-relaxed text-navy select-none">
              <div className="p-4 bg-navy/[0.02] border-l-2 border-gold font-sans text-xs italic leading-relaxed text-slate-700">
                <span className="font-bold text-navy block not-italic uppercase font-mono text-[9px] tracking-wider mb-1">Executive abstract</span>
                "{viewingPub.description || 'No summary registered for this monograph.'}"
              </div>

              <div className="space-y-4">
                <h4 className="font-bold font-serif text-lg border-b border-navy/5 pb-1">I. INTRODUCTION & STRUCTURAL BACKGROUND</h4>
                <p className="text-xs">
                  Within the socioeconomic dynamics of Akwa Ibom State, sociology serves as an essential framework for contextualizing urban transition paradigms. Delinquent activities, modern policing failures, and public relations models operate simultaneously within localized control institutions. In order to evaluate sociological recidivism rates inside secondary colleges in Uyo municipal, we must construct multi-tiered empirical appraisals of child-family linkages.
                </p>
                <p className="text-xs">
                  This academic draft assesses the active community-policing alliances, establishing statistical frameworks based on grassroots questionnaires. Standard regression formulas indicate that juvenile deviancy corresponds directly to domestic sub-structural breakdowns and school management boundaries.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <h4 className="font-bold font-serif text-lg border-b border-navy/5 pb-1">II. RESEARCH METHDOLOGY</h4>
                <p className="text-xs">
                  A stratified random sampling method was utilized to distribute questionnaires across 4 public secondary structures across Uyo. Statistical calculations map criminological variables across Pearson product-moment coefficient grids...
                </p>
              </div>

              {/* Watermark security */}
              <div className="py-8 text-center text-gold/15 select-none pointer-events-none uppercase font-mono font-bold tracking-[0.2em] text-[10px]">
                Authorized for {profile.email} &bull; Academic Portal Security Checked
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#f0ece3] border-t border-navy/10 flex justify-between items-center sm:text-xs">
              <span className="font-mono text-[10px] text-navy/70">Secure Session Verified &bull; ISO Criminology Standard</span>
              <button
                onClick={() => setPdfViewerOpen(false)}
                className="cursor-pointer bg-navy text-gold hover:text-navy hover:bg-gold px-4 py-2 font-mono uppercase text-[10px] font-bold"
              >
                Conclude Session
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CHRONICLE ANNOUNCEMENT VIEWER MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left">
          <div className="bg-[#fdfcf9] border border-navy/20 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col relative animate-slide-up">
            <div className="absolute top-0 inset-x-0 h-[4px] bg-gold" />
            
            {/* Modal Header */}
            <div className="p-5 border-b border-navy/10 flex justify-between items-start gap-4">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-gold block font-bold">{selectedPost.category} &bull; Announcement</span>
                <h3 className="font-serif font-bold text-lg text-navy uppercase leading-snug mt-1">{selectedPost.title}</h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Published on: {selectedPost.date}</p>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="cursor-pointer font-mono text-xs uppercase font-bold text-navy hover:text-gold px-2.5 py-1 border border-navy/20"
              >
                Close
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-grow p-6 overflow-y-auto space-y-4 font-serif leading-relaxed text-navy">
              {selectedPost.imageUrl && (
                <div className="aspect-video relative overflow-hidden bg-slate-100 border border-navy/10 mb-2">
                  <img src={selectedPost.imageUrl} alt={selectedPost.title} referrerPolicy="no-referrer" className="object-cover w-full h-full" />
                </div>
              )}
              <p className="font-sans text-xs font-semibold text-slate-700 bg-navy/[0.02] p-3 border-l-2 border-gold italic">
                "{selectedPost.excerpt}"
              </p>
              <div className="text-xs text-slate-800 font-sans space-y-3 leading-relaxed whitespace-pre-wrap">
                {selectedPost.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#f0ece3] border-t border-navy/10 flex justify-end">
              <button
                onClick={() => setSelectedPost(null)}
                className="cursor-pointer bg-navy text-gold hover:text-navy hover:bg-gold px-4 py-2 font-mono uppercase text-[10px] font-bold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
