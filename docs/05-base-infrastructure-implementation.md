# Base Infrastructure Implementation Guide

## Overview

This document provides step-by-step instructions for implementing the
foundational infrastructure that all components will use. This MUST be completed
before migrating any components.

## Prerequisites

- Lit 3.x installed
- TypeScript 5.x with decorators enabled
- Tailwind CSS v4 configured

## Task 1: Create BaseElement Class

### File: `registry/lib/base-element.ts`

**Purpose**: Provide common functionality for all components including typed
events, dependency management, and Tailwind integration.

**Implementation Instructions**:

```typescript
/**
 * BaseElement - Foundation class for all registry components
 *
 * Features:
 * 1. Automatic Tailwind CSS injection via TW mixin
 * 2. Typed event emission with composed: true by default
 * 3. Automatic dependency registration
 * 4. Host class forwarding support
 */

import { LitElement, type PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import { TW } from "./tailwindMixin";

export class BaseElement extends TW(LitElement) {
  /**
   * Forward host classes to internal elements
   * This allows Tailwind utilities on the host to work
   */
  @property({ type: String, attribute: "class" }) className = "";

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
    options?: Omit<CustomEventInit<T>, "detail" | "bubbles" | "composed">
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
        if (!customElements.get(name)) {
          customElements.define(name, ctor);
        }
      });
    }
  }
}

export default BaseElement;
```

**Testing Checklist**:

- [ ] Class extends TW(LitElement)
- [ ] emit() method creates events with composed: true
- [ ] Dependencies auto-register on connectedCallback
- [ ] className property is reactive

**Note on Slot Detection**: For reactive slot content detection, use Lit's
built-in `@queryAssignedElements` decorator instead of a custom controller. For
simple non-reactive checks, use the `hasSlottedContent()` utility function from
`registry/lib/utils.ts`.

---

## Task 2: Create FormElement Class

### File: `registry/lib/form-element.ts`

**Purpose**: Base class for all form-participating components (input, select,
checkbox, etc.)

**Implementation Instructions**:

```typescript
/**
 * FormElement - Base class for form-participating components
 *
 * Features:
 * 1. Native form participation via ElementInternals
 * 2. Validation API (checkValidity, reportValidity, setCustomValidity)
 * 3. Form submission and reset support
 * 4. Accessible by default with ARIA attributes
 */

import type { PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import { BaseElement } from "./base-element";

export interface FormElementProperties {
  name?: string;
  value?: unknown;
  defaultValue?: unknown;
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  form?: string;
}

export abstract class FormElement
  extends BaseElement
  implements FormElementProperties
{
  // Enable native form participation (where supported)
  static formAssociated = true;

  // ElementInternals for native form participation
  protected internals?: ElementInternals;

  // Form element reference
  private _form: HTMLFormElement | null = null;

  // Form properties
  @property({ type: String }) name = "";
  @property() value: unknown = "";
  @property() defaultValue: unknown = "";
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property({ type: String }) form = "";

  // Validity state
  protected validationMessage = "";
  protected isValid = true;

  constructor() {
    super();

    // Attach ElementInternals if available
    if ("attachInternals" in this) {
      this.internals = this.attachInternals();
    }
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set default value on first connection
    if (this.defaultValue === "") {
      this.defaultValue = this.value;
    }

    // Find and attach to form
    this._form = this._findForm();
    if (this._form) {
      this._form.addEventListener("submit", this._handleFormSubmit);
      this._form.addEventListener("reset", this._handleFormReset);
    }

    // Update form value
    this.updateFormValue();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    // Cleanup form listeners
    if (this._form) {
      this._form.removeEventListener("submit", this._handleFormSubmit);
      this._form.removeEventListener("reset", this._handleFormReset);
    }
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    // Update form value when value changes
    if (changedProperties.has("value")) {
      this.updateFormValue();
      this.checkValidity();
    }

    // Update validity when validation props change
    if (
      changedProperties.has("required") ||
      changedProperties.has("disabled")
    ) {
      this.checkValidity();
    }
  }

  /**
   * Find the form this element belongs to
   */
  private _findForm(): HTMLFormElement | null {
    // Check for form attribute (allows associating with a form by ID)
    if (this.form) {
      return document.getElementById(this.form) as HTMLFormElement;
    }

    // Use ElementInternals.form if available (preferred)
    if (this.internals?.form) {
      return this.internals.form;
    }

    // Fallback to closest form ancestor
    return this.closest("form");
  }

  /**
   * Handle form submission - validate before allowing submit
   */
  private _handleFormSubmit = (event: Event) => {
    if (!this.reportValidity()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  /**
   * Handle form reset - restore default value
   */
  private _handleFormReset = () => {
    this.reset();
  };

  /**
   * Update the form value using ElementInternals
   */
  protected updateFormValue() {
    const formValue = this.disabled ? null : this.value;

    if (this.internals) {
      // Use native form participation
      if (formValue === null || formValue === undefined) {
        this.internals.setFormValue(null);
      } else if (typeof formValue === "string") {
        this.internals.setFormValue(formValue);
      } else {
        // Convert to FormData for complex values
        const formData = new FormData();
        formData.set(this.name, String(formValue));
        this.internals.setFormValue(formData);
      }
    }
  }

  /**
   * Check validity without showing error message
   */
  checkValidity(): boolean {
    if (this.disabled) {
      this.isValid = true;
      this.validationMessage = "";
      return true;
    }

    // Check required
    if (this.required && !this.value) {
      this.isValid = false;
      this.validationMessage = "Please fill out this field.";
    } else {
      this.isValid = true;
      this.validationMessage = "";
    }

    // Update ElementInternals validity
    if (this.internals) {
      if (this.isValid) {
        this.internals.setValidity({});
      } else {
        this.internals.setValidity(
          { valueMissing: this.required && !this.value },
          this.validationMessage
        );
      }
    }

    return this.isValid;
  }

  /**
   * Check validity and show error message
   */
  reportValidity(): boolean {
    const isValid = this.checkValidity();

    if (!isValid) {
      this.emit("invalid", {
        message: this.validationMessage,
        validity: this.validity,
      });

      // Could also show a tooltip or other UI here
      this.internals?.reportValidity();
    }

    return isValid;
  }

  /**
   * Set a custom validation message
   */
  setCustomValidity(message: string): void {
    this.validationMessage = message;
    this.isValid = !message;

    if (this.internals) {
      if (message) {
        this.internals.setValidity({ customError: true }, message);
      } else {
        this.internals.setValidity({});
      }
    }
  }

  /**
   * Get validity state
   */
  get validity(): ValidityState {
    if (this.internals) {
      return this.internals.validity;
    }

    // Polyfill ValidityState
    return {
      badInput: false,
      customError: !!this.validationMessage,
      patternMismatch: false,
      rangeOverflow: false,
      rangeUnderflow: false,
      stepMismatch: false,
      tooLong: false,
      tooShort: false,
      typeMismatch: false,
      valid: this.isValid,
      valueMissing: this.required && !this.value,
    } as ValidityState;
  }

  /**
   * Reset to default value
   */
  reset(): void {
    this.value = this.defaultValue;
    this.validationMessage = "";
    this.isValid = true;
    this.requestUpdate();
  }

  /**
   * Get the form element this control belongs to
   */
  get formElement(): HTMLFormElement | null {
    if (this.internals) {
      return this.internals.form;
    }

    if (this.form) {
      return document.getElementById(this.form) as HTMLFormElement;
    }

    return this.closest("form");
  }

  /**
   * Focus the form control (to be implemented by subclasses)
   */
  abstract focus(options?: FocusOptions): void;

  /**
   * Blur the form control (to be implemented by subclasses)
   */
  abstract blur(): void;
}

export default FormElement;
```

**Testing Checklist**:

- [ ] FormElement extends BaseElement
- [ ] ElementInternals attached when available
- [ ] Form participation works (submit includes value)
- [ ] Validation API implemented
- [ ] Reset restores defaultValue
- [ ] Form association via form attribute works
- [ ] Form submit/reset event handling works

**Note on Form Integration**: FormElement handles all form integration
internally using ElementInternals API (95%+ browser support). No separate
controller is needed.

---

## Task 3: Slot Detection Patterns

### File: `@/controllers/has-slot.ts`

**Purpose**: Detect when slots have content and trigger re-renders when slot
content changes.

**Implementation Instructions**:

```typescript
/**
 * HasSlotController - Reactive controller for slot content detection
 *
 * Usage:
 * private hasSlot = new HasSlotController(this, "prefix", "suffix");
 *
 * In render:
 * ${this.hasSlot.test("prefix") ? html`<div>Has prefix</div>` : null}
 */

import { ReactiveController, ReactiveControllerHost } from "lit";

export class HasSlotController implements ReactiveController {
  private host: ReactiveControllerHost & Element;
  private slotNames: string[] = [];
  private slotStates = new Map<string, boolean>();

  constructor(host: ReactiveControllerHost & Element, ...slotNames: string[]) {
    (this.host = host).addController(this);
    this.slotNames = slotNames;

    // Include default slot if specified
    if (slotNames.includes("[default]")) {
      this.slotNames = slotNames.filter((s) => s !== "[default]");
      this.slotNames.push("[default]");
    }
  }

  hostConnected() {
    // Wait for first update to ensure shadow root exists
    this.host.updateComplete.then(() => {
      this.detectSlots();
      this.observeSlots();
    });
  }

  hostDisconnected() {
    // Clean up observers
  }

  /**
   * Test if a slot has content
   */
  test(slotName: string): boolean {
    return this.slotStates.get(slotName) ?? false;
  }

  /**
   * Detect initial slot content
   */
  private detectSlots() {
    for (const slotName of this.slotNames) {
      const hasContent =
        slotName === "[default]"
          ? this.hasDefaultSlot()
          : this.hasNamedSlot(slotName);

      this.slotStates.set(slotName, hasContent);
    }
  }

  /**
   * Check if default slot has content
   */
  private hasDefaultSlot(): boolean {
    const nodes = Array.from(this.host.childNodes);
    return nodes.some((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent?.trim() !== "";
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        // Elements without slot attribute go to default slot
        return !el.hasAttribute("slot");
      }
      return false;
    });
  }

  /**
   * Check if named slot has content
   */
  private hasNamedSlot(name: string): boolean {
    return this.host.querySelector(`[slot="${name}"]`) !== null;
  }

  /**
   * Observe slot changes
   */
  private observeSlots() {
    const shadowRoot = (this.host as any).shadowRoot;
    if (!shadowRoot) return;

    // Listen to slotchange events
    this.slotNames.forEach((slotName) => {
      const selector =
        slotName === "[default]"
          ? "slot:not([name])"
          : `slot[name="${slotName}"]`;

      const slot = shadowRoot.querySelector(selector);
      if (slot) {
        slot.addEventListener("slotchange", () => {
          const oldState = this.slotStates.get(slotName);
          const newState =
            slotName === "[default]"
              ? this.hasDefaultSlot()
              : this.hasNamedSlot(slotName);

          if (oldState !== newState) {
            this.slotStates.set(slotName, newState);
            this.host.requestUpdate();
          }
        });
      }
    });

    // Also observe light DOM changes
    const observer = new MutationObserver(() => {
      let changed = false;

      for (const slotName of this.slotNames) {
        const oldState = this.slotStates.get(slotName);
        const newState =
          slotName === "[default]"
            ? this.hasDefaultSlot()
            : this.hasNamedSlot(slotName);

        if (oldState !== newState) {
          this.slotStates.set(slotName, newState);
          changed = true;
        }
      }

      if (changed) {
        this.host.requestUpdate();
      }
    });

    observer.observe(this.host, {
      childList: true,
      subtree: false,
      characterData: true,
    });
  }
}

export default HasSlotController;
```

**Testing Checklist**:

- [ ] Controller detects default slot content
- [ ] Controller detects named slot content
- [ ] Updates trigger when slot content changes
- [ ] Text nodes properly detected
- [ ] Empty slots return false

---

## Task 4: Create FormControlController

### File: `@/controllers/form-control.ts`

**Purpose**: Handle form submission, reset, and validation for form components.

**Implementation Instructions**:

```typescript
/**
 * FormControlController - Manages form participation for components
 *
 * Features:
 * 1. Automatic form association
 * 2. Submit/reset handling
 * 3. Validation coordination
 * 4. Focus management
 */

import { ReactiveController, ReactiveControllerHost } from "lit";

interface FormControlHost extends ReactiveControllerHost, HTMLElement {
  name?: string;
  value?: unknown;
  disabled?: boolean;
  required?: boolean;
  defaultValue?: unknown;
  checkValidity?(): boolean;
  reportValidity?(): boolean;
  setCustomValidity?(message: string): void;
  reset?(): void;
}

export class FormControlController implements ReactiveController {
  private host: FormControlHost;
  private form: HTMLFormElement | null = null;
  private hiddenInput?: HTMLInputElement;

  constructor(
    host: FormControlHost,
    private options?: {
      value?: (host: FormControlHost) => unknown;
      setValue?: (host: FormControlHost, value: unknown) => void;
    }
  ) {
    (this.host = host).addController(this);
  }

  hostConnected() {
    this.form = this.findForm();

    if (this.form) {
      this.attachToForm();
    }

    // Create hidden input for form submission (fallback for no ElementInternals)
    if (!("ElementInternals" in window) && this.host.name) {
      this.createHiddenInput();
    }
  }

  hostDisconnected() {
    if (this.form) {
      this.detachFromForm();
    }

    if (this.hiddenInput) {
      this.hiddenInput.remove();
    }
  }

  hostUpdated() {
    // Update hidden input value
    if (this.hiddenInput && this.host.name) {
      this.hiddenInput.name = this.host.name;
      this.hiddenInput.value = String(this.getValue() ?? "");
      this.hiddenInput.disabled = this.host.disabled ?? false;
      this.hiddenInput.required = this.host.required ?? false;
    }
  }

  /**
   * Find the form this control belongs to
   */
  private findForm(): HTMLFormElement | null {
    // Check for form attribute
    if (this.host.getAttribute("form")) {
      const formId = this.host.getAttribute("form")!;
      return document.getElementById(formId) as HTMLFormElement;
    }

    // Find closest form
    return this.host.closest("form");
  }

  /**
   * Attach event listeners to form
   */
  private attachToForm() {
    if (!this.form) return;

    // Listen for form events
    this.form.addEventListener("submit", this.handleSubmit);
    this.form.addEventListener("reset", this.handleReset);
    this.form.addEventListener("formdata", this.handleFormData);
  }

  /**
   * Remove event listeners from form
   */
  private detachFromForm() {
    if (!this.form) return;

    this.form.removeEventListener("submit", this.handleSubmit);
    this.form.removeEventListener("reset", this.handleReset);
    this.form.removeEventListener("formdata", this.handleFormData);
  }

  /**
   * Handle form submission
   */
  private handleSubmit = (event: Event) => {
    // Validate on submit
    if (this.host.reportValidity && !this.host.reportValidity()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  /**
   * Handle form reset
   */
  private handleReset = () => {
    // Reset to default value
    if (this.host.reset) {
      this.host.reset();
    } else if (this.host.defaultValue !== undefined) {
      this.setValue(this.host.defaultValue);
      this.host.requestUpdate();
    }
  };

  /**
   * Handle formdata event (for custom elements without ElementInternals)
   */
  private handleFormData = (event: FormDataEvent) => {
    if (!this.host.disabled && this.host.name) {
      const value = this.getValue();
      if (value !== null && value !== undefined) {
        event.formData.append(this.host.name, String(value));
      }
    }
  };

  /**
   * Create hidden input for form submission fallback
   */
  private createHiddenInput() {
    this.hiddenInput = document.createElement("input");
    this.hiddenInput.type = "hidden";
    this.hiddenInput.name = this.host.name || "";
    this.hiddenInput.value = String(this.getValue() ?? "");

    // Insert next to host element
    this.host.parentElement?.insertBefore(
      this.hiddenInput,
      this.host.nextSibling
    );
  }

  /**
   * Get the current value
   */
  private getValue(): unknown {
    if (this.options?.value) {
      return this.options.value(this.host);
    }
    return this.host.value;
  }

  /**
   * Set the current value
   */
  private setValue(value: unknown) {
    if (this.options?.setValue) {
      this.options.setValue(this.host, value);
    } else {
      this.host.value = value;
    }
  }

  /**
   * Submit the form
   */
  submit(submitter?: HTMLElement) {
    if (this.form) {
      const submitEvent = new SubmitEvent("submit", {
        bubbles: true,
        cancelable: true,
        submitter,
      });

      this.form.dispatchEvent(submitEvent);

      if (!submitEvent.defaultPrevented) {
        this.form.submit();
      }
    }
  }

  /**
   * Reset the form
   */
  reset() {
    if (this.form) {
      this.form.reset();
    }
  }

  /**
   * Check validity of all form controls
   */
  checkFormValidity(): boolean {
    if (!this.form) return true;

    return this.form.checkValidity();
  }

  /**
   * Report validity of all form controls
   */
  reportFormValidity(): boolean {
    if (!this.form) return true;

    return this.form.reportValidity();
  }
}

export default FormControlController;
```

**Testing Checklist**:

- [ ] Form association works via closest form
- [ ] Form association works via form attribute
- [ ] Submit triggers validation
- [ ] Reset restores default values
- [ ] FormData includes component value
- [ ] Hidden input fallback works

---

## Task 5: Create Context Utilities

### File: `registry/lib/context.ts`

**Purpose**: Enable state sharing between parent and child components.

**Implementation Instructions**:

```typescript
/**
 * Context utilities for component state sharing
 * Based on Lit's @lit/context
 */

import { createContext, provide, consume } from "@lit/context";
import type { Context } from "@lit/context";
import type { ReactiveElement } from "lit";

export interface ComponentContext<T> {
  context: Context<unknown, T>;
  provide(host: ReactiveElement, value: T): void;
  consume(host: ReactiveElement): T | undefined;
}

/**
 * Create a typed context for component communication
 *
 * Usage:
 * const dialogContext = createComponentContext<DialogState>("dialog");
 *
 * In parent:
 * dialogContext.provide(this, { open: true });
 *
 * In child:
 * const state = dialogContext.consume(this);
 */
export function createComponentContext<T>(name: string): ComponentContext<T> {
  const context = createContext<T>(Symbol(name));

  return {
    context,

    provide(host: ReactiveElement, value: T) {
      provide({ context, host, value });
    },

    consume(host: ReactiveElement): T | undefined {
      return consume({
        context,
        host,
        subscribe: true, // Auto re-render on context changes
      });
    },
  };
}

// Re-export Lit context utilities
export { createContext, provide, consume } from "@lit/context";
export type { Context } from "@lit/context";

export default createComponentContext;
```

**Testing Checklist**:

- [ ] Context creation works
- [ ] Parent can provide context
- [ ] Children can consume context
- [ ] Updates trigger re-renders
- [ ] Multiple contexts don't conflict

---

## Task 6: Update Type Definitions

### File: `registry/lib/types.ts`

**Purpose**: Shared TypeScript interfaces and types.

**Implementation Instructions**:

```typescript
/**
 * Shared type definitions for the component registry
 */

import type { LitElement } from "lit";

// Form-related types
export interface FormValue {
  name: string;
  value: unknown;
}

export interface ValidationState {
  valid: boolean;
  message?: string;
  errors?: string[];
}

// Event types
export interface ComponentEvent<T = unknown> extends CustomEvent<T> {
  target: LitElement;
}

// Size variants used across components
export type Size = "sm" | "md" | "lg";

// Common component variants
export type Variant =
  | "default"
  | "primary"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost";

// Orientation for components like tabs, separator
export type Orientation = "horizontal" | "vertical";

// Alignment options
export type Align = "start" | "center" | "end";

// Side for popovers, tooltips
export type Side = "top" | "right" | "bottom" | "left";

// Animation state
export type AnimationState =
  | "idle"
  | "entering"
  | "entered"
  | "exiting"
  | "exited";

// Slot configuration
export interface SlotConfig {
  name: string;
  fallback?: string;
}

// Focus options
export interface FocusConfig {
  trap?: boolean;
  returnFocus?: boolean;
  initialFocus?: string | HTMLElement;
}

// Keyboard navigation
export interface KeyboardConfig {
  escape?: boolean;
  tab?: boolean;
  arrow?: boolean;
  enter?: boolean;
  space?: boolean;
}

// Export component property interfaces
export { FormElementProperties } from "./form-element";
export { BaseElement } from "./base-element";

// Utility type for component variants from CVA
export type { VariantProps } from "class-variance-authority";
```

**Testing Checklist**:

- [ ] All types exported correctly
- [ ] No TypeScript errors
- [ ] Types are reusable across components

---

## Task 7: Create Animation Utilities

### File: `registry/lib/animations.ts`

**Purpose**: Tailwind-based animation utilities that respect
prefers-reduced-motion.

**Implementation Instructions**:

```typescript
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
  exitClasses = animations.fadeOut
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
```

**Testing Checklist**:

- [ ] Reduced motion check works
- [ ] Animation duration calculated correctly
- [ ] waitForAnimation resolves after animation
- [ ] Animation classes applied correctly
- [ ] No animations when reduced motion preferred

---

## Task 8: Update Utils File

### File: `registry/lib/utils.ts`

**Purpose**: Add additional utility functions needed by new patterns.

**Implementation Instructions**:

```typescript
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
      '[tabindex]:not([tabindex="-1"])'
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
  delay: number
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
  delay: number
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

export default {
  cn,
  uid,
  isFocusable,
  getFocusableElements,
  trapFocus,
  debounce,
  throttle,
};
```

**Testing Checklist**:

- [ ] cn() merges classes correctly
- [ ] uid() generates unique IDs
- [ ] Focus utilities work correctly
- [ ] trapFocus prevents focus escape
- [ ] debounce/throttle work as expected

---

## Validation Steps

After implementing all base infrastructure:

1. **Build Test**:

   ```bash
   bun run build
   ```

2. **Type Check**:

   ```bash
   bun tsc --noEmit
   ```

3. **Lint Check**:

   ```bash
   bun run lint
   ```

4. **Create Test Component**: Create a simple test component using the new base:

   ```typescript
   @customElement("test-component")
   export class TestComponent extends BaseElement {
     render() {
       return html`<div>Test</div>`;
     }
   }
   ```

5. **Test Form Component**: Create a test form component:
   ```typescript
   @customElement("test-input")
   export class TestInput extends FormElement {
     focus() {}
     blur() {}
   }
   ```

---

## Common Issues & Solutions

### Issue: TypeScript decorator errors

**Solution**: Ensure `experimentalDecorators: true` and
`useDefineForClassFields: false` in tsconfig.json

### Issue: Tailwind styles not applying

**Solution**: Ensure TW mixin is in the inheritance chain and Tailwind CSS is
built

### Issue: Events not crossing Shadow DOM

**Solution**: Always use `composed: true` in event creation

### Issue: Form submission not including component values

**Solution**: Check ElementInternals support and hidden input fallback

### Issue: Context not updating

**Solution**: Ensure `subscribe: true` in consume() call

---

## Dependencies to Install

```bash
# If not already installed
bun add @lit/context
```

---

## Next Steps

Once base infrastructure is complete:

1. Run validation steps
2. Create PR for review
3. After approval, begin component migration
4. Use component-specific implementation guides
