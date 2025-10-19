import { ExternalLink } from 'lucide-react';

interface NarrativeLink {
  label: string;
  url: string;
}

interface GoalNarrativeDetailProps {
  title?: string;
  summary: string;
  highlights?: string[];
  links?: NarrativeLink[];
  imageUrl?: string;
  dataSource?: string;
}

export function GoalNarrativeDetail({
  title,
  summary,
  highlights,
  links,
  imageUrl,
  dataSource
}: GoalNarrativeDetailProps) {
  return (
    <div className="space-y-4">
      {title && <h4 className="font-semibold text-neutral-900">{title}</h4>}

      {/* Summary Section */}
      <div className="bg-white rounded-lg border border-neutral-200 p-5">
        <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
          {summary}
        </p>

        {/* Highlights/Key Points */}
        {highlights && highlights.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <h5 className="text-sm font-semibold text-neutral-900 mb-2">Key Highlights</h5>
            <ul className="space-y-2">
              {highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Data Source */}
        {dataSource && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <p className="text-xs text-neutral-500">
              <span className="font-medium">Data Source:</span> {dataSource}
            </p>
          </div>
        )}
      </div>

      {/* Image (if provided) */}
      {imageUrl && (
        <div className="rounded-lg overflow-hidden border border-neutral-200">
          <img
            src={imageUrl}
            alt={title || 'Goal visualization'}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Links Section */}
      {links && links.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-semibold text-neutral-900">Related Resources</h5>
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-white rounded-lg border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-colors group"
            >
              <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 flex-shrink-0" />
              <span className="text-sm text-neutral-700 group-hover:text-neutral-900 group-hover:underline">
                {link.label}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
