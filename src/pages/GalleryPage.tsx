import { useState } from 'react';
import { Camera, Calendar, Tag, X, ZoomIn } from 'lucide-react';
import { GalleryImage } from '../types';

interface GalleryPageProps {
  galleryImages: GalleryImage[];
}

export default function GalleryPage({ galleryImages }: GalleryPageProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const categories = ['all', 'Lectures', 'Conferences', 'Fieldwork'];

  const filteredImages = galleryImages.filter(img => {
    if (activeCategory === 'all') return true;
    return img.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="space-y-12 py-4 animate-fade-in text-left text-navy">
      {/* Page Header */}
      <div className="space-y-2">
        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold flex items-center gap-2">
          <span className="w-6 h-[1px] bg-gold"></span>
          Visual Archives
        </h3>
        <h2 className="font-serif text-3xl font-bold text-navy uppercase leading-tight">
          Academic <span className="text-gold italic font-light">Gallery</span>
        </h2>
        <p className="text-navy/80 max-w-2xl text-xs leading-relaxed font-light mt-2">
          A visual record of global conferences, national sociology symposia, classroom lectures at University of Uyo, and empirical fieldwork operations across the villages and farmlands of southern Nigeria.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-navy/10 pb-4">
        {categories.map((cat, index) => (
          <button
            key={index}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2.5 rounded-none text-[10px] uppercase tracking-widest font-bold transition-all border ${
              activeCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-navy text-gold border-navy'
                : 'bg-[#fdfcf9] text-navy/70 border-navy/10 hover:bg-neutral-100 hover:text-navy'
            } cursor-pointer`}
          >
            {cat === 'all' ? 'All Images' : cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filteredImages.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredImages.map((img) => (
            <div 
              key={img.id} 
              onClick={() => setSelectedImage(img)}
              className="group relative bg-white rounded-none overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer border border-navy/10 hover:border-gold"
            >
              {/* Image box */}
              <div className="relative aspect-square overflow-hidden bg-navy/5">
                <img 
                  src={img.imageUrl} 
                  alt={img.caption} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale group-hover:grayscale-0 brightness-95"
                />
                <div className="absolute inset-0 bg-navy/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-none text-white border border-white/20">
                    <ZoomIn className="h-5 w-5 text-gold" />
                  </div>
                </div>
              </div>

              {/* Caption and meta */}
              <div className="p-4 space-y-2 text-left">
                <div className="flex items-center justify-between text-[9px] font-mono tracking-widest uppercase text-navy/50 font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3 text-gold" />
                    {img.category || "General"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gold" />
                    {new Date(img.date).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}
                  </span>
                </div>
                <p className="text-xs text-navy/85 font-light line-clamp-2 leading-relaxed">
                  {img.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-none py-12 px-6 text-center border border-navy/10 text-navy/50 space-y-2">
          <Camera className="h-10 w-10 mx-auto text-gold/60" />
          <p className="font-serif text-lg font-bold uppercase tracking-wide text-navy">No Gallery Images Present</p>
          <p className="text-xs font-light">Adjust your active category tab to see other images.</p>
        </div>
      )}

      {/* Lightbox / Fullscreen Modal Overlay */}
      {selectedImage && (
        <div className="fixed inset-0 bg-navy/95 z-50 flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="relative max-w-4xl w-full bg-white rounded-none overflow-hidden border border-gold/30 shadow-2xl animate-scale-up text-navy">
            {/* Close button */}
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-40 p-2 bg-navy hover:bg-navy-hover text-white hover:text-gold rounded-none transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid md:grid-cols-12">
              {/* Image Box */}
              <div className="md:col-span-8 bg-neutral-900 flex items-center justify-center min-h-[300px] md:min-h-[450px]">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.caption} 
                  referrerPolicy="no-referrer"
                  className="max-h-[70vh] max-w-full object-contain"
                />
              </div>

              {/* Informative Side Panel */}
              <div className="md:col-span-4 p-6 text-left flex flex-col justify-between space-y-6 bg-[#fdfcf9] border-t md:border-t-0 md:border-l border-navy/10 relative">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gold md:top-0 md:left-0 md:w-[3px] md:h-full"></div>
                <div className="space-y-4 pt-2 md:pt-0">
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest text-navy bg-white px-3 py-1 border border-navy/10 rounded-none shadow-xs">
                    <Tag className="h-3 w-3 text-gold" />
                    {selectedImage.category || "General"}
                  </span>
                  
                  <h4 className="font-serif font-bold text-lg text-navy uppercase tracking-wide">
                    Event Overview
                  </h4>
                  
                  <p className="text-xs text-navy/85 leading-relaxed font-light">
                    {selectedImage.caption}
                  </p>
                </div>

                <div className="pt-4 border-t border-navy/10 flex items-center gap-2 text-[10px] font-mono tracking-wider uppercase text-navy/50 font-bold">
                  <Calendar className="h-4 w-4 text-gold" />
                  <span>Recorded on: {new Date(selectedImage.date).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
