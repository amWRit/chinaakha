"use client";


import { useEffect, useState } from "react";
import { Instagram, Image as ImageIcon, FileText } from "lucide-react";
import dynamic from "next/dynamic";
const TextPoem = dynamic(() => import("../components/TextPoem"), { ssr: false });
const ImagePoem = dynamic(() => import("../components/ImagePoem"), { ssr: false });


export default function Home() {
  const [poems, setPoems] = useState<any[]>([]);
  const [tab, setTab] = useState<'text' | 'image'>('text');
  const [count, setCount] = useState(3);

  useEffect(() => {
    fetch("/api/poems")
      .then((res) => res.json())
      .then((data) => setPoems(data));
  }, []);

  const showMore = () => setCount((c) => Math.min(c + 3, poems.filter(p => p.type === 'TEXT').length));

  const textPoems = poems.filter((p) => p.type === 'TEXT');
  const imagePoems = poems.filter((p) => p.type === 'IMAGE');

  return (
    <main className="container">
      <div id="logo">
        <img src="/images/logo_final.png" alt="Chinaakha Logo" />
      </div>
      <div className="flex justify-center gap-6 my-8">
        <button
          className={`p-3 rounded-full border-2 transition-all ${tab === 'text' ? 'bg-pink-100 border-pink-400' : 'bg-white border-gray-200'} hover:border-pink-400`}
          onClick={() => setTab('text')}
          aria-label="Text Poems"
        >
          <FileText size={28} color={tab === 'text' ? '#e46c6e' : '#888'} />
        </button>
        <button
          className={`p-3 rounded-full border-2 transition-all ${tab === 'image' ? 'bg-pink-100 border-pink-400' : 'bg-white border-gray-200'} hover:border-pink-400`}
          onClick={() => setTab('image')}
          aria-label="Image Poems"
        >
          <ImageIcon size={28} color={tab === 'image' ? '#e46c6e' : '#888'} />
        </button>
      </div>

      {tab === 'text' && (
        <div>
          {textPoems.slice(0, count).map((poem) => (
            <TextPoem key={poem.id} content={poem.content} />
          ))}
          {count < textPoems.length && (
            <button className="button-30" onClick={showMore} style={{ margin: "2rem auto", display: "block" }}>
              Show More
            </button>
          )}
        </div>
      )}

      {tab === 'image' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-4" style={{ gridAutoRows: 'minmax(180px, 1fr)' }}>
          {imagePoems.map((item, idx) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-500 hover:scale-105"
              style={{ gridRow: idx % 3 === 0 ? 'span 2' : 'span 1' }}
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
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              background: "transparent",
              borderRadius: "50%",
              border: "2px solid #fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.10)"
            }}
          >
            <Instagram size={28} color="#fff" />
          </a>
        </div>
      </div>
    </main>
  );
}
