'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { updateDashboardOrder } from '@/app/actions'
import {
  dashboardItemKey,
  type DashboardItem,
  type DashboardSectionKey,
} from '@/lib/dashboardOrder'

const SECTION_LABELS: Record<DashboardSectionKey, string> = {
  liveTicker: 'Live Ticker',
  playoffOdds: 'Playoff Odds Tracker',
  rankings: 'National Rankings',
}

function itemLabel(item: DashboardItem, teamNames: Map<string, string>) {
  return item.type === 'team'
    ? (teamNames.get(item.id) ?? 'Team')
    : SECTION_LABELS[item.key]
}

function SortableRow({ id, label }: { id: string; label: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--background)] px-3 py-2 text-sm ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${label}`}
        className="touch-none cursor-grab px-1 text-[var(--text-muted)] active:cursor-grabbing"
      >
        &#9776;
      </button>
      <span className="flex-1 truncate">{label}</span>
    </li>
  )
}

export function ReorderPanel({
  initialOrder,
  teamNames,
}: {
  initialOrder: DashboardItem[]
  teamNames: Map<string, string>
}) {
  const [order, setOrder] = useState(initialOrder)
  const [isSaving, startSaving] = useTransition()
  const [saved, setSaved] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setOrder((prev) => {
      const oldIndex = prev.findIndex((i) => dashboardItemKey(i) === active.id)
      const newIndex = prev.findIndex((i) => dashboardItemKey(i) === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
    setSaved(false)
  }

  function save() {
    setSaved(false)
    startSaving(async () => {
      await updateDashboardOrder(order)
      setSaved(true)
    })
  }

  return (
    <>
      <p className="mt-3 text-sm text-[var(--text-muted)]">
        Drag to reorder team cards and dashboard sections.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={order.map(dashboardItemKey)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="mt-3 space-y-1.5">
            {order.map((item) => (
              <SortableRow
                key={dashboardItemKey(item)}
                id={dashboardItemKey(item)}
                label={itemLabel(item, teamNames)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={save}
        disabled={isSaving}
        className="mt-3 rounded-lg bg-[var(--seq-fill)] px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSaving ? 'Saving…' : 'Save order'}
      </button>
      {saved && !isSaving && (
        <span className="ml-2 text-sm text-[var(--text-muted)]">Saved.</span>
      )}
    </>
  )
}
