import { Capacitor, SystemBars, SystemBarsStyle, SystemBarType } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import type { Screen } from './types'

/** True when running inside the Android app (not a normal browser). */
const isNativeApp = Capacitor.isNativePlatform()

/** Screens with a navy top bar get white status-bar icons; light screens get dark icons. */
export function applyStatusBar(screen: Screen) {
  document.body.dataset.screen = screen
  if (!isNativeApp) return
  const style = screen === 'home' ? SystemBarsStyle.Dark : SystemBarsStyle.Light
  SystemBars.setStyle({ style, bar: SystemBarType.StatusBar }).catch(() => {})
}

// Where the Android back button goes from each screen. "exit" leaves the app;
// "previous" returns to whichever screen opened this one.
const BACK_TARGET: Record<Screen, Screen | 'exit' | 'minimize' | 'previous'> = {
  welcome: 'exit',
  'tell-name': 'welcome',
  'join-group': 'previous',
  pending: 'welcome',
  home: 'minimize',
  'set-recurring': 'home',
  'add-override': 'home',
  'slot-volunteer': 'home',
  'slot-serving': 'home',
  'slot-filled': 'home',
}

/**
 * Handles the Android hardware/gesture back button:
 * 1. If a pop-up sheet is open, close it.
 * 2. Otherwise go to the previous screen.
 * 3. On the first screens, leave or minimize the app.
 */
export function listenForBackButton(getScreen: () => Screen, getPrevScreen: () => Screen, go: (screen: Screen) => void) {
  if (!isNativeApp) return () => {}
  const handle = CapApp.addListener('backButton', () => {
    const backdrop = document.querySelector<HTMLElement>('[role="dialog"] > div[aria-hidden="true"]')
    if (backdrop) {
      backdrop.click()
      return
    }
    const target = BACK_TARGET[getScreen()]
    if (target === 'exit') CapApp.exitApp()
    else if (target === 'minimize') CapApp.minimizeApp()
    else go(target === 'previous' ? getPrevScreen() : target)
  })
  return () => { handle.then(h => h.remove()) }
}
