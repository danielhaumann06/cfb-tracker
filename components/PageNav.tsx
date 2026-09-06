'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const STACK_KEY = 'cfb_nav_stack'
const INDEX_KEY = 'cfb_nav_index'

function readNavState(): { stack: string[]; index: number } {
  try {
    const stack = JSON.parse(sessionStorage.getItem(STACK_KEY) ?? 'null')
    const index = JSON.parse(sessionStorage.getItem(INDEX_KEY) ?? 'null')
    if (Array.isArray(stack) && typeof index === 'number') {
      return { stack, index }
    }
  } catch {
    // sessionStorage unavailable (private mode, etc.) - fall through
  }
  return { stack: [], index: -1 }
}

function writeNavState(stack: string[], index: number) {
  try {
    sessionStorage.setItem(STACK_KEY, JSON.stringify(stack))
    sessionStorage.setItem(INDEX_KEY, JSON.stringify(index))
  } catch {
    // ignore - Forward just won't persist across reloads this session
  }
}

// The browser deliberately doesn't expose canGoForward, so we track our own
// per-tab navigation stack in sessionStorage to know whether Forward has
// anywhere to go, distinguishing "moved back/forward" from "navigated fresh"
// (which should drop any stale forward entries, same as real browser history).
function useCanGoForward(): boolean {
  const pathname = usePathname()
  const [canGoForward, setCanGoForward] = useState(false)

  useEffect(() => {
    let { stack, index } = readNavState()

    if (stack.length === 0) {
      stack = [pathname]
      index = 0
    } else if (pathname === stack[index]) {
      // same page (e.g. first mount) - no change
    } else if (index + 1 < stack.length && pathname === stack[index + 1]) {
      index += 1
    } else if (index - 1 >= 0 && pathname === stack[index - 1]) {
      index -= 1
    } else {
      stack = [...stack.slice(0, index + 1), pathname]
      index = stack.length - 1
    }

    writeNavState(stack, index)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with sessionStorage/navigation, an external system, not derivable during render
    setCanGoForward(index < stack.length - 1)
  }, [pathname])

  return canGoForward
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M15 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ForwardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M4 11.5L12 4l8 7.5M6 9.5V20h5v-6h2v6h5V9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TabButton({
  onClick,
  href,
  label,
  icon,
}: {
  onClick?: () => void
  href?: string
  label: string
  icon: React.ReactNode
}) {
  const className =
    'flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[var(--text-secondary)] hover:text-[var(--foreground)]'

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        {icon}
        <span className="text-[11px]">{label}</span>
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} className={className}>
      {icon}
      <span className="text-[11px]">{label}</span>
    </button>
  )
}

export function PageNav() {
  const router = useRouter()
  const canGoForward = useCanGoForward()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border-hairline)] bg-[var(--surface-1)]/90 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface-1)]/70"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-around px-2">
        <TabButton onClick={() => router.back()} label="Back" icon={<BackIcon />} />
        {canGoForward && (
          <TabButton
            onClick={() => router.forward()}
            label="Forward"
            icon={<ForwardIcon />}
          />
        )}
        <TabButton href="/" label="Home" icon={<HomeIcon />} />
      </div>
    </nav>
  )
}
