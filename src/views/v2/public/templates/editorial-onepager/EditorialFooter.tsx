'use client'
import type { EditorialContent } from './fixtures/editorial-fixtures'

export interface EditorialFooterProps {
  content: EditorialContent['footer']
}

export function EditorialFooter({ content }: EditorialFooterProps) {
  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: 'var(--purple-darker, #0D0626)',
        color: '#fff',
      }}
    >
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: 'var(--purple-soft, #9B86F0)' }}
                aria-hidden="true"
              />
              <span className="font-medium">{content.organizationName}</span>
            </div>
            {content.tagline && (
              <p
                className="mt-4 text-sm max-w-sm"
                style={{
                  color: 'rgba(244,241,250,0.7)',
                  lineHeight: 1.6,
                }}
              >
                {content.tagline}
              </p>
            )}
          </div>

          {content.columns.map((column) => (
            <div key={column.heading} className="md:col-span-3">
              <div
                className="text-[11px] uppercase tracking-[0.18em] mb-3"
                style={{ color: 'rgba(244,241,250,0.55)' }}
              >
                {column.heading}
              </div>
              <ul className="space-y-2 text-sm">
                {column.items.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <a href={item.href} style={{ color: '#fff' }}>
                        {item.label}
                      </a>
                    ) : (
                      <span style={{ color: 'rgba(244,241,250,0.85)' }}>
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default EditorialFooter
