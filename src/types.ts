export type Screen =
  | "welcome" | "tell-name" | "join-group" | "pending"
  | "home"
  | "set-recurring" | "add-override"
  | "slot-volunteer" | "slot-serving" | "slot-filled"

export type HomeTab = "availability" | "slots"

/** Where the availability timetable is looking. `dayIndex` is 0 = Monday … 6 = Sunday. */
export interface TimetablePosition {
  weekOffset: number // weeks from this week
  view: "week" | "day"
  dayIndex: number
}

export interface FormData {
  name: string
  groupCode: string
  groupName: string
}

export interface RecurringAvail {
  id: string
  days: string[]
  startTime: string
  endTime: string
}

export interface OneTimeOverride {
  id: string
  date: string
  type: "free" | "blocked"
  startTime?: string
  endTime?: string
}

export type AvailEditTarget =
  | { kind: "recurring"; entry: RecurringAvail }
  | { kind: "override"; entry: OneTimeOverride }

export type SlotStatus = "open" | "serving" | "filled"

export interface Slot {
  id: string
  date: string
  time: string
  massName: string // e.g. "Sunday Mass"
  totalSpots: number
  filledSpots: number
  status: SlotStatus
  withinCutoff?: boolean
}
