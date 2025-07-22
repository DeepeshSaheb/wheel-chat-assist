import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content, isUser }) => {
  if (isUser) {
    // User messages are displayed as plain text
    return <p className="whitespace-pre-wrap text-sm sm:text-base">{content}</p>;
  }

  // Bot messages are rendered as markdown with elegant styling
  return (
    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize how different markdown elements are rendered
          h1: ({ children }) => (
            <h1 className="text-lg sm:text-xl font-bold mb-2 text-foreground">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg font-semibold mb-2 text-foreground">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-semibold mb-1 text-foreground">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-sm sm:text-base mb-2 text-foreground leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-1 text-sm sm:text-base text-foreground">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1 text-sm sm:text-base text-foreground">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm sm:text-base text-foreground">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">{children}</em>
          ),
          code: ({ children }) => (
            <code className="bg-muted px-1 py-0.5 rounded text-xs sm:text-sm font-mono text-foreground">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-2 text-xs sm:text-sm font-mono text-foreground">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-sm sm:text-base text-muted-foreground mb-2">{children}</blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} className="text-primary underline hover:text-primary/80 text-sm sm:text-base" target="_blank" rel="noopener noreferrer">{children}</a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};