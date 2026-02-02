import React from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";

export default function Markdown({ children }: { children: string }) {
  const html = React.useMemo(() => {
    // Use the synchronous API of marked
    return DOMPurify.sanitize(marked.parse(children || "") as string);
  }, [children]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
