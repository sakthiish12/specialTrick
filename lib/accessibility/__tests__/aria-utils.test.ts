import {
  getAriaLabel,
  getAriaRole,
  getAriaLiveRegion,
  getAriaDescribedBy,
  getAriaControls,
  getAriaExpanded,
  getAriaHidden,
  getAriaCurrent,
  getAriaLabeledBy,
  getAriaPressed,
  getAriaSelected,
  getAriaSort,
  getAriaValueNow,
  getAriaValueMin,
  getAriaValueMax,
  getAriaValueText,
  getAriaBusy,
  getAriaChecked,
  getAriaDisabled,
  getAriaInvalid,
  getAriaReadOnly,
  getAriaRequired,
  getAriaMultiLine,
  getAriaMultiSelectable,
  getAriaOrientation,
  getAriaPlaceholder,
  getAriaRelevant,
  getAriaAtomic,
  getAriaDropEffect,
  getAriaGrabbed,
  getAriaHasPopup,
  getAriaLevel,
  getAriaModal,
  getAriaPosInSet,
  getAriaSetSize,
} from "../aria-utils"

describe("ARIA Utilities", () => {
  describe("getAriaLabel", () => {
    it("returns correct label for navigation", () => {
      expect(getAriaLabel("NAVIGATION", "MAIN")).toBe("Main navigation")
      expect(getAriaLabel("NAVIGATION", "MOBILE")).toBe("Mobile navigation menu")
      expect(getAriaLabel("NAVIGATION", "SOCIAL")).toBe("Social media links")
    })

    it("returns correct label for sections", () => {
      expect(getAriaLabel("SECTIONS", "HERO")).toBe("Hero section")
      expect(getAriaLabel("SECTIONS", "ABOUT")).toBe("About section")
      expect(getAriaLabel("SECTIONS", "PROJECTS")).toBe("Projects section")
    })

    it("returns correct label for controls", () => {
      expect(getAriaLabel("CONTROLS", "MENU_TOGGLE")).toBe("Toggle navigation menu")
      expect(getAriaLabel("CONTROLS", "THEME_TOGGLE")).toBe("Toggle dark/light theme")
      expect(getAriaLabel("CONTROLS", "SEARCH")).toBe("Search")
    })
  })

  describe("getAriaRole", () => {
    it("returns correct role", () => {
      expect(getAriaRole("NAVIGATION")).toBe("navigation")
      expect(getAriaRole("MAIN")).toBe("main")
      expect(getAriaRole("BUTTON")).toBe("button")
    })
  })

  describe("getAriaLiveRegion", () => {
    it("returns correct politeness level", () => {
      expect(getAriaLiveRegion("POLITE")).toBe("polite")
      expect(getAriaLiveRegion("ASSERTIVE")).toBe("assertive")
      expect(getAriaLiveRegion("OFF")).toBe("off")
    })
  })

  describe("ARIA attribute getters", () => {
    it("returns correct aria-describedby", () => {
      expect(getAriaDescribedBy("description-id")).toBe('aria-describedby="description-id"')
    })

    it("returns correct aria-controls", () => {
      expect(getAriaControls("controlled-id")).toBe('aria-controls="controlled-id"')
    })

    it("returns correct aria-expanded", () => {
      expect(getAriaExpanded(true)).toBe('aria-expanded="true"')
      expect(getAriaExpanded(false)).toBe('aria-expanded="false"')
    })

    it("returns correct aria-hidden", () => {
      expect(getAriaHidden(true)).toBe('aria-hidden="true"')
      expect(getAriaHidden(false)).toBe('aria-hidden="false"')
    })

    it("returns correct aria-current", () => {
      expect(getAriaCurrent(true)).toBe('aria-current="page"')
      expect(getAriaCurrent(false)).toBe("")
    })

    it("returns correct aria-labelledby", () => {
      expect(getAriaLabeledBy("label-id")).toBe('aria-labelledby="label-id"')
    })

    it("returns correct aria-pressed", () => {
      expect(getAriaPressed(true)).toBe('aria-pressed="true"')
      expect(getAriaPressed(false)).toBe('aria-pressed="false"')
    })

    it("returns correct aria-selected", () => {
      expect(getAriaSelected(true)).toBe('aria-selected="true"')
      expect(getAriaSelected(false)).toBe('aria-selected="false"')
    })

    it("returns correct aria-sort", () => {
      expect(getAriaSort("ascending")).toBe('aria-sort="ascending"')
      expect(getAriaSort("descending")).toBe('aria-sort="descending"')
      expect(getAriaSort("none")).toBe('aria-sort="none"')
    })

    it("returns correct aria-value attributes", () => {
      expect(getAriaValueNow(50)).toBe('aria-valuenow="50"')
      expect(getAriaValueMin(0)).toBe('aria-valuemin="0"')
      expect(getAriaValueMax(100)).toBe('aria-valuemax="100"')
      expect(getAriaValueText("50%")).toBe('aria-valuetext="50%"')
    })

    it("returns correct aria-busy", () => {
      expect(getAriaBusy(true)).toBe('aria-busy="true"')
      expect(getAriaBusy(false)).toBe('aria-busy="false"')
    })

    it("returns correct aria-checked", () => {
      expect(getAriaChecked(true)).toBe('aria-checked="true"')
      expect(getAriaChecked(false)).toBe('aria-checked="false"')
    })

    it("returns correct aria-disabled", () => {
      expect(getAriaDisabled(true)).toBe('aria-disabled="true"')
      expect(getAriaDisabled(false)).toBe('aria-disabled="false"')
    })

    it("returns correct aria-invalid", () => {
      expect(getAriaInvalid(true)).toBe('aria-invalid="true"')
      expect(getAriaInvalid(false)).toBe('aria-invalid="false"')
    })

    it("returns correct aria-readonly", () => {
      expect(getAriaReadOnly(true)).toBe('aria-readonly="true"')
      expect(getAriaReadOnly(false)).toBe('aria-readonly="false"')
    })

    it("returns correct aria-required", () => {
      expect(getAriaRequired(true)).toBe('aria-required="true"')
      expect(getAriaRequired(false)).toBe('aria-required="false"')
    })

    it("returns correct aria-multiline", () => {
      expect(getAriaMultiLine(true)).toBe('aria-multiline="true"')
      expect(getAriaMultiLine(false)).toBe('aria-multiline="false"')
    })

    it("returns correct aria-multiselectable", () => {
      expect(getAriaMultiSelectable(true)).toBe('aria-multiselectable="true"')
      expect(getAriaMultiSelectable(false)).toBe('aria-multiselectable="false"')
    })

    it("returns correct aria-orientation", () => {
      expect(getAriaOrientation("horizontal")).toBe('aria-orientation="horizontal"')
      expect(getAriaOrientation("vertical")).toBe('aria-orientation="vertical"')
    })

    it("returns correct aria-placeholder", () => {
      expect(getAriaPlaceholder("Enter text")).toBe('aria-placeholder="Enter text"')
    })

    it("returns correct aria-relevant", () => {
      expect(getAriaRelevant("additions removals")).toBe('aria-relevant="additions removals"')
    })

    it("returns correct aria-atomic", () => {
      expect(getAriaAtomic(true)).toBe('aria-atomic="true"')
      expect(getAriaAtomic(false)).toBe('aria-atomic="false"')
    })

    it("returns correct aria-dropeffect", () => {
      expect(getAriaDropEffect("copy")).toBe('aria-dropeffect="copy"')
    })

    it("returns correct aria-grabbed", () => {
      expect(getAriaGrabbed(true)).toBe('aria-grabbed="true"')
      expect(getAriaGrabbed(false)).toBe('aria-grabbed="false"')
    })

    it("returns correct aria-haspopup", () => {
      expect(getAriaHasPopup(true)).toBe('aria-haspopup="true"')
      expect(getAriaHasPopup(false)).toBe('aria-haspopup="false"')
    })

    it("returns correct aria-level", () => {
      expect(getAriaLevel(1)).toBe('aria-level="1"')
    })

    it("returns correct aria-modal", () => {
      expect(getAriaModal(true)).toBe('aria-modal="true"')
      expect(getAriaModal(false)).toBe('aria-modal="false"')
    })

    it("returns correct aria-posinset", () => {
      expect(getAriaPosInSet(1)).toBe('aria-posinset="1"')
    })

    it("returns correct aria-setsize", () => {
      expect(getAriaSetSize(5)).toBe('aria-setsize="5"')
    })
  })
}) 