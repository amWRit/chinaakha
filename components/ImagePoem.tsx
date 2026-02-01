import React from "react";
import Image from "next/image";

export default function ImagePoem({ fileId, title }: { fileId: string; title?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-500 hover:scale-105">
      <Image
        src={`https://drive.google.com/uc?export=view&id=${fileId}`}
        alt={title || "Poem Image"}
        width={600}
        height={800}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        style={{ maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
        {title && <h3 className="text-white text-2xl font-bold">{title}</h3>}
      </div>
    </div>
  );
}
