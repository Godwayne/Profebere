import { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Award, FileText, ArrowRight, MapPin, Mail, ChevronRight, Sparkles, Heart } from 'lucide-react';
import { BlogPost, Publication, CMSPage } from '../types';
import { fetchCMSPage } from '../services/db';
import profProfileImg from '../assets/images/faculty_prof_ebere_1781985440905.jpg';

interface HomeProps {
  onNavigate: (page: string) => void;
  latestBlogPosts: BlogPost[];
  recentPublications: Publication[];
}

export default function Home({ onNavigate, latestBlogPosts, recentPublications }: HomeProps) {
  const [cmsPage, setCmsPage] = useState<CMSPage | null>(null);

  useEffect(() => {
    const loadCms = async () => {
      try {
        const page = await fetchCMSPage('home');
        if (page) {
          setCmsPage(page);
        }
      } catch (e) {
        console.error("Error loading home page CMS content:", e);
      }
    };
    loadCms();
  }, []);

  return (
    <div className="space-y-16 py-4 animate-fade-in text-navy">
      
      {/* CMS Page Blocks Rendering if present */}
      {cmsPage && cmsPage.blocks && cmsPage.blocks.length > 0 && (
        <section id="cms_home_blocks" className="space-y-8 animate-fade-in bg-amber-500/5 border border-amber-500/10 p-6 md:p-8 rounded-xl text-left">
          <div className="flex items-center space-x-2 border-b border-navy/10 pb-2">
            <Sparkles className="h-5 w-5 text-amber-600 animate-pulse" />
            <h2 className="font-serif font-bold text-lg uppercase tracking-tight text-navy">
              Academic Bulletins & Section Updates (CMS)
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 pt-2">
            {cmsPage.blocks.map((block) => (
              <div 
                key={block.id} 
                className={`p-6 border transition hover:shadow-md rounded text-left ${
                  block.type === 'hero' 
                    ? 'bg-navy text-white border-gold/20 col-span-full' 
                    : block.type === 'cta'
                    ? 'bg-amber-50 border-amber-200' 
                    : 'bg-white border-navy/10'
                }`}
              >
                {block.subheading && (
                  <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-amber-600 block mb-1">
                    {block.subheading}
                  </span>
                )}
                <h3 className="font-serif font-bold text-lg text-navy mb-2 border-b border-navy/5 pb-1">
                  {block.heading}
                </h3>
                <p className="text-xs text-navy/85 whitespace-pre-line leading-relaxed font-sans">
                  {block.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section id="academic_hero" className="relative bg-navy text-[#fdfcf9] rounded-none overflow-hidden border border-gold/15 shadow-xl mr-1">
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-transparent opacity-95 z-10" />
        {/* Soft geometric background lines */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] z-0" />
        <div className="absolute top-10 right-10 w-96 h-96 border border-gold/10 rounded-full z-0 pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 border border-gold/5 rounded-full z-0 pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-12 gap-10 items-center z-20 font-sans">
          <div className="md:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 bg-gold/10 border border-gold/30 px-3 py-1 text-[10px] uppercase font-mono tracking-widest text-gold font-bold">
              <GraduationCap className="h-4.5 w-4.5 text-gold" />
              <span>{cmsPage?.heroInstitution || "University of Uyo, Nigeria"}</span>
            </div>
            
            <div className="relative">
              <div className="absolute -top-3 -left-4 w-12 h-12 border-t-2 border-l-2 border-gold opacity-60"></div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight uppercase pt-2">
                {cmsPage?.heroTitle ? (
                  (() => {
                    const words = cmsPage.heroTitle.trim().split(/\s+/);
                    if (words.length > 1) {
                      const lastWord = words[words.length - 1];
                      const restWords = words.slice(0, words.length - 1).join(" ");
                      return (
                        <>
                          {restWords} <br />
                          <span className="text-gold italic font-light">{lastWord}</span>
                        </>
                      );
                    }
                    return cmsPage.heroTitle;
                  })()
                ) : (
                  <>
                    Prof. Ebere <br/>
                    <span className="text-gold italic font-light">Okorie</span>
                  </>
                )}
              </h1>
            </div>
            
            <p className="text-lg sm:text-xl text-[#fdfcf9]/90 font-serif italic max-w-xl pl-4 border-l-2 border-gold">
              {cmsPage?.heroSubheading || "Professor of Sociology and Anthropology"}
            </p>
            
            <p className="text-sm text-[#fdfcf9]/80 max-w-xl leading-relaxed font-light">
              {cmsPage?.heroDescription || "Professor Ebere James Okorie is a distinguished Professor of Criminology at the Department of Sociology and Anthropology, University of Uyo (UNIUYO), Nigeria. His research spans security studies, juvenile delinquency, and deviant behavior, and he has notably supervised numerous doctoral candidates in his field."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                id="view_publications_btn"
                onClick={() => onNavigate('publications')}
                className="inline-flex items-center justify-between bg-[#fdfcf9] text-navy hover:bg-white text-xs uppercase tracking-widest font-bold px-6 py-4 rounded-none transition-all duration-300 shadow-md cursor-pointer gap-4"
              >
                <span>Academic Library</span>
                <div className="w-4 h-[1px] bg-gold"></div>
              </button>
              
              <button 
                id="contact_prof_btn"
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center justify-between border border-white/20 hover:border-gold text-[#fdfcf9] hover:text-gold px-6 py-4 rounded-none bg-white/5 backdrop-blur-xs text-xs uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer gap-4"
              >
                <span>Get in Touch</span>
                <div className="w-4 h-[1px] bg-white"></div>
              </button>

              <button 
                id="donate_hero_btn"
                onClick={() => onNavigate('donate')}
                className="inline-flex items-center justify-between bg-[#D4AF37] hover:bg-[#b8942a] text-navy px-6 py-4 rounded-none text-xs uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer gap-4 border border-gold/40 shadow-md font-sans"
              >
                <span className="flex items-center gap-1.5 font-extrabold uppercase">
                  <Heart className="h-4 w-4 fill-navy" />
                  Support Outreach
                </span>
                <div className="w-4 h-[1px] bg-navy"></div>
              </button>
            </div>
          </div>
          
          <div className="md:col-span-5 flex justify-center">
            <div className="relative bg-navy">
              {/* Gold frame decoration */}
              <div className="absolute -inset-3 border border-gold/40 z-0 rounded-none transform rotate-1" />
              <div className="absolute inset-0 border border-white/10 z-0 rounded-none transform -rotate-1" />
              
              <img 
                id="prof_profile_image"
                src={cmsPage?.profileImage || profProfileImg} 
                alt="Prof. Ebere Okorie" 
                referrerPolicy="no-referrer"
                className="relative object-cover w-64 h-80 sm:w-72 sm:h-96 shadow-2xl z-10 border border-[#002147]/20 filter contrast-105 brightness-95 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section id="academic_stats" className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { icon: GraduationCap, score: "25+", label: "Years of Academic Service", color: "text-navy bg-gold/5 border border-gold/10" },
          { icon: BookOpen, score: "60+", label: "Published Works & Articles", color: "text-navy bg-navy/5 border border-navy/10" },
          { icon: Award, score: "1200+", label: "Research Citations Worldwide", color: "text-navy bg-gold/5 border border-gold/10" },
          { icon: FileText, score: "50+", label: "Postgraduates Supervised", color: "text-navy bg-navy/5 border border-navy/10" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-none border border-navy/10 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-gold hover:shadow-md">
            <div className={`p-3 mb-4 rounded-none ${stat.color}`}>
              <stat.icon className="h-5 w-5 text-gold" />
            </div>
            <span className="font-serif text-3xl font-bold text-navy">{stat.score}</span>
            <span className="text-[10px] uppercase tracking-widest text-[#002147]/60 font-semibold mt-2">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Structured Profile Focus Areas */}
      <section id="academic_focus" className="grid md:grid-cols-3 gap-8 pt-4">
        <div className="md:col-span-1 flex flex-col justify-center space-y-4 pr-4 text-left">
          <div className="space-y-2">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold flex items-center gap-2">
              <span className="w-6 h-[1px] bg-gold"></span>
              Scholarly Direction
            </h3>
            <h2 className="font-serif text-3xl font-bold text-navy tracking-tight uppercase leading-tight">
              Pinnacles of <br/>
              <span className="text-gold italic font-light">Academic Leadership</span>
            </h2>
          </div>
          <p className="text-xs text-navy/85 leading-relaxed font-light">
            Providing intellectual stewardship at the University of Uyo, guiding rigorous investigations into modern and historical social setups, family structures, gender empowerment codes, and agrarian resilience.
          </p>
          <div className="pt-2">
            <button 
              id="read_bio_link"
              onClick={() => onNavigate('about')}
              className="px-6 py-4 bg-navy text-white hover:bg-navy-hover text-[10px] uppercase tracking-widest font-bold flex items-center justify-between cursor-pointer w-full transition"
            >
              <span>Read Full Biography</span>
              <div className="w-4 h-[1px] bg-gold"></div>
            </button>
          </div>
        </div>

        <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-none border-l-4 border-gold border-y border-r border-navy/10 shadow-xs space-y-3 text-left">
            <div className="text-navy font-bold font-serif text-base border-b border-navy/10 pb-2 flex items-center justify-between uppercase tracking-wider">
              <span>Primary Researcher</span>
              <Award className="h-4.5 w-4.5 text-gold" />
            </div>
            <p className="text-navy/85 text-xs font-light leading-relaxed">
              Spearheading international and local grant research endeavors under agencies like TetFund, mapping indigenous adaptations to climate shifts in Akwa Ibom coastal regions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-none border-l-4 border-gold border-y border-r border-navy/10 shadow-xs space-y-3 text-left">
            <div className="text-navy font-bold font-serif text-base border-b border-navy/10 pb-2 flex items-center justify-between uppercase tracking-wider">
              <span>Author & Scholar</span>
              <BookOpen className="h-4.5 w-4.5 text-gold" />
            </div>
            <p className="text-navy/85 text-xs font-light leading-relaxed">
              Distinguished author of multiple peer-reviewed monographs and textbooks on gender, agrarian sociology, and conflict resolutions employed across Nigerian assemblies.
            </p>
          </div>

          <div className="bg-white p-6 rounded-none border-l-4 border-gold border-y border-r border-navy/10 shadow-xs space-y-3 text-left">
            <div className="text-navy font-bold font-serif text-base border-b border-navy/10 pb-2 flex items-center justify-between uppercase tracking-wider">
              <span>Community Advocate</span>
              <MapPin className="h-4.5 w-4.5 text-gold" />
            </div>
            <p className="text-navy/85 text-xs font-light leading-relaxed">
              Actively translating research parameters into actionable local councils directives, reviewing safety parameters, civic land rights and equitable training frameworks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-none border-l-4 border-gold border-y border-r border-navy/10 shadow-xs space-y-3 text-left">
            <div className="text-navy font-bold font-serif text-base border-b border-navy/10 pb-2 flex items-center justify-between uppercase tracking-wider">
              <span>Dedicated Mentor</span>
              <GraduationCap className="h-4.5 w-4.5 text-gold" />
            </div>
            <p className="text-navy/85 text-xs font-light leading-relaxed">
              Nurturing standard research practices in postgraduates (M.Sc, Ph.D), fostering advanced analytical structures, ethnographic rigor, and academic writing mastery.
            </p>
          </div>
        </div>
      </section>

      {/* Selected publications and Blog side-by-side or stacked */}
      <div id="home_split_sections" className="grid lg:grid-cols-12 gap-12 pt-6">
        {/* Recent publications preview (Left) */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-end border-b border-navy/10 pb-3">
            <div className="text-left">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-1">Catalog Digest</h3>
              <h3 className="font-serif text-2xl font-bold text-navy uppercase">
                Selected <span className="text-gold italic font-normal">Publications</span>
              </h3>
            </div>
            <button 
              id="goto_all_publications"
              onClick={() => onNavigate('publications')}
              className="text-xs uppercase tracking-widest font-bold text-[#002147]/70 hover:text-gold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <span>Library</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {recentPublications.slice(0, 3).map((pub) => (
              <div 
                key={pub.id} 
                className="bg-white p-5 rounded-none border-l-2 border-navy border-y border-r border-navy/10 shadow-xs transition hover:shadow-md hover:border-gold hover:border-l-gold space-y-2 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-none font-mono bg-navy text-gold">
                    {pub.type}
                  </span>
                  <span className="text-xs text-[#002147]/50 font-medium font-mono">{pub.year}</span>
                </div>
                <h4 
                  onClick={() => onNavigate('publications')}
                  className="font-serif font-bold text-navy hover:text-gold transition text-base sm:text-lg leading-snug cursor-pointer group-hover:italic"
                >
                  {pub.title}
                </h4>
                <p className="text-xs text-navy/70 font-light">
                  <span className="font-semibold text-navy/90">{pub.authors}</span> &bull; <span className="italic">{pub.publisher}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Latest News/Blog (Right) */}
        <section className="lg:col-span-5 space-y-6">
          <div className="flex justify-between items-end border-b border-[#002147]/10 pb-3">
            <div className="text-left">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-1">Academic Ledger</h3>
              <h3 className="font-serif text-2xl font-bold text-navy uppercase">
                News & <span className="text-gold italic font-normal">Updates</span>
              </h3>
            </div>
            <button 
              id="goto_all_blog"
              onClick={() => onNavigate('blog')}
              className="text-xs uppercase tracking-widest font-bold text-[#002147]/70 hover:text-gold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <span>View Feed</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {latestBlogPosts.slice(0, 2).map((post) => (
              <div 
                key={post.id} 
                className="bg-white rounded-none border border-navy/10 overflow-hidden shadow-xs hover:shadow-md hover:border-gold transition text-left flex flex-col sm:flex-row group"
              >
                {post.imageUrl && (
                  <div className="relative sm:w-32 h-32 sm:h-auto overflow-hidden bg-[#fdfcf9] shrink-0 border-r border-navy/5">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500 filter brightness-95"
                    />
                  </div>
                )}
                <div className="p-4 flex flex-col justify-between space-y-2 flex-grow">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono tracking-widest uppercase text-navy/40">
                      <span>{post.category}</span>
                      <span>{new Date(post.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                    </div>
                    <h4 
                      onClick={() => onNavigate('blog')}
                      className="font-serif font-bold text-navy text-sm sm:text-base hover:text-gold transition line-clamp-2 leading-snug cursor-pointer group-hover:italic"
                    >
                      {post.title}
                    </h4>
                    <p className="text-xs text-[#002147]/70 leading-relaxed max-w-sm font-light line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
