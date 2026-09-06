import type { GameArticle } from '@/lib/espn'

export function GameSummary({ article }: { article: GameArticle }) {
  return (
    <details className="group rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] shadow-[var(--shadow-card)]">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
        Game Summary
        <span className="text-[var(--text-muted)] transition-transform group-open:rotate-180">
          &darr;
        </span>
      </summary>
      <div className="space-y-3 border-t border-[var(--gridline)] px-4 py-3 text-sm text-[var(--text-secondary)]">
        {article.sections.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <h4 className="mb-1 font-semibold text-[var(--foreground)]">
                {section.heading}
              </h4>
            )}
            <div className="space-y-2">
              {section.paragraphs.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </details>
  )
}
