import { KeyboardEvent } from "react"

export const KEYBOARD_KEYS = {
  ENTER: "Enter",
  SPACE: " ",
  ESCAPE: "Escape",
  TAB: "Tab",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End",
  PAGE_UP: "PageUp",
  PAGE_DOWN: "PageDown",
} as const

export type KeyboardKey = keyof typeof KEYBOARD_KEYS

export function isKeyboardKey(key: string): key is KeyboardKey {
  return key in KEYBOARD_KEYS
}

export function getKeyboardKey(key: string): string {
  return KEYBOARD_KEYS[key as KeyboardKey] || key
}

export function isKeyboardNavigation(event: KeyboardEvent): boolean {
  return [
    KEYBOARD_KEYS.ARROW_UP,
    KEYBOARD_KEYS.ARROW_DOWN,
    KEYBOARD_KEYS.ARROW_LEFT,
    KEYBOARD_KEYS.ARROW_RIGHT,
    KEYBOARD_KEYS.HOME,
    KEYBOARD_KEYS.END,
    KEYBOARD_KEYS.PAGE_UP,
    KEYBOARD_KEYS.PAGE_DOWN,
  ].includes(event.key as any)
}

export function isKeyboardActivation(event: KeyboardEvent): boolean {
  return [KEYBOARD_KEYS.ENTER, KEYBOARD_KEYS.SPACE].includes(event.key as any)
}

export function isKeyboardDismissal(event: KeyboardEvent): boolean {
  return event.key === KEYBOARD_KEYS.ESCAPE
}

export function isKeyboardTab(event: KeyboardEvent): boolean {
  return event.key === KEYBOARD_KEYS.TAB
}

export function handleKeyboardNavigation(
  event: KeyboardEvent,
  options: {
    onArrowUp?: () => void
    onArrowDown?: () => void
    onArrowLeft?: () => void
    onArrowRight?: () => void
    onHome?: () => void
    onEnd?: () => void
    onPageUp?: () => void
    onPageDown?: () => void
    onEnter?: () => void
    onSpace?: () => void
    onEscape?: () => void
    onTab?: () => void
  }
): void {
  const {
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onHome,
    onEnd,
    onPageUp,
    onPageDown,
    onEnter,
    onSpace,
    onEscape,
    onTab,
  } = options

  switch (event.key) {
    case KEYBOARD_KEYS.ARROW_UP:
      onArrowUp?.()
      break
    case KEYBOARD_KEYS.ARROW_DOWN:
      onArrowDown?.()
      break
    case KEYBOARD_KEYS.ARROW_LEFT:
      onArrowLeft?.()
      break
    case KEYBOARD_KEYS.ARROW_RIGHT:
      onArrowRight?.()
      break
    case KEYBOARD_KEYS.HOME:
      onHome?.()
      break
    case KEYBOARD_KEYS.END:
      onEnd?.()
      break
    case KEYBOARD_KEYS.PAGE_UP:
      onPageUp?.()
      break
    case KEYBOARD_KEYS.PAGE_DOWN:
      onPageDown?.()
      break
    case KEYBOARD_KEYS.ENTER:
      onEnter?.()
      break
    case KEYBOARD_KEYS.SPACE:
      onSpace?.()
      break
    case KEYBOARD_KEYS.ESCAPE:
      onEscape?.()
      break
    case KEYBOARD_KEYS.TAB:
      onTab?.()
      break
  }
}

export function createKeyboardHandler(
  options: {
    onArrowUp?: () => void
    onArrowDown?: () => void
    onArrowLeft?: () => void
    onArrowRight?: () => void
    onHome?: () => void
    onEnd?: () => void
    onPageUp?: () => void
    onPageDown?: () => void
    onEnter?: () => void
    onSpace?: () => void
    onEscape?: () => void
    onTab?: () => void
  } = {}
) {
  return (event: KeyboardEvent) => {
    handleKeyboardNavigation(event, options)
  }
}

export function createKeyboardActivationHandler(
  onActivate: () => void,
  onDismiss?: () => void
) {
  return (event: KeyboardEvent) => {
    if (isKeyboardActivation(event)) {
      event.preventDefault()
      onActivate()
    } else if (isKeyboardDismissal(event) && onDismiss) {
      event.preventDefault()
      onDismiss()
    }
  }
}

export function createKeyboardNavigationHandler(
  onNavigate: (direction: "up" | "down" | "left" | "right") => void,
  onActivate?: () => void,
  onDismiss?: () => void
) {
  return (event: KeyboardEvent) => {
    if (isKeyboardNavigation(event)) {
      event.preventDefault()
      switch (event.key) {
        case KEYBOARD_KEYS.ARROW_UP:
          onNavigate("up")
          break
        case KEYBOARD_KEYS.ARROW_DOWN:
          onNavigate("down")
          break
        case KEYBOARD_KEYS.ARROW_LEFT:
          onNavigate("left")
          break
        case KEYBOARD_KEYS.ARROW_RIGHT:
          onNavigate("right")
          break
      }
    } else if (isKeyboardActivation(event) && onActivate) {
      event.preventDefault()
      onActivate()
    } else if (isKeyboardDismissal(event) && onDismiss) {
      event.preventDefault()
      onDismiss()
    }
  }
} 