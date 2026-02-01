"use client";

import { useEffect, useState } from "react";
import { Instagram, Image as ImageIcon, FileText, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
const TextPoem = dynamic(() => import("../components/TextPoem"), { ssr: false });
const ImagePoem = dynamic(() => import("../components/ImagePoem"), { ssr: false });

export default function Home() {
  const [poems, setPoems] = useState<any[]>([]);
  const [tab, setTab] = useState<'text' | 'image'>('text');
  const [count, setCount] = useState(3);
  const [gridLayout, setGridLayout] = useState<number[]>([]);

  useEffect(() => {
    fetch("/api/poems")
      .then((res) => res.json())
      .then((data) => setPoems(data));
  }, []);

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

  return (
    <main className="container">
      <div id="logo">
        <img src="/images/logo_final.png" alt="Chinaakha Logo" />
      </div>

      {/* Enhanced Tab Buttons */}
      <div className="tab-container">
        <div className="tab-wrapper">
          <button
            className={`tab-button ${tab === 'text' ? 'active' : ''}`}
            onClick={() => setTab('text')}
            aria-label="Text Poems"
          >
            <div className="tab-icon-wrapper">
              <FileText size={24} strokeWidth={2.5} />
            </div>
            {/* <span className="tab-label">Text Poems</span> */}
            {tab === 'text' && (
              <div className="sparkle-container">
                <Sparkles size={16} className="sparkle" />
              </div>
            )}
          </button>

          <button
            className={`tab-button ${tab === 'image' ? 'active' : ''}`}
            onClick={() => setTab('image')}
            aria-label="Image Poems"
          >
            <div className="tab-icon-wrapper">
              <ImageIcon size={24} strokeWidth={2.5} />
            </div>
            {/* <span className="tab-label">Image Gallery</span> */}
            {tab === 'image' && (
              <div className="sparkle-container">
                <Sparkles size={16} className="sparkle" />
              </div>
            )}
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
              <TextPoem content={poem.content} />
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
            >
              <ImagePoem fileId={item.image?.fileId} title={item.title || ''} />
            </div>
          ))}
        </div>
      )}

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
            <Instagram size={28} color="#fff" />
          </a>
        </div>
      </div>
    </main>
  );
}
