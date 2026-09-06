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

export function ReorderPanel<T>({
  initialOrder,
  getKey,
  getLabel,
  onSave,
  helpText = 'Drag to reorder.',
}: {
  initialOrder: T[]
  getKey: (item: T) => string
  getLabel: (item: T) => string
  onSave: (items: T[]) => Promise<void>
  helpText?: string
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
      const oldIndex = prev.findIndex((i) => getKey(i) === active.id)
      const newIndex = prev.findIndex((i) => getKey(i) === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
    setSaved(false)
  }

  function save() {
    setSaved(false)
    startSaving(async () => {
      await onSave(order)
      setSaved(true)
    })
  }

  return (
    <>
      <p className="mt-3 text-sm text-[var(--text-muted)]">{helpText}</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={order.map(getKey)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="mt-3 space-y-1.5">
            {order.map((item) => (
              <SortableRow
                key={getKey(item)}
                id={getKey(item)}
                label={getLabel(item)}
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
