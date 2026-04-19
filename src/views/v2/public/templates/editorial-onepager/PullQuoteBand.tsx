'use client'
import type { EditorialContent } from './fixtures/editorial-fixtures'

export interface PullQuoteBandProps {
  content: EditorialContent['pullQuote']
}

export function PullQuoteBand({ content }: PullQuoteBandProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'var(--purple-darker, #0D0626)',
        color: '#fff',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(255,255,255,0.15) 1px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 30%, black 40%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 30%, black 40%, transparent 85%)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-28">
        <div
          className="text-[11px] uppercase tracking-[0.2em]"
          style={{ color: 'rgba(244,241,250,0.6)' }}
        >
          The moment that mattered
        </div>

        <blockquote className="mt-10 max-w-4xl">
          <p
            className="text-4xl md:text-6xl"
            style={{
              color: '#fff',
              fontFamily: 'var(--font-editorial-serif)',
              lineHeight: 1.1,
            }}
          >
            <span style={{ color: 'var(--purple-soft, #9B86F0)' }}>&ldquo;</span>
            {content.text}
            <span style={{ color: 'var(--purple-soft, #9B86F0)' }}>&rdquo;</span>
          </p>
          <footer
            className="mt-6 text-sm"
            style={{ color: 'rgba(244,241,250,0.7)' }}
          >
            {content.attribution}
          </footer>
        </blockquote>

        <div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 pt-16"
          style={{ borderTop: '1px solid rgba(244,241,250,0.12)' }}
        >
          {content.stats.map((stat) => (
            <div key={stat.label}>
              <div
                className="text-[88px]"
                style={{
                  color: '#fff',
                  fontFamily: 'var(--font-editorial-display)',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                className="mt-2 text-sm"
                style={{
                  color: 'rgba(244,241,250,0.75)',
                  maxWidth: '220px',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PullQuoteBand
