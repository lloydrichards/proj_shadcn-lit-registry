# Component Pattern Specification

## Executive Summary

This document defines the optimal component patterns for the shadcn-lit
registry, based on extensive research comparing Shoelace's production-grade
patterns with the current implementation, while maintaining the registry's
unique value proposition: **Tailwind CSS styling for web components that mirrors
shadcn/ui**.

### Core Philosophy

- **HTML-first**: Prioritize semantic HTML and native elements
- **Tailwind-powered**: Use utility classes as the primary styling mechanism
- **Composable**: Build complex UIs from simple, focused components
- **Accessible**: WCAG AA+ compliant by default
- **Customizable**: Support multiple customization approaches (Tailwind classes,
  CSS parts, CSS custom properties)

## 1. Base Component Architecture

### 1.1 Base Class Pattern

All components should extend from a common base class that provides essential
functionality:

```typescript
// registry/lib/base-element.ts
import { LitElement, type PropertyValues } from "lit";
import { TW } from "./tailwindMixin";

/**
 * Base class for all registry components
 * Provides common functionality like typed events and Tailwind integration
 */
export class BaseElement extends TW(LitElement) {
  /**
   * Emit a strongly-typed custom event
   * All events are bubbled and composed by default to cross shadow DOM boundaries
   */
  protected emit<T = Record<string, unknown>>(
    name: string,
    detail?: T,
    options?: Omit<CustomEventInit<T>, "detail" | "bubbles" | "composed">
  ): boolean {
    const event = new CustomEvent(name, {
      bubbles: true,
      composed: true,
      cancelable: options?.cancelable ?? false,
      detail,
      ...options,
    });
    return this.dispatchEvent(event);
  }

  /**
   * Register component dependencies automatically
   * Ensures child components are defined before use
   */
  static dependencies?: Record<string, typeof BaseElement>;

  override connectedCallback() {
    super.connectedCallback();

    // Auto-register dependencies
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
```

### 1.2 Component Template

```typescript
import { html, css, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { cva, type VariantProps } from "class-variance-authority";
import { BaseElement } from "@/registry/lib/base-element";
import { cn } from "@/registry/lib/utils";

// Define variants using CVA
const componentVariants = cva(
  "base-styles", // Base classes always applied
  {
    variants: {
      variant: {
        default: "...",
        secondary: "...",
      },
      size: {
        sm: "...",
        md: "...",
        lg: "...",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// Export types for TypeScript consumers
export interface ComponentProperties {
  variant?: VariantProps<typeof componentVariants>["variant"];
  size?: VariantProps<typeof componentVariants>["size"];
  disabled?: boolean;
}

/**
 * @element ui-component
 * @slot - Default slot for content
 * @slot prefix - Content to display before main content
 * @slot suffix - Content to display after main content
 * @csspart base - The component's base wrapper
 * @csspart prefix - The prefix container
 * @csspart suffix - The suffix container
 * @fires component-change - Fired when component state changes
 */
@customElement("ui-component")
export class Component extends BaseElement implements ComponentProperties {
  // Static dependencies ensure child components are registered
  static dependencies = {
    "ui-icon": Icon,
  };

  // Public reactive properties (reflect for HTML attribute binding)
  @property({ type: String, reflect: true })
  variant: ComponentProperties["variant"] = "default";

  @property({ type: String, reflect: true })
  size: ComponentProperties["size"] = "md";

  @property({ type: Boolean, reflect: true })
  disabled = false;

  // Internal state (not reflected to attributes)
  @state() private _internalState = "";

  // Minimal styles for layout, most styling via Tailwind
  static styles = css`
    :host {
      display: inline-block;
    }
    :host([disabled]) {
      pointer-events: none;
    }
  `;

  render() {
    return html`
      <div
        part="base"
        class=${cn(
          componentVariants({ variant: this.variant, size: this.size }),
          this.disabled && "opacity-50 cursor-not-allowed",
          this.className // Forward host classes
        )}
        aria-disabled=${this.disabled ? "true" : "false"}
      >
        <slot name="prefix" part="prefix"></slot>
        <slot part="content"></slot>
        <slot name="suffix" part="suffix"></slot>
      </div>
    `;
  }

  // Lifecycle and event handlers
  protected override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("disabled")) {
      this.emit("component-change", { disabled: this.disabled });
    }
  }
}

// Global type augmentation for TypeScript
declare global {
  interface HTMLElementTagNameMap {
    "ui-component": Component;
  }

  interface HTMLElementEventMap {
    "component-change": CustomEvent<{ disabled: boolean }>;
  }
}
```

## 2. Reactive Controllers

Use reactive controllers for reusable, composable functionality:

### 2.1 HasSlotController

Detect when slots have content to conditionally render containers:

```typescript
// registry/lib/controllers/has-slot.ts
import { ReactiveController, ReactiveControllerHost } from "lit";

export class HasSlotController implements ReactiveController {
  private host: ReactiveControllerHost & Element;
  private slotNames: string[] = [];

  constructor(host: ReactiveControllerHost & Element, ...slotNames: string[]) {
    (this.host = host).addController(this);
    this.slotNames = slotNames;
  }

  test(slotName: string): boolean {
    if (slotName === "[default]") {
      return this.hasDefaultSlot();
    }
    return this.host.querySelector(`[slot="${slotName}"]`) !== null;
  }

  private hasDefaultSlot(): boolean {
    return [...this.host.childNodes].some((node) => {
      if (node.nodeType === node.TEXT_NODE && node.textContent!.trim() !== "") {
        return true;
      }
      if (node.nodeType === node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (!el.hasAttribute("slot")) return true;
      }
      return false;
    });
  }

  hostConnected() {
    this.host.addEventListener("slotchange", this.handleSlotChange);
  }

  hostDisconnected() {
    this.host.removeEventListener("slotchange", this.handleSlotChange);
  }

  private handleSlotChange = () => {
    this.host.requestUpdate();
  };
}
```

### 2.2 FormControlController

Enable form participation for custom inputs:

```typescript
// registry/lib/controllers/form-control.ts
import { ReactiveController, ReactiveControllerHost } from "lit";

interface FormControlHost extends ReactiveControllerHost, HTMLElement {
  name?: string;
  value?: unknown;
  disabled?: boolean;
  required?: boolean;
  checkValidity?(): boolean;
  reportValidity?(): boolean;
  setCustomValidity?(message: string): void;
}

export class FormControlController implements ReactiveController {
  private host: FormControlHost;
  private form?: HTMLFormElement | null;
  private validationMessage = "";

  constructor(host: FormControlHost) {
    (this.host = host).addController(this);
  }

  hostConnected() {
    this.form = this.findForm();
    this.attachToForm();
  }

  hostDisconnected() {
    this.detachFromForm();
  }

  private findForm(): HTMLFormElement | null {
    return this.host.closest("form");
  }

  private attachToForm() {
    if (this.form) {
      this.form.addEventListener("submit", this.handleSubmit);
      this.form.addEventListener("reset", this.handleReset);
    }
  }

  private detachFromForm() {
    if (this.form) {
      this.form.removeEventListener("submit", this.handleSubmit);
      this.form.removeEventListener("reset", this.handleReset);
    }
  }

  private handleSubmit = (event: Event) => {
    if (!this.checkValidity()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  private handleReset = () => {
    // Reset to default value
    this.host.value = undefined;
    this.host.requestUpdate();
  };

  checkValidity(): boolean {
    const isValid =
      this.host.disabled || !this.host.required || !!this.host.value;
    if (!isValid) {
      this.validationMessage = "This field is required";
    } else {
      this.validationMessage = "";
    }
    return isValid;
  }

  reportValidity(): boolean {
    const isValid = this.checkValidity();
    if (!isValid && this.validationMessage) {
      // Could show a tooltip or other UI here
      this.host.emit("invalid", { message: this.validationMessage });
    }
    return isValid;
  }

  setCustomValidity(message: string) {
    this.validationMessage = message;
  }

  get validity() {
    return {
      valid: this.checkValidity(),
      customError: !!this.validationMessage,
    };
  }
}
```

## 3. Component Categories

### 3.1 Simple Components (Button, Badge, Avatar)

Focus on styling and basic interactivity:

```typescript
@customElement("ui-button")
export class Button extends BaseElement {
  private readonly formController = new FormControlController(this);

  @property({ type: String }) type: "button" | "submit" | "reset" = "button";

  private handleClick = (e: Event) => {
    if (this.type === "submit") {
      this.formController.submit();
    }
  };
}
```

### 3.2 Form Components (Input, Select, Checkbox)

Full form integration with validation:

```typescript
@customElement("ui-input")
export class Input extends BaseElement {
  static formAssociated = true;
  private readonly formController = new FormControlController(this);

  @property() name = "";
  @property() value = "";
  @property({ type: Boolean }) required = false;

  checkValidity() {
    return this.formController.checkValidity();
  }
}
```

### 3.3 Composite Components (Card, Dialog, Accordion)

Multiple sub-components working together:

```typescript
@customElement("ui-dialog")
export class Dialog extends BaseElement {
  static dependencies = {
    "ui-dialog-content": DialogContent,
    "ui-dialog-header": DialogHeader,
    "ui-dialog-footer": DialogFooter,
  };

  @property({ type: Boolean, reflect: true }) open = false;

  // Manage state for child components
}
```

## 4. Styling Strategy

### 4.1 Primary: Tailwind Utilities

```typescript
render() {
  return html`
    <div class=${cn(
      "bg-card text-card-foreground rounded-lg border",
      this.className
    )}>
      <slot></slot>
    </div>
  `;
}
```

### 4.2 Secondary: CSS Parts

```typescript
render() {
  return html`
    <div part="base" class="...">
      <header part="header">...</header>
      <div part="content">...</div>
    </div>
  `;
}
```

Users can then customize:

```css
ui-card::part(base) {
  border-radius: 0;
}
```

### 4.3 Tertiary: CSS Custom Properties

For theme-level tokens:

```css
:host {
  --ui-card-padding: var(--spacing-4, 1rem);
  --ui-card-radius: var(--radius-lg, 0.5rem);
}
```

## 5. Accessibility Requirements

### 5.1 ARIA Attributes

- Always use semantic HTML first
- Add ARIA only when necessary
- Ensure all interactive elements are keyboard accessible

### 5.2 Focus Management

```typescript
@customElement("ui-dialog")
export class Dialog extends BaseElement {
  private previousFocus?: HTMLElement;

  private handleOpen() {
    this.previousFocus = document.activeElement as HTMLElement;
    // Find and focus first focusable element
    const firstFocusable = this.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }

  private handleClose() {
    this.previousFocus?.focus();
  }
}
```

### 5.3 Keyboard Navigation

```typescript
private handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case "Escape":
      if (this.closeOnEscape) {
        this.close();
      }
      break;
    case "Tab":
      this.handleTabKey(e);
      break;
  }
};
```

## 6. Event Patterns

### 6.1 Custom Events

All custom events must:

- Use `bubbles: true` and `composed: true`
- Have typed detail objects
- Follow naming convention: `component-action`

```typescript
// Good
this.emit("dialog-close", { reason: "escape" });

// Also good - for standard events
this.emit("change", { value: this.value });
```

### 6.2 Event Documentation

```typescript
/**
 * @fires dialog-close - Fired when dialog closes. Detail: {reason: string}
 * @fires dialog-open - Fired when dialog opens
 */
```

## 7. Testing Requirements

Each component should have:

- Unit tests for logic
- Visual tests via Storybook
- Accessibility tests
- Form integration tests (for form components)

## 8. Documentation Standards

Each component must include:

- TypeScript interfaces for all properties
- JSDoc comments with @element, @slot, @csspart, @fires
- Storybook stories showing all variants
- README with usage examples

## Next Steps

1. Create base infrastructure (BaseElement, controllers)
2. Refactor existing components to follow patterns
3. Add missing accessibility features
4. Implement form control support
5. Add comprehensive testing
