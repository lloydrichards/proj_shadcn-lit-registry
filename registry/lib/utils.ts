import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Create a unique ID
 */
export function uid(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;

  if (element.tabIndex >= 0) return true;

  const focusableTags = ["BUTTON", "INPUT", "SELECT", "TEXTAREA", "A", "AREA"];

  if (focusableTags.includes(element.tagName)) {
    return !element.hasAttribute("disabled");
  }

  return false;
}

/**
 * Get all focusable elements within container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(
    "button:not([disabled]), " +
      "[href], " +
      "input:not([disabled]), " +
      "select:not([disabled]), " +
      "textarea:not([disabled]), " +
      '[tabindex]:not([tabindex="-1"])',
  );

  return Array.from(elements).filter((el) => {
    // Skip hidden elements
    const style = getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  });
}

/**
 * Trap focus within container
 */
export function trapFocus(container: HTMLElement) {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  container.addEventListener("keydown", handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Check if an element has slotted content
 * Useful for conditional rendering based on slot presence
 *
 * Note: For reactive slot detection, prefer using @queryAssignedElements decorator
 *
 * @param host - The host element (custom element)
 * @param slotName - The slot name to check (empty string for default slot)
 * @returns true if the slot has content, false otherwise
 *
 * @example
 * // Check default slot
 * if (hasSlottedContent(this)) {
 *   // Render something
 * }
 *
 * @example
 * // Check named slot
 * if (hasSlottedContent(this, 'prefix')) {
 *   // Render prefix wrapper
 * }
 */
export function hasSlottedContent(host: Element, slotName = ""): boolean {
  if (slotName) {
    // Check for elements with matching slot attribute
    return host.querySelector(`[slot="${slotName}"]`) !== null;
  }

  // Check for default slot content (elements without slot attribute + text nodes)
  return Array.from(host.childNodes).some((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      return !(node as Element).hasAttribute("slot");
    }
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent?.trim() !== "";
    }
    return false;
  });
}

export default {
  cn,
  uid,
  isFocusable,
  getFocusableElements,
  trapFocus,
  debounce,
  throttle,
  hasSlottedContent,
};
