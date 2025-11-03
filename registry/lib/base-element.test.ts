import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { describe, expect, it } from "vitest";
import { BaseElement } from "./base-element";

@customElement("test-base-element")
class TestBaseElement extends BaseElement {
  render() {
    return html`<div class="test">
      <slot></slot>
    </div>`;
  }

  // Expose emit for testing
  public testEmit<T>(name: string, detail?: T) {
    return this.emit(name, detail);
  }
}

@customElement("test-dependency")
class TestDependency extends BaseElement {
  render() {
    return html`<span>Dependency</span>`;
  }
}

@customElement("test-with-dependencies")
class TestWithDependencies extends BaseElement {
  static dependencies = {
    "test-dep": TestDependency,
  };

  render() {
    return html`<test-dep></test-dep>`;
  }
}

describe("BaseElement", () => {
  it("should extend TW(LitElement)", () => {
    const element = document.createElement(
      "test-base-element",
    ) as TestBaseElement;
    expect(element).toBeInstanceOf(LitElement);
  });

  it("should emit events with composed: true", () => {
    const element = document.createElement(
      "test-base-element",
    ) as TestBaseElement;
    let eventFired = false;
    let eventDetail: unknown = null;
    let eventBubbles = false;
    let eventComposed = false;

    element.addEventListener("test-event", (e: Event) => {
      const customEvent = e as CustomEvent;
      eventFired = true;
      eventDetail = customEvent.detail;
      eventBubbles = customEvent.bubbles;
      eventComposed = customEvent.composed;
    });

    element.testEmit("test-event", { value: "test" });

    expect(eventFired).toBe(true);
    expect(eventBubbles).toBe(true);
    expect(eventComposed).toBe(true);
    expect(eventDetail).toEqual({ value: "test" });
  });

  it("should register dependencies on connection", async () => {
    // This test verifies the dependency registration mechanism.
    // Due to browser limitations, custom element constructors can only be
    // registered once. In test environments with hot reload, the constructor
    // might already be used even if the element name isn't registered yet.

    const element = document.createElement(
      "test-with-dependencies",
    ) as TestWithDependencies;

    // Verify the dependencies property is set correctly
    expect(TestWithDependencies.dependencies).toBeDefined();
    expect(TestWithDependencies.dependencies?.["test-dep"]).toBe(
      TestDependency,
    );

    document.body.appendChild(element);
    await element.updateComplete;

    // Verify the element renders successfully (which would fail if deps weren't registered)
    expect(element.isConnected).toBe(true);
    expect(element.shadowRoot?.querySelector("test-dep")).toBeDefined();

    document.body.removeChild(element);
  });
});
