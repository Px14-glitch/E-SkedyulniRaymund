// PLACEHOLDER — owned by the Scheduling group. Read-only sample data so the timetable can show the member's given schedule. Replace getMyAssignments() with the Scheduling module's real data when the modules are integrated.

export type Assignment = {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:MM 24h
  massName: string
  role: string
}

export function getMyAssignments(): Assignment[] {
  return [
    { id: "a1", date: "2026-10-04", time: "09:00", massName: "Sunday Mass", role: "Lector" },
    { id: "a2", date: "2026-10-07", time: "18:00", massName: "Weekday Mass", role: "Lector" },
    { id: "a3", date: "2026-10-11", time: "11:00", massName: "Sunday Mass", role: "Lector" },
  ]
}
