import React, { useState } from 'react';
import { 
  Menu, X, GraduationCap, MapPin, Mail, ChevronRight, BookOpen, 
  Linkedin, Twitter, Globe, Lock, ShieldCheck, User as UserIcon, Heart,
  Search, Sparkles
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { fetchPublications, fetchProjects, fetchBlogPosts } from '../services/db';

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth();

  // Integrated Global Academic Search Engine State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [publications, setPublications] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [searchActive, setSearchActive] = useState(false);
  const [dbLoaded, setDbLoaded] = useState(false);

  const handleSearchFocus = async () => {
    setSearchActive(true);
    if (!dbLoaded) {
      setIsSearching(true);
      try {
        const [pubs, projs, blogs] = await Promise.all([
          fetchPublications(),
          fetchProjects(),
          fetchBlogPosts()
        ]);
        setPublications(pubs);
        setProjects(projs);
        setBlogPosts(blogs);
        setDbLoaded(true);
      } catch (err) {
        console.error("Failed loading search database catalogs", err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const filteredPublications = searchQuery.trim() === '' ? [] : publications.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.journal && p.journal.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.summary && p.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredBlogPosts = searchQuery.trim() === '' ? [] : blogPosts.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = searchQuery.trim() === '' ? [] : projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalResults = filteredPublications.length + filteredBlogPosts.length + filteredProjects.length;

  const navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'Biography' },
    { id: 'publications', label: 'Publications Library' },
    { id: 'research', label: 'Research & Projects' },
    { id: 'gallery', label: 'Fieldwork' },
    { id: 'blog', label: 'News & Blog' },
    { id: 'contact', label: 'Official Mail' },
    { id: 'donate', label: 'Research Donation', icon: Heart },
    { id: 'dashboard', label: user ? 'Scholar Console' : 'Scholar Gateway', icon: UserIcon },
    { id: 'admin', label: 'Admin Portal', icon: Lock }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfcf9] text-navy relative overflow-x-hidden font-sans">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-[800px] bg-navy/[0.015] -z-10 pointer-events-none" />
      <div className="absolute top-[400px] -left-20 w-80 h-80 border border-gold/10 rounded-full -z-10 pointer-events-none" />
      
      {/* Vertical Branding Strip */}
      <div className="absolute top-1/2 -right-12 transform -rotate-90 origin-center text-gold/15 font-serif font-bold uppercase tracking-[0.8em] text-xs hidden xl:block select-none pointer-events-none">
        Academic Excellence &bull; University of Uyo
      </div>

      {/* Structural University Header line */}
      <div className="bg-navy text-[#fdfcf9] text-[10px] sm:text-xs py-2 px-4 select-none border-b border-gold/20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-4 text-left">
          <div className="flex items-center space-x-1.5 font-medium tracking-wider uppercase text-[10px]">
            <GraduationCap className="h-4 w-4 text-gold shrink-0" />
            <span>Faculty of Social Sciences &bull; Department of Sociology and Anthropology</span>
          </div>
          <div className="flex items-center space-x-3.5 font-mono text-[9px] opacity-90">
            <span className="text-[#fdfcf9]/80">University of Uyo, Nigeria</span>
            <span className="text-gold">&bull;</span>
            <span className="text-gold select-all hover:underline truncate max-w-[200px] sm:max-w-none">ebere.okorie@uniuyo.edu.ng</span>
          </div>
        </div>
      </div>

      {/* Main Professional Academic Header */}
      <header className="sticky top-0 bg-[#fdfcf9]/95 backdrop-blur-md border-b border-navy/10 z-40 header-glass relative">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
          
          {/* Logo Brand Brand */}
          <div 
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className="flex items-center space-x-3 cursor-pointer text-left select-none group shrink-0"
          >
            <div className="w-10 h-10 bg-navy flex items-center justify-center text-gold font-serif text-lg font-bold italic transition-all group-hover:bg-navy-hover">
              EO
            </div>
            <div className="hidden sm:block">
              <span className="font-serif font-bold text-lg sm:text-xl text-navy tracking-tight block uppercase">Prof. Ebere Okorie</span>
              <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-gold font-bold block">Sociology & anthropology &bull; UniUyo</span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:block relative w-64 xl:w-72">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onFocus={handleSearchFocus}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search resources, books, news..."
                className="w-full pl-9 pr-8 py-2 bg-[#fdfcf9] border border-navy/15 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-gold rounded-full transition-all focus:ring-1 focus:ring-gold/20"
              />
              <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-navy/40" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-2.5 text-[10px] text-navy/40 hover:text-gold cursor-pointer font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden lg:flex items-center space-x-1 font-sans text-xs uppercase tracking-wider font-semibold">
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative px-3 py-2 transition-all duration-300 flex items-center space-x-1 cursor-pointer ${
                  currentPage === item.id 
                    ? 'text-gold font-bold bg-navy/[0.03]' 
                    : 'text-navy/70 hover:text-gold hover:bg-navy/[0.01]'
                }`}
              >
                {item.icon && <item.icon className="h-3.5 w-3.5 mr-0.5 inline-block text-gold" />}
                <span>{item.label}</span>
                {currentPage === item.id && (
                  <span className="absolute bottom-0 inset-x-3 h-[2px] bg-gold" />
                )}
              </button>
            ))}
          </nav>

          {/* Mobile nav open triggers */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-navy hover:text-gold transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Floating Academic Index Results Overlays Panel */}
        {searchActive && (
          <div className="absolute top-full left-0 right-0 max-w-xl mx-auto bg-white border border-slate-200/80 shadow-2xl rounded-2xl z-50 p-5 mt-2 max-h-[420px] overflow-y-auto animate-fade-in text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-[#b49e62] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#b49e62]" />
                Digital Portal Finder
              </span>
              <button
                type="button"
                onClick={() => { setSearchActive(false); setSearchQuery(''); }}
                className="text-[10px] uppercase font-mono px-2 py-1 bg-slate-100 hover:bg-slate-250 text-slate-500 rounded transition cursor-pointer"
              >
                Close Search
              </button>
            </div>

            {isSearching ? (
              <div className="py-12 text-center space-y-2">
                <div className="inline-block h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-serif italic text-xs text-slate-400">Querying scholarly library indices...</p>
              </div>
            ) : searchQuery.trim() === '' ? (
              <div className="py-10 text-center text-slate-400 space-y-1">
                <p className="font-serif text-sm italic">Type keywords to search published works...</p>
                <p className="text-[9px] uppercase font-mono tracking-[0.1em] text-[#a0aec0]">publications • books • research projects • blogs • news</p>
              </div>
            ) : totalResults === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <p className="font-serif text-sm italic">No records match "{searchQuery}"</p>
                <p className="text-[9px] uppercase font-mono tracking-wider pt-1.5 text-slate-400">Try other professional terms (e.g. "sociology", "transitions", "justice")</p>
              </div>
            ) : (
              <div className="pt-3 space-y-4">
                <p className="text-[10px] text-slate-400 font-mono tracking-wider pb-1">{totalResults} matches mapped under "{searchQuery}"</p>
                
                {/* Results: Publications */}
                {filteredPublications.length > 0 && (
                  <div className="space-y-1.5 text-left">
                    <span className="text-[8px] font-bold uppercase font-mono tracking-wider text-[#b49e62] bg-amber-500/5 px-2 py-0.5 rounded">Publications & Books</span>
                    <div className="grid gap-1.5">
                      {filteredPublications.map(pub => (
                        <div 
                          key={pub.id}
                          onClick={() => {
                            onNavigate('publications');
                            setSearchActive(false);
                            setSearchQuery('');
                          }}
                          className="p-2.5 bg-slate-50 hover:bg-amber-500/5 border border-slate-150 rounded-lg cursor-pointer transition text-left"
                        >
                          <h4 className="font-serif text-xs font-bold text-navy truncate">{pub.title}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-1 italic">{pub.journal} &bull; {pub.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results: Research Projects */}
                {filteredProjects.length > 0 && (
                  <div className="space-y-1.5 text-left pt-1">
                    <span className="text-[8px] font-bold uppercase font-mono tracking-wider text-emerald-850 bg-emerald-55 px-2 py-0.5 rounded">Research & Projects</span>
                    <div className="grid gap-1.5">
                      {filteredProjects.map(proj => (
                        <div 
                          key={proj.id}
                          onClick={() => {
                            onNavigate('research');
                            setSearchActive(false);
                            setSearchQuery('');
                          }}
                          className="p-2.5 bg-slate-50 hover:bg-emerald-500/5 border border-slate-150 rounded-lg cursor-pointer transition text-left"
                        >
                          <h4 className="font-serif text-xs font-bold text-navy truncate">{proj.name}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results: Blog Posts */}
                {filteredBlogPosts.length > 0 && (
                  <div className="space-y-1.5 text-left pt-1">
                    <span className="text-[8px] font-bold uppercase font-mono tracking-wider text-indigo-850 bg-indigo-55 px-2 py-0.5 rounded">News & Blog Articles</span>
                    <div className="grid gap-1.5">
                      {filteredBlogPosts.map(post => (
                        <div 
                          key={post.id}
                          onClick={() => {
                            onNavigate('blog');
                            setSearchActive(false);
                            setSearchQuery('');
                          }}
                          className="p-2.5 bg-slate-50 hover:bg-indigo-500/5 border border-slate-150 rounded-lg cursor-pointer transition text-left"
                        >
                          <h4 className="font-serif text-xs font-bold text-navy truncate">{post.title}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{post.excerpt || post.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Navigation Dropdown panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-navy/10 bg-[#fdfcf9]/98 backdrop-blur-md p-4 space-y-3.5 animate-slide-down shadow-lg text-left">
            {/* Mobile Integrated Search Input */}
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onFocus={handleSearchFocus}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search literature library..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-navy/15 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-gold rounded-full"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-navy/40" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-[10px] text-navy/40 hover:text-gold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="space-y-2">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                    currentPage === item.id 
                      ? 'bg-navy text-gold font-bold' 
                      : 'text-navy/80 hover:bg-navy/[0.04]'
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4 shrink-0 text-gold" />}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Body Academic Wrapper */}
      <main className="flex-grow max-w-6xl mx-auto px-4 py-10 w-full relative z-10">
        {children}
      </main>

      {/* Sleek Scholarly Footer */}
      <footer className="bg-navy text-[#fdfcf9] font-sans mt-20 select-none relative z-10 border-t-2 border-gold/40">
        
        {/* Core Footer links and Bio column info */}
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-12 gap-10 text-left">
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gold text-navy flex items-center justify-center font-serif text-base font-bold italic">
                EO
              </div>
              <span className="font-serif font-bold text-xl text-white tracking-wide uppercase">Prof. Ebere Okorie</span>
            </div>
            <p className="text-xs text-[#fdfcf9]/70 leading-relaxed max-w-md font-light">
              Distinguished Professor of Sociology and Anthropology. Specializing in agrarian research transitions, ethnic conflict solutions, environmental sociology, and indigenous micro-structural developments in Sub-Saharan Africa.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-[10px] uppercase font-mono tracking-widest text-[#fdfcf9]/80 rounded-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Academic Portal: Online Secure</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-4 text-xs">
            <h4 className="font-serif text-white font-bold text-sm tracking-wider uppercase text-gold">Scholarly Pathways</h4>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { id: 'about', label: 'Biography & CV' },
                { id: 'publications', label: 'Publications Library' },
                { id: 'research', label: 'Research Specializations' },
                { id: 'gallery', label: 'Fieldwork Gallery' },
                { id: 'blog', label: 'News & Scholarly Notes' },
                { id: 'contact', label: 'Official Correspondence' },
                { id: 'dashboard', label: user ? 'Scholar Console' : 'Scholar Portal' },
              ].map(link => (
                <button 
                  key={link.id} 
                  onClick={() => onNavigate(link.id)}
                  className="hover:text-gold text-[#fdfcf9]/60 transition text-left cursor-pointer font-medium hover:pl-1.5 duration-200"
                >
                  &bull; {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 space-y-4 text-xs">
            <h4 className="font-serif text-white font-bold text-sm tracking-wider uppercase text-gold">Institutional Office</h4>
            <div className="space-y-3 text-[#fdfcf9]/70 leading-relaxed">
              <div className="flex items-start space-x-2.5">
                <MapPin className="h-4.5 w-4.5 text-gold shrink-0 mt-0.5" />
                <span>Room 304, Dept of Sociology, Faculty of Social Sciences, University of Uyo, Akwa Ibom, Nigeria.</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="h-4.5 w-4.5 text-gold shrink-0" />
                <span className="select-all">ebere.okorie@uniuyo.edu.ng</span>
              </div>
            </div>
            
            {/* Social handles links */}
            <div className="flex items-center space-x-3 pt-3">
              {[
                { icon: Linkedin, url: "https://linkedin.com" },
                { icon: Twitter, url: "https://twitter.com" },
                { icon: Globe, url: "https://scholar.google.com" }
              ].map((soc, index) => (
                <a 
                  key={index} 
                  href={soc.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/5 border border-white/10 hover:border-gold hover:text-gold text-[#fdfcf9]/90 transition"
                >
                  <soc.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Brand Copyright */}
        <div className="max-w-6xl mx-auto px-4 py-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-[#fdfcf9]/50 gap-4">
          <p className="font-serif font-light">&copy; {new Date().getFullYear()} Prof. Ebere Okorie. All Academic Rights Reserved.</p>
          <div className="flex items-center space-x-4 font-mono text-[10px] tracking-widest uppercase">
            <span>Faculty Platform</span>
            <span>&bull;</span>
            <button onClick={() => onNavigate('admin')} className="hover:text-gold text-white font-bold transition cursor-pointer">Consoles Access</button>
          </div>
        </div>

      </footer>

    </div>
  );
}
