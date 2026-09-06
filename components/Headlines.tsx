import type { Headline } from '@/lib/espn'

function timeAgo(iso: string): string {
  const hours = Math.max(
    1,
    Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000)
  )
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function Headlines({ items }: { items: Headline[] }) {
  if (items.length === 0) return null

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] shadow-[var(--shadow-card)]">
      <ul>
        {items.map((item, i) => (
          <li
            key={item.url}
            className={i > 0 ? 'border-t border-[var(--gridline)]' : ''}
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 text-sm hover:bg-[var(--background)]"
            >
              <p className="font-medium">{item.headline}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {timeAgo(item.published)} &middot; ESPN
              </p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
