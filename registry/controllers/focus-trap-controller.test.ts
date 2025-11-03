/**
 * Unit tests for FocusTrapController
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ReactiveControllerHost } from "lit";
import { FocusTrapController } from "./focus-trap-controller";

describe("FocusTrapController", () => {
  let mockHost: ReactiveControllerHost;
  let container: HTMLElement;
  let controller: FocusTrapController;

  // Helper to create a focusable element
  function createFocusableElement(
    tag: string = "button",
    text: string = "Button",
  ): HTMLElement {
    const element = document.createElement(tag);
    element.textContent = text;
    element.tabIndex = 0;
    return element;
  }

  // Helper to simulate Tab key press
  function simulateTabKey(shiftKey = false): KeyboardEvent {
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey,
      bubbles: true,
      cancelable: true,
    });
    return event;
  }

  beforeEach(() => {
    // Create container
    container = document.createElement("div");
    document.body.appendChild(container);

    // Create mock host
    mockHost = {
      addController: vi.fn(),
      removeController: vi.fn(),
      requestUpdate: vi.fn(),
      updateComplete: Promise.resolve(true),
    };
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("Basic Focus Trap", () => {
    it("should trap focus within container with multiple elements", () => {
      const button1 = createFocusableElement("button", "First");
      const button2 = createFocusableElement("button", "Second");
      const button3 = createFocusableElement("button", "Third");

      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
      });

      controller.start();

      // Focus last element
      button3.focus();
      expect(document.activeElement).toBe(button3);

      // Tab should cycle to first
      const event = simulateTabKey();
      container.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(button1);
    });

    it("should trap focus in reverse direction with Shift+Tab", () => {
      const button1 = createFocusableElement("button", "First");
      const button2 = createFocusableElement("button", "Second");
      const button3 = createFocusableElement("button", "Third");

      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
      });

      controller.start();

      // Focus first element
      button1.focus();
      expect(document.activeElement).toBe(button1);

      // Shift+Tab should cycle to last
      const event = simulateTabKey(true);
      container.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(button3);
    });

    it("should not prevent Tab when focus is in the middle", () => {
      const button1 = createFocusableElement("button", "First");
      const button2 = createFocusableElement("button", "Second");
      const button3 = createFocusableElement("button", "Third");

      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
      });

      controller.start();

      // Focus middle element
      button2.focus();

      // Tab should not be prevented (normal behavior)
      const event = simulateTabKey();
      container.dispatchEvent(event);

      // Event should not be prevented since we're in the middle
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe("Auto Focus", () => {
    it("should auto-focus first element when autoFocus is true", () => {
      const button1 = createFocusableElement("button", "First");
      const button2 = createFocusableElement("button", "Second");

      container.appendChild(button1);
      container.appendChild(button2);

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
        autoFocus: true,
      });

      controller.start();

      expect(document.activeElement).toBe(button1);
    });

    it("should respect autofocus attribute", () => {
      const button1 = createFocusableElement("button", "First");
      const button2 = createFocusableElement("button", "Second");
      button2.setAttribute("autofocus", "");

      container.appendChild(button1);
      container.appendChild(button2);

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
        autoFocus: true,
      });

      controller.start();

      expect(document.activeElement).toBe(button2);
    });

    it("should not auto-focus when autoFocus is false", () => {
      const button1 = createFocusableElement("button", "First");
      const button2 = createFocusableElement("button", "Second");

      container.appendChild(button1);
      container.appendChild(button2);

      const originalFocus = document.activeElement;

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
        autoFocus: false,
      });

      controller.start();

      expect(document.activeElement).toBe(originalFocus);
    });

    it("should focus container when no focusable elements exist", () => {
      container.tabIndex = 0;

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
        autoFocus: true,
      });

      controller.start();

      expect(document.activeElement).toBe(container);
    });
  });

  describe("Restore Focus", () => {
    it("should restore focus to previous element when restoreFocus is true", () => {
      const outsideButton = createFocusableElement("button", "Outside");
      document.body.appendChild(outsideButton);
      outsideButton.focus();

      const button1 = createFocusableElement("button", "First");
      container.appendChild(button1);

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
        restoreFocus: true,
      });

      controller.start();
      expect(document.activeElement).toBe(button1);

      controller.stop();
      expect(document.activeElement).toBe(outsideButton);
    });

    it("should not restore focus when restoreFocus is false", () => {
      const outsideButton = createFocusableElement("button", "Outside");
      document.body.appendChild(outsideButton);
      outsideButton.focus();

      const button1 = createFocusableElement("button", "First");
      container.appendChild(button1);

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
        restoreFocus: false,
      });

      controller.start();
      expect(document.activeElement).toBe(button1);

      controller.stop();
      expect(document.activeElement).toBe(button1);
    });
  });

  describe("Lifecycle", () => {
    it("should register controller with host on construction", () => {
      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
      });

      expect(mockHost.addController).toHaveBeenCalledWith(controller);
    });

    it("should remove event listeners on disconnect", () => {
      const button = createFocusableElement();
      container.appendChild(button);

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
      });

      controller.start();
      button.focus();

      controller.hostDisconnected();

      // Tab should not be trapped after disconnect
      const event = simulateTabKey();
      container.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
    });

    it("should handle container being null", () => {
      controller = new FocusTrapController(mockHost, {
        getContainer: () => null,
      });

      // Should not throw
      expect(() => controller.start()).not.toThrow();
      expect(() => controller.stop()).not.toThrow();
    });
  });

  describe("Manual Control", () => {
    it("should start trapping when start() is called", () => {
      const button = createFocusableElement();
      container.appendChild(button);

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
        autoFocus: false,
      });

      expect(controller.active).toBe(false);

      controller.start();

      expect(controller.active).toBe(true);
    });

    it("should stop trapping when stop() is called", () => {
      const button = createFocusableElement();
      container.appendChild(button);

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
      });

      controller.start();
      expect(controller.active).toBe(true);

      controller.stop();
      expect(controller.active).toBe(false);
    });

    it("should activate when update() is called and isActive is true", () => {
      const button = createFocusableElement();
      container.appendChild(button);

      let isActive = true;
      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
        isActive: () => isActive,
      });

      controller.update();

      expect(controller.active).toBe(true);
    });

    it("should deactivate when update() is called and isActive is false", () => {
      const button = createFocusableElement();
      container.appendChild(button);

      let isActive = true;
      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
        isActive: () => isActive,
      });

      controller.update();
      expect(controller.active).toBe(true);

      isActive = false;
      controller.update();

      expect(controller.active).toBe(false);
    });
  });

  describe("Non-Tab Keys", () => {
    it("should not interfere with non-Tab keys", () => {
      const button = createFocusableElement();
      container.appendChild(button);

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
      });

      controller.start();
      button.focus();

      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
      });
      container.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe("Default Configuration", () => {
    it("should use default isActive (always true) when not provided", () => {
      const button = createFocusableElement();
      container.appendChild(button);

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
        autoFocus: false,
      });

      controller.update();

      expect(controller.active).toBe(true);
    });

    it("should use default autoFocus (true) when not provided", () => {
      const button = createFocusableElement();
      container.appendChild(button);

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
      });

      controller.start();

      expect(document.activeElement).toBe(button);
    });

    it("should use default restoreFocus (true) when not provided", () => {
      const outsideButton = createFocusableElement("button", "Outside");
      document.body.appendChild(outsideButton);
      outsideButton.focus();

      const button = createFocusableElement();
      container.appendChild(button);

      controller = new FocusTrapController(mockHost, {
        getContainer: () => container,
      });

      controller.start();
      controller.stop();

      expect(document.activeElement).toBe(outsideButton);
    });
  });
});
