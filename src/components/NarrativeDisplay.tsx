import DOMPurify from 'dompurify';
import type { NarrativeConfig } from '../lib/metric-visualizations';

interface NarrativeDisplayProps {
  config: NarrativeConfig;
}

export function NarrativeDisplay({ config }: NarrativeDisplayProps) {
  const {
    content,
    title,
    showTitle = true,
    allowedTags = ['p', 'h1', 'h2', 'h3', 'a', 'ul', 'li', 'strong', 'em', 'u', 'br']
  } = config;

  // Sanitize the HTML content using DOMPurify
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false
  });

  return (
    <div className="narrative-display bg-white dark:bg-transparent rounded-lg p-6 border border-neutral-200 dark:border-transparent">
      {showTitle && title && (
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          {title}
        </h3>
      )}

      <div
        className="prose prose-sm dark:prose-invert max-w-none narrative-content"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        style={{
          // Custom styles for narrative content
          lineHeight: '1.7',
        }}
      />

      <style>{`
        .narrative-content h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #171717;
        }
        .dark .narrative-content h1 {
          color: #f3f4f6;
        }
        .narrative-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #404040;
        }
        .dark .narrative-content h2 {
          color: #e5e7eb;
        }
        .narrative-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #525252;
        }
        .dark .narrative-content h3 {
          color: #d1d5db;
        }
        .narrative-content p {
          margin-bottom: 1rem;
          color: #525252;
        }
        .dark .narrative-content p {
          color: #9ca3af;
        }
        .narrative-content a {
          color: #2563eb;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .narrative-content a:hover {
          color: #1d4ed8;
        }
        .dark .narrative-content a {
          color: #60a5fa;
        }
        .dark .narrative-content a:hover {
          color: #93c5fd;
        }
        .narrative-content ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .narrative-content li {
          margin-bottom: 0.5rem;
          color: #525252;
        }
        .dark .narrative-content li {
          color: #9ca3af;
        }
        .narrative-content strong {
          font-weight: 600;
          color: #171717;
        }
        .dark .narrative-content strong {
          color: #f3f4f6;
        }
        .narrative-content em {
          font-style: italic;
        }
        .narrative-content u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
