'use client'

import { useState } from 'react'
import { ReorderPanel } from '@/components/ReorderPanel'
import { updateConferenceLayout } from '@/app/actions'
import {
  CONFERENCE_SECTION_LABELS,
  type ConferenceSectionKey,
} from '@/lib/conferenceLayout'

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.83l-1.17-1.17a2 2 0 0 0-2.83 0L4 16v4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ConferenceLayoutMenu({
  initialOrder,
}: {
  initialOrder: ConferenceSectionKey[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Reorder page sections"
        className="flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--foreground)]"
      >
        <EditIcon />
        Reorder
      </button>

      {open && (
        <section className="absolute right-0 top-full z-30 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4 shadow-[var(--shadow-card-hover)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Reorder Page</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-[var(--text-secondary)] underline underline-offset-2"
            >
              Close
            </button>
          </div>
          <ReorderPanel
            initialOrder={initialOrder}
            getKey={(key) => key}
            getLabel={(key) => CONFERENCE_SECTION_LABELS[key]}
            onSave={updateConferenceLayout}
            helpText="Drag to reorder this page's sections."
          />
        </section>
      )}
    </div>
  )
}
