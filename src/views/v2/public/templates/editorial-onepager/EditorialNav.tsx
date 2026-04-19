'use client'
import type { EditorialContent } from './fixtures/editorial-fixtures'

export interface EditorialNavProps {
  content: EditorialContent['nav']
}

export function EditorialNav({ content }: EditorialNavProps) {
  return (
    <nav
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(250,247,242,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line-soft)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-3 shrink-0">
          <span
            className="flex items-center justify-center w-11 h-11 rounded-[10px] text-white"
            style={{
              background: 'var(--ink)',
              fontFamily: 'var(--font-editorial-display)',
              fontSize: '22px',
              lineHeight: 1,
            }}
          >
            {content.brandMark}
          </span>
          <span className="flex flex-col leading-[1.15]">
            <span
              className="text-[10px] uppercase tracking-[0.16em]"
              style={{ color: 'var(--muted)' }}
            >
              {content.eyebrow}
            </span>
            <span
              className="text-[18px]"
              style={{
                color: 'var(--ink)',
                fontFamily: 'var(--font-editorial-display)',
                fontWeight: 500,
              }}
            >
              {content.title}{' '}
              <span style={{ fontStyle: 'italic', fontWeight: 400 }}>
                {content.titleItalic}
              </span>
            </span>
          </span>
        </a>

        <div
          className="hidden md:flex items-center gap-9 text-[18px]"
          style={{
            color: 'var(--ink)',
            fontFamily: 'var(--font-editorial-display)',
            fontWeight: 500,
          }}
        >
          {content.anchors.map((anchor) => (
            <a
              key={anchor.href}
              href={anchor.href}
              className="relative hover:opacity-80 transition-opacity"
            >
              {anchor.label}
            </a>
          ))}
        </div>

        <a
          href="#cta"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium shrink-0 hover:opacity-90 transition"
          style={{ background: 'var(--ink)', color: '#fff' }}
        >
          {content.ctaLabel}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 7h10m0 0L8 3m4 4L8 11"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </nav>
  )
}

export default EditorialNav
