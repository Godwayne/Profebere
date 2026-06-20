import { useState, useEffect } from 'react';
import { FileText, Download, GraduationCap, Briefcase, Award, BookOpen, Sparkles } from 'lucide-react';
import { fetchCMSPage } from '../services/db';
import { CMSPage } from '../types';
import profProfileImg from '../assets/images/faculty_prof_ebere_1781985440905.jpg';

interface AboutProps {
  onNavigate: (page: string) => void;
}

export default function About({ onNavigate }: AboutProps) {
  const [cmsPage, setCmsPage] = useState<CMSPage | null>(null);

  useEffect(() => {
    const loadCms = async () => {
      try {
        const page = await fetchCMSPage('about');
        if (page) {
          setCmsPage(page);
        }
      } catch (e) {
        console.error("Error loading about page CMS content:", e);
      }
    };
    loadCms();
  }, []);

  const handlePrintCV = () => {
    window.print();
  };

  return (
    <div className="space-y-16 py-4 animate-fade-in text-navy">
      
      {/* CMS Page Blocks Rendering if present */}
      {cmsPage && cmsPage.blocks && cmsPage.blocks.length > 0 && (
        <section id="cms_about_blocks" className="space-y-6 animate-fade-in bg-[#f0ece3] border border-navy/10 p-6 md:p-8 rounded text-left">
          <div className="flex items-center space-x-2 border-b border-navy/10 pb-2">
            <Sparkles className="h-5 w-5 text-amber-600 animate-pulse" />
            <h2 className="font-serif font-bold text-lg uppercase tracking-tight text-navy">
              Special Institutional/Personal Updates (CMS)
            </h2>
          </div>
          <div className="grid gap-6 pt-2">
            {cmsPage.blocks.map((block) => (
              <div 
                key={block.id} 
                className="p-6 bg-white border border-navy/15 shadow-sm rounded text-left"
              >
                {block.subheading && (
                  <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#002147]/60 block mb-1">
                    {block.subheading}
                  </span>
                )}
                <h3 className="font-serif font-bold text-base text-navy mb-2 border-b border-navy/5 pb-1">
                  {block.heading}
                </h3>
                <p className="text-xs text-navy/85 whitespace-pre-line leading-relaxed">
                  {block.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bio Header */}
      <section id="bio_intro" className="grid md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-none border border-navy/10 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
            
            <div className="relative inline-block mb-4 mt-2">
              <div className="absolute -inset-2 border border-gold/30 rounded-none transform rotate-3" />
              <img 
                src={profProfileImg} 
                alt="Prof. Ebere Okorie" 
                referrerPolicy="no-referrer"
                className="relative object-cover w-36 h-36 mx-auto border border-navy/10 filter brightness-95 transition-all duration-300 pointer-events-none"
              />
            </div>
            
            <h3 className="font-serif font-bold text-navy text-xl uppercase tracking-tight">Prof. Ebere Okorie</h3>
            <p className="text-xs text-[#002147]/50 font-mono tracking-widest uppercase mt-1">Department of Sociology & Anthropology</p>
            <p className="text-xs text-gold font-bold uppercase tracking-wider mt-1">University of Uyo, Nigeria</p>
            
            <div className="mt-6 pt-6 border-t border-navy/10 flex flex-col space-y-3.5 text-left text-xs text-navy/80 select-none">
              <div className="flex items-center space-x-2.5">
                <GraduationCap className="h-4.5 w-4.5 text-gold shrink-0" />
                <span className="font-medium">PhD, Sociology (University of Ibadan)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Briefcase className="h-4.5 w-4.5 text-gold shrink-0" />
                <span className="font-medium">25+ Years of Lecturing Leadership</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Award className="h-4.5 w-4.5 text-gold shrink-0" />
                <span className="font-medium">NASA Research Fellowship</span>
              </div>
            </div>

            <button 
              id="download_cv_bar"
              onClick={handlePrintCV}
              className="mt-6 w-full inline-flex items-center justify-between bg-navy hover:bg-navy-hover text-white text-[10px] uppercase tracking-widest font-bold px-4 py-3.5 rounded-none shadow-md transition cursor-pointer"
            >
              <span>Download Academic CV</span>
              <div className="w-3 h-[1px] bg-gold" />
            </button>
          </div>
        </div>

        <div className="md:col-span-8 space-y-6 text-left">
          <div className="space-y-2">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold flex items-center gap-2">
              <span className="w-6 h-[1px] bg-gold"></span>
              The scholar's path
            </h3>
            <h2 className="font-serif text-3xl font-bold text-navy uppercase leading-tight">
              Biography & <span className="text-gold italic font-light">Academic Journey</span>
            </h2>
          </div>

          <div className="text-navy/90 space-y-5 leading-relaxed text-sm font-light">
            <p>
              <strong>Prof. Ebere Okorie</strong> is a distinguished Professor of Sociology and Anthropology at the prestigious University of Uyo, Akwa Ibom State, Nigeria. For over two and a half decades, her scholarly pursuits have centered on unraveling the complex, multi-tiered institutional frameworks governing community development, rural gender politics, and shifting familial designs within sub-Saharan Africa.
            </p>
            <p>
              Her scholarly roots trace back to her B.Sc. studies at the <em>University of Nigeria, Nsukka</em>, where she graduated with Honors. Driven by a passion to explore grassroots systems, she pursued her M.Sc. in Sociology at the <em>University of Port Harcourt</em>, after which she proceeded to the iconic school of sociological thought—the <em>University of Ibadan</em>, completing her Doctorate with a thesis analyzing Customary Land Tenure and Women’s Cooperative Unions.
            </p>
            <p>
              As a core researcher, she has served as project leader on various state-sponsored and international partnership grants. She remains a prominent advisor on environmental-social disruptions and rural women’s livelihood safeguards across Akwa Ibom and surrounding West African states.
            </p>
            <p>
              Beyond active research, Prof. Okorie is an enthusiast of academic mentorship. She has successfully supervised over 50 postgraduates (M.Sc. & Ph.D.) and continues to serve as an external examiner to multiple universities across Nigeria, promoting high methodological rigor and ethnographic authenticity.
            </p>
          </div>
        </div>
      </section>

      {/* Educational Background & Accreditations */}
      <section id="education_timeline" className="space-y-6 text-left">
        <div className="border-b border-navy/10 pb-3">
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-1">Pedigree</h3>
          <h3 className="font-serif text-2xl font-bold text-navy uppercase">
            Academic <span className="text-gold italic font-light">Pathways</span>
          </h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              degree: "Ph.D. in Sociology",
              institution: "University of Ibadan, Nigeria",
              details: "Specialized in Gender Systems and Customary Tenures. Awarded outstanding doctoral thesis recognition from the faculty.",
              year: "2005"
            },
            {
              degree: "M.Sc. in Sociology",
              institution: "University of Port Harcourt, Nigeria",
              details: "Concentration in Rural Livelihoods and Agrarian Cooperatives. Graduated at the top of her graduate seminar cohort.",
              year: "1999"
            },
            {
              degree: "B.Sc. in Sociology & Anthropology",
              institution: "University of Nigeria, Nsukka",
              details: "Graduated with Second Class Honors (Upper Division). Developed foundational focus on ethnographic techniques.",
              year: "1995"
            }
          ].map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-none border-l-2 border-gold border-y border-r border-navy/10 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="font-mono text-[10px] font-bold text-navy bg-gold/10 px-2 py-1 rounded-none inline-block tracking-widest">{item.year}</span>
                <h4 className="font-serif font-bold text-navy text-lg leading-snug">{item.degree}</h4>
                <p className="text-gold text-xs font-semibold uppercase tracking-wider">{item.institution}</p>
                <p className="text-navy/80 text-xs leading-relaxed pt-2 font-light">{item.details}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Curriculum Vitae Viewer */}
      <section id="academic_cv" className="bg-white border border-navy/10 rounded-none p-6 sm:p-10 shadow-sm text-left relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-navy" />
        <div className="absolute top-0 right-0 w-1/4 h-full bg-navy/[0.01] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-navy/10 pb-6 mb-8 gap-4">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-bold text-navy uppercase">Curriculum Vitae</h3>
            <p className="text-navy/65 text-xs sm:text-sm">Consolidated portfolio of research subjects, teaching, and fellowships</p>
          </div>
          <button 
            id="print_cv_action"
            onClick={handlePrintCV}
            className="inline-flex items-center justify-between border border-navy/20 hover:border-gold hover:text-gold text-navy text-xs uppercase font-bold tracking-widest px-4 py-2.5 rounded-none transition cursor-pointer gap-2"
          >
            <FileText className="h-4 w-4" />
            <span>Print Layout (A4)</span>
          </button>
        </div>

        <div className="grid md:grid-cols-12 gap-8 divide-y md:divide-y-0 md:divide-x divide-navy/10">
          {/* Left Column of CV */}
          <div className="md:col-span-4 space-y-6 pt-6 md:pt-0">
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-navy text-sm uppercase tracking-widest border-b border-navy/5 pb-1 text-gold">Research Interests</h4>
              <ul className="text-xs text-navy/90 space-y-2.5 list-none">
                <li className="flex items-start gap-1.5"><span className="text-gold font-bold">&bull;</span> Gender Structures & Land Tenancy Rights</li>
                <li className="flex items-start gap-1.5"><span className="text-gold font-bold">&bull;</span> Rural Agrarian Cooperatives & Microlending</li>
                <li className="flex items-start gap-1.5"><span className="text-gold font-bold">&bull;</span> Sociological Dynamics of Sub-Saharan Families</li>
                <li className="flex items-start gap-1.5"><span className="text-gold font-bold">&bull;</span> Ibibio Ethnology & indigenous Peace Treaties</li>
                <li className="flex items-start gap-1.5"><span className="text-gold font-bold">&bull;</span> Educational Inclusion and Policy Guidelines</li>
              </ul>
            </div>

            <div className="space-y-3 pt-4">
              <h4 className="font-serif font-bold text-navy text-sm uppercase tracking-widest border-b border-navy/5 pb-1 text-gold">Affiliations</h4>
              <ul className="text-xs text-navy/90 space-y-2.5 list-none">
                <li className="flex items-start gap-1.5"><span className="text-gold font-bold">&bull;</span> Fellow, Nigerian Anthropological & Sociological Association</li>
                <li className="flex items-start gap-1.5"><span className="text-gold font-bold">&bull;</span> Member, International Sociological Association (ISA)</li>
                <li className="flex items-start gap-1.5"><span className="text-gold font-bold">&bull;</span> Trustee, Council on African Gender Studies</li>
                <li className="flex items-start gap-1.5"><span className="text-gold font-bold">&bull;</span> Advisory Board, Akwa Ibom State Livelihood Board</li>
              </ul>
            </div>
          </div>

          {/* Right Column of CV */}
          <div className="md:col-span-8 md:pl-8 space-y-6 pt-6 md:pt-0">
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-navy text-sm uppercase tracking-widest text-gold border-b border-navy/5 pb-1">Current Teaching & Course Load (UniUyo)</h4>
              <div className="space-y-4.5 text-xs">
                <div className="space-y-1">
                  <h5 className="font-bold text-navy text-sm uppercase tracking-wide">SOC 812: Advanced Sociological Thought (M.Sc./Ph.D.)</h5>
                  <p className="text-navy/70 leading-relaxed font-light">Analyzing classical and modern social theories, structural functionalism, and sub-Saharan adaptations.</p>
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-navy text-sm uppercase tracking-wide">SOC 411: Sociology of the Family (B.Sc.)</h5>
                  <p className="text-navy/70 leading-relaxed font-light">Exploring kinship systems, modern marriage trends under urbanization, and legal dualism in West Africa.</p>
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-navy text-sm uppercase tracking-wide">SOC 321: Rural Sociology and Agrarian Systems (B.Sc.)</h5>
                  <p className="text-navy/70 leading-relaxed font-light">Studies on rural development patterns, agricultural cooperatives, land tenure systems, and peasant economy paradigms.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h4 className="font-serif font-bold text-navy text-sm uppercase tracking-widest text-gold border-b border-navy/5 pb-1">Selected Meritorious Awards</h4>
              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-navy tracking-wide">
                    <span>DISTINGUISHED SOCIOLOGICAL EXCELLENCE AWARD</span>
                    <span className="font-mono text-gold">2024</span>
                  </div>
                  <p className="text-navy/70 pl-2 border-l border-gold font-light">Awarded by NASA in recognition of pioneering research on rural women's land rights in southern Nigeria.</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-navy tracking-wide">
                    <span>UNIVERSITY OF UYO BEST RESEARCHER (SOCIAL SCIENCES)</span>
                    <span className="font-mono text-gold">2021</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
