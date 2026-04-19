'use client'
import type { EditorialContent } from './fixtures/editorial-fixtures'

export interface QuarterlyCTABandProps {
  content: EditorialContent['cta']
}

export function QuarterlyCTABand({ content }: QuarterlyCTABandProps) {
  return (
    <section id="cta" className="relative py-28 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-7">
            <div
              className="text-[11px] uppercase tracking-[0.2em]"
              style={{ color: 'var(--muted)' }}
            >
              What&rsquo;s next
            </div>
            <h2
              className="mt-5 text-5xl md:text-6xl"
              style={{
                color: 'var(--ink)',
                fontFamily: 'var(--font-editorial-display)',
                lineHeight: 1.02,
              }}
            >
              {content.headline}
            </h2>
            <p
              className="mt-6 text-lg max-w-xl"
              style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}
            >
              {content.body}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="Signup form coming soon"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium disabled:cursor-not-allowed disabled:opacity-80"
                style={{ background: 'var(--ink)', color: 'var(--bg)' }}
              >
                {content.buttonLabel}
                <span
                  className="text-xs"
                  style={{ color: 'var(--bg-alt)' }}
                  aria-hidden="true"
                >
                  coming soon
                </span>
              </button>
            </div>
          </div>

          {content.scheduleLabel && (
            <div className="md:col-span-5">
              <div
                className="p-7 rounded-xl"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                }}
              >
                <div
                  className="text-[11px] uppercase tracking-[0.16em]"
                  style={{ color: 'var(--muted)' }}
                >
                  Quarterly review schedule
                </div>
                <p
                  className="mt-4 text-base"
                  style={{ color: 'var(--ink)', fontWeight: 500 }}
                >
                  {content.scheduleLabel}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default QuarterlyCTABand
