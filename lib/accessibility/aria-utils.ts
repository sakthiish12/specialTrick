export const ARIA_LABELS = {
  NAVIGATION: {
    MAIN: "Main navigation",
    MOBILE: "Mobile navigation menu",
    SOCIAL: "Social media links",
  },
  SECTIONS: {
    HERO: "Hero section",
    ABOUT: "About section",
    PROJECTS: "Projects section",
    SKILLS: "Skills section",
    BLOG: "Blog section",
    CONTACT: "Contact section",
  },
  CONTROLS: {
    MENU_TOGGLE: "Toggle navigation menu",
    THEME_TOGGLE: "Toggle dark/light theme",
    SEARCH: "Search",
    FILTER: "Filter",
    SORT: "Sort",
  },
} as const

export const ARIA_ROLES = {
  NAVIGATION: "navigation",
  MAIN: "main",
  COMPLEMENTARY: "complementary",
  CONTENTINFO: "contentinfo",
  BANNER: "banner",
  SEARCH: "search",
  FORM: "form",
  LIST: "list",
  LISTITEM: "listitem",
  ARTICLE: "article",
  BUTTON: "button",
  DIALOG: "dialog",
  ALERT: "alert",
  STATUS: "status",
} as const

export const ARIA_LIVE_REGIONS = {
  POLITE: "polite",
  ASSERTIVE: "assertive",
  OFF: "off",
} as const

export function getAriaLabel(key: keyof typeof ARIA_LABELS, subKey?: string): string {
  if (subKey) {
    return ARIA_LABELS[key][subKey as keyof typeof ARIA_LABELS[typeof key]]
  }
  return ARIA_LABELS[key] as unknown as string
}

export function getAriaRole(role: keyof typeof ARIA_ROLES): string {
  return ARIA_ROLES[role]
}

export function getAriaLiveRegion(politeness: keyof typeof ARIA_LIVE_REGIONS): string {
  return ARIA_LIVE_REGIONS[politeness]
}

export function getAriaDescribedBy(id: string): string {
  return `aria-describedby="${id}"`
}

export function getAriaControls(id: string): string {
  return `aria-controls="${id}"`
}

export function getAriaExpanded(expanded: boolean): string {
  return `aria-expanded="${expanded}"`
}

export function getAriaHidden(hidden: boolean): string {
  return `aria-hidden="${hidden}"`
}

export function getAriaCurrent(current: boolean): string {
  return current ? 'aria-current="page"' : ""
}

export function getAriaLabeledBy(id: string): string {
  return `aria-labelledby="${id}"`
}

export function getAriaPressed(pressed: boolean): string {
  return `aria-pressed="${pressed}"`
}

export function getAriaSelected(selected: boolean): string {
  return `aria-selected="${selected}"`
}

export function getAriaSort(direction: "ascending" | "descending" | "none"): string {
  return `aria-sort="${direction}"`
}

export function getAriaValueNow(value: number): string {
  return `aria-valuenow="${value}"`
}

export function getAriaValueMin(min: number): string {
  return `aria-valuemin="${min}"`
}

export function getAriaValueMax(max: number): string {
  return `aria-valuemax="${max}"`
}

export function getAriaValueText(text: string): string {
  return `aria-valuetext="${text}"`
}

export function getAriaBusy(busy: boolean): string {
  return `aria-busy="${busy}"`
}

export function getAriaChecked(checked: boolean): string {
  return `aria-checked="${checked}"`
}

export function getAriaDisabled(disabled: boolean): string {
  return `aria-disabled="${disabled}"`
}

export function getAriaInvalid(invalid: boolean): string {
  return `aria-invalid="${invalid}"`
}

export function getAriaReadOnly(readOnly: boolean): string {
  return `aria-readonly="${readOnly}"`
}

export function getAriaRequired(required: boolean): string {
  return `aria-required="${required}"`
}

export function getAriaMultiLine(multiLine: boolean): string {
  return `aria-multiline="${multiLine}"`
}

export function getAriaMultiSelectable(multiSelectable: boolean): string {
  return `aria-multiselectable="${multiSelectable}"`
}

export function getAriaOrientation(orientation: "horizontal" | "vertical"): string {
  return `aria-orientation="${orientation}"`
}

export function getAriaPlaceholder(placeholder: string): string {
  return `aria-placeholder="${placeholder}"`
}

export function getAriaRelevant(relevant: string): string {
  return `aria-relevant="${relevant}"`
}

export function getAriaAtomic(atomic: boolean): string {
  return `aria-atomic="${atomic}"`
}

export function getAriaDropEffect(effect: string): string {
  return `aria-dropeffect="${effect}"`
}

export function getAriaGrabbed(grabbed: boolean): string {
  return `aria-grabbed="${grabbed}"`
}

export function getAriaHasPopup(popup: boolean): string {
  return `aria-haspopup="${popup}"`
}

export function getAriaLevel(level: number): string {
  return `aria-level="${level}"`
}

export function getAriaModal(modal: boolean): string {
  return `aria-modal="${modal}"`
}

export function getAriaPosInSet(pos: number): string {
  return `aria-posinset="${pos}"`
}

export function getAriaSetSize(size: number): string {
  return `aria-setsize="${size}"`
} 