'use client'

import { useEffect, useRef, useState, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

const PULL_THRESHOLD = 70 // px of drag needed to trigger a refresh
const MAX_PULL = 110 // cap on how far the indicator travels
const RESISTANCE = 0.5 // drag feels heavier than a 1:1 finger-follow

export function PullToRefresh({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number | null>(null)
  const pullRef = useRef(0)

  useEffect(() => {
    pullRef.current = pull
  }, [pull])

  // Once router.refresh()'s transition settles, drop the indicator.
  useEffect(() => {
    if (refreshing && !isPending) {
      const timeout = setTimeout(() => {
        setRefreshing(false)
        setPull(0)
      }, 250)
      return () => clearTimeout(timeout)
    }
  }, [isPending, refreshing])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onTouchStart(e: TouchEvent) {
      if (refreshing || window.scrollY > 0) {
        startYRef.current = null
        return
      }
      startYRef.current = e.touches[0].clientY
    }

    function onTouchMove(e: TouchEvent) {
      if (startYRef.current == null) return
      if (window.scrollY > 0) {
        startYRef.current = null
        setPull(0)
        return
      }
      const delta = e.touches[0].clientY - startYRef.current
      if (delta <= 0) {
        setPull(0)
        return
      }
      // Take over the gesture so the native overscroll bounce doesn't fight
      // our indicator (touchmove has to be a non-passive listener for this).
      if (e.cancelable) e.preventDefault()
      setPull(Math.min(delta * RESISTANCE, MAX_PULL))
    }

    function onTouchEnd() {
      if (startYRef.current == null) return
      startYRef.current = null
      if (pullRef.current >= PULL_THRESHOLD) {
        setRefreshing(true)
        startTransition(() => {
          router.refresh()
        })
      } else {
        setPull(0)
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [refreshing, router, startTransition])

  const showIndicator = refreshing || pull > 0
  const indicatorHeight = refreshing ? PULL_THRESHOLD : pull
  const progress = Math.min(pull / PULL_THRESHOLD, 1)

  return (
    <div ref={containerRef} className="flex flex-1 flex-col">
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden"
        style={{
          height: indicatorHeight,
          transition: refreshing ? undefined : 'height 200ms ease-out',
        }}
        aria-hidden={!showIndicator}
      >
        <div
          className={`h-5 w-5 rounded-full border-2 border-[var(--seq-fill)] border-t-transparent ${
            refreshing ? 'animate-spin' : ''
          }`}
          style={
            refreshing
              ? undefined
              : { transform: `rotate(${progress * 360}deg)`, opacity: progress }
          }
        />
      </div>
      {children}
    </div>
  )
}
