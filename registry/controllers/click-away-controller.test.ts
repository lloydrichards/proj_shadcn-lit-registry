/**
 * Unit tests for ClickAwayController
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ReactiveControllerHost } from "lit";
import { ClickAwayController } from "./click-away-controller";

describe("ClickAwayController", () => {
  let mockHost: ReactiveControllerHost & HTMLElement;
  let controller: ClickAwayController;
  let onClickAwaySpy: ReturnType<typeof vi.fn>;

  // Helper to create a mock element
  function createMockElement(id: string): HTMLElement {
    const element = document.createElement("div");
    element.id = id;
    document.body.appendChild(element);
    return element;
  }

  // Helper to simulate a click event
  function simulateClick(target: HTMLElement): void {
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    Object.defineProperty(event, "target", {
      value: target,
      enumerable: true,
    });
    target.dispatchEvent(event);
  }

  beforeEach(() => {
    // Create mock host
    const hostElement = createMockElement("host");
    mockHost = Object.assign(hostElement, {
      addController: vi.fn(),
      removeController: vi.fn(),
      requestUpdate: vi.fn(),
      updateComplete: Promise.resolve(true),
    });

    onClickAwaySpy = vi.fn();

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  describe("Basic Click Away Detection", () => {
    it("should trigger onClickAway when clicking outside the host element", () => {
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
      });

      controller.start();
      vi.runAllTimers(); // Run setTimeout

      const outsideElement = createMockElement("outside");
      simulateClick(outsideElement);

      expect(onClickAwaySpy).toHaveBeenCalledOnce();
    });

    it("should NOT trigger onClickAway when clicking inside the host element", () => {
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
      });

      controller.start();
      vi.runAllTimers();

      simulateClick(mockHost);

      expect(onClickAwaySpy).not.toHaveBeenCalled();
    });

    it("should NOT trigger onClickAway when clicking on a child of the host element", () => {
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
      });

      controller.start();
      vi.runAllTimers();

      const child = document.createElement("span");
      mockHost.appendChild(child);
      simulateClick(child);

      expect(onClickAwaySpy).not.toHaveBeenCalled();
    });

    it("should respect isActive flag when false", () => {
      let isActive = false;
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
        isActive: () => isActive,
      });

      controller.start();
      vi.runAllTimers();

      const outsideElement = createMockElement("outside");
      simulateClick(outsideElement);

      expect(onClickAwaySpy).not.toHaveBeenCalled();
    });

    it("should respect isActive flag when true", () => {
      let isActive = true;
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
        isActive: () => isActive,
      });

      controller.start();
      vi.runAllTimers();

      const outsideElement = createMockElement("outside");
      simulateClick(outsideElement);

      expect(onClickAwaySpy).toHaveBeenCalledOnce();
    });
  });

  describe("Excluded Elements", () => {
    it("should NOT trigger onClickAway when clicking on excluded element", () => {
      const excludedElement = createMockElement("excluded");
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
        excludeElements: () => [excludedElement],
      });

      controller.start();
      vi.runAllTimers();

      simulateClick(excludedElement);

      expect(onClickAwaySpy).not.toHaveBeenCalled();
    });

    it("should NOT trigger onClickAway when clicking on child of excluded element", () => {
      const excludedElement = createMockElement("excluded");
      const child = document.createElement("span");
      excludedElement.appendChild(child);

      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
        excludeElements: () => [excludedElement],
      });

      controller.start();
      vi.runAllTimers();

      simulateClick(child);

      expect(onClickAwaySpy).not.toHaveBeenCalled();
    });

    it("should handle multiple excluded elements", () => {
      const excluded1 = createMockElement("excluded1");
      const excluded2 = createMockElement("excluded2");

      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
        excludeElements: () => [excluded1, excluded2],
      });

      controller.start();
      vi.runAllTimers();

      simulateClick(excluded1);
      expect(onClickAwaySpy).not.toHaveBeenCalled();

      simulateClick(excluded2);
      expect(onClickAwaySpy).not.toHaveBeenCalled();
    });

    it("should call excludeElements function on each click", () => {
      const excludeElementsSpy = vi.fn(() => []);
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
        excludeElements: excludeElementsSpy,
      });

      controller.start();
      vi.runAllTimers();

      const outsideElement = createMockElement("outside");
      simulateClick(outsideElement);

      expect(excludeElementsSpy).toHaveBeenCalled();
    });
  });

  describe("Lifecycle", () => {
    it("should register controller with host on construction", () => {
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
      });

      expect(mockHost.addController).toHaveBeenCalledWith(controller);
    });

    it("should use setTimeout to delay event listener attachment", () => {
      const setTimeoutSpy = vi.spyOn(window, "setTimeout");

      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
      });

      controller.start();

      expect(setTimeoutSpy).toHaveBeenCalled();
    });

    it("should remove event listener on disconnect", () => {
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
      });

      controller.start();
      vi.runAllTimers();

      controller.hostDisconnected();

      const outsideElement = createMockElement("outside");
      simulateClick(outsideElement);

      expect(onClickAwaySpy).not.toHaveBeenCalled();
    });

    it("should not trigger before setTimeout completes", () => {
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
      });

      controller.start();
      // Don't run timers

      const outsideElement = createMockElement("outside");
      simulateClick(outsideElement);

      expect(onClickAwaySpy).not.toHaveBeenCalled();
    });
  });

  describe("Manual Control", () => {
    it("should start listening when start() is called", () => {
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
      });

      controller.start();
      vi.runAllTimers();

      const outsideElement = createMockElement("outside");
      simulateClick(outsideElement);

      expect(onClickAwaySpy).toHaveBeenCalledOnce();
    });

    it("should stop listening when stop() is called", () => {
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
      });

      controller.start();
      vi.runAllTimers();

      controller.stop();

      const outsideElement = createMockElement("outside");
      simulateClick(outsideElement);

      expect(onClickAwaySpy).not.toHaveBeenCalled();
    });

    it("should start listening when update() is called and isActive is true", () => {
      let isActive = true;
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
        isActive: () => isActive,
      });

      controller.update();
      vi.runAllTimers();

      const outsideElement = createMockElement("outside");
      simulateClick(outsideElement);

      expect(onClickAwaySpy).toHaveBeenCalledOnce();
    });

    it("should stop listening when update() is called and isActive is false", () => {
      let isActive = true;
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
        isActive: () => isActive,
      });

      controller.update();
      vi.runAllTimers();

      isActive = false;
      controller.update();

      const outsideElement = createMockElement("outside");
      simulateClick(outsideElement);

      expect(onClickAwaySpy).not.toHaveBeenCalled();
    });
  });

  describe("Capture Phase", () => {
    it("should use capture phase when useCapture is true", () => {
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");

      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
        useCapture: true,
      });

      controller.start();
      vi.runAllTimers();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
        true,
      );
    });

    it("should use bubbling phase by default", () => {
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");

      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
      });

      controller.start();
      vi.runAllTimers();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
        false,
      );
    });
  });

  describe("Default Configuration", () => {
    it("should use default isActive (always true) when not provided", () => {
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
      });

      controller.start();
      vi.runAllTimers();

      const outsideElement = createMockElement("outside");
      simulateClick(outsideElement);

      expect(onClickAwaySpy).toHaveBeenCalledOnce();
    });

    it("should use default excludeElements (empty array) when not provided", () => {
      controller = new ClickAwayController(mockHost, {
        onClickAway: onClickAwaySpy,
      });

      controller.start();
      vi.runAllTimers();

      const outsideElement = createMockElement("outside");
      simulateClick(outsideElement);

      expect(onClickAwaySpy).toHaveBeenCalledOnce();
    });
  });
});
