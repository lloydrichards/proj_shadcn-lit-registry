/**
 * BaseElement - Foundation class for all registry components
 *
 * Features:
 * 1. Automatic Tailwind CSS injection via TW mixin
 * 2. Typed event emission with composed: true by default
 * 3. Automatic dependency registration
 * 4. Host class forwarding support via native className property
 */

import { LitElement } from "lit";
import { TW } from "./tailwindMixin";

export class BaseElement extends TW(LitElement) {
  /**
   * Static dependencies that will be auto-registered
   * Example: static dependencies = { "ui-icon": Icon }
   */
  static dependencies?: Record<string, CustomElementConstructor>;

  /**
   * Emit a custom event that crosses shadow DOM boundaries
   * All events are composed and bubble by default
   */
  protected emit<T = Record<string, unknown>>(
    name: string,
    detail?: T,
    options?: Omit<CustomEventInit<T>, "detail" | "bubbles" | "composed">,
  ): boolean {
    const event = new CustomEvent(name, {
      bubbles: true,
      composed: true, // CRITICAL: Must be true for shadow DOM
      cancelable: options?.cancelable ?? false,
      detail,
      ...options,
    });
    return this.dispatchEvent(event);
  }

  override connectedCallback() {
    super.connectedCallback();
    this.registerDependencies();
  }

  private registerDependencies() {
    const deps = (this.constructor as typeof BaseElement).dependencies;
    if (deps) {
      Object.entries(deps).forEach(([name, ctor]) => {
        // Validate element name
        if (!name.includes("-")) {
          console.error(
            `Invalid custom element name "${name}": must contain a hyphen`,
          );
          return;
        }

        if (customElements.get(name)) {
          return; // Already registered
        }

        try {
          customElements.define(name, ctor);
        } catch (error) {
          console.error(`Failed to register custom element "${name}":`, error);
        }
      });
    }
  }
}

export default BaseElement;
