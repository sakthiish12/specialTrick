import {
  KEYBOARD_KEYS,
  isKeyboardKey,
  getKeyboardKey,
  isKeyboardNavigation,
  isKeyboardActivation,
  isKeyboardDismissal,
  isKeyboardTab,
  handleKeyboardNavigation,
  createKeyboardHandler,
  createKeyboardActivationHandler,
  createKeyboardNavigationHandler,
} from "../keyboard-utils"

describe("Keyboard Utilities", () => {
  describe("KEYBOARD_KEYS", () => {
    it("has all required keys", () => {
      expect(KEYBOARD_KEYS).toEqual({
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
      })
    })
  })

  describe("isKeyboardKey", () => {
    it("returns true for valid keyboard keys", () => {
      expect(isKeyboardKey("ENTER")).toBe(true)
      expect(isKeyboardKey("SPACE")).toBe(true)
      expect(isKeyboardKey("ESCAPE")).toBe(true)
    })

    it("returns false for invalid keyboard keys", () => {
      expect(isKeyboardKey("INVALID")).toBe(false)
      expect(isKeyboardKey("")).toBe(false)
    })
  })

  describe("getKeyboardKey", () => {
    it("returns correct key value for valid keyboard keys", () => {
      expect(getKeyboardKey("ENTER")).toBe("Enter")
      expect(getKeyboardKey("SPACE")).toBe(" ")
      expect(getKeyboardKey("ESCAPE")).toBe("Escape")
    })

    it("returns original key for invalid keyboard keys", () => {
      expect(getKeyboardKey("INVALID")).toBe("INVALID")
      expect(getKeyboardKey("")).toBe("")
    })
  })

  describe("isKeyboardNavigation", () => {
    it("returns true for navigation keys", () => {
      expect(isKeyboardNavigation({ key: "ArrowUp" } as any)).toBe(true)
      expect(isKeyboardNavigation({ key: "ArrowDown" } as any)).toBe(true)
      expect(isKeyboardNavigation({ key: "ArrowLeft" } as any)).toBe(true)
      expect(isKeyboardNavigation({ key: "ArrowRight" } as any)).toBe(true)
      expect(isKeyboardNavigation({ key: "Home" } as any)).toBe(true)
      expect(isKeyboardNavigation({ key: "End" } as any)).toBe(true)
      expect(isKeyboardNavigation({ key: "PageUp" } as any)).toBe(true)
      expect(isKeyboardNavigation({ key: "PageDown" } as any)).toBe(true)
    })

    it("returns false for non-navigation keys", () => {
      expect(isKeyboardNavigation({ key: "Enter" } as any)).toBe(false)
      expect(isKeyboardNavigation({ key: "Space" } as any)).toBe(false)
      expect(isKeyboardNavigation({ key: "Escape" } as any)).toBe(false)
    })
  })

  describe("isKeyboardActivation", () => {
    it("returns true for activation keys", () => {
      expect(isKeyboardActivation({ key: "Enter" } as any)).toBe(true)
      expect(isKeyboardActivation({ key: " " } as any)).toBe(true)
    })

    it("returns false for non-activation keys", () => {
      expect(isKeyboardActivation({ key: "ArrowUp" } as any)).toBe(false)
      expect(isKeyboardActivation({ key: "Escape" } as any)).toBe(false)
    })
  })

  describe("isKeyboardDismissal", () => {
    it("returns true for dismissal key", () => {
      expect(isKeyboardDismissal({ key: "Escape" } as any)).toBe(true)
    })

    it("returns false for non-dismissal keys", () => {
      expect(isKeyboardDismissal({ key: "Enter" } as any)).toBe(false)
      expect(isKeyboardDismissal({ key: "ArrowUp" } as any)).toBe(false)
    })
  })

  describe("isKeyboardTab", () => {
    it("returns true for tab key", () => {
      expect(isKeyboardTab({ key: "Tab" } as any)).toBe(true)
    })

    it("returns false for non-tab keys", () => {
      expect(isKeyboardTab({ key: "Enter" } as any)).toBe(false)
      expect(isKeyboardTab({ key: "ArrowUp" } as any)).toBe(false)
    })
  })

  describe("handleKeyboardNavigation", () => {
    it("calls correct handler for each key", () => {
      const handlers = {
        onArrowUp: jest.fn(),
        onArrowDown: jest.fn(),
        onArrowLeft: jest.fn(),
        onArrowRight: jest.fn(),
        onHome: jest.fn(),
        onEnd: jest.fn(),
        onPageUp: jest.fn(),
        onPageDown: jest.fn(),
        onEnter: jest.fn(),
        onSpace: jest.fn(),
        onEscape: jest.fn(),
        onTab: jest.fn(),
      }

      handleKeyboardNavigation({ key: "ArrowUp" } as any, handlers)
      expect(handlers.onArrowUp).toHaveBeenCalled()

      handleKeyboardNavigation({ key: "ArrowDown" } as any, handlers)
      expect(handlers.onArrowDown).toHaveBeenCalled()

      handleKeyboardNavigation({ key: "ArrowLeft" } as any, handlers)
      expect(handlers.onArrowLeft).toHaveBeenCalled()

      handleKeyboardNavigation({ key: "ArrowRight" } as any, handlers)
      expect(handlers.onArrowRight).toHaveBeenCalled()

      handleKeyboardNavigation({ key: "Home" } as any, handlers)
      expect(handlers.onHome).toHaveBeenCalled()

      handleKeyboardNavigation({ key: "End" } as any, handlers)
      expect(handlers.onEnd).toHaveBeenCalled()

      handleKeyboardNavigation({ key: "PageUp" } as any, handlers)
      expect(handlers.onPageUp).toHaveBeenCalled()

      handleKeyboardNavigation({ key: "PageDown" } as any, handlers)
      expect(handlers.onPageDown).toHaveBeenCalled()

      handleKeyboardNavigation({ key: "Enter" } as any, handlers)
      expect(handlers.onEnter).toHaveBeenCalled()

      handleKeyboardNavigation({ key: " " } as any, handlers)
      expect(handlers.onSpace).toHaveBeenCalled()

      handleKeyboardNavigation({ key: "Escape" } as any, handlers)
      expect(handlers.onEscape).toHaveBeenCalled()

      handleKeyboardNavigation({ key: "Tab" } as any, handlers)
      expect(handlers.onTab).toHaveBeenCalled()
    })
  })

  describe("createKeyboardHandler", () => {
    it("creates handler that calls correct functions", () => {
      const handlers = {
        onArrowUp: jest.fn(),
        onArrowDown: jest.fn(),
      }

      const handler = createKeyboardHandler(handlers)

      handler({ key: "ArrowUp" } as any)
      expect(handlers.onArrowUp).toHaveBeenCalled()

      handler({ key: "ArrowDown" } as any)
      expect(handlers.onArrowDown).toHaveBeenCalled()
    })
  })

  describe("createKeyboardActivationHandler", () => {
    it("creates handler that calls activate on Enter/Space", () => {
      const onActivate = jest.fn()
      const onDismiss = jest.fn()
      const handler = createKeyboardActivationHandler(onActivate, onDismiss)

      handler({ key: "Enter", preventDefault: jest.fn() } as any)
      expect(onActivate).toHaveBeenCalled()

      handler({ key: " ", preventDefault: jest.fn() } as any)
      expect(onActivate).toHaveBeenCalledTimes(2)
    })

    it("creates handler that calls dismiss on Escape", () => {
      const onActivate = jest.fn()
      const onDismiss = jest.fn()
      const handler = createKeyboardActivationHandler(onActivate, onDismiss)

      handler({ key: "Escape", preventDefault: jest.fn() } as any)
      expect(onDismiss).toHaveBeenCalled()
    })
  })

  describe("createKeyboardNavigationHandler", () => {
    it("creates handler that calls navigate with correct direction", () => {
      const onNavigate = jest.fn()
      const handler = createKeyboardNavigationHandler(onNavigate)

      handler({ key: "ArrowUp", preventDefault: jest.fn() } as any)
      expect(onNavigate).toHaveBeenCalledWith("up")

      handler({ key: "ArrowDown", preventDefault: jest.fn() } as any)
      expect(onNavigate).toHaveBeenCalledWith("down")

      handler({ key: "ArrowLeft", preventDefault: jest.fn() } as any)
      expect(onNavigate).toHaveBeenCalledWith("left")

      handler({ key: "ArrowRight", preventDefault: jest.fn() } as any)
      expect(onNavigate).toHaveBeenCalledWith("right")
    })

    it("creates handler that calls activate on Enter/Space", () => {
      const onNavigate = jest.fn()
      const onActivate = jest.fn()
      const handler = createKeyboardNavigationHandler(onNavigate, onActivate)

      handler({ key: "Enter", preventDefault: jest.fn() } as any)
      expect(onActivate).toHaveBeenCalled()

      handler({ key: " ", preventDefault: jest.fn() } as any)
      expect(onActivate).toHaveBeenCalledTimes(2)
    })

    it("creates handler that calls dismiss on Escape", () => {
      const onNavigate = jest.fn()
      const onDismiss = jest.fn()
      const handler = createKeyboardNavigationHandler(onNavigate, undefined, onDismiss)

      handler({ key: "Escape", preventDefault: jest.fn() } as any)
      expect(onDismiss).toHaveBeenCalled()
    })
  })
}) 