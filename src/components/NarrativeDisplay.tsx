import React from 'react';
import type { NarrativeConfig } from '../lib/metric-visualizations';

interface NarrativeDisplayProps {
  config: NarrativeConfig;
}

// Simple HTML sanitizer (allows only safe tags)
function sanitizeHTML(html: string, allowedTags: string[]): string {
  const div = document.createElement('div');
  div.innerHTML = html;

  // Remove all elements not in allowed list
  const allElements = div.getElementsByTagName('*');
  for (let i = allElements.length - 1; i >= 0; i--) {
    const element = allElements[i];
    if (!allowedTags.includes(element.tagName.toLowerCase())) {
      element.remove();
    }
  }

  // Remove all event handlers and dangerous attributes
  const safeElements = div.getElementsByTagName('*');
  for (let i = 0; i < safeElements.length; i++) {
    const element = safeElements[i];
    const attributes = Array.from(element.attributes);
    attributes.forEach(attr => {
      // Remove event handlers (on*)
      if (attr.name.startsWith('on')) {
        element.removeAttribute(attr.name);
      }
      // Remove javascript: links
      if (attr.name === 'href' && attr.value.toLowerCase().startsWith('javascript:')) {
        element.setAttribute('href', '#');
      }
    });
  }

  return div.innerHTML;
}

export function NarrativeDisplay({ config }: NarrativeDisplayProps) {
  const {
    content,
    title,
    showTitle = true,
    allowedTags = ['p', 'h1', 'h2', 'h3', 'a', 'ul', 'li', 'strong', 'em', 'u', 'br']
  } = config;

  // Sanitize the HTML content
  const sanitizedContent = sanitizeHTML(content, allowedTags);

  return (
    <div className="narrative-display bg-white rounded-lg p-6 border border-neutral-200">
      {showTitle && title && (
        <h3 className="text-xl font-semibold text-neutral-900 mb-4">
          {title}
        </h3>
      )}

      <div
        className="prose prose-sm max-w-none narrative-content"
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
        .narrative-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #404040;
        }
        .narrative-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #525252;
        }
        .narrative-content p {
          margin-bottom: 1rem;
          color: #525252;
        }
        .narrative-content a {
          color: #2563eb;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .narrative-content a:hover {
          color: #1d4ed8;
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
        .narrative-content strong {
          font-weight: 600;
          color: #171717;
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
