import React, { useState } from 'react';
import { 
  Menu, X, GraduationCap, MapPin, Mail, ChevronRight, BookOpen, 
  Linkedin, Twitter, Globe, Lock, ShieldCheck, User as UserIcon
} from 'lucide-react';
import { useAuth } from './AuthContext';

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth();

  const navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'Biography' },
    { id: 'publications', label: 'Publications Library' },
    { id: 'research', label: 'Research & Projects' },
    { id: 'gallery', label: 'Fieldwork' },
    { id: 'blog', label: 'News & Blog' },
    { id: 'contact', label: 'Official Mail' },
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
      <header className="sticky top-0 bg-[#fdfcf9]/95 backdrop-blur-md border-b border-navy/10 z-40 header-glass">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          
          {/* Logo Brand Brand */}
          <div 
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className="flex items-center space-x-3 cursor-pointer text-left select-none group"
          >
            <div className="w-10 h-10 bg-navy flex items-center justify-center text-gold font-serif text-lg font-bold italic transition-all group-hover:bg-navy-hover">
              EO
            </div>
            <div>
              <span className="font-serif font-bold text-lg sm:text-xl text-navy tracking-tight block uppercase">Prof. Ebere Okorie</span>
              <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-gold font-bold block">Sociology & anthropology &bull; UniUyo</span>
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

        {/* Mobile Navigation Dropdown panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-navy/10 bg-[#fdfcf9]/98 backdrop-blur-md p-4 space-y-2 animate-slide-down shadow-lg text-left">
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
