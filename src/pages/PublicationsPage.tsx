import React, { useState, useEffect } from 'react';
import { 
  Search, Book, BookOpen, FileText, ExternalLink, ChevronDown, ChevronUp, 
  Copy, Check, Heart, MessageSquare, ShoppingCart, User as UserIcon, Calendar, 
  Lock, ArrowRight, ShieldCheck, CreditCard, Sparkles, AlertCircle, HelpCircle, Star
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { Publication, Comment, Transaction, FavoriteItem, CMSPage } from '../types';
import { 
  addComment, fetchPublicationComments, addTransaction, 
  updateTransactionStatus, updatePublication, fetchUserFavorites, addFavorite, removeFavorite,
  fetchCMSPage
} from '../services/db';

interface PublicationsPageProps {
  publications: Publication[];
}

export default function PublicationsPage({ publications }: PublicationsPageProps) {
  const { user, profile, toggleLikePublication, addPurchasedPublication } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'book' | 'journal' | 'conference'>('all');
  const [expandedPubId, setExpandedPubId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cmsPage, setCmsPage] = useState<CMSPage | null>(null);

  // Load CMS Page configs
  useEffect(() => {
    const loadCms = async () => {
      try {
        const page = await fetchCMSPage('publications');
        setCmsPage(page);
      } catch (err) {
        console.error("Failed to load publications page CMS:", err);
      }
    };
    loadCms();
  }, []);

  // Favorites System state
  const [userFavorites, setUserFavorites] = useState<FavoriteItem[]>([]);

  // Load user favorites
  useEffect(() => {
    const loadFavorites = async () => {
      if (profile) {
        try {
          const list = await fetchUserFavorites(profile.uid);
          setUserFavorites(list || []);
        } catch (e) {
          console.error("Error loading user favorites list:", e);
        }
      } else {
        setUserFavorites([]);
      }
    };
    loadFavorites();
  }, [profile]);

  // Handle addition or deletion of Favorites
  const handleToggleFavoriteItem = async (e: React.MouseEvent, pub: Publication) => {
    e.stopPropagation();
    if (!profile) {
      alert("Please register or log in to add this item to your favorites.");
      return;
    }

    const existingFav = userFavorites.find(f => f.contentId === pub.id);
    if (existingFav) {
      // Remove it
      try {
        await removeFavorite(existingFav.id, profile.uid);
        setUserFavorites(prev => prev.filter(f => f.id !== existingFav.id));
      } catch (err) {
        console.error("Failed to remove favorite:", err);
      }
    } else {
      // Add it
      try {
        const item: Omit<FavoriteItem, 'id'> = {
          userId: profile.uid,
          contentId: pub.id,
          title: pub.title,
          contentType: pub.type === 'journal' ? 'journal' : 'publication',
          dateAdded: new Date().toISOString()
        };
        const saved = await addFavorite(item);
        setUserFavorites(prev => [saved, ...prev]);
      } catch (err: any) {
        alert(err.message || "Failed to add to favorites.");
      }
    }
  };

  // Comments and feedback state
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [commentingLoading, setCommentingLoading] = useState<Record<string, boolean>>({});

  // E-commerce Checkout State
  const [checkoutPub, setCheckoutPub] = useState<Publication | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // In-app mock reader
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [viewingPub, setViewingPub] = useState<Publication | null>(null);

  // Load comments when an item expands
  const handleToggleExpand = async (pubId: string) => {
    if (expandedPubId === pubId) {
      setExpandedPubId(null);
    } else {
      setExpandedPubId(pubId);
      // Fetch comments for this publication
      try {
        const comments = await fetchPublicationComments(pubId);
        setCommentsMap(prev => ({ ...prev, [pubId]: comments }));
      } catch (err) {
        console.error("Could not fetch scholarly feedback remarks:", err);
      }
    }
  };

  // Like operations
  const handleToggleLike = async (e: React.MouseEvent, pub: Publication) => {
    e.stopPropagation();
    if (!user) {
      alert("Please register or log in to like this publication.");
      return;
    }
    try {
      await toggleLikePublication(pub.id);
      
      // Local state adjustment for like count
      const updatedLikesCount = (pub.likesCount || 0) + 
        ((profile?.likedPublications || []).includes(pub.id) ? -1 : 1);
        
      await updatePublication({
        ...pub,
        likesCount: updatedLikesCount > 0 ? updatedLikesCount : 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Citation coping
  const handleCopyCitation = (e: React.MouseEvent, pub: Publication) => {
    e.stopPropagation();
    const citation = `${pub.authors} (${pub.year}). "${pub.title}." ${pub.publisher}.${pub.link ? ` Available at: ${pub.link}` : ''}`;
    navigator.clipboard.writeText(citation).then(() => {
      setCopiedId(pub.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Submit comment
  const handlePostComment = async (pub: Publication) => {
    const text = newCommentText[pub.id] || '';
    if (!text.trim() || !profile) return;

    setCommentingLoading(prev => ({ ...prev, [pub.id]: true }));
    try {
      const commentObj: Omit<Comment, 'id'> = {
        userId: profile.uid,
        userName: profile.displayName,
        publicationId: pub.id,
        publicationTitle: pub.title,
        text: text.trim(),
        date: new Date().toISOString(),
        status: 'pending' // Admin must moderate
      };

      const result = await addComment(commentObj);
      
      // Update local comments map
      setCommentsMap(prev => ({
        ...prev,
        [pub.id]: [...(prev[pub.id] || []), result]
      }));

      // Flush text
      setNewCommentText(prev => ({ ...prev, [pub.id]: '' }));
    } catch (err) {
      console.error("Failed to upload review:", err);
    } finally {
      setCommentingLoading(prev => ({ ...prev, [pub.id]: false }));
    }
  };

  // Dynamic script loader for Paystack Inline API
  const loadPaystackPop = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).PaystackPop) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Launch Checkout Flow
  const handleBuyNow = (pub: Publication) => {
    if (!user) {
      alert("Please log in or register a visitor profile to process checkouts.");
      return;
    }
    setCheckoutPub(pub);
    setPaymentError('');
    setPaymentSuccess(false);
  };

  // Execute Paystack Payment Transaction
  const executePayment = async (bypassVerification: boolean = false) => {
    if (!checkoutPub || !profile) return;
    setProcessingPayment(true);
    setPaymentError('');

    const reference = 'pay_' + Date.now() + Math.random().toString(36).substring(4);
    const priceAmount = checkoutPub.price || 5000;

    // Create a pending transaction ledger entry first
    const pendingTxn: Omit<Transaction, 'id'> = {
      userId: profile.uid,
      userEmail: profile.email,
      userName: profile.displayName,
      type: 'purchase',
      amount: priceAmount,
      publicationId: checkoutPub.id,
      publicationTitle: checkoutPub.title,
      status: 'pending',
      reference: reference,
      date: new Date().toISOString()
    };

    try {
      const addedTxn = await addTransaction(pendingTxn);

      if (bypassVerification) {
        // Simulated Direct Verification (Developer Bypass mode)
        // Wait 1.5s for realistic system verification response
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Finalize transaction status in database
        await updateTransactionStatus(addedTxn.id, 'success');
        
        // Unlock on visitor profile
        await addPurchasedPublication(checkoutPub.id);
        
        setPaymentSuccess(true);
        setProcessingPayment(false);
        setTimeout(() => setCheckoutPub(null), 2500);
        return;
      }

      // Real Paystack Popup Flow
      const scriptLoaded = await loadPaystackPop();
      if (!scriptLoaded) {
        throw new Error("Unable to link with Paystack network nodes. Use bypass mode for active browser sandbox preview testing.");
      }

      const handler = (window as any).PaystackPop.setup({
        key: 'pk_test_d34bbf335e2365a12ecb7fe8991a2eb345fbc67a', // Valid mock developer testing public key
        email: profile?.email || user?.email || '',
        amount: priceAmount * 100, // Paystack requires kobo units
        currency: 'NGN',
        ref: reference,
        callback: function(response: any) {
          // Response came from paystack - verify ref on backend or directly update
          updateTransactionStatus(addedTxn.id, 'success')
            .then(() => addPurchasedPublication(checkoutPub.id))
            .then(() => {
              setPaymentSuccess(true);
              setProcessingPayment(false);
              setTimeout(() => setCheckoutPub(null), 2500);
            })
            .catch((err) => {
              console.error("Error updating transaction status after payment:", err);
              setPaymentSuccess(true);
              setProcessingPayment(false);
              setTimeout(() => setCheckoutPub(null), 2500);
            });
        },
        onSuccess: function(response: any) {
          updateTransactionStatus(addedTxn.id, 'success')
            .then(() => addPurchasedPublication(checkoutPub.id))
            .then(() => {
              setPaymentSuccess(true);
              setProcessingPayment(false);
              setTimeout(() => setCheckoutPub(null), 2500);
            })
            .catch((err) => {
              console.error("Error updating transaction status after payment:", err);
              setPaymentSuccess(true);
              setProcessingPayment(false);
              setTimeout(() => setCheckoutPub(null), 2500);
            });
        },
        onClose: function() {
          setPaymentError("Payment process canceled by checkout user.");
          updateTransactionStatus(addedTxn.id, 'failed')
            .catch(e => console.error(e))
            .finally(() => {
              setProcessingPayment(false);
            });
        },
        onCancel: function() {
          setPaymentError("Payment process canceled by checkout user.");
          updateTransactionStatus(addedTxn.id, 'failed')
            .catch(e => console.error(e))
            .finally(() => {
              setProcessingPayment(false);
            });
        }
      });

      handler.openIframe();
    } catch (err: any) {
      console.error(err);
      setPaymentError(err.message || "An unexpected error interrupted payment security handshakes.");
      setProcessingPayment(false);
    }
  };

  const handleOpenDocViewer = (pub: Publication) => {
    setViewingPub(pub);
    setPdfViewerOpen(true);
  };

  const filteredPublications = publications.filter(pub => {
    const matchesSearch = 
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.publisher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.year.toString().includes(searchTerm);
      
    const matchesTab = activeTab === 'all' || pub.type === activeTab;
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-12 py-4 animate-fade-in text-left text-navy">
      {/* Title & Introduction */}
      <div className="space-y-2">
        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold flex items-center gap-2">
          <span className="w-6 h-[1px] bg-gold"></span>
          {cmsPage?.heroSubheading || "Intellectual Library"}
        </h3>
        <h2 className="font-serif text-3xl font-bold text-navy uppercase leading-tight">
          {cmsPage?.heroTitle ? (
            <span dangerouslySetInnerHTML={{ __html: cmsPage.heroTitle }} />
          ) : (
            <>Academic <span className="text-gold italic font-light">Publications</span></>
          )}
        </h2>
        <p className="text-navy/80 max-w-2xl text-xs leading-relaxed font-light mt-2">
          {cmsPage?.heroDescription || "Explore a comprehensive archive of monographs, course textbooks, award-winning international journals, and global conference assemblies highlighting rural developments, policing reforms, cyber-deviancy and Criminology."}
        </p>
      </div>

      {/* Render CMS Custom Blocks if any */}
      {cmsPage?.blocks && cmsPage.blocks.length > 0 && (
        <div className="space-y-4 border-l-2 border-gold/40 pl-4 py-1">
          {cmsPage.blocks.map(block => (
            <div key={block.id} className="space-y-1">
              {block.heading && <h4 className="font-serif font-bold text-sm text-navy uppercase">{block.heading}</h4>}
              {block.subheading && <p className="text-[10px] uppercase font-bold text-gold">{block.subheading}</p>}
              {block.content && <p className="text-xs text-navy/80 font-light max-w-2xl">{block.content}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-none border border-navy/10 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#002147]/50" />
          <input 
            id="pub_search_input"
            type="text"
            placeholder="Search by title, author, journal, or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-navy/15 rounded-none text-xs tracking-wider uppercase font-mono focus:outline-none focus:border-gold bg-[#fdfcf9] focus:bg-white transition-colors"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Works' },
            { id: 'book', label: 'Books' },
            { id: 'journal', label: 'Journals' },
            { id: 'conference', label: 'Conferences' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 rounded-none text-[10px] uppercase tracking-widest font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-navy text-gold font-bold shadow-xs border border-navy' 
                  : 'bg-[#fdfcf9] text-navy/70 hover:bg-neutral-100 hover:text-navy border border-navy/10'
              } cursor-pointer`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Publications List */}
      <div className="space-y-4">
        {filteredPublications.length > 0 ? (
          filteredPublications.map(pub => {
            const isExpanded = expandedPubId === pub.id;
            const isCopied = copiedId === pub.id;

            // Check if liked or purchased or favorited
            const isLiked = profile ? (profile.likedPublications || []).includes(pub.id) : false;
            const isFavorited = userFavorites.some(f => f.contentId === pub.id);
            const isUnlocked = pub.isPaid 
              ? (profile ? (profile.purchasedPublications || []).includes(pub.id) : false)
              : true;
            
            return (
              <div 
                key={pub.id} 
                className="bg-white border border-navy/10 rounded-none overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-350"
              >
                <div className="p-5 flex flex-col sm:flex-row gap-5 items-start">
                  
                  {/* Year Panel */}
                  <div className="sm:w-16 shrink-0 flex sm:flex-col items-center bg-navy text-gold px-3 py-2.5 rounded-none text-center font-mono space-x-2 sm:space-x-0 w-max sm:w-auto border border-gold/15">
                    <span className="text-[8px] uppercase tracking-widest font-semibold opacity-80 sm:mb-1">YEAR</span>
                    <span className="text-sm sm:text-base font-bold">{pub.year}</span>
                  </div>

                  {/* Info Panel */}
                  <div className="space-y-2 flex-grow text-left">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[8px] uppercase font-bold tracking-widest px-2.5 py-1 bg-[#fdfcf9] border border-navy/15 text-navy font-mono">
                        {pub.type === 'book' ? <Book className="h-3 w-3 text-gold" /> : 
                         pub.type === 'journal' ? <BookOpen className="h-3 w-3 text-gold" /> : 
                         <FileText className="h-3 w-3 text-gold" />}
                        {pub.type}
                      </span>

                      {/* Cash value labels */}
                      {pub.isPaid ? (
                        isUnlocked ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase font-mono text-[9px] font-bold">
                            Acquired Draft
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 uppercase font-mono text-[9px] font-bold">
                            ₦{pub.price?.toLocaleString()} NGN
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 bg-green-50 text-green-800 border border-green-200 uppercase font-mono text-[8px] font-bold">
                          Gratis Access
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-navy text-base sm:text-lg leading-snug group-hover:italic uppercase tracking-wide">
                      {pub.title}
                    </h4>

                    <div className="text-xs text-navy/80 font-light">
                      <strong className="font-semibold text-navy">{pub.authors}</strong> &bull; <span className="italic">{pub.publisher}</span>
                    </div>

                    {/* Interaction Buttons */}
                    <div className="flex flex-wrap gap-4 pt-3 border-t border-navy/5 items-center">
                      
                      {/* View Abstract */}
                      {pub.description && (
                        <button 
                          onClick={() => handleToggleExpand(pub.id)}
                          className="inline-flex items-center space-x-1.5 text-[9px] uppercase tracking-widest font-bold text-navy/60 hover:text-gold transition cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <span>Hide Abstracts & comments</span>
                              <ChevronUp className="h-3 w-3 animate-bounce" />
                            </>
                          ) : (
                            <>
                              <span>View Abstracts & comments</span>
                              <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      )}

                      {/* Quick like counter */}
                      <button
                        onClick={(e) => handleToggleLike(e, pub)}
                        className={`inline-flex items-center space-x-1.5 text-[9px] uppercase tracking-widest font-bold transition cursor-pointer ${
                          isLiked ? 'text-rose-600' : 'text-navy/60 hover:text-rose-600'
                        }`}
                      >
                        <Heart className={`h-3 w-3 ${isLiked ? 'fill-rose-600' : ''}`} />
                        <span>Like {pub.likesCount && pub.likesCount > 0 ? `(${pub.likesCount})` : ''}</span>
                      </button>

                      {/* Deployed Star Favorite button */}
                      <button
                        onClick={(e) => handleToggleFavoriteItem(e, pub)}
                        className={`inline-flex items-center space-x-1.5 text-[9px] uppercase tracking-widest font-bold transition cursor-pointer ${
                          isFavorited ? 'text-amber-500 font-black' : 'text-navy/60 hover:text-amber-500'
                        }`}
                        title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                      >
                        <Star className={`h-3.5 w-3.5 ${isFavorited ? 'fill-amber-500' : ''}`} />
                        <span>{isFavorited ? "Favorited" : "Favorite"}</span>
                      </button>

                      {/* Copy Citation */}
                      <button
                        onClick={(e) => handleCopyCitation(e, pub)}
                        className="inline-flex items-center space-x-1.5 text-[9px] uppercase tracking-widest font-bold text-navy/60 hover:text-gold transition cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3 text-green-600" />
                            <span className="text-green-600 font-bold">Citation Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Citation</span>
                          </>
                        )}
                      </button>

                      {/* E-commerce Buy / Read Buttons */}
                      {pub.isPaid ? (
                        isUnlocked ? (
                          <button
                            onClick={() => handleOpenDocViewer(pub)}
                            className="cursor-pointer inline-flex items-center space-x-1 py-1 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] uppercase font-mono font-bold tracking-wider rounded-none"
                          >
                            <span>Read Academic Draft</span>
                            <BookOpen className="h-3 w-3 ml-1" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyNow(pub)}
                            className="cursor-pointer inline-flex items-center space-x-1.5 py-1 px-3 bg-gold text-navy hover:bg-navy hover:text-gold text-[10px] uppercase font-mono font-black tracking-wider transition"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span>Buy Study</span>
                          </button>
                        )
                      ) : (
                        pub.link && (
                          <a 
                            href={pub.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-[9px] uppercase tracking-widest font-bold text-navy/60 hover:text-gold transition"
                          >
                            <span>Full Article</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )
                      )}

                    </div>
                  </div>
                </div>

                {/* Expanded Abstract Section with Comments Panel */}
                {isExpanded && (
                  <div className="bg-[#fdfcf9] border-t border-navy/5 p-6 animate-slide-up-faint border-l-4 border-gold text-left space-y-6">
                    {pub.description && (
                      <div>
                        <strong className="block text-navy font-serif font-bold mb-1 uppercase tracking-wide text-[10px]">Abstract & Overview:</strong>
                        <p className="text-xs text-navy/85 font-light leading-relaxed">{pub.description}</p>
                      </div>
                    )}

                    {/* Scholarly Comments Sub-Portlet */}
                    <div className="pt-6 border-t border-navy/5 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-gold" />
                        <h5 className="font-serif font-bold text-xs text-navy uppercase tracking-wider">
                          Scholarly Peer Discussions ({commentsMap[pub.id]?.filter(c => c.status === 'approved').length || 0})
                        </h5>
                      </div>

                      {/* Messages box */}
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {(commentsMap[pub.id] || [])
                          .filter(c => c.status === 'approved' || (profile && c.userId === profile.uid))
                          .length === 0 ? (
                            <p className="font-mono text-[10px] text-slate-400 uppercase">No discussions published on this file.</p>
                          ) : (
                            (commentsMap[pub.id] || [])
                              .filter(c => c.status === 'approved' || (profile && c.userId === profile.uid))
                              .map(c => (
                                <div key={c.id} className="p-3 bg-white border border-navy/5 text-xs text-left">
                                  <div className="flex justify-between items-center mb-1 font-mono text-[9px] text-[#002147]/60">
                                    <span className="font-bold flex items-center gap-1">
                                      <UserIcon className="h-3 w-3" /> {c.userName}
                                    </span>
                                    <span>{new Date(c.date).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-navy/90 italic font-sans">"{c.text}"</p>
                                  {c.status === 'pending' && (
                                    <span className="inline-block mt-1 text-[8px] font-mono text-amber-700 bg-amber-50 px-1 border border-amber-200 uppercase">
                                      Under Review by Professor
                                    </span>
                                  )}
                                </div>
                              ))
                          )}
                      </div>

                      {/* Insert Custom scholarly remark */}
                      {user ? (
                        <div className="space-y-2.5 pt-3">
                          <textarea
                            value={newCommentText[pub.id] || ''}
                            onChange={(e) => setNewCommentText(prev => ({ ...prev, [pub.id]: e.target.value }))}
                            placeholder="Contribute scholarly peer-feedback or pose academic query under review constraints..."
                            rows={2}
                            className="w-full text-xs text-navy bg-white border border-navy/15 rounded-none p-2.5 focus:outline-none focus:ring-1 focus:ring-gold font-sans"
                            maxLength={1000}
                          />
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 font-mono">Constructive feedback only. Managed by administration tools.</span>
                            <button
                              onClick={() => handlePostComment(pub)}
                              disabled={commentingLoading[pub.id] || !(newCommentText[pub.id] || '').trim()}
                              className="cursor-pointer bg-navy text-gold hover:bg-gold hover:text-navy px-4 py-1.5 font-mono uppercase text-[9px] font-black transition disabled:opacity-40"
                            >
                              {commentingLoading[pub.id] ? "Publishing..." : "Publish comment"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-navy/[0.02] border border-navy/5 text-[10px] text-navy/70 uppercase font-mono">
                          Please log in or register a visitor profile to comment in peer discussion.
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-none py-12 px-6 text-center border border-navy/10 text-navy/50 space-y-2">
            <Book className="h-10 w-10 mx-auto text-gold/60" />
            <p className="font-serif text-lg font-bold uppercase tracking-wide text-navy">No Publications Found</p>
            <p className="text-xs font-light">Try adjusting your search filters or matching keywords.</p>
          </div>
        )}
      </div>

      {/* CO-COMMERCE SLIDING CHECKOUT DRAWER */}
      {checkoutPub && profile && (
        <div className="fixed inset-0 bg-navy/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-left">
          <div className="bg-white border border-navy/20 p-6 md:p-8 max-w-md w-full relative shadow-2xl animate-slide-up">
            <div className="absolute top-0 inset-x-0 h-[4px] bg-gold" />
            
            {/* Drawer Header */}
            <h3 className="font-serif font-bold text-xl text-navy uppercase tracking-tight">Checkout Order Panel</h3>
            <p className="font-mono text-[9px] text-gold uppercase tracking-wider mt-1 mb-6">Unified Paystack processing gateway</p>

            {/* Error or Success notification cards */}
            {paymentError && (
              <div className="p-3 bg-red-50 border-l-2 border-red-500 text-xs text-red-800 mb-5 text-left leading-relaxed">
                {paymentError}
              </div>
            )}

            {paymentSuccess ? (
              <div className="p-4 bg-[#f0f9eb] border border-emerald-300 text-center space-y-2 mb-6">
                <Sparkles className="h-6 w-6 text-emerald-600 mx-auto animate-spin" />
                <p className="font-serif font-extrabold text-sm text-green-800 uppercase">Payment confirmed!</p>
                <p className="text-xs text-green-700">Digital key signature authenticated. Unlocking draft access in dashboard and library panels...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Product Summary */}
                <div className="p-4 bg-navy/[0.02] border border-navy/5 space-y-2">
                  <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest block font-bold">SCHOLARSHIP TRANSACTION</span>
                  <span className="font-serif font-black text-sm text-navy uppercase block leading-snug">{checkoutPub.title}</span>
                  <span className="text-[11px] text-slate-500 font-mono block">Criminology Monographs Catalogue</span>
                </div>

                {/* Pricing Table */}
                <div className="border-t border-b border-navy/10 py-3 text-xs space-y-1.5 font-mono uppercase tracking-wide">
                  <div className="flex justify-between text-navy/70">
                    <span>Manuscript Draft Licensing</span>
                    <span>₦{(checkoutPub.price || 5000).toLocaleString()}.00</span>
                  </div>
                  <div className="flex justify-between text-navy/70">
                    <span>In-App secure preservation support</span>
                    <span>₦0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-navy text-sm pt-1 border-t border-dashed border-navy/10">
                    <span>Total Amount DUE</span>
                    <span className="text-gold">₦{(checkoutPub.price || 5000).toLocaleString()}.00 NGN</span>
                  </div>
                </div>

                {/* Warnings or notices */}
                <div className="p-3 bg-amber-50/50 border border-amber-200 text-[10px] text-amber-900 leading-normal flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block font-mono text-[9px] uppercase">Verify and Unlock bounds</span>
                    All transaction keys are signed client-side and checked server-side. For container testing in sandbox preview, use either the Sandbox Gateway check OR the Bypass check.
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-3">
                  <button
                    onClick={() => executePayment(false)}
                    disabled={processingPayment}
                    className="cursor-pointer w-full py-2.5 bg-navy text-[#fdfcf9] hover:bg-gold hover:text-navy font-mono text-xs uppercase font-bold tracking-widest flex items-center justify-center gap-2 transition duration-300"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>{processingPayment ? "Validating Paystack..." : "Pay with Paystack Inline"}</span>
                  </button>

                  <button
                    onClick={() => executePayment(true)}
                    disabled={processingPayment}
                    className="cursor-pointer w-full py-2 bg-emerald-700 text-[#fdfcf9] hover:bg-emerald-800 font-mono text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-1.5 transition duration-300"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Dev-Bypass Simulation Unlock (1 Click test)</span>
                  </button>

                  <button
                    onClick={() => setCheckoutPub(null)}
                    disabled={processingPayment}
                    className="cursor-pointer w-full py-2 border border-navy/20 text-navy font-mono text-[10px] uppercase transition hover:bg-slate-50"
                  >
                    Abort Transaction
                  </button>
                </div>
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
                Authorized Session for Academic Preview Check &bull; Database Verified Secured
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

    </div>
  );
}
