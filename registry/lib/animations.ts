/**
 * Animation utilities using Tailwind classes
 * Respects prefers-reduced-motion
 */

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Get animation duration in milliseconds
 */
export function getAnimationDuration(element: HTMLElement): number {
  if (prefersReducedMotion()) return 0;

  const style = getComputedStyle(element);
  const duration = style.animationDuration || style.transitionDuration || "0s";

  // Convert to milliseconds
  if (duration.endsWith("ms")) {
    return parseFloat(duration);
  } else if (duration.endsWith("s")) {
    return parseFloat(duration) * 1000;
  }

  return 0;
}

/**
 * Wait for animation to complete
 */
export function waitForAnimation(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    if (prefersReducedMotion()) {
      resolve();
      return;
    }

    const duration = getAnimationDuration(element);
    if (duration === 0) {
      resolve();
      return;
    }

    // Listen for animationend or transitionend
    const handleEnd = () => {
      element.removeEventListener("animationend", handleEnd);
      element.removeEventListener("transitionend", handleEnd);
      resolve();
    };

    element.addEventListener("animationend", handleEnd);
    element.addEventListener("transitionend", handleEnd);

    // Fallback timeout
    setTimeout(() => {
      element.removeEventListener("animationend", handleEnd);
      element.removeEventListener("transitionend", handleEnd);
      resolve();
    }, duration + 50);
  });
}

/**
 * Tailwind animation classes
 */
export const animations = {
  // Fade
  fadeIn: "animate-in fade-in-0",
  fadeOut: "animate-out fade-out-0",

  // Zoom
  zoomIn: "animate-in zoom-in-95",
  zoomOut: "animate-out zoom-out-95",

  // Slide
  slideInFromTop: "animate-in slide-in-from-top-2",
  slideInFromBottom: "animate-in slide-in-from-bottom-2",
  slideInFromLeft: "animate-in slide-in-from-left-2",
  slideInFromRight: "animate-in slide-in-from-right-2",
  slideOutToTop: "animate-out slide-out-to-top-2",
  slideOutToBottom: "animate-out slide-out-to-bottom-2",
  slideOutToLeft: "animate-out slide-out-to-left-2",
  slideOutToRight: "animate-out slide-out-to-right-2",

  // Accordion
  accordionDown: "data-[state=open]:animate-accordion-down",
  accordionUp: "data-[state=closed]:animate-accordion-up",

  // Collapsible
  collapsibleDown: "data-[state=open]:animate-collapsible-down",
  collapsibleUp: "data-[state=closed]:animate-collapsible-up",

  // Dialog/Modal
  dialogShow: "animate-in fade-in-0 zoom-in-95",
  dialogHide: "animate-out fade-out-0 zoom-out-95",

  // Popover/Dropdown
  popoverShow: "animate-in fade-in-0 zoom-in-95",
  popoverHide: "animate-out fade-out-0 zoom-out-95",

  // Toast
  toastSlideIn: "animate-in slide-in-from-top-full",
  toastSwipeOut: "animate-out slide-out-to-right-full",
} as const;

/**
 * Apply animation classes conditionally
 */
export function animationClasses(
  state: "entering" | "entered" | "exiting" | "exited",
  enterClasses = animations.fadeIn,
  exitClasses = animations.fadeOut,
): string {
  if (prefersReducedMotion()) return "";

  switch (state) {
    case "entering":
      return enterClasses;
    case "exiting":
      return exitClasses;
    default:
      return "";
  }
}

export default {
  prefersReducedMotion,
  getAnimationDuration,
  waitForAnimation,
  animations,
  animationClasses,
};
