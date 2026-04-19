'use client'
import type { EditorialContent } from './fixtures/editorial-fixtures'

export interface EditorialHeroProps {
  content: EditorialContent['hero']
}

export function EditorialHero({ content }: EditorialHeroProps) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(107, 79, 230, 0.25) 1px, transparent 1.2px)',
          backgroundSize: '22px 22px',
          maskImage:
            'radial-gradient(ellipse 90% 75% at 50% 40%, black 35%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 75% at 50% 40%, black 35%, transparent 85%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute pointer-events-none"
        style={{
          inset: '-10% -10% auto -10%',
          height: '75%',
          background:
            'radial-gradient(40% 55% at 20% 35%, rgba(107,79,230,0.22), transparent 70%), radial-gradient(35% 50% at 85% 20%, rgba(201,154,43,0.14), transparent 70%), radial-gradient(50% 60% at 60% 75%, rgba(155,134,240,0.18), transparent 70%)',
          filter: 'blur(40px)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-24">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-[0.14em] font-medium"
            style={{
              background: 'var(--green-soft)',
              border: '1px solid var(--green-line)',
              color: 'var(--green-emphasis)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--green-emphasis)' }}
              aria-hidden="true"
            />
            {content.eyebrow}
          </span>
          {content.eyebrowMeta && (
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              {content.eyebrowMeta}
            </span>
          )}
        </div>

        <h1
          className="mt-10 text-[60px] md:text-[112px] leading-[0.96]"
          style={{
            color: 'var(--ink)',
            fontFamily: 'var(--font-editorial-display)',
            letterSpacing: '-0.022em',
          }}
        >
          {content.headlinePrefix}
          <br />
          <em
            style={{
              color: 'var(--green-emphasis)',
              fontStyle: 'italic',
              fontFamily: 'var(--font-editorial-display)',
            }}
          >
            {content.headlineEmphasis}
          </em>{' '}
          {content.headlineSuffix}
        </h1>

        <p
          className="mt-8 max-w-3xl text-xl md:text-[26px]"
          style={{
            color: 'var(--ink-soft)',
            fontFamily: 'var(--font-editorial-display)',
            lineHeight: 1.45,
          }}
        >
          {content.supporting}
          {content.supportingEmphasis && (
            <span style={{ fontStyle: 'italic' }}>
              {' '}
              {content.supportingEmphasis}
            </span>
          )}
        </p>
      </div>
    </section>
  )
}

export default EditorialHero
