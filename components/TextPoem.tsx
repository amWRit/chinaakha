import React from "react";

export default function TextPoem({ content }: { content: string }) {
  return (
    <blockquote className="blockquote">
      <h1>{content}</h1>
    </blockquote>
  );
}
