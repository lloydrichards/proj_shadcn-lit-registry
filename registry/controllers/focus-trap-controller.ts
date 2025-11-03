/**
 * FocusTrapController - Reactive controller for focus trap management
 *
 * Provides reusable logic for trapping focus within a container element.
 * When active, Tab/Shift+Tab cycles through focusable elements within the container.
 *
 * Used by: dialog, potentially other modal components
 */

import type { ReactiveController, ReactiveControllerHost } from "lit";
import { getFocusableElements } from "../lib/utils";

/**
 * Configuration options for the FocusTrapController
 */
export interface FocusTrapConfig {
  /**
   * Function to get the container element where focus should be trapped
   * Should return null/undefined when focus trap should not be active
   */
  getContainer: () => HTMLElement | null | undefined;

  /**
   * Function to check if the focus trap should be active
   * @default () => true
   */
  isActive?: () => boolean;

  /**
   * Whether to auto-focus the first focusable element when trap activates
   * @default true
   */
  autoFocus?: boolean;

  /**
   * Whether to restore focus to previously focused element when trap deactivates
   * @default true
   */
  restoreFocus?: boolean;
}

/**
 * Reactive controller for focus trap management
 *
 * @example
 * ```typescript
 * export class Dialog extends BaseElement {
 *   @property({ type: Boolean }) open = false;
 *   @query('[role="dialog"]') dialogElement?: HTMLElement;
 *
 *   private focusTrap = new FocusTrapController(this, {
 *     getContainer: () => this.dialogElement,
 *     isActive: () => this.open,
 *   });
 *
 *   override updated(changed: PropertyValues) {
 *     super.updated(changed);
 *     if (changed.has('open')) {
 *       this.focusTrap.update();
 *     }
 *   }
 * }
 * ```
 */
export class FocusTrapController implements ReactiveController {
  private config: Required<FocusTrapConfig>;
  private isTrapping = false;
  private previousFocus: HTMLElement | null = null;

  constructor(host: ReactiveControllerHost, config: FocusTrapConfig) {
    this.config = {
      isActive: () => true,
      autoFocus: true,
      restoreFocus: true,
      ...config,
    };
    host.addController(this);
  }

  hostConnected(): void {
    // Controller is ready
  }

  hostDisconnected(): void {
    this.deactivate();
  }

  /**
   * Handle Tab key for focus trapping
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== "Tab") return;

    const container = this.config.getContainer();
    if (!container) return;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab - moving backwards
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab - moving forwards
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  /**
   * Activate the focus trap
   */
  private activate(): void {
    if (this.isTrapping) return;

    const container = this.config.getContainer();
    if (!container) return;

    // Store currently focused element
    if (
      this.config.restoreFocus &&
      document.activeElement instanceof HTMLElement
    ) {
      this.previousFocus = document.activeElement;
    }

    // Attach event listener
    container.addEventListener("keydown", this.handleKeyDown);
    this.isTrapping = true;

    // Auto-focus first focusable element
    if (this.config.autoFocus) {
      const focusableElements = getFocusableElements(container);
      if (focusableElements.length > 0) {
        // Check for autofocus attribute first
        const autofocusElement = focusableElements.find((el) =>
          el.hasAttribute("autofocus"),
        );
        if (autofocusElement) {
          autofocusElement.focus();
        } else {
          focusableElements[0].focus();
        }
      } else {
        // No focusable elements - focus container itself
        container.focus();
      }
    }
  }

  /**
   * Deactivate the focus trap
   */
  private deactivate(): void {
    if (!this.isTrapping) return;

    const container = this.config.getContainer();
    if (container) {
      container.removeEventListener("keydown", this.handleKeyDown);
    }

    this.isTrapping = false;

    // Restore focus to previously focused element
    if (this.config.restoreFocus && this.previousFocus) {
      this.previousFocus.focus();
      this.previousFocus = null;
    }
  }

  /**
   * Update the focus trap state based on isActive
   * Call this in the host component's updated() lifecycle
   */
  update(): void {
    if (this.config.isActive()) {
      this.activate();
    } else {
      this.deactivate();
    }
  }

  /**
   * Manually activate the focus trap
   */
  start(): void {
    this.activate();
  }

  /**
   * Manually deactivate the focus trap
   */
  stop(): void {
    this.deactivate();
  }

  /**
   * Check if focus trap is currently active
   */
  get active(): boolean {
    return this.isTrapping;
  }
}

export default FocusTrapController;
