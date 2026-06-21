import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import PublicationsPage from './pages/PublicationsPage';
import ResearchPage from './pages/ResearchPage';
import GalleryPage from './pages/GalleryPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import UserDashboard from './pages/UserDashboard';
import LiveChatWidget from './components/LiveChatWidget';

import { AuthProvider, useAuth } from './components/AuthContext';
import { Publication, BlogPost, Project, GalleryImage } from './types';
import { fetchPublications, fetchProjects, fetchBlogPosts, fetchGalleryImages } from './services/db';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [publications, setPublications] = useState<Publication[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { user } = useAuth();

  const loadAllData = async () => {
    try {
      const [pubs, projs, blogs, gallery] = await Promise.all([
        fetchPublications(),
        fetchProjects(),
        fetchBlogPosts(),
        fetchGalleryImages()
      ]);
      setPublications(pubs);
      setProjects(projs);
      setBlogPosts(blogs);
      setGalleryImages(gallery);
    } catch (error) {
      console.error("Error loading application catalogs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-serif italic text-slate-500 text-sm">Synchronizing academic website database...</p>
        </div>
      ) : (
        <>
          {currentPage === 'home' && (
            <Home 
              onNavigate={handleNavigate} 
              latestBlogPosts={blogPosts} 
              recentPublications={publications} 
            />
          )}
          {currentPage === 'about' && (
            <About onNavigate={handleNavigate} />
          )}
          {currentPage === 'publications' && (
            <PublicationsPage publications={publications} />
          )}
          {currentPage === 'research' && (
            <ResearchPage projects={projects} />
          )}
          {currentPage === 'gallery' && (
            <GalleryPage galleryImages={galleryImages} />
          )}
          {currentPage === 'blog' && (
            <BlogPage blogPosts={blogPosts} />
          )}
          {(currentPage === 'contact' || currentPage === 'donate') && (
            <ContactPage scrollToDonation={currentPage === 'donate'} />
          )}
          {currentPage === 'admin' && (
            <AdminDashboard 
              publications={publications} 
              projects={projects} 
              blogPosts={blogPosts} 
              galleryImages={galleryImages} 
              onRefreshData={loadAllData} 
            />
          )}
          {currentPage === 'dashboard' && (
            user ? (
              <UserDashboard />
            ) : (
              <AuthPage onSuccess={() => setCurrentPage('dashboard')} />
            )
          )}
        </>
      )}
      <LiveChatWidget />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
