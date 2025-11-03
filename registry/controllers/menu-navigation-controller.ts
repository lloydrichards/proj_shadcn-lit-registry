/**
 * MenuNavigationController - Reactive controller for menu keyboard navigation
 *
 * Provides reusable keyboard navigation logic for menu-like components
 * including arrow keys, home/end, enter/space, and typeahead search.
 *
 * Used by: dropdown-menu, context-menu, menubar, select
 */

import type { ReactiveController, ReactiveControllerHost } from "lit";

/**
 * Interface for menu items that can be navigated
 */
export interface NavigableMenuItem extends HTMLElement {
  disabled?: boolean;
  highlighted?: boolean;
}

/**
 * Configuration options for the MenuNavigationController
 */
export interface MenuNavigationConfig {
  /**
   * Function to get the current list of navigable items
   */
  getItems: () => NavigableMenuItem[];

  /**
   * Get the current highlighted index from host component
   */
  getHighlightedIndex: () => number;

  /**
   * Set the highlighted index in host component (triggers Lit reactivity)
   */
  setHighlightedIndex: (index: number) => void;

  /**
   * Callback when an item should be selected (Enter/Space pressed)
   */
  onSelect?: (item: NavigableMenuItem, index: number) => void;

  /**
   * Callback when Escape key is pressed
   */
  onEscape?: () => void;

  /**
   * Whether navigation should loop (wrap around)
   * Can be a boolean or a getter function for reactivity
   * @default true
   */
  loop?: boolean | (() => boolean);

  /**
   * Typeahead timeout in milliseconds
   * @default 500
   */
  typeaheadTimeout?: number;

  /**
   * Orientation of the menu
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal";
}

/**
 * Reactive controller for keyboard navigation in menu components
 *
 * @example
 * ```typescript
 * export class DropdownMenuContent extends BaseElement {
 *   @state() private highlightedIndex = -1;
 *
 *   private navigation = new MenuNavigationController(this, {
 *     getItems: () => this.getNavigableItems(),
 *     getHighlightedIndex: () => this.highlightedIndex,
 *     setHighlightedIndex: (index) => { this.highlightedIndex = index; },
 *     onSelect: (item) => item.click(),
 *     onEscape: () => this.close(),
 *     loop: () => this.loop, // Reactive getter
 *   });
 *
 *   override willUpdate(changed: PropertyValues) {
 *     super.willUpdate(changed);
 *     if (changed.has('highlightedIndex')) {
 *       const items = this.getNavigableItems();
 *       items.forEach((item, i) => {
 *         item.highlighted = i === this.highlightedIndex;
 *       });
 *     }
 *   }
 *
 *   private handleKeyDown = (e: KeyboardEvent) => {
 *     this.navigation.handleKeyDown(e);
 *   };
 * }
 * ```
 */
export class MenuNavigationController implements ReactiveController {
  private config: MenuNavigationConfig & {
    loop: boolean | (() => boolean);
    typeaheadTimeout: number;
    orientation: "vertical" | "horizontal";
    onSelect: (item: NavigableMenuItem, index: number) => void;
    onEscape: () => void;
  };

  private typeaheadString = "";
  private typeaheadTimer?: number;

  constructor(host: ReactiveControllerHost, config: MenuNavigationConfig) {
    this.config = {
      loop: true,
      typeaheadTimeout: 500,
      orientation: "vertical",
      onSelect: () => {},
      onEscape: () => {},
      ...config,
    };
    host.addController(this);
  }

  private getLoop(): boolean {
    const loop = this.config.loop;
    return typeof loop === "function" ? loop() : loop;
  }

  hostConnected(): void {
    // Controller is ready
  }

  hostDisconnected(): void {
    if (this.typeaheadTimer) {
      clearTimeout(this.typeaheadTimer);
    }
  }
  handleKeyDown(e: KeyboardEvent): void {
    const items = this.config.getItems();
    if (items.length === 0) return;

    const isVertical = this.config.orientation === "vertical";
    const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
    const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";

    switch (e.key) {
      case nextKey:
        e.preventDefault();
        this.navigateNext(items);
        break;

      case prevKey:
        e.preventDefault();
        this.navigatePrevious(items);
        break;

      case "Home":
        e.preventDefault();
        this.navigateToFirst(items);
        break;

      case "End":
        e.preventDefault();
        this.navigateToLast(items);
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        this.selectHighlighted(items);
        break;

      case "Escape":
        e.preventDefault();
        this.config.onEscape();
        break;

      default:
        // Handle typeahead for single character keys
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          this.handleTypeahead(e.key, items);
        }
    }
  }
  private navigateNext(items: NavigableMenuItem[]): void {
    const current = this.config.getHighlightedIndex();
    let next: number;

    if (this.getLoop()) {
      next = (current + 1) % items.length;
    } else {
      next = Math.min(current + 1, items.length - 1);
    }

    this.config.setHighlightedIndex(next);
  }
  private navigatePrevious(items: NavigableMenuItem[]): void {
    const current = this.config.getHighlightedIndex();
    let prev: number;

    if (this.getLoop()) {
      prev = (current - 1 + items.length) % items.length;
    } else {
      prev = Math.max(current - 1, 0);
    }

    this.config.setHighlightedIndex(prev);
  }
  private navigateToFirst(_items: NavigableMenuItem[]): void {
    this.config.setHighlightedIndex(0);
  }
  private navigateToLast(items: NavigableMenuItem[]): void {
    this.config.setHighlightedIndex(items.length - 1);
  }
  private selectHighlighted(items: NavigableMenuItem[]): void {
    const index = this.config.getHighlightedIndex();
    if (index >= 0 && index < items.length) {
      const item = items[index];
      if (item && !item.disabled) {
        this.config.onSelect(item, index);
      }
    }
  }
  private handleTypeahead(char: string, items: NavigableMenuItem[]): void {
    if (this.typeaheadTimer) {
      clearTimeout(this.typeaheadTimer);
    }

    this.typeaheadString += char.toLowerCase();

    const matchIndex = items.findIndex((item) =>
      item.textContent?.toLowerCase().startsWith(this.typeaheadString),
    );

    if (matchIndex >= 0) {
      this.config.setHighlightedIndex(matchIndex);
    }

    this.typeaheadTimer = window.setTimeout(() => {
      this.typeaheadString = "";
    }, this.config.typeaheadTimeout);
  }
  reset(): void {
    this.config.setHighlightedIndex(-1);
    this.typeaheadString = "";
    if (this.typeaheadTimer) {
      clearTimeout(this.typeaheadTimer);
    }
  }
  get currentIndex(): number {
    return this.config.getHighlightedIndex();
  }
}

export default MenuNavigationController;
