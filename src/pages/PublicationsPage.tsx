import { useState } from 'react';
import { Search, Book, BookOpen, FileText, ExternalLink, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Publication } from '../types';

interface PublicationsPageProps {
  publications: Publication[];
}

export default function PublicationsPage({ publications }: PublicationsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'book' | 'journal' | 'conference'>('all');
  const [expandedPubId, setExpandedPubId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPublications = publications.filter(pub => {
    const matchesSearch = 
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.publisher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.year.toString().includes(searchTerm);
      
    const matchesTab = activeTab === 'all' || pub.type === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const toggleExpand = (id: string) => {
    if (expandedPubId === id) {
      setExpandedPubId(null);
    } else {
      setExpandedPubId(id);
    }
  };

  const copyCitation = (pub: Publication) => {
    const citation = `${pub.authors} (${pub.year}). "${pub.title}." ${pub.publisher}.${pub.link ? ` Available at: ${pub.link}` : ''}`;
    navigator.clipboard.writeText(citation).then(() => {
      setCopiedId(pub.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="space-y-12 py-4 animate-fade-in text-left text-navy">
      {/* Title & Introduction */}
      <div className="space-y-2">
        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold flex items-center gap-2">
          <span className="w-6 h-[1px] bg-gold"></span>
          Intellectual Library
        </h3>
        <h2 className="font-serif text-3xl font-bold text-navy uppercase leading-tight">
          Academic <span className="text-gold italic font-light">Publications</span>
        </h2>
        <p className="text-navy/80 max-w-2xl text-xs leading-relaxed font-light mt-2">
          Explore a comprehensive archive of monographs, course textbooks, award-winning international journals, and global conference assemblies highlighting rural developments, family structures, and African gender models.
        </p>
      </div>

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
                  <div className="space-y-2 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[8px] uppercase font-bold tracking-widest px-2.5 py-1 bg-[#fdfcf9] border border-navy/15 text-navy font-mono">
                        {pub.type === 'book' ? <Book className="h-3 w-3 text-gold" /> : 
                         pub.type === 'journal' ? <BookOpen className="h-3 w-3 text-gold" /> : 
                         <FileText className="h-3 w-3 text-gold" />}
                        {pub.type}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-navy text-base sm:text-lg leading-snug group-hover:italic uppercase tracking-wide">
                      {pub.title}
                    </h4>

                    <div className="text-xs text-navy/80 font-light">
                      <strong className="font-semibold text-navy">{pub.authors}</strong> &bull; <span className="italic">{pub.publisher}</span>
                    </div>

                    {/* Interaction Buttons */}
                    <div className="flex flex-wrap gap-4 pt-3 border-t border-navy/5">
                      {pub.description && (
                        <button 
                          onClick={() => toggleExpand(pub.id)}
                          className="inline-flex items-center space-x-1.5 text-[9px] uppercase tracking-widest font-bold text-navy/60 hover:text-gold transition cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <span>Hide Abstract</span>
                              <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              <span>View Abstract</span>
                              <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => copyCitation(pub)}
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

                      {pub.link && (
                        <a 
                          href={pub.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-[9px] uppercase tracking-widest font-bold text-navy/60 hover:text-gold transition"
                        >
                          <span>Full Article</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Abstract Section */}
                {isExpanded && pub.description && (
                  <div className="bg-[#fdfcf9] border-t border-navy/5 p-5 text-navy/85 text-xs leading-relaxed font-light animate-slide-up-faint border-l-4 border-gold">
                    <strong className="block text-navy font-serif font-semibold mb-1 uppercase tracking-wide text-[10px]">Abstract & Overview:</strong>
                    {pub.description}
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
    </div>
  );
}
