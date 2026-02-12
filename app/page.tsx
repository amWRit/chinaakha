"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, FileText, Shield, Type } from "lucide-react";
import dynamic from "next/dynamic";
const TextPoem = dynamic(() => import("../components/TextPoem"), { ssr: false });
const ImagePoem = dynamic(() => import("../components/ImagePoem"), { ssr: false });
const ImageLightbox = dynamic(() => import("../components/ImageLightBox"), { ssr: false });
const AdminFAB = dynamic(() => import("../components/AdminFAB"), { ssr: false });
const AddTextPoemModal = dynamic(() => import("../components/AddTextPoemModal"), { ssr: false });
const AddImagePoemModal = dynamic(() => import("../components/AddImagePoemModal"), { ssr: false });
const Toast = dynamic(() => import("../components/Toast"), { ssr: false });

export default function Home() {
  const [poems, setPoems] = useState<any[]>([]);
  const [tab, setTab] = useState<'text' | 'image'>('text');
  const [count, setCount] = useState(3);
  const [gridLayout, setGridLayout] = useState<number[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ fileId: string; title: string } | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showUnicode, setShowUnicode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const tapCount = useRef(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  // Detect mobile
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop: listen for typing 'admin' or 'ruma'
  useEffect(() => {
    if (isMobile) return;
    let buffer = '';
    const handler = (e: KeyboardEvent) => {
      buffer += e.key.toLowerCase();
      if (buffer.length > 5) buffer = buffer.slice(-5);
      if (buffer.endsWith('admin') || buffer.endsWith('ruma')) {
        setShowAdmin(true);
        setShowUnicode(true);
        buffer = '';
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isMobile]);

  // Mobile: triple-tap logo
  const handleLogoTap = () => {
    if (!isMobile) return;
    tapCount.current += 1;
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => {
      tapCount.current = 0;
    }, 1000);
    if (tapCount.current === 3) {
      setShowAdmin(true);
      setShowUnicode(true);
      tapCount.current = 0;
    }
  };

  useEffect(() => {
    fetch("/api/poems")
      .then((res) => res.json())
      .then((data) => setPoems(data.filter((p: any) => p.status === 'PUBLISHED')));
  }, []);

  // Check admin authentication status
  useEffect(() => {
    fetch("/api/admins", { method: "GET" })
      .then((res) => {
        if (res.status === 200 && res.headers.get("x-admin-authenticated") === "true") {
          setIsAdminAuthenticated(true);
        }
      })
      .catch(() => setIsAdminAuthenticated(false));
  }, []);

  const refreshPoems = () => {
    fetch("/api/poems")
      .then((res) => res.json())
      .then((data) => setPoems(data.filter((p: any) => p.status === 'PUBLISHED')));
  };

  useEffect(() => {
    // Generate randomized grid spans for images
    const imagePoems = poems.filter((p) => p.type === 'IMAGE');
    const layout = imagePoems.map(() => {
      const random = Math.random();
      if (random > 0.7) return 2; // 30% chance of spanning 2 rows
      return 1; // 70% chance of spanning 1 row
    });
    setGridLayout(layout);
  }, [poems]);

  const showMore = () => setCount((c) => Math.min(c + 3, poems.filter(p => p.type === 'TEXT').length));

  const textPoems = poems.filter((p) => p.type === 'TEXT');
  const imagePoems = poems.filter((p) => p.type === 'IMAGE');

  const handleImageClick = (fileId: string, title: string) => {
    setSelectedImage({ fileId, title });
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setTimeout(() => setSelectedImage(null), 300); // Clear after animation
  };

  return (
    <main className="container">
      <div id="logo" onClick={handleLogoTap} style={{ cursor: isMobile ? 'pointer' : undefined }}>
        <img src="/images/logos/logo_final.png" alt="Chinaakha Logo" />
      </div>

      {/* Admin Button */}
      {showAdmin && (
        <button
          className="admin-btn"
          style={{ 
            position: 'fixed', 
            top: 24, 
            right: 24, 
            zIndex: 1000,
            backgroundColor: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={async () => {
            // Check session
            const res = await fetch('/api/admins', { method: 'GET' });
            if (res.status === 200 && res.headers.get('x-admin-authenticated') === 'true') {
              router.push('/admin/dashboard');
            } else {
              router.push('/admin/login');
            }
          }}
        >
          <Shield size={18} />
          <span>Admin</span>
        </button>
      )}

      {/* Unicode Tool Button */}
      {showUnicode && (
        <button
          className="unicode-btn"
          style={{ 
            position: 'fixed', 
            top: 24, 
            left: 24, 
            zIndex: 1000,
            backgroundColor: '#e46c6e',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(228,108,110,0.3)',
            transition: 'all 0.2s ease'
          }}
          onClick={() => router.push('/tools/unicode')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#d35d5f';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(228,108,110,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#e46c6e';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(228,108,110,0.3)';
          }}
        >
          <Type size={18} />
          <span>Unicode</span>
        </button>
      )}

      {/* Enhanced Tab Buttons */}
      <div className="tab-container">
        <div className="tab-wrapper">
          <button
            className={`tab-button ${tab === 'text' ? 'active' : ''}`}
            onClick={() => setTab('text')}
            aria-label="Text Poems"
          >
            <div className="tab-icon-wrapper">
              <FileText size={18} strokeWidth={2.5} />
            </div>
            {/* <span className="tab-label">Text Poems</span> */}
          </button>

          <button
            className={`tab-button ${tab === 'image' ? 'active' : ''}`}
            onClick={() => setTab('image')}
            aria-label="Image Poems"
          >
            <div className="tab-icon-wrapper">
              <ImageIcon size={18} strokeWidth={2.5} />
            </div>
            {/* <span className="tab-label">Image Gallery</span> */}
          </button>
        </div>
        <div className={`tab-indicator ${tab === 'image' ? 'right' : 'left'}`} />
      </div>

      {/* Text Poems Tab */}
      {tab === 'text' && (
        <div className="text-poems-container">
          {textPoems.slice(0, count).map((poem, index) => (
            <div 
              key={poem.id} 
              className="poem-card-wrapper"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <TextPoem content={poem.content} title={poem.title} createdAt={poem.createdAt} />
            </div>
          ))}
          {count < textPoems.length && (
            <button className="button-30 show-more-btn" onClick={showMore}>
              Show More
            </button>
          )}
        </div>
      )}

      {/* Image Poems Tab */}
      {tab === 'image' && (
        <div className="image-gallery">
          {imagePoems.map((item, idx) => (
            <div
              key={item.id}
              className="image-card"
              style={{
                gridRow: `span ${gridLayout[idx] || 1}`,
                animationDelay: `${idx * 0.08}s`
              }}
              onClick={() => handleImageClick(item.image?.fileId, item.title || '')}
            >
              <ImagePoem fileId={item.image?.fileId} title={item.title || ''} />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <ImageLightbox
          fileId={selectedImage.fileId}
          title={selectedImage.title}
          isOpen={lightboxOpen}
          onClose={closeLightbox}
        />
      )}

      {/* Admin FAB - Only show if authenticated */}
      {isAdminAuthenticated && (
        <AdminFAB
          onAddTextPoem={() => setShowTextModal(true)}
          onAddImagePoem={() => setShowImageModal(true)}
        />
      )}

      {/* Add Text Poem Modal */}
      <AddTextPoemModal
        isOpen={showTextModal}
        onClose={() => setShowTextModal(false)}
        onSuccess={() => {
          refreshPoems();
          setToastMessage("Poem added to drafts successfully!");
        }}
        onError={(message) => setToastMessage(message)}
      />

      {/* Add Image Poem Modal */}
      <AddImagePoemModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSuccess={() => {
          refreshPoems();
          setToastMessage("Image poem added to drafts successfully!");
        }}
        onError={(message) => setToastMessage(message)}
      />

      {/* Toast Message */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      <div className="text">- RANDOM FEELINGS PUT INTO WORDS -</div>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <span style={{ fontSize: 18, color: "#e46c6e" }}>❤️</span>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
          <a
            href="https://instagram.com/chinaakha"
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-link"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
}