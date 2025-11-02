# Composite Component Patterns

## Overview

Composite components consist of multiple sub-components that work together to
create complex UI patterns. Examples include dialogs, accordions, tabs, and
cards. This document outlines patterns for building these multi-part components
while maintaining flexibility and composability.

## Design Principles

1. **Component Coordination** - Parent manages state, children are
   presentational
2. **Flexible Composition** - Allow users to omit optional parts
3. **Context Sharing** - Use events or context API for child-parent
   communication
4. **Progressive Enhancement** - Components should work without JavaScript where
   possible

## Context Management Pattern

For complex components where children need access to parent state:

```typescript
// registry/lib/context.ts
import { createContext, provide, consume } from "@lit/context";

export interface ComponentContext<T> {
  context: Context<unknown, T>;
  provide(host: ReactiveElement, value: T): void;
  consume(host: ReactiveElement): T | undefined;
}

export function createComponentContext<T>(name: string): ComponentContext<T> {
  const context = createContext<T>(Symbol(name));

  return {
    context,
    provide(host: ReactiveElement, value: T) {
      provide({ context, host, value });
    },
    consume(host: ReactiveElement): T | undefined {
      return consume({ context, host, subscribe: true });
    },
  };
}
```

## Dialog Component Pattern

A complete dialog implementation with portal rendering and focus management:

```typescript
// registry/ui/dialog/dialog-context.ts
export interface DialogContext {
  open: boolean;
  modal: boolean;
  setOpen: (open: boolean) => void;
}

export const dialogContext = createComponentContext<DialogContext>("dialog");

// registry/ui/dialog/dialog.ts
import { html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BaseElement } from "@/registry/lib/base-element";
import { dialogContext } from "./dialog-context";

/**
 * @element ui-dialog
 * @slot trigger - The dialog trigger
 * @slot - The dialog content
 * @fires dialog-open - When dialog opens
 * @fires dialog-close - When dialog closes
 */
@customElement("ui-dialog")
export class Dialog extends BaseElement {
  static dependencies = {
    "ui-dialog-trigger": DialogTrigger,
    "ui-dialog-content": DialogContent,
    "ui-dialog-header": DialogHeader,
    "ui-dialog-footer": DialogFooter,
    "ui-dialog-title": DialogTitle,
    "ui-dialog-description": DialogDescription,
  };

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) modal = true;

  static styles = css`
    :host {
      display: contents;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();

    // Provide context to children
    dialogContext.provide(this, {
      open: this.open,
      modal: this.modal,
      setOpen: (open: boolean) => this.setOpen(open),
    });
  }

  override updated(changedProperties: Map<PropertyKey, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("open")) {
      // Update context
      dialogContext.provide(this, {
        open: this.open,
        modal: this.modal,
        setOpen: (open: boolean) => this.setOpen(open),
      });

      // Emit events
      this.emit(this.open ? "dialog-open" : "dialog-close");
    }
  }

  private setOpen(open: boolean) {
    this.open = open;
  }

  render() {
    return html`<slot></slot>`;
  }
}

// registry/ui/dialog/dialog-trigger.ts
@customElement("ui-dialog-trigger")
export class DialogTrigger extends BaseElement {
  private context?: DialogContext;

  override connectedCallback() {
    super.connectedCallback();
    this.context = dialogContext.consume(this);
  }

  render() {
    return html`
      <button
        part="trigger"
        @click=${this.handleClick}
        aria-haspopup="dialog"
        aria-expanded=${this.context?.open ? "true" : "false"}
        class=${cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          this.className
        )}
      >
        <slot></slot>
      </button>
    `;
  }

  private handleClick = () => {
    this.context?.setOpen(!this.context.open);
  };
}

// registry/ui/dialog/dialog-content.ts
@customElement("ui-dialog-content")
export class DialogContent extends BaseElement {
  private context?: DialogContext;
  private dialog?: HTMLDialogElement;
  private previousFocus?: HTMLElement;

  @property({ type: Boolean }) closeOnEscape = true;
  @property({ type: Boolean }) closeOnBackdrop = true;

  @state() private isAnimating = false;

  override connectedCallback() {
    super.connectedCallback();
    this.context = dialogContext.consume(this);
  }

  override updated(changedProperties: Map<PropertyKey, unknown>) {
    super.updated(changedProperties);

    // React to context changes
    if (this.context?.open && !this.dialog?.open) {
      this.showDialog();
    } else if (!this.context?.open && this.dialog?.open) {
      this.hideDialog();
    }
  }

  render() {
    if (!this.context?.open && !this.isAnimating) {
      return null;
    }

    return html`
      <dialog
        part="dialog"
        @cancel=${this.handleCancel}
        @click=${this.handleBackdropClick}
        class=${cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg",
          "translate-x-[-50%] translate-y-[-50%]",
          "gap-4 border bg-background p-6 shadow-lg",
          "duration-200 sm:rounded-lg",
          this.context?.open
            ? "animate-in fade-in-0 zoom-in-95"
            : "animate-out fade-out-0 zoom-out-95",
          this.className
        )}
      >
        <slot></slot>
        <button
          part="close"
          @click=${this.close}
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <ui-icon name="x" class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </button>
      </dialog>
    `;
  }

  private showDialog() {
    this.isAnimating = true;
    this.previousFocus = document.activeElement as HTMLElement;

    requestAnimationFrame(() => {
      if (!this.dialog) {
        this.dialog = this.renderRoot.querySelector("dialog");
      }

      if (this.dialog) {
        if (this.context?.modal) {
          this.dialog.showModal();
        } else {
          this.dialog.show();
        }

        this.focusFirstElement();

        // End animation
        setTimeout(() => {
          this.isAnimating = false;
        }, 200);
      }
    });
  }

  private hideDialog() {
    this.isAnimating = true;

    setTimeout(() => {
      this.dialog?.close();
      this.previousFocus?.focus();
      this.isAnimating = false;
    }, 200);
  }

  private focusFirstElement() {
    const focusable = this.dialog?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  }

  private handleCancel = (e: Event) => {
    if (this.closeOnEscape) {
      e.preventDefault();
      this.close();
    }
  };

  private handleBackdropClick = (e: MouseEvent) => {
    if (this.closeOnBackdrop && e.target === this.dialog) {
      this.close();
    }
  };

  private close() {
    this.context?.setOpen(false);
  }
}
```

## Accordion Component Pattern

Accordions with single/multiple expansion modes:

```typescript
// registry/ui/accordion/accordion.ts
interface AccordionContext {
  type: "single" | "multiple";
  value: string | string[];
  toggle: (itemValue: string) => void;
}

const accordionContext = createComponentContext<AccordionContext>("accordion");

@customElement("ui-accordion")
export class Accordion extends BaseElement {
  static dependencies = {
    "ui-accordion-item": AccordionItem,
    "ui-accordion-trigger": AccordionTrigger,
    "ui-accordion-content": AccordionContent,
  };

  @property({ type: String }) type: "single" | "multiple" = "single";
  @property() value: string | string[] = this.type === "single" ? "" : [];

  override connectedCallback() {
    super.connectedCallback();
    this.updateContext();
  }

  override updated(changedProperties: Map<PropertyKey, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has("value") || changedProperties.has("type")) {
      this.updateContext();
    }
  }

  private updateContext() {
    accordionContext.provide(this, {
      type: this.type,
      value: this.value,
      toggle: (itemValue: string) => this.toggle(itemValue),
    });
  }

  private toggle(itemValue: string) {
    if (this.type === "single") {
      this.value = this.value === itemValue ? "" : itemValue;
    } else {
      const values = Array.isArray(this.value) ? this.value : [];
      const index = values.indexOf(itemValue);
      if (index > -1) {
        this.value = values.filter((v) => v !== itemValue);
      } else {
        this.value = [...values, itemValue];
      }
    }

    this.emit("change", { value: this.value });
  }

  render() {
    return html`
      <div
        part="base"
        role="region"
        class=${cn("divide-y divide-border", this.className)}
      >
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-accordion-item")
export class AccordionItem extends BaseElement {
  @property({ type: String }) value = "";

  @state() private isOpen = false;
  private context?: AccordionContext;

  override connectedCallback() {
    super.connectedCallback();
    this.context = accordionContext.consume(this);
  }

  override updated() {
    // Update open state based on context
    if (this.context) {
      const { type, value } = this.context;
      if (type === "single") {
        this.isOpen = value === this.value;
      } else {
        this.isOpen = (value as string[]).includes(this.value);
      }
    }
  }

  render() {
    return html`
      <div
        part="item"
        data-state=${this.isOpen ? "open" : "closed"}
        class="border-b"
      >
        <slot></slot>
      </div>
    `;
  }

  toggle() {
    this.context?.toggle(this.value);
  }
}

@customElement("ui-accordion-trigger")
export class AccordionTrigger extends BaseElement {
  private item?: AccordionItem;

  override connectedCallback() {
    super.connectedCallback();
    this.item = this.closest("ui-accordion-item") as AccordionItem;
  }

  render() {
    const isOpen = this.item?.isOpen ?? false;

    return html`
      <h3 part="heading" class="flex">
        <button
          part="trigger"
          type="button"
          @click=${this.handleClick}
          aria-expanded=${isOpen ? "true" : "false"}
          class=${cn(
            "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all",
            "hover:underline",
            this.className
          )}
        >
          <slot></slot>
          <ui-icon
            name="chevron-down"
            class=${cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </h3>
    `;
  }

  private handleClick = () => {
    this.item?.toggle();
  };
}

@customElement("ui-accordion-content")
export class AccordionContent extends BaseElement {
  private item?: AccordionItem;

  @state() private isOpen = false;

  override connectedCallback() {
    super.connectedCallback();
    this.item = this.closest("ui-accordion-item") as AccordionItem;
  }

  override updated() {
    this.isOpen = this.item?.isOpen ?? false;
  }

  static styles = css`
    :host {
      display: block;
      overflow: hidden;
    }
    [part="content"] {
      transition: all 200ms ease-out;
    }
    [part="content"][data-state="closed"] {
      animation: accordion-up 200ms ease-out;
      height: 0;
    }
    [part="content"][data-state="open"] {
      animation: accordion-down 200ms ease-out;
    }
    @keyframes accordion-down {
      from {
        height: 0;
      }
      to {
        height: var(--height);
      }
    }
    @keyframes accordion-up {
      from {
        height: var(--height);
      }
      to {
        height: 0;
      }
    }
  `;

  render() {
    return html`
      <div
        part="content"
        role="region"
        data-state=${this.isOpen ? "open" : "closed"}
        class=${cn(
          "pb-4 pt-0 text-sm",
          !this.isOpen && "hidden",
          this.className
        )}
        style="--height: ${this.scrollHeight}px"
      >
        <slot></slot>
      </div>
    `;
  }
}
```

## Tabs Component Pattern

```typescript
// registry/ui/tabs/tabs.ts
interface TabsContext {
  value: string;
  orientation: "horizontal" | "vertical";
  activate: (value: string) => void;
}

const tabsContext = createComponentContext<TabsContext>("tabs");

@customElement("ui-tabs")
export class Tabs extends BaseElement {
  static dependencies = {
    "ui-tabs-list": TabsList,
    "ui-tabs-trigger": TabsTrigger,
    "ui-tabs-content": TabsContent,
  };

  @property({ type: String }) value = "";
  @property({ type: String }) orientation: "horizontal" | "vertical" =
    "horizontal";

  override connectedCallback() {
    super.connectedCallback();

    // Auto-select first tab if none selected
    if (!this.value) {
      requestAnimationFrame(() => {
        const firstTrigger = this.querySelector("ui-tabs-trigger");
        if (firstTrigger) {
          this.value = firstTrigger.getAttribute("value") || "";
        }
      });
    }

    this.updateContext();
  }

  override updated(changedProperties: Map<PropertyKey, unknown>) {
    super.updated(changedProperties);
    if (
      changedProperties.has("value") ||
      changedProperties.has("orientation")
    ) {
      this.updateContext();
    }
  }

  private updateContext() {
    tabsContext.provide(this, {
      value: this.value,
      orientation: this.orientation,
      activate: (value: string) => this.activate(value),
    });
  }

  private activate(value: string) {
    if (this.value !== value) {
      this.value = value;
      this.emit("change", { value });
    }
  }

  render() {
    return html`
      <div
        part="base"
        data-orientation=${this.orientation}
        class=${cn(
          "w-full",
          this.orientation === "vertical" && "flex gap-4",
          this.className
        )}
      >
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-tabs-list")
export class TabsList extends BaseElement {
  private context?: TabsContext;

  override connectedCallback() {
    super.connectedCallback();
    this.context = tabsContext.consume(this);
  }

  render() {
    const isVertical = this.context?.orientation === "vertical";

    return html`
      <div
        part="list"
        role="tablist"
        aria-orientation=${this.context?.orientation}
        class=${cn(
          "inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
          isVertical ? "flex-col h-auto" : "h-9",
          this.className
        )}
        @keydown=${this.handleKeyDown}
      >
        <slot></slot>
      </div>
    `;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const triggers = Array.from(this.querySelectorAll("ui-tabs-trigger"));
    const currentIndex = triggers.findIndex(
      (t) => t.getAttribute("value") === this.context?.value
    );

    let nextIndex = -1;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        nextIndex = (currentIndex + 1) % triggers.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        nextIndex = currentIndex <= 0 ? triggers.length - 1 : currentIndex - 1;
        break;
      case "Home":
        e.preventDefault();
        nextIndex = 0;
        break;
      case "End":
        e.preventDefault();
        nextIndex = triggers.length - 1;
        break;
    }

    if (nextIndex >= 0) {
      const value = triggers[nextIndex].getAttribute("value");
      if (value) {
        this.context?.activate(value);
        (triggers[nextIndex] as HTMLElement).focus();
      }
    }
  };
}

@customElement("ui-tabs-trigger")
export class TabsTrigger extends BaseElement {
  @property({ type: String }) value = "";

  private context?: TabsContext;

  @state() private isActive = false;

  override connectedCallback() {
    super.connectedCallback();
    this.context = tabsContext.consume(this);
  }

  override updated() {
    this.isActive = this.context?.value === this.value;
  }

  render() {
    return html`
      <button
        part="trigger"
        type="button"
        role="tab"
        tabindex=${this.isActive ? "0" : "-1"}
        aria-selected=${this.isActive ? "true" : "false"}
        aria-controls=${`panel-${this.value}`}
        @click=${this.handleClick}
        class=${cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1",
          "text-sm font-medium ring-offset-background transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          this.isActive && "bg-background text-foreground shadow",
          this.className
        )}
      >
        <slot></slot>
      </button>
    `;
  }

  private handleClick = () => {
    this.context?.activate(this.value);
  };
}

@customElement("ui-tabs-content")
export class TabsContent extends BaseElement {
  @property({ type: String }) value = "";

  private context?: TabsContext;

  @state() private isActive = false;

  override connectedCallback() {
    super.connectedCallback();
    this.context = tabsContext.consume(this);
  }

  override updated() {
    this.isActive = this.context?.value === this.value;
  }

  render() {
    if (!this.isActive) {
      return null;
    }

    return html`
      <div
        part="content"
        role="tabpanel"
        id=${`panel-${this.value}`}
        tabindex="0"
        class=${cn(
          "mt-2 ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          this.className
        )}
      >
        <slot></slot>
      </div>
    `;
  }
}
```

## Card Component Pattern (Simple Composite)

```typescript
// registry/ui/card/card.ts
@customElement("ui-card")
export class Card extends BaseElement {
  static dependencies = {
    "ui-card-header": CardHeader,
    "ui-card-title": CardTitle,
    "ui-card-description": CardDescription,
    "ui-card-content": CardContent,
    "ui-card-footer": CardFooter,
  };

  render() {
    return html`
      <article
        part="base"
        class=${cn(
          "rounded-xl border bg-card text-card-foreground shadow",
          this.className
        )}
      >
        <slot></slot>
      </article>
    `;
  }
}

@customElement("ui-card-header")
export class CardHeader extends BaseElement {
  render() {
    return html`
      <header
        part="header"
        class=${cn("flex flex-col space-y-1.5 p-6", this.className)}
      >
        <slot></slot>
      </header>
    `;
  }
}

@customElement("ui-card-title")
export class CardTitle extends BaseElement {
  @property({ type: String }) as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" =
    "h3";

  render() {
    const Tag = this.as;
    return html`
      <${Tag}
        part="title"
        class=${cn("font-semibold leading-none tracking-tight", this.className)}
      >
        <slot></slot>
      </${Tag}>
    `;
  }
}

@customElement("ui-card-description")
export class CardDescription extends BaseElement {
  render() {
    return html`
      <p
        part="description"
        class=${cn("text-sm text-muted-foreground", this.className)}
      >
        <slot></slot>
      </p>
    `;
  }
}

@customElement("ui-card-content")
export class CardContent extends BaseElement {
  render() {
    return html`
      <div part="content" class=${cn("p-6 pt-0", this.className)}>
        <slot></slot>
      </div>
    `;
  }
}

@customElement("ui-card-footer")
export class CardFooter extends BaseElement {
  render() {
    return html`
      <footer
        part="footer"
        class=${cn("flex items-center p-6 pt-0", this.className)}
      >
        <slot></slot>
      </footer>
    `;
  }
}
```

## Best Practices

1. **Use Context for Complex State** - When multiple children need parent state
2. **Keep Sub-components Simple** - They should primarily handle presentation
3. **Document Component Structure** - Make it clear which sub-components are
   required
4. **Support Flexible Composition** - Allow omitting optional parts
5. **Manage Focus Properly** - Especially for modals and overlays
6. **Handle Keyboard Navigation** - Arrow keys, Tab, Escape, etc.
7. **Animate Thoughtfully** - Respect prefers-reduced-motion
8. **Test Component Combinations** - Ensure all valid compositions work
