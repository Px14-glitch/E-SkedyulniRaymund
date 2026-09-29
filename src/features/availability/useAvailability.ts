import { useState } from "react"
import type { RecurringAvail, OneTimeOverride, AvailEditTarget, TimetablePosition } from "./types"
import { INITIAL_RECURRING, INITIAL_OVERRIDES } from "./data"

// This week, on today. Phones start on the one-day view (big and easy to read); tablets and computers show the whole week.
function initialTimetablePosition(): TimetablePosition {
  return {
    weekOffset: 0,
    view: window.matchMedia("(min-width: 640px)").matches ? "week" : "day",
    dayIndex: (new Date().getDay() + 6) % 7,
  }
}

export function useAvailability() {
  const [recurringEntries, setRecurringEntries] = useState<RecurringAvail[]>(INITIAL_RECURRING)
  const [overrides, setOverrides] = useState<OneTimeOverride[]>(INITIAL_OVERRIDES)
  const [editTarget, setEditTarget] = useState<AvailEditTarget | null>(null)
  // Kept here so the timetable shows the same week and view after an add/edit screen.
  const [timetablePosition, setTimetablePosition] = useState(initialTimetablePosition)

  return {
    recurringEntries,
    overrides,
    timetablePosition,
    editingRecurring: editTarget?.kind === "recurring" ? editTarget.entry : undefined,
    editingOverride: editTarget?.kind === "override" ? editTarget.entry : undefined,

    changePosition(change: Partial<TimetablePosition>) {
      setTimetablePosition(current => ({ ...current, ...change }))
    },
    resetPosition() {
      setTimetablePosition(initialTimetablePosition())
    },

    /** Pass an entry to edit it, or nothing to add a new one. */
    startRecurring(entry?: RecurringAvail) {
      setEditTarget(entry ? { kind: "recurring", entry } : null)
    },
    startOverride(entry?: OneTimeOverride) {
      setEditTarget(entry ? { kind: "override", entry } : null)
    },

    saveRecurring(entry: RecurringAvail) {
      setRecurringEntries(prev =>
        prev.find(e => e.id === entry.id) ? prev.map(e => e.id === entry.id ? entry : e) : [...prev, entry]
      )
    },
    saveOverride(entry: OneTimeOverride) {
      setOverrides(prev =>
        prev.find(e => e.id === entry.id) ? prev.map(e => e.id === entry.id ? entry : e) : [...prev, entry]
      )
    },

    removeRecurring(id: string) {
      setRecurringEntries(prev => prev.filter(e => e.id !== id))
    },
    removeOverride(id: string) {
      setOverrides(prev => prev.filter(e => e.id !== id))
    },
  }
}
