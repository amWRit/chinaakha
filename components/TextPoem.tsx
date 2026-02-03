import React, { useState, useMemo } from "react";

export default function TextPoem({ content, title, createdAt }: { content: string; title?: string; createdAt?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { truncatedContent, needsTruncation } = useMemo(() => {
    const lines = content.split('\n');
    const lineLimit = 8;
    
    if (lines.length <= lineLimit) {
      return { truncatedContent: content, needsTruncation: false };
    }
    
    return {
      truncatedContent: lines.slice(0, lineLimit).join('\n'),
      needsTruncation: true
    };
  }, [content]);
  
  return (
    <div className="blockquote">
      <div className="poem-glass-card">
        {title && (
          <div className="poem-header">
            <h3 className="poem-title">{title}</h3>
            {createdAt && (
              <div className="poem-date">
                {new Date(createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            )}
          </div>
        )}
        <div className="poem-content-wrapper">
          <div className={`poem-content ${!isExpanded && needsTruncation ? 'truncated' : ''}`}>
            {isExpanded || !needsTruncation ? content : truncatedContent}
          </div>

        </div>
        {needsTruncation && (
          <button 
            className="poem-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </div>
  );
}
