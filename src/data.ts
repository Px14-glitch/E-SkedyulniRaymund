import type { FormData, RecurringAvail, OneTimeOverride, Slot } from "./types"

export const DAYS_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export const INITIAL_FORM: FormData = {
  name: "",
  groupCode: "",
  groupName: "",
}

export const INITIAL_RECURRING: RecurringAvail[] = [
  { id: "r1", days: ["Sun"], startTime: "08:00", endTime: "12:00" },
  { id: "r2", days: ["Wed"], startTime: "18:00", endTime: "20:30" },
]

export const INITIAL_OVERRIDES: OneTimeOverride[] = [
  { id: "o1", date: "2026-09-28", type: "blocked" },
  { id: "o2", date: "2026-10-05", type: "free", startTime: "13:00", endTime: "17:00" },
]

export const SAMPLE_SLOTS: Slot[] = [
  { id: "s1", date: "2026-09-27", time: "8:00 AM", massName: "Sunday Mass", totalSpots: 3, filledSpots: 1, status: "open" },
  { id: "s2", date: "2026-09-27", time: "10:30 AM", massName: "Sunday Mass", totalSpots: 3, filledSpots: 3, status: "filled" },
  { id: "s3", date: "2026-10-01", time: "7:00 PM", massName: "Weekday Mass", totalSpots: 2, filledSpots: 1, status: "serving", withinCutoff: false },
  { id: "s4", date: "2026-10-04", time: "8:00 AM", massName: "Sunday Mass", totalSpots: 3, filledSpots: 2, status: "open" },
  { id: "s5", date: "2026-10-04", time: "10:30 AM", massName: "Sunday Mass", totalSpots: 3, filledSpots: 0, status: "open" },
  { id: "s6", date: "2026-10-08", time: "7:00 PM", massName: "Weekday Mass", totalSpots: 2, filledSpots: 2, status: "filled" },
  { id: "s7", date: "2026-10-11", time: "8:00 AM", massName: "Sunday Mass", totalSpots: 3, filledSpots: 1, status: "serving", withinCutoff: true },
]
