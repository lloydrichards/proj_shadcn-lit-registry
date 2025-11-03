/**
 * ClickAwayController - Reactive controller for click-outside detection
 *
 * Provides reusable logic for detecting clicks outside a component
 * and triggering a callback. Commonly used in dropdowns, menus, and modals.
 *
 * Used by: dropdown-menu, context-menu, menubar, select
 */

import type { ReactiveController, ReactiveControllerHost } from "lit";

/**
 * Configuration options for the ClickAwayController
 */
export interface ClickAwayConfig {
  /**
   * Callback when a click outside is detected
   */
  onClickAway: () => void;

  /**
   * Function to check if the controller should be active
   * Returns true when click-away detection should be enabled
   * @default () => true
   */
  isActive?: () => boolean;

  /**
   * Additional elements to exclude from click-away detection
   * Clicks on these elements will NOT trigger onClickAway
   * @default []
   */
  excludeElements?: () => HTMLElement[];

  /**
   * Whether to use capture phase for click detection
   * @default false
   */
  useCapture?: boolean;
}

/**
 * Reactive controller for click-outside detection
 *
 * @example
 * ```typescript
 * export class DropdownMenu extends BaseElement {
 *   @property({ type: Boolean }) open = false;
 *
 *   private clickAway = new ClickAwayController(this, {
 *     onClickAway: () => { this.open = false; },
 *     isActive: () => this.open,
 *     excludeElements: () => {
 *       const content = this.querySelector("ui-dropdown-menu-content");
 *       return content ? [content] : [];
 *     },
 *   });
 *
 *   override updated(changed: PropertyValues) {
 *     super.updated(changed);
 *     if (changed.has('open')) {
 *       this.clickAway.update();
 *     }
 *   }
 * }
 * ```
 */
export class ClickAwayController implements ReactiveController {
  private host: ReactiveControllerHost & HTMLElement;
  private config: Required<ClickAwayConfig>;
  private isListening = false;

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    config: ClickAwayConfig,
  ) {
    this.host = host;
    this.config = {
      isActive: () => true,
      excludeElements: () => [],
      useCapture: false,
      ...config,
    };
    host.addController(this);
  }

  hostConnected(): void {
    // Controller is ready
  }

  hostDisconnected(): void {
    this.stopListening();
  }

  /**
   * Handle click events
   */
  private handleClick = (e: MouseEvent): void => {
    // Check if controller is active
    if (!this.config.isActive()) {
      return;
    }

    const target = e.target;
    if (!(target instanceof Node)) {
      return;
    }

    // Check if click is on the host element
    if (this.host.contains(target)) {
      return;
    }

    // Check if click is on any excluded elements
    const excludedElements = this.config.excludeElements();
    for (const element of excludedElements) {
      if (element.contains(target)) {
        return;
      }
    }

    // Click is outside - trigger callback
    this.config.onClickAway();
  };

  /**
   * Start listening for click events
   */
  private startListening(): void {
    if (this.isListening) return;

    // Use setTimeout to avoid triggering on the same click that opened the component
    setTimeout(() => {
      document.addEventListener(
        "click",
        this.handleClick,
        this.config.useCapture,
      );
      this.isListening = true;
    }, 0);
  }

  /**
   * Stop listening for click events
   */
  private stopListening(): void {
    if (!this.isListening) return;

    document.removeEventListener(
      "click",
      this.handleClick,
      this.config.useCapture,
    );
    this.isListening = false;
  }

  /**
   * Update the listening state based on isActive
   * Call this in the host component's updated() lifecycle
   */
  update(): void {
    if (this.config.isActive()) {
      this.startListening();
    } else {
      this.stopListening();
    }
  }

  /**
   * Manually start listening (useful for testing)
   */
  start(): void {
    this.startListening();
  }

  /**
   * Manually stop listening (useful for testing)
   */
  stop(): void {
    this.stopListening();
  }
}

export default ClickAwayController;
