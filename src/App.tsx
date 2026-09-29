import { useState, useEffect, useRef } from "react"
import type { Screen, HomeTab, FormData, RecurringAvail, OneTimeOverride, AvailEditTarget, Slot, TimetablePosition } from "./types"
import { INITIAL_FORM, INITIAL_RECURRING, INITIAL_OVERRIDES, SAMPLE_SLOTS } from "./data"
import { useIsDesktop } from "./components/shared"
import { applyStatusBar, listenForBackButton } from "./native"

// Wizard
import { WelcomeScreen, TellNameScreen, JoinGroupScreen, PendingScreen } from "./screens/wizard"
import { DesktopJoinGroupScreen, DesktopPendingScreen } from "./screens/desktop"
import { HomeScreen, MINISTRIES } from "./screens/home"

// Availability
import { AvailabilityTab, SetRecurringScreen, AddOverrideScreen } from "./screens/availability"

// Open Slots
import { SlotList, SlotVolunteerScreen, SlotServingScreen, SlotFilledScreen } from "./screens/slots"

// This week, on today. Phones start on the one-day view (big and easy to read); tablets and computers show the whole week.
function initialTimetablePosition(): TimetablePosition {
  return {
    weekOffset: 0,
    view: window.matchMedia("(min-width: 640px)").matches ? "week" : "day",
    dayIndex: (new Date().getDay() + 6) % 7,
  }
}

export default function App() {
  const isDesktop = useIsDesktop()
  const [screen, setScreen] = useState<Screen>("welcome")
  const [prevScreen, setPrevScreen] = useState<Screen>("welcome")
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  const [homeTab, setHomeTab] = useState<HomeTab>("availability")
  const [ministry, setMinistry] = useState(MINISTRIES[0])

  const [recurringEntries, setRecurringEntries] = useState<RecurringAvail[]>(INITIAL_RECURRING)
  const [overrides, setOverrides] = useState<OneTimeOverride[]>(INITIAL_OVERRIDES)
  const [editTarget, setEditTarget] = useState<AvailEditTarget | null>(null)
  // Kept here so the timetable shows the same week and view after an add/edit screen.
  const [timetablePosition, setTimetablePosition] = useState(initialTimetablePosition)

  const [slots, setSlots] = useState<Slot[]>(SAMPLE_SLOTS)
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null)

  function go(to: Screen) {
    setPrevScreen(screen)
    setScreen(to)
  }

  function updateForm(partial: Partial<FormData>) {
    setForm(f => ({ ...f, ...partial }))
  }

  function reset() {
    setForm(INITIAL_FORM)
    setFirstName("")
    setLastName("")
    setHomeTab("availability")
    setMinistry(MINISTRIES[0])
    setTimetablePosition(initialTimetablePosition())
    go("welcome")
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    applyStatusBar(screen)
  }, [screen])

  // Android back button support (only active inside the Android app).
  const screenRef = useRef(screen)
  screenRef.current = screen
  const prevScreenRef = useRef(prevScreen)
  prevScreenRef.current = prevScreen
  const goRef = useRef(go)
  goRef.current = go
  useEffect(() => listenForBackButton(() => screenRef.current, () => prevScreenRef.current, to => goRef.current(to)), [])

  switch (screen) {
    case "welcome":
      return <WelcomeScreen onStart={() => go("tell-name")} />

    case "tell-name":
      return (
        <TellNameScreen
          firstName={firstName}
          lastName={lastName}
          setFirstName={setFirstName}
          setLastName={setLastName}
          onContinue={() => {
            updateForm({ name: `${firstName} ${lastName}`.trim() })
            go("join-group")
          }}
        />
      )

    case "join-group": {
      // Back returns to wherever the member came from: name entry during onboarding, or Home via "+ Join Another Ministry".
      const back = () => go(prevScreen)
      return isDesktop ? (
        <DesktopJoinGroupScreen data={form} setData={updateForm} onJoin={() => go("pending")} onBack={back} />
      ) : (
        <JoinGroupScreen data={form} setData={updateForm} onJoin={() => go("pending")} onBack={back} />
      )
    }

    case "pending":
      return isDesktop ? (
        <DesktopPendingScreen data={form} onBack={reset} onApproved={() => go("home")} />
      ) : (
        <PendingScreen data={form} onBack={reset} onApproved={() => go("home")} />
      )

    case "home":
      return (
        <HomeScreen
          userName={form.name || "Maria Santos"}
          ministry={ministry}
          onMinistryChange={setMinistry}
          tab={homeTab}
          onTabChange={setHomeTab}
          onJoin={() => go("join-group")}
        >
          {homeTab === "availability" ? (
            <AvailabilityTab
              recurringEntries={recurringEntries}
              overrides={overrides}
              slots={slots}
              onViewSlot={slot => { setActiveSlot(slot); go("slot-serving") }}
              position={timetablePosition}
              onPositionChange={change => setTimetablePosition(current => ({ ...current, ...change }))}
              onAddRecurring={() => { setEditTarget(null); go("set-recurring") }}
              onAddOverride={() => { setEditTarget(null); go("add-override") }}
              onEditRecurring={e => { setEditTarget({ kind: "recurring", entry: e }); go("set-recurring") }}
              onEditOverride={e => { setEditTarget({ kind: "override", entry: e }); go("add-override") }}
              onRemoveRecurring={id => setRecurringEntries(prev => prev.filter(e => e.id !== id))}
              onRemoveOverride={id => setOverrides(prev => prev.filter(e => e.id !== id))}
            />
          ) : (
            <SlotList
              slots={slots}
              onSlotTap={slot => {
                setActiveSlot(slot)
                go(slot.status === "filled" ? "slot-filled" : slot.status === "serving" ? "slot-serving" : "slot-volunteer")
              }}
            />
          )}
        </HomeScreen>
      )

    case "set-recurring":
      return (
        <SetRecurringScreen
          initial={editTarget?.kind === "recurring" ? editTarget.entry : undefined}
          onSave={entry => {
            setRecurringEntries(prev =>
              prev.find(e => e.id === entry.id) ? prev.map(e => e.id === entry.id ? entry : e) : [...prev, entry]
            )
            go("home")
          }}
          onBack={() => go("home")}
        />
      )

    case "add-override":
      return (
        <AddOverrideScreen
          initial={editTarget?.kind === "override" ? editTarget.entry : undefined}
          onSave={entry => {
            setOverrides(prev =>
              prev.find(e => e.id === entry.id) ? prev.map(e => e.id === entry.id ? entry : e) : [...prev, entry]
            )
            go("home")
          }}
          onBack={() => go("home")}
        />
      )

    case "slot-volunteer":
      return activeSlot ? (
        <SlotVolunteerScreen
          slot={activeSlot}
          onVolunteer={() => {
            setSlots(prev => prev.map(s => s.id === activeSlot.id ? { ...s, status: "serving", filledSpots: s.filledSpots + 1 } : s))
            setActiveSlot(prev => prev ? { ...prev, status: "serving", filledSpots: prev.filledSpots + 1 } : prev)
            go("slot-serving")
          }}
          onBack={() => go("home")}
        />
      ) : null

    case "slot-serving":
      return activeSlot ? (
        <SlotServingScreen
          slot={activeSlot}
          onCancelSpot={() => {
            setSlots(prev => prev.map(s => s.id === activeSlot.id ? { ...s, status: "open", filledSpots: Math.max(0, s.filledSpots - 1) } : s))
            go("home")
          }}
          onBack={() => go("home")}
        />
      ) : null

    case "slot-filled":
      return <SlotFilledScreen onSeeOthers={() => go("home")} />
  }
}
