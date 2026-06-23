import { useState, useEffect } from 'react';
import { Calendar, Tag, User, ChevronLeft, ArrowRight, NotepadText, Sparkles } from 'lucide-react';
import { BlogPost, CMSPage } from '../types';
import { fetchCMSPage } from '../services/db';

interface BlogPageProps {
  blogPosts: BlogPost[];
}

export default function BlogPage({ blogPosts }: BlogPageProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cmsPage, setCmsPage] = useState<CMSPage | null>(null);

  useEffect(() => {
    const loadCms = async () => {
      try {
        const page = await fetchCMSPage('blog');
        setCmsPage(page);
      } catch (err) {
        console.error("Failed to load blog page CMS:", err);
      }
    };
    loadCms();
  }, []);

  const categories = ['all', 'Announcements', 'Academic Notes', 'Conferences'];

  const filteredPosts = blogPosts.filter(post => {
    if (selectedCategory === 'all') return true;
    return post.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  if (selectedPost) {
    return (
      <div className="max-w-3xl mx-auto py-4 animate-fade-in text-left space-y-8 text-navy">
        {/* Back Button */}
        <button 
          onClick={() => setSelectedPost(null)}
          className="inline-flex items-center justify-between border border-navy/20 hover:border-gold hover:text-gold text-navy text-[10px] uppercase font-bold tracking-widest px-4 py-3 rounded-none transition cursor-pointer gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Feed</span>
        </button>

        {/* Article Meta */}
        <div className="space-y-4">
          <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-mono font-bold tracking-widest text-[#002147] bg-[#fdfcf9] px-3 py-1 border border-navy/15 rounded-none">
            <Tag className="h-3 w-3 text-gold" />
            {selectedPost.category}
          </span>
          
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy leading-tight max-w-2xl uppercase tracking-wide">
            {selectedPost.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-widest text-navy/50 font-bold border-b border-navy/5 pb-4">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-gold" />
              <span>Prof. Ebere Okorie</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gold" />
              <span>{new Date(selectedPost.date).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}</span>
            </span>
          </div>
        </div>

        {/* Main Image */}
        {selectedPost.imageUrl && (
          <div className="rounded-none overflow-hidden aspect-video relative bg-[#fdfcf9] max-h-[400px] border border-navy/15">
            <img 
              src={selectedPost.imageUrl} 
              alt={selectedPost.title} 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover filter brightness-95"
            />
          </div>
        )}

        {/* Content Paragraphs */}
        <div className="text-navy space-y-6 text-sm leading-relaxed font-light mt-2 p-6 bg-white border border-navy/10 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold"></div>
          {selectedPost.content.split('\n\n').map((para, index) => (
            <p key={index}>
              {para}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-4 animate-fade-in text-left text-navy">
      {/* Page Header */}
      <div className="space-y-2">
        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold flex items-center gap-2">
          <span className="w-6 h-[1px] bg-gold"></span>
          {cmsPage?.heroSubheading || "Chronicles of Research"}
        </h3>
        <h2 className="font-serif text-3xl font-bold text-navy uppercase leading-tight">
          {cmsPage?.heroTitle ? (
            <span dangerouslySetInnerHTML={{ __html: cmsPage.heroTitle }} />
          ) : (
            <>Academic Blog & <span className="text-gold italic font-light">News Feed</span></>
          )}
        </h2>
        <p className="text-navy/80 max-w-2xl text-xs leading-relaxed font-light mt-2">
          {cmsPage?.heroDescription || "Stay informed on Prof. Okorie's recent administrative callings, conference briefs, sociological insights, field studies, and comments regarding local public policy parameters."}
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

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-navy/10 pb-4">
        {categories.map((cat, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2.5 rounded-none text-[10px] uppercase tracking-widest font-bold transition-all border ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-navy text-gold border-navy font-bold'
                : 'bg-[#fdfcf9] text-navy/70 border-navy/10 hover:bg-neutral-100 hover:text-navy'
            } cursor-pointer`}
          >
            {cat === 'all' ? 'All Ledger' : cat}
          </button>
        ))}
      </div>

      {/* Blog Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <div 
              key={post.id} 
              onClick={() => setSelectedPost(post)}
              className="bg-white rounded-none border border-navy/10 overflow-hidden shadow-xs hover:shadow-lg hover:border-gold transition-all duration-300 flex flex-col justify-between text-left group cursor-pointer"
            >
              <div className="space-y-4">
                {/* Image */}
                {post.imageUrl && (
                  <div className="relative aspect-video overflow-hidden bg-navy/5 border-b border-navy/5">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500 filter grayscale group-hover:grayscale-0 brightness-95"
                    />
                  </div>
                )}

                {/* Body Content */}
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center text-[9px] uppercase font-mono font-bold tracking-widest text-[#002147]/40">
                    <span className="text-gold font-bold">{post.category}</span>
                    <span>{new Date(post.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                  </div>

                  <h3 className="font-serif font-bold text-navy text-base leading-snug group-hover:text-gold transition uppercase tracking-wide">
                    {post.title}
                  </h3>

                  <p className="text-xs text-[#002147]/80 leading-relaxed font-light line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="px-6 pb-6 pt-3 border-t border-navy/5 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-navy/60 group-hover:text-gold transition">
                <span>Read Full Article</span>
                <ArrowRight className="h-4 w-4 text-gold transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-none py-12 px-6 text-center border border-navy/10 text-navy/50 space-y-2">
          <NotepadText className="h-10 w-10 mx-auto text-gold/60" />
          <p className="font-serif text-lg font-bold uppercase tracking-wide text-navy">No Blog Articles Found</p>
          <p className="text-xs font-light">Select another category filter to explore other posts.</p>
        </div>
      )}
    </div>
  );
}
