import React, { useState } from 'react';
import { Bold, Italic, Link as LinkIcon, List, Heading1, Heading2, Heading3, Eye, Code } from 'lucide-react';
import type { NarrativeConfig } from '../lib/metric-visualizations';
import { NarrativeDisplay } from './NarrativeDisplay';

interface NarrativeEditorProps {
  config: NarrativeConfig;
  onChange: (config: NarrativeConfig) => void;
}

export function NarrativeEditor({ config, onChange }: NarrativeEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showHTMLView, setShowHTMLView] = useState(false);

  const insertHTML = (htmlToInsert: string) => {
    const textarea = document.getElementById('narrative-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newContent =
      textarea.value.substring(0, start) +
      htmlToInsert.replace('SELECTED', selectedText || 'text') +
      textarea.value.substring(end);

    onChange({ ...config, content: newContent });

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + htmlToInsert.indexOf('SELECTED');
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbar = [
    { icon: Heading1, label: 'Heading 1', html: '<h1>SELECTED</h1>' },
    { icon: Heading2, label: 'Heading 2', html: '<h2>SELECTED</h2>' },
    { icon: Heading3, label: 'Heading 3', html: '<h3>SELECTED</h3>' },
    { icon: Bold, label: 'Bold', html: '<strong>SELECTED</strong>' },
    { icon: Italic, label: 'Italic', html: '<em>SELECTED</em>' },
    { icon: LinkIcon, label: 'Link', html: '<a href="https://example.com">SELECTED</a>' },
    { icon: List, label: 'Bullet List', html: '<ul>\n  <li>SELECTED</li>\n  <li>Item 2</li>\n</ul>' },
  ];

  return (
    <div className="space-y-4">
      {/* Title Input */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., NDE Academic Classification"
        />
      </div>

      {/* Show Title Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="show-title"
          checked={config.showTitle !== false}
          onChange={(e) => onChange({ ...config, showTitle: e.target.checked })}
          className="rounded border-neutral-300"
        />
        <label htmlFor="show-title" className="text-sm text-neutral-700">
          Show title in display
        </label>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-neutral-100 rounded-md border border-neutral-200 flex-wrap">
        {toolbar.map((tool, index) => (
          <button
            key={index}
            type="button"
            onClick={() => insertHTML(tool.html)}
            className="p-2 hover:bg-white rounded transition-colors"
            title={tool.label}
          >
            <tool.icon className="w-4 h-4 text-neutral-600" />
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowHTMLView(!showHTMLView)}
          className={`p-2 rounded transition-colors ${showHTMLView ? 'bg-blue-100 text-blue-600' : 'hover:bg-white'}`}
          title="Toggle HTML view"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`p-2 rounded transition-colors ${showPreview ? 'bg-blue-100 text-blue-600' : 'hover:bg-white'}`}
          title="Toggle preview"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Content Editor */}
      {!showPreview ? (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Content {showHTMLView && '(HTML)'}
          </label>
          <textarea
            id="narrative-textarea"
            value={config.content}
            onChange={(e) => onChange({ ...config, content: e.target.value })}
            className="w-full h-64 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Enter your narrative content here... You can use HTML tags or click the toolbar buttons."
          />
          <p className="mt-2 text-xs text-neutral-500">
            Use the toolbar buttons to insert formatted content, or write HTML directly.
            {config.maxLength && ` Max ${config.maxLength} characters.`}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Current: {config.content.length} characters
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-neutral-700">
              Preview
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Back to editing
            </button>
          </div>
          <div className="border border-neutral-300 rounded-md p-4 bg-neutral-50">
            <NarrativeDisplay config={config} />
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-900 font-medium mb-1">💡 Formatting Tips:</p>
        <ul className="text-xs text-blue-800 space-y-0.5 ml-4 list-disc">
          <li>Use the toolbar buttons to insert formatted content</li>
          <li>Select text first, then click a button to wrap it in formatting</li>
          <li>For links, edit the href="..." to your actual URL</li>
          <li>Use the preview button to see how it will look</li>
        </ul>
      </div>
    </div>
  );
}
