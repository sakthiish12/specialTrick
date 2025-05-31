import { render, screen, fireEvent, act, renderHook } from "@testing-library/react"
import {
  useFocusTrap,
  getFocusableElements,
  useFocusOnMount,
  useFocusOnUpdate,
  useFocusOnFirstRender,
  useFocusOnLastRender,
  useFocusOnMountAndUpdate,
} from "../focus-utils"

describe("Focus Utilities", () => {
  describe("getFocusableElements", () => {
    it("returns focusable elements", () => {
      const container = document.createElement("div")
      container.innerHTML = `
        <button>Button 1</button>
        <a href="#">Link 1</a>
        <input type="text" />
        <select><option>Option 1</option></select>
        <textarea></textarea>
        <div tabindex="0">Focusable div</div>
        <div tabindex="-1">Non-focusable div</div>
        <button disabled>Disabled button</button>
        <div aria-hidden="true">Hidden div</div>
      `
      document.body.appendChild(container)

      const focusableElements = getFocusableElements(container)
      expect(focusableElements).toHaveLength(6)
      expect(focusableElements[0].textContent).toBe("Button 1")
      expect(focusableElements[1].textContent).toBe("Link 1")
      expect(focusableElements[2].tagName).toBe("INPUT")
      expect(focusableElements[3].tagName).toBe("SELECT")
      expect(focusableElements[4].tagName).toBe("TEXTAREA")
      expect(focusableElements[5].textContent).toBe("Focusable div")

      document.body.removeChild(container)
    })
  })

  describe("useFocusTrap", () => {
    it("traps focus within container", () => {
      const { result } = renderHook(() => useFocusTrap(true))
      const container = document.createElement("div")
      result.current.current = container

      container.innerHTML = `
        <button>Button 1</button>
        <button>Button 2</button>
        <button>Button 3</button>
      `
      document.body.appendChild(container)

      const buttons = container.querySelectorAll("button")
      buttons[0].focus()

      // Tab to last button
      fireEvent.keyDown(document, { key: "Tab" })
      expect(document.activeElement).toBe(buttons[1])

      fireEvent.keyDown(document, { key: "Tab" })
      expect(document.activeElement).toBe(buttons[2])

      // Tab should wrap to first button
      fireEvent.keyDown(document, { key: "Tab" })
      expect(document.activeElement).toBe(buttons[0])

      // Shift + Tab should wrap to last button
      fireEvent.keyDown(document, { key: "Tab", shiftKey: true })
      expect(document.activeElement).toBe(buttons[2])

      document.body.removeChild(container)
    })

    it("calls onEscape when Escape is pressed", () => {
      const onEscape = jest.fn()
      const { result } = renderHook(() => useFocusTrap(true, { onEscape }))
      const container = document.createElement("div")
      result.current.current = container

      fireEvent.keyDown(document, { key: "Escape" })
      expect(onEscape).toHaveBeenCalled()

      document.body.removeChild(container)
    })

    it("focuses initial element when provided", () => {
      const initialFocusRef = { current: document.createElement("button") }
      const { result } = renderHook(() =>
        useFocusTrap(true, { initialFocusRef })
      )
      const container = document.createElement("div")
      result.current.current = container

      expect(document.activeElement).toBe(initialFocusRef.current)

      document.body.removeChild(container)
    })

    it("restores focus to final element when trap is deactivated", () => {
      const finalFocusRef = { current: document.createElement("button") }
      const { result, rerender } = renderHook(
        (isActive: boolean) => useFocusTrap(isActive, { finalFocusRef }),
        { initialProps: true }
      )
      const container = document.createElement("div")
      result.current.current = container

      rerender(false)
      expect(document.activeElement).toBe(finalFocusRef.current)

      document.body.removeChild(container)
    })
  })

  describe("useFocusOnMount", () => {
    it("focuses element on mount when shouldFocus is true", () => {
      const { result } = renderHook(() => useFocusOnMount(true))
      const element = document.createElement("button")
      result.current.current = element

      expect(document.activeElement).toBe(element)
    })

    it("does not focus element on mount when shouldFocus is false", () => {
      const { result } = renderHook(() => useFocusOnMount(false))
      const element = document.createElement("button")
      result.current.current = element

      expect(document.activeElement).not.toBe(element)
    })

    it("calls onFocus when element is focused", () => {
      const onFocus = jest.fn()
      const { result } = renderHook(() => useFocusOnMount(true, { onFocus }))
      const element = document.createElement("button")
      result.current.current = element

      fireEvent.focus(element)
      expect(onFocus).toHaveBeenCalled()
    })

    it("calls onBlur when element is blurred", () => {
      const onBlur = jest.fn()
      const { result } = renderHook(() => useFocusOnMount(true, { onBlur }))
      const element = document.createElement("button")
      result.current.current = element

      fireEvent.blur(element)
      expect(onBlur).toHaveBeenCalled()
    })
  })

  describe("useFocusOnUpdate", () => {
    it("focuses element when shouldFocus changes from false to true", () => {
      const { result, rerender } = renderHook(
        (shouldFocus: boolean) => useFocusOnUpdate(shouldFocus),
        { initialProps: false }
      )
      const element = document.createElement("button")
      result.current.current = element

      expect(document.activeElement).not.toBe(element)

      rerender(true)
      expect(document.activeElement).toBe(element)
    })

    it("does not focus element when shouldFocus changes from true to false", () => {
      const { result, rerender } = renderHook(
        (shouldFocus: boolean) => useFocusOnUpdate(shouldFocus),
        { initialProps: true }
      )
      const element = document.createElement("button")
      result.current.current = element

      expect(document.activeElement).toBe(element)

      rerender(false)
      expect(document.activeElement).toBe(element)
    })
  })

  describe("useFocusOnFirstRender", () => {
    it("focuses element on first render", () => {
      const { result } = renderHook(() => useFocusOnFirstRender())
      const element = document.createElement("button")
      result.current.current = element

      expect(document.activeElement).toBe(element)
    })

    it("does not focus element on subsequent renders", () => {
      const { result, rerender } = renderHook(() => useFocusOnFirstRender())
      const element = document.createElement("button")
      result.current.current = element

      expect(document.activeElement).toBe(element)

      rerender()
      expect(document.activeElement).toBe(element)
    })
  })

  describe("useFocusOnLastRender", () => {
    it("focuses element on last render", () => {
      const { result } = renderHook(() => useFocusOnLastRender())
      const element = document.createElement("button")
      result.current.current = element

      expect(document.activeElement).toBe(element)
    })
  })

  describe("useFocusOnMountAndUpdate", () => {
    it("focuses element on mount and when shouldFocus changes from false to true", () => {
      const { result, rerender } = renderHook(
        (shouldFocus: boolean) => useFocusOnMountAndUpdate(shouldFocus),
        { initialProps: true }
      )
      const element = document.createElement("button")
      result.current.current = element

      expect(document.activeElement).toBe(element)

      rerender(false)
      expect(document.activeElement).toBe(element)

      rerender(true)
      expect(document.activeElement).toBe(element)
    })
  })
}) 