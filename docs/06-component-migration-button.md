# Button Component Migration Guide

## Component: ui-button

**Priority**: HIGH  
**Complexity**: LOW  
**Dependencies**: BaseElement, FormControlController

## Current Implementation Analysis

**File**: `registry/ui/button/button.ts`

**Current Issues**:

- Uses ElementInternals but doesn't extend FormElement
- Missing slot detection for prefix/suffix
- No animation support
- Limited accessibility attributes
- Events don't use typed emit helper

## Migration Instructions

### Step 1: Update Imports and Base Class

```typescript
// REMOVE these imports
import { html, LitElement, nothing, type PropertyValues } from "lit";
import { TW } from "@/lib/tailwindMixin";

// ADD these imports
import { html, css, type PropertyValues } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { cva, type VariantProps } from "class-variance-authority";
import { BaseElement } from "@/registry/lib/base-element";
import { FormControlController } from "@/controllers/form-control";
import { HasSlotController } from "@/controllers/has-slot";
import { cn } from "@/registry/lib/utils";
import { animations, waitForAnimation } from "@/registry/lib/animations";
```

### Step 2: Update Class Definition

```typescript
// Keep existing buttonVariants definition as-is

type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProperties {
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string | null;
  ariaDescribedby?: string | null;
  ariaLabelledby?: string | null;
}

/**
 * @element ui-button
 * @slot - Default content
 * @slot prefix - Content before the label
 * @slot suffix - Content after the label
 * @csspart base - The button element
 * @csspart prefix - The prefix container
 * @csspart content - The main content
 * @csspart suffix - The suffix container
 * @csspart loading - The loading spinner
 * @fires click - Standard click event
 * @fires button-click - Custom click event with detail
 */
@customElement("ui-button")
export class Button extends BaseElement implements ButtonProperties {
  // Static dependencies (if using icons)
  static dependencies = {
    // "ui-spinner": Spinner, // Add if you have a spinner component
  };

  // Controllers
  private readonly formController = new FormControlController(this);
  private readonly hasSlot = new HasSlotController(this, "prefix", "suffix");

  // Properties
  @property({ type: String, reflect: true })
  variant: ButtonVariants["variant"] = "default";
  @property({ type: String, reflect: true }) size: ButtonVariants["size"] =
    "default";
  @property({ type: String }) type: "button" | "submit" | "reset" = "button";
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) loading = false;

  // Accessibility properties
  @property({ type: String, attribute: "aria-label" }) ariaLabel:
    | string
    | null = null;
  @property({ type: String, attribute: "aria-describedby" }) ariaDescribedby:
    | string
    | null = null;
  @property({ type: String, attribute: "aria-labelledby" }) ariaLabelledby:
    | string
    | null = null;

  // Internal state
  @state() private isPressed = false;

  // Query for the button element
  @query("button") private button!: HTMLButtonElement;

  // Minimal styles for layout
  static styles = css`
    :host {
      display: inline-block;
    }
    :host([disabled]) {
      pointer-events: none;
    }
    /* Ensure slots are inline */
    ::slotted(*) {
      pointer-events: none;
    }
  `;

  render() {
    const hasPrefix = this.hasSlot.test("prefix");
    const hasSuffix = this.hasSlot.test("suffix") || this.loading;

    return html`
      <button
        part="base"
        type=${this.type}
        class=${cn(
          buttonVariants({ variant: this.variant, size: this.size }),
          this.loading && "relative",
          this.className // Forward host classes
        )}
        ?disabled=${this.disabled || this.loading}
        aria-label=${this.ariaLabel || null}
        aria-describedby=${this.ariaDescribedby || null}
        aria-labelledby=${this.ariaLabelledby || null}
        aria-disabled=${this.disabled || this.loading ? "true" : "false"}
        aria-busy=${this.loading ? "true" : "false"}
        aria-pressed=${this.isPressed ? "true" : "false"}
        @click=${this.handleClick}
        @mousedown=${this.handleMouseDown}
        @mouseup=${this.handleMouseUp}
        @mouseleave=${this.handleMouseLeave}
        @keydown=${this.handleKeyDown}
        @keyup=${this.handleKeyUp}
      >
        ${hasPrefix
          ? html`
              <span part="prefix" class="mr-2">
                <slot name="prefix"></slot>
              </span>
            `
          : null}

        <span part="content" class=${this.loading ? "opacity-0" : ""}>
          <slot></slot>
        </span>

        ${hasSuffix
          ? html`
              <span part="suffix" class="ml-2">
                ${this.loading
                  ? html`
                      <span
                        part="loading"
                        class=${cn(
                          "absolute inset-0 flex items-center justify-center",
                          animations.fadeIn
                        )}
                      >
                        <!-- Add spinner component or loading animation -->
                        <svg
                          class="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </span>
                    `
                  : html` <slot name="suffix"></slot> `}
              </span>
            `
          : null}
      </button>
    `;
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("disabled")) {
      this.setAttribute("aria-disabled", String(this.disabled));

      // Emit state change event
      this.emit("button-state-change", {
        disabled: this.disabled,
        loading: this.loading,
      });
    }

    if (changedProperties.has("loading")) {
      // Handle loading state animation
      if (this.loading) {
        this.emit("button-loading-start");
      } else {
        this.emit("button-loading-end");
      }
    }
  }

  private handleClick = async (e: Event) => {
    // Prevent click when disabled or loading
    if (this.disabled || this.loading) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Handle form submission
    if (this.type === "submit") {
      const form = this.closest("form");
      if (form) {
        e.preventDefault();
        // Validate form
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        // Submit form
        form.requestSubmit();
      }
    } else if (this.type === "reset") {
      const form = this.closest("form");
      if (form) {
        e.preventDefault();
        form.reset();
      }
    }

    // Emit custom event
    this.emit("button-click", {
      type: this.type,
      variant: this.variant,
    });

    // Add click animation
    this.animateClick();
  };

  private handleMouseDown = () => {
    if (!this.disabled && !this.loading) {
      this.isPressed = true;
    }
  };

  private handleMouseUp = () => {
    this.isPressed = false;
  };

  private handleMouseLeave = () => {
    this.isPressed = false;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      if (!this.disabled && !this.loading) {
        this.isPressed = true;
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      this.isPressed = false;
    }
  };

  private async animateClick() {
    // Add ripple effect or scale animation
    if (!this.button) return;

    this.button.style.transform = "scale(0.95)";
    await waitForAnimation(this.button);
    this.button.style.transform = "";
  }

  // Public API methods
  override focus(options?: FocusOptions) {
    this.button?.focus(options);
  }

  override blur() {
    this.button?.blur();
  }

  click() {
    this.button?.click();
  }

  /**
   * Set loading state programmatically
   */
  setLoading(loading: boolean) {
    this.loading = loading;
  }

  /**
   * Check if button can submit a form
   */
  get canSubmit(): boolean {
    return this.type === "submit" && !this.disabled && !this.loading;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-button": Button;
  }

  interface HTMLElementEventMap {
    "button-click": CustomEvent<{ type: string; variant: string }>;
    "button-state-change": CustomEvent<{ disabled: boolean; loading: boolean }>;
    "button-loading-start": CustomEvent;
    "button-loading-end": CustomEvent;
  }
}
```

### Step 3: Update Stories

```typescript
// button.stories.ts
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./button";
import type { ButtonProperties } from "./button";

const meta: Meta<ButtonProperties> = {
  title: "ui/Button",
  component: "ui-button",
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon-sm", "icon", "icon-lg"],
    },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
    },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<ButtonProperties>;

export const Default: Story = {
  args: {
    variant: "default",
    size: "default",
    type: "button",
  },
  render: (args) => html`
    <ui-button
      variant=${args.variant}
      size=${args.size}
      type=${args.type}
      ?disabled=${args.disabled}
      ?loading=${args.loading}
    >
      Button
    </ui-button>
  `,
};

export const WithSlots: Story = {
  render: () => html`
    <ui-button>
      <svg
        slot="prefix"
        class="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
      Button with Icon
      <svg
        slot="suffix"
        class="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7z" />
      </svg>
    </ui-button>
  `,
};

export const FormSubmission: Story = {
  render: () => html`
    <form
      @submit=${(e: Event) => {
        e.preventDefault();
        console.log("Form submitted");
      }}
    >
      <input type="text" required placeholder="Enter text" />
      <ui-button type="submit">Submit</ui-button>
      <ui-button type="reset" variant="outline">Reset</ui-button>
    </form>
  `,
};

export const LoadingStates: Story = {
  render: () => html`
    <div class="flex gap-4">
      <ui-button loading>Loading...</ui-button>
      <ui-button loading variant="secondary">Please wait</ui-button>
      <ui-button loading variant="outline">Processing</ui-button>
    </div>
  `,
};
```

## Migration Checklist

### Code Structure

- [ ] Extends BaseElement instead of TW(LitElement)
- [ ] Uses FormControlController for form integration
- [ ] Uses HasSlotController for slot detection
- [ ] Implements typed emit() for events
- [ ] Adds CSS part attributes for all elements
- [ ] Includes JSDoc comments with @element, @slot, @csspart, @fires

### Properties & Attributes

- [ ] All public properties use @property decorator
- [ ] Reflect properties that should be HTML attributes
- [ ] Internal state uses @state decorator
- [ ] aria-\* attributes properly bound
- [ ] Loading state property added

### Accessibility

- [ ] aria-disabled reflects disabled state
- [ ] aria-busy reflects loading state
- [ ] aria-pressed for button state
- [ ] aria-label, aria-describedby, aria-labelledby support
- [ ] Keyboard event handlers (Enter, Space)
- [ ] Focus visible styles work

### Form Integration

- [ ] Submit button triggers form submission
- [ ] Reset button triggers form reset
- [ ] Form validation checked before submit
- [ ] Works inside <form> elements

### Events

- [ ] All custom events use composed: true
- [ ] Standard click event still works
- [ ] Custom button-click event emitted
- [ ] State change events emitted
- [ ] Event types added to global declarations

### Styling

- [ ] Tailwind classes applied correctly
- [ ] Host classes forwarded via className
- [ ] Dark mode styles work
- [ ] Loading state styles applied
- [ ] Animation classes from animations utility

### Slots

- [ ] Default slot for content
- [ ] prefix slot for icons/content before
- [ ] suffix slot for icons/content after
- [ ] Slots conditionally rendered based on content

### Testing

- [ ] Component renders without errors
- [ ] All variants render correctly
- [ ] Form submission works
- [ ] Loading state displays correctly
- [ ] Slots render when content provided
- [ ] Keyboard navigation works
- [ ] Events fire correctly
- [ ] TypeScript types correct

## Validation Tests

```typescript
// Test basic rendering
const button = document.createElement("ui-button");
button.variant = "primary";
button.textContent = "Click me";
document.body.appendChild(button);

// Test form submission
const form = document.createElement("form");
const submitBtn = document.createElement("ui-button");
submitBtn.type = "submit";
form.appendChild(submitBtn);
form.addEventListener("submit", (e) => {
  console.log("Form submitted!");
  e.preventDefault();
});

// Test slots
const btnWithSlots = document.createElement("ui-button");
const prefix = document.createElement("span");
prefix.slot = "prefix";
prefix.textContent = "→";
btnWithSlots.appendChild(prefix);

// Test events
button.addEventListener("button-click", (e) => {
  console.log("Button clicked:", e.detail);
});

// Test loading state
button.loading = true;
console.assert(button.getAttribute("aria-busy") === "true");

// Test disabled state
button.disabled = true;
console.assert(button.getAttribute("aria-disabled") === "true");
```

## Common Issues & Fixes

### Issue: Form submission not working

**Fix**: Ensure FormControlController is initialized and type="submit" is set

### Issue: Slots not detecting content

**Fix**: Check HasSlotController is initialized with correct slot names

### Issue: Events not bubbling out of Shadow DOM

**Fix**: Ensure all custom events use composed: true

### Issue: Loading spinner not showing

**Fix**: Check loading state styles and conditional rendering

### Issue: Keyboard events not working

**Fix**: Add keydown/keyup handlers for Space and Enter keys

## Notes for Agent

- The button component is foundational and used everywhere
- Must maintain backward compatibility with existing variant/size props
- Form integration is critical for submit/reset functionality
- Loading state should disable interaction but show loading indicator
- Accessibility is crucial - this is one of the most used components
- Test thoroughly with forms, keyboard navigation, and screen readers

## References

- [BaseElement implementation](./05-base-infrastructure-implementation.md#task-1-create-baseelement-class)
- [FormControlController](./05-base-infrastructure-implementation.md#task-4-create-formcontrolcontroller)
- [HasSlotController](./05-base-infrastructure-implementation.md#task-3-create-hasslotcontroller)
- [MDN Button element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button)
- [ARIA button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
