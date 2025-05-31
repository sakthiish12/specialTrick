import { RefObject, useEffect, useRef } from "react"

export function useFocusTrap(
  isActive: boolean,
  options: {
    onEscape?: () => void
    initialFocusRef?: RefObject<HTMLElement>
    finalFocusRef?: RefObject<HTMLElement>
  } = {}
) {
  const { onEscape, initialFocusRef, finalFocusRef } = options
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return

    const container = containerRef.current
    if (!container) return

    // Store the element that had focus before the trap was activated
    const previousActiveElement = document.activeElement as HTMLElement

    // Focus the initial element or the first focusable element in the container
    const focusableElements = getFocusableElements(container)
    const elementToFocus = initialFocusRef?.current || focusableElements[0]
    if (elementToFocus) {
      elementToFocus.focus()
    }

    // Handle keyboard events
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onEscape) {
        onEscape()
        return
      }

      if (event.key !== "Tab") return

      const focusableElements = getFocusableElements(container)
      if (focusableElements.length === 0) return

      const firstFocusableElement = focusableElements[0]
      const lastFocusableElement = focusableElements[focusableElements.length - 1]

      // If shift + tab
      if (event.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          event.preventDefault()
          lastFocusableElement.focus()
        }
      }
      // If tab
      else {
        if (document.activeElement === lastFocusableElement) {
          event.preventDefault()
          firstFocusableElement.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      // Restore focus to the element that had focus before the trap was activated
      if (finalFocusRef?.current) {
        finalFocusRef.current.focus()
      } else {
        previousActiveElement?.focus()
      }
    }
  }, [isActive, onEscape, initialFocusRef, finalFocusRef])

  return containerRef
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  return Array.from(focusableElements).filter((element) => {
    return (
      element.offsetParent !== null && // Element is visible
      !element.hasAttribute("disabled") && // Element is not disabled
      !element.hasAttribute("aria-hidden") // Element is not hidden from screen readers
    )
  })
}

export function useFocusOnMount(
  shouldFocus: boolean,
  options: {
    onFocus?: () => void
    onBlur?: () => void
  } = {}
) {
  const { onFocus, onBlur } = options
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!shouldFocus) return

    const element = elementRef.current
    if (!element) return

    element.focus()

    if (onFocus) {
      element.addEventListener("focus", onFocus)
    }

    if (onBlur) {
      element.addEventListener("blur", onBlur)
    }

    return () => {
      if (onFocus) {
        element.removeEventListener("focus", onFocus)
      }
      if (onBlur) {
        element.removeEventListener("blur", onBlur)
      }
    }
  }, [shouldFocus, onFocus, onBlur])

  return elementRef
}

export function useFocusOnUpdate(
  shouldFocus: boolean,
  options: {
    onFocus?: () => void
    onBlur?: () => void
  } = {}
) {
  const { onFocus, onBlur } = options
  const elementRef = useRef<HTMLElement>(null)
  const previousShouldFocusRef = useRef(shouldFocus)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    if (shouldFocus && !previousShouldFocusRef.current) {
      element.focus()
    }

    previousShouldFocusRef.current = shouldFocus

    if (onFocus) {
      element.addEventListener("focus", onFocus)
    }

    if (onBlur) {
      element.addEventListener("blur", onBlur)
    }

    return () => {
      if (onFocus) {
        element.removeEventListener("focus", onFocus)
      }
      if (onBlur) {
        element.removeEventListener("blur", onBlur)
      }
    }
  }, [shouldFocus, onFocus, onBlur])

  return elementRef
}

export function useFocusOnFirstRender(
  options: {
    onFocus?: () => void
    onBlur?: () => void
  } = {}
) {
  const { onFocus, onBlur } = options
  const elementRef = useRef<HTMLElement>(null)
  const hasFocusedRef = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element || hasFocusedRef.current) return

    element.focus()
    hasFocusedRef.current = true

    if (onFocus) {
      element.addEventListener("focus", onFocus)
    }

    if (onBlur) {
      element.addEventListener("blur", onBlur)
    }

    return () => {
      if (onFocus) {
        element.removeEventListener("focus", onFocus)
      }
      if (onBlur) {
        element.removeEventListener("blur", onBlur)
      }
    }
  }, [onFocus, onBlur])

  return elementRef
}

export function useFocusOnLastRender(
  options: {
    onFocus?: () => void
    onBlur?: () => void
  } = {}
) {
  const { onFocus, onBlur } = options
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.focus()

    if (onFocus) {
      element.addEventListener("focus", onFocus)
    }

    if (onBlur) {
      element.addEventListener("blur", onBlur)
    }

    return () => {
      if (onFocus) {
        element.removeEventListener("focus", onFocus)
      }
      if (onBlur) {
        element.removeEventListener("blur", onBlur)
      }
    }
  }, [onFocus, onBlur])

  return elementRef
}

export function useFocusOnMountAndUpdate(
  shouldFocus: boolean,
  options: {
    onFocus?: () => void
    onBlur?: () => void
  } = {}
) {
  const { onFocus, onBlur } = options
  const elementRef = useRef<HTMLElement>(null)
  const previousShouldFocusRef = useRef(shouldFocus)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    if (shouldFocus && (!previousShouldFocusRef.current || !hasFocusedRef.current)) {
      element.focus()
      hasFocusedRef.current = true
    }

    previousShouldFocusRef.current = shouldFocus

    if (onFocus) {
      element.addEventListener("focus", onFocus)
    }

    if (onBlur) {
      element.addEventListener("blur", onBlur)
    }

    return () => {
      if (onFocus) {
        element.removeEventListener("focus", onFocus)
      }
      if (onBlur) {
        element.removeEventListener("blur", onBlur)
      }
    }
  }, [shouldFocus, onFocus, onBlur])

  return elementRef
}

const hasFocusedRef = { current: false } 