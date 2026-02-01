import React from "react";
import Image from "next/image";

export default function ImagePoem({ fileId, title }: { fileId: string; title?: string }) {
  return (
    <div className="image-poem-wrapper">
      <div className="image-container">
        <Image
          src={`https://drive.google.com/uc?export=view&id=${fileId}`}
          alt={title || "Poem Image"}
          width={600}
          height={800}
          className="poem-image"
          style={{ 
            maxWidth: "100%", 
            height: "100%", 
            objectFit: "cover",
            display: "block"
          }}
        />
      </div>
      {title && (
        <div className="image-overlay">
          <div className="overlay-content">
            <h3 className="image-title">{title}</h3>
            <div className="title-underline"></div>
          </div>
        </div>
      )}
      <div className="image-glow"></div>
    </div>
  );
}
