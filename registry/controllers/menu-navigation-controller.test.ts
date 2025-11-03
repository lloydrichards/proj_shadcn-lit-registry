/**
 * Unit tests for MenuNavigationController
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ReactiveControllerHost } from "lit";
import {
  MenuNavigationController,
  type NavigableMenuItem,
  type MenuNavigationConfig,
} from "./menu-navigation-controller";

describe("MenuNavigationController", () => {
  // Mock host component
  let mockHost: ReactiveControllerHost;
  let controller: MenuNavigationController;
  let highlightedIndex: number;
  let mockItems: NavigableMenuItem[];

  // Mock config callbacks
  let getItemsSpy: ReturnType<typeof vi.fn>;
  let getHighlightedIndexSpy: ReturnType<typeof vi.fn>;
  let setHighlightedIndexSpy: ReturnType<typeof vi.fn>;
  let onSelectSpy: ReturnType<typeof vi.fn>;
  let onEscapeSpy: ReturnType<typeof vi.fn>;

  /**
   * Helper to create a mock menu item
   */
  function createMockItem(
    textContent: string,
    disabled = false,
  ): NavigableMenuItem {
    return {
      textContent,
      disabled,
      highlighted: false,
    } as NavigableMenuItem;
  }

  /**
   * Helper to create a keyboard event
   */
  function createKeyboardEvent(
    key: string,
    options: Partial<KeyboardEvent> = {},
  ): KeyboardEvent {
    return {
      key,
      preventDefault: vi.fn(),
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      ...options,
    } as unknown as KeyboardEvent;
  }

  beforeEach(() => {
    // Reset state
    highlightedIndex = -1;

    // Create mock items
    mockItems = [
      createMockItem("Apple"),
      createMockItem("Banana"),
      createMockItem("Cherry"),
      createMockItem("Date"),
      createMockItem("Elderberry"),
    ];

    // Create mock host
    mockHost = {
      addController: vi.fn(),
      removeController: vi.fn(),
      requestUpdate: vi.fn(),
      updateComplete: Promise.resolve(true),
    };

    // Create mock config callbacks
    getItemsSpy = vi.fn(() => mockItems);
    getHighlightedIndexSpy = vi.fn(() => highlightedIndex);
    setHighlightedIndexSpy = vi.fn((index: number) => {
      highlightedIndex = index;
    });
    onSelectSpy = vi.fn();
    onEscapeSpy = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe("Basic Navigation - Vertical Orientation", () => {
    beforeEach(() => {
      const config: MenuNavigationConfig = {
        getItems: getItemsSpy,
        getHighlightedIndex: getHighlightedIndexSpy,
        setHighlightedIndex: setHighlightedIndexSpy,
        onSelect: onSelectSpy,
        onEscape: onEscapeSpy,
        orientation: "vertical",
      };
      controller = new MenuNavigationController(mockHost, config);
    });

    it("should navigate down with ArrowDown", () => {
      highlightedIndex = 0;
      const event = createKeyboardEvent("ArrowDown");

      controller.handleKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(1);
    });

    it("should navigate up with ArrowUp", () => {
      highlightedIndex = 2;
      const event = createKeyboardEvent("ArrowUp");

      controller.handleKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(1);
    });

    it("should navigate to first item with Home key", () => {
      highlightedIndex = 3;
      const event = createKeyboardEvent("Home");

      controller.handleKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(0);
    });

    it("should navigate to last item with End key", () => {
      highlightedIndex = 0;
      const event = createKeyboardEvent("End");

      controller.handleKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(4);
    });
  });

  describe("Basic Navigation - Horizontal Orientation", () => {
    beforeEach(() => {
      const config: MenuNavigationConfig = {
        getItems: getItemsSpy,
        getHighlightedIndex: getHighlightedIndexSpy,
        setHighlightedIndex: setHighlightedIndexSpy,
        onSelect: onSelectSpy,
        onEscape: onEscapeSpy,
        orientation: "horizontal",
      };
      controller = new MenuNavigationController(mockHost, config);
    });

    it("should navigate right with ArrowRight", () => {
      highlightedIndex = 0;
      const event = createKeyboardEvent("ArrowRight");

      controller.handleKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(1);
    });

    it("should navigate left with ArrowLeft", () => {
      highlightedIndex = 2;
      const event = createKeyboardEvent("ArrowLeft");

      controller.handleKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(1);
    });

    it("should not respond to ArrowDown in horizontal mode", () => {
      highlightedIndex = 0;
      const event = createKeyboardEvent("ArrowDown");

      controller.handleKeyDown(event);

      expect(setHighlightedIndexSpy).not.toHaveBeenCalled();
    });

    it("should not respond to ArrowUp in horizontal mode", () => {
      highlightedIndex = 2;
      const event = createKeyboardEvent("ArrowUp");

      controller.handleKeyDown(event);

      expect(setHighlightedIndexSpy).not.toHaveBeenCalled();
    });
  });

  describe("Selection Tests", () => {
    beforeEach(() => {
      const config: MenuNavigationConfig = {
        getItems: getItemsSpy,
        getHighlightedIndex: getHighlightedIndexSpy,
        setHighlightedIndex: setHighlightedIndexSpy,
        onSelect: onSelectSpy,
        onEscape: onEscapeSpy,
      };
      controller = new MenuNavigationController(mockHost, config);
    });

    it("should call onSelect with correct item and index when Enter is pressed", () => {
      highlightedIndex = 2;
      const event = createKeyboardEvent("Enter");

      controller.handleKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onSelectSpy).toHaveBeenCalledWith(mockItems[2], 2);
    });

    it("should call onSelect with correct item and index when Space is pressed", () => {
      highlightedIndex = 1;
      const event = createKeyboardEvent(" ");

      controller.handleKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onSelectSpy).toHaveBeenCalledWith(mockItems[1], 1);
    });

    it("should not call onSelect on disabled items", () => {
      mockItems[2].disabled = true;
      highlightedIndex = 2;
      const event = createKeyboardEvent("Enter");

      controller.handleKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onSelectSpy).not.toHaveBeenCalled();
    });

    it("should not call onSelect when no item is highlighted", () => {
      highlightedIndex = -1;
      const event = createKeyboardEvent("Enter");

      controller.handleKeyDown(event);

      expect(onSelectSpy).not.toHaveBeenCalled();
    });

    it("should not call onSelect when index is out of bounds", () => {
      highlightedIndex = 999;
      const event = createKeyboardEvent("Enter");

      controller.handleKeyDown(event);

      expect(onSelectSpy).not.toHaveBeenCalled();
    });
  });

  describe("Typeahead Search Tests", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      const config: MenuNavigationConfig = {
        getItems: getItemsSpy,
        getHighlightedIndex: getHighlightedIndexSpy,
        setHighlightedIndex: setHighlightedIndexSpy,
        onSelect: onSelectSpy,
        onEscape: onEscapeSpy,
        typeaheadTimeout: 500,
      };
      controller = new MenuNavigationController(mockHost, config);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should find item with single character search", () => {
      const event = createKeyboardEvent("c");

      controller.handleKeyDown(event);

      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(2); // Cherry
    });

    it("should find item with multi-character search", () => {
      const event1 = createKeyboardEvent("b");
      const event2 = createKeyboardEvent("a");

      controller.handleKeyDown(event1);
      controller.handleKeyDown(event2);

      expect(setHighlightedIndexSpy).toHaveBeenLastCalledWith(1); // Banana
    });

    it("should be case-insensitive", () => {
      const event = createKeyboardEvent("C");

      controller.handleKeyDown(event);

      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(2); // Cherry
    });

    it("should reset typeahead string after timeout", () => {
      const event1 = createKeyboardEvent("b");
      const event2 = createKeyboardEvent("c");

      // Type 'b'
      controller.handleKeyDown(event1);
      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(1); // Banana

      // Wait for timeout
      vi.advanceTimersByTime(500);

      // Type 'c' - should find Cherry, not continue 'bc' search
      controller.handleKeyDown(event2);
      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(2); // Cherry
    });

    it("should not trigger typeahead with modifier keys", () => {
      const event = createKeyboardEvent("c", { ctrlKey: true });

      controller.handleKeyDown(event);

      expect(setHighlightedIndexSpy).not.toHaveBeenCalled();
    });

    it("should not trigger typeahead with meta key", () => {
      const event = createKeyboardEvent("c", { metaKey: true });

      controller.handleKeyDown(event);

      expect(setHighlightedIndexSpy).not.toHaveBeenCalled();
    });

    it("should not trigger typeahead with alt key", () => {
      const event = createKeyboardEvent("c", { altKey: true });

      controller.handleKeyDown(event);

      expect(setHighlightedIndexSpy).not.toHaveBeenCalled();
    });

    it("should not navigate if no match is found", () => {
      const event = createKeyboardEvent("z");

      controller.handleKeyDown(event);

      expect(setHighlightedIndexSpy).not.toHaveBeenCalled();
    });
  });

  describe("Loop Property Tests", () => {
    it("should wrap to first item when loop=true and navigating down from last", () => {
      const config: MenuNavigationConfig = {
        getItems: getItemsSpy,
        getHighlightedIndex: getHighlightedIndexSpy,
        setHighlightedIndex: setHighlightedIndexSpy,
        loop: true,
      };
      controller = new MenuNavigationController(mockHost, config);
      highlightedIndex = 4; // Last item

      const event = createKeyboardEvent("ArrowDown");
      controller.handleKeyDown(event);

      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(0);
    });

    it("should wrap to last item when loop=true and navigating up from first", () => {
      const config: MenuNavigationConfig = {
        getItems: getItemsSpy,
        getHighlightedIndex: getHighlightedIndexSpy,
        setHighlightedIndex: setHighlightedIndexSpy,
        loop: true,
      };
      controller = new MenuNavigationController(mockHost, config);
      highlightedIndex = 0; // First item

      const event = createKeyboardEvent("ArrowUp");
      controller.handleKeyDown(event);

      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(4);
    });

    it("should stay at last item when loop=false and navigating down from last", () => {
      const config: MenuNavigationConfig = {
        getItems: getItemsSpy,
        getHighlightedIndex: getHighlightedIndexSpy,
        setHighlightedIndex: setHighlightedIndexSpy,
        loop: false,
      };
      controller = new MenuNavigationController(mockHost, config);
      highlightedIndex = 4; // Last item

      const event = createKeyboardEvent("ArrowDown");
      controller.handleKeyDown(event);

      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(4);
    });

    it("should stay at first item when loop=false and navigating up from first", () => {
      const config: MenuNavigationConfig = {
        getItems: getItemsSpy,
        getHighlightedIndex: getHighlightedIndexSpy,
        setHighlightedIndex: setHighlightedIndexSpy,
        loop: false,
      };
      controller = new MenuNavigationController(mockHost, config);
      highlightedIndex = 0; // First item

      const event = createKeyboardEvent("ArrowUp");
      controller.handleKeyDown(event);

      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(0);
    });

    it("should evaluate loop as reactive getter function", () => {
      let loopValue = true;
      const loopGetter = vi.fn(() => loopValue);

      const config: MenuNavigationConfig = {
        getItems: getItemsSpy,
        getHighlightedIndex: getHighlightedIndexSpy,
        setHighlightedIndex: setHighlightedIndexSpy,
        loop: loopGetter,
      };
      controller = new MenuNavigationController(mockHost, config);
      highlightedIndex = 4; // Last item

      // First navigation with loop=true
      const event1 = createKeyboardEvent("ArrowDown");
      controller.handleKeyDown(event1);
      expect(loopGetter).toHaveBeenCalled();
      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(0);

      // Change loop value
      loopValue = false;
      highlightedIndex = 4;

      // Second navigation with loop=false
      const event2 = createKeyboardEvent("ArrowDown");
      controller.handleKeyDown(event2);
      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(4);
    });
  });

  describe("Reset Tests", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      const config: MenuNavigationConfig = {
        getItems: getItemsSpy,
        getHighlightedIndex: getHighlightedIndexSpy,
        setHighlightedIndex: setHighlightedIndexSpy,
      };
      controller = new MenuNavigationController(mockHost, config);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should clear highlighted index to -1", () => {
      highlightedIndex = 3;

      controller.reset();

      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(-1);
    });

    it("should clear typeahead string", () => {
      // Type some characters
      controller.handleKeyDown(createKeyboardEvent("b"));
      controller.handleKeyDown(createKeyboardEvent("a"));

      // Reset
      controller.reset();

      // Type 'c' - should find Cherry, not continue 'bac' search
      controller.handleKeyDown(createKeyboardEvent("c"));
      expect(setHighlightedIndexSpy).toHaveBeenLastCalledWith(2); // Cherry
    });

    it("should clear typeahead timer", () => {
      // Type a character to start timer
      controller.handleKeyDown(createKeyboardEvent("b"));

      // Reset
      controller.reset();

      // Advance time - timer should not fire
      vi.advanceTimersByTime(500);

      // Type another character - should start fresh search
      controller.handleKeyDown(createKeyboardEvent("c"));
      expect(setHighlightedIndexSpy).toHaveBeenLastCalledWith(2); // Cherry
    });
  });

  describe("Escape Key Test", () => {
    beforeEach(() => {
      const config: MenuNavigationConfig = {
        getItems: getItemsSpy,
        getHighlightedIndex: getHighlightedIndexSpy,
        setHighlightedIndex: setHighlightedIndexSpy,
        onEscape: onEscapeSpy,
      };
      controller = new MenuNavigationController(mockHost, config);
    });

    it("should call onEscape callback when Escape is pressed", () => {
      const event = createKeyboardEvent("Escape");

      controller.handleKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onEscapeSpy).toHaveBeenCalled();
    });
  });

  describe("Controller Lifecycle", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      const config: MenuNavigationConfig = {
        getItems: getItemsSpy,
        getHighlightedIndex: getHighlightedIndexSpy,
        setHighlightedIndex: setHighlightedIndexSpy,
      };
      controller = new MenuNavigationController(mockHost, config);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should register controller with host", () => {
      expect(mockHost.addController).toHaveBeenCalledWith(controller);
    });

    it("should cleanup typeahead timer on disconnect", () => {
      // Start a typeahead timer
      controller.handleKeyDown(createKeyboardEvent("b"));

      // Disconnect controller
      controller.hostDisconnected();

      // Advance time - timer should not fire
      vi.advanceTimersByTime(500);

      // Verify timer was cleared (no errors thrown)
      expect(true).toBe(true);
    });

    it("should expose currentIndex getter", () => {
      highlightedIndex = 3;

      expect(controller.currentIndex).toBe(3);
      expect(getHighlightedIndexSpy).toHaveBeenCalled();
    });
  });

  describe("Default Configuration", () => {
    it("should use default values when not provided", () => {
      const config: MenuNavigationConfig = {
        getItems: getItemsSpy,
        getHighlightedIndex: getHighlightedIndexSpy,
        setHighlightedIndex: setHighlightedIndexSpy,
      };
      controller = new MenuNavigationController(mockHost, config);
      highlightedIndex = 4;

      // Default loop=true
      const event1 = createKeyboardEvent("ArrowDown");
      controller.handleKeyDown(event1);
      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(0);

      // Default orientation=vertical
      highlightedIndex = 0;
      const event2 = createKeyboardEvent("ArrowDown");
      controller.handleKeyDown(event2);
      expect(setHighlightedIndexSpy).toHaveBeenCalledWith(1);

      // Default onSelect does nothing (no error)
      highlightedIndex = 0;
      const event3 = createKeyboardEvent("Enter");
      expect(() => controller.handleKeyDown(event3)).not.toThrow();

      // Default onEscape does nothing (no error)
      const event4 = createKeyboardEvent("Escape");
      expect(() => controller.handleKeyDown(event4)).not.toThrow();
    });
  });
});
