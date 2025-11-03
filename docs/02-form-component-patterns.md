# Form Component Patterns

## Overview

Form components are the most complex category in the registry, requiring proper
integration with native HTML forms, validation, and accessibility. This document
provides patterns for building form components that work seamlessly with
standard HTML forms while maintaining the Tailwind-first styling approach.

## Core Requirements

All form components must:

1. Work with native HTML `<form>` elements
2. Support form submission and reset
3. Provide validation APIs
4. Be fully accessible
5. Support both controlled and uncontrolled usage

## Base Form Component Pattern

```typescript
// registry/lib/form-element.ts
import { property } from "lit/decorators.js";
import { BaseElement } from "./base-element";
import { FormControlController } from "./controllers/form-control";

export interface FormElementProperties {
  name?: string;
  value?: unknown;
  defaultValue?: unknown;
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  form?: string;
}

/**
 * Base class for form-participating components
 */
export abstract class FormElement
  extends BaseElement
  implements FormElementProperties
{
  // Enable ElementInternals for form association (where supported)
  static formAssociated = true;

  protected formController = new FormControlController(this);
  protected internals?: ElementInternals;

  // Form properties
  @property({ type: String }) name = "";
  @property() value: unknown = "";
  @property() defaultValue: unknown = "";
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property({ type: String }) form = "";

  constructor() {
    super();
    // Use ElementInternals where available for native form participation
    if ("attachInternals" in this) {
      this.internals = this.attachInternals();
    }
  }

  // Form API methods
  checkValidity(): boolean {
    return this.formController.checkValidity();
  }

  reportValidity(): boolean {
    return this.formController.reportValidity();
  }

  setCustomValidity(message: string): void {
    this.formController.setCustomValidity(message);
    this.internals?.setValidity({ customError: !!message }, message);
  }

  // Reset to default value
  reset(): void {
    this.value = this.defaultValue;
    this.requestUpdate();
  }

  // Get associated form
  get formElement(): HTMLFormElement | null {
    if (this.form) {
      return document.getElementById(this.form) as HTMLFormElement;
    }
    return this.closest("form");
  }
}
```

## Input Component Pattern

```typescript
// registry/ui/input/input.ts
import { html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";
import { cva } from "class-variance-authority";
import { FormElement } from "@/registry/lib/form-element";
import { cn } from "@/registry/lib/utils";

const inputVariants = cva(
  "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input",
        error: "border-destructive focus-visible:ring-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface InputProperties extends FormElementProperties {
  type?: HTMLInputElement["type"];
  placeholder?: string;
  pattern?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  autocomplete?: string;
  autofocus?: boolean;
}

/**
 * @element ui-input
 * @slot prefix - Content before the input
 * @slot suffix - Content after the input
 * @csspart base - The wrapper container
 * @csspart input - The native input element
 * @csspart prefix - The prefix container
 * @csspart suffix - The suffix container
 * @fires change - Standard change event
 * @fires input - Standard input event
 */
@customElement("ui-input")
export class Input extends FormElement implements InputProperties {
  @property({ type: String }) type: HTMLInputElement["type"] = "text";
  @property({ type: String }) placeholder = "";
  @property({ type: String }) pattern = "";
  @property() min?: string | number;
  @property() max?: string | number;
  @property() step?: string | number;
  @property({ type: String }) autocomplete = "";
  @property({ type: Boolean }) autofocus = false;

  @query("input") private input!: HTMLInputElement;

  static styles = css`
    :host {
      display: block;
    }
    :host([disabled]) {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  render() {
    const hasError = !this.checkValidity();

    return html`
      <div part="base" class="relative flex items-center">
        <div part="prefix" class="absolute left-3">
          <slot name="prefix"></slot>
        </div>
        <input
          part="input"
          type=${this.type}
          class=${cn(
            inputVariants({ variant: hasError ? "error" : "default" }),
            this.className
          )}
          .value=${live(this.value as string)}
          placeholder=${ifDefined(this.placeholder)}
          pattern=${ifDefined(this.pattern)}
          min=${ifDefined(this.min)}
          max=${ifDefined(this.max)}
          step=${ifDefined(this.step)}
          ?disabled=${this.disabled}
          ?required=${this.required}
          ?readonly=${this.readonly}
          ?autofocus=${this.autofocus}
          autocomplete=${ifDefined(this.autocomplete)}
          aria-invalid=${hasError ? "true" : "false"}
          aria-required=${this.required ? "true" : "false"}
          @input=${this.handleInput}
          @change=${this.handleChange}
          @blur=${this.handleBlur}
        />
        <div part="suffix" class="absolute right-3">
          <slot name="suffix"></slot>
        </div>
      </div>
    `;
  }

  private handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.value = target.value;

    // Update ElementInternals
    this.internals?.setFormValue(this.value as string);

    // Re-emit for parent components
    this.emit("input", { value: this.value });
  };

  private handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.value = target.value;

    this.emit("change", { value: this.value });
  };

  private handleBlur = () => {
    // Trigger validation on blur
    this.reportValidity();
    this.emit("blur");
  };

  override firstUpdated() {
    // Set default value
    if (this.defaultValue === "") {
      this.defaultValue = this.value;
    }

    // Set initial form value
    this.internals?.setFormValue(this.value as string);
  }

  // Override validation for input-specific rules
  override checkValidity(): boolean {
    if (!this.input) return true;

    // Use native input validation
    const nativeValid = this.input.checkValidity();

    if (!nativeValid) {
      this.setCustomValidity(this.input.validationMessage);
      return false;
    }

    // Additional custom validation can go here
    return super.checkValidity();
  }

  // Public API to focus the input
  override focus(options?: FocusOptions) {
    this.input?.focus(options);
  }

  override blur() {
    this.input?.blur();
  }

  select() {
    this.input?.select();
  }

  setSelectionRange(
    selectionStart: number,
    selectionEnd: number,
    selectionDirection?: "forward" | "backward" | "none"
  ) {
    this.input?.setSelectionRange(
      selectionStart,
      selectionEnd,
      selectionDirection
    );
  }
}
```

## Select Component Pattern

```typescript
// registry/ui/select/select.ts
import { html, css } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { FormElement } from "@/registry/lib/form-element";
import { HasSlotController } from "@/controllers/has-slot";

/**
 * @element ui-select
 * @slot - Options (ui-option elements)
 * @slot trigger - Custom trigger content
 * @csspart trigger - The select trigger button
 * @csspart content - The dropdown content
 * @csspart option - Individual options
 * @fires change - When selection changes
 */
@customElement("ui-select")
export class Select extends FormElement {
  private hasSlotController = new HasSlotController(this, "trigger");

  @state() private isOpen = false;
  @state() private selectedOption?: HTMLElement;

  @query('[part="trigger"]') private trigger!: HTMLButtonElement;
  @query('[part="content"]') private content!: HTMLElement;

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
    }
    [part="content"] {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 50;
      min-width: 8rem;
      margin-top: 0.25rem;
    }
  `;

  render() {
    return html`
      <button
        part="trigger"
        type="button"
        class=${cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          this.className
        )}
        @click=${this.toggleOpen}
        @keydown=${this.handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded=${this.isOpen ? "true" : "false"}
        aria-controls="select-content"
        ?disabled=${this.disabled}
      >
        ${this.hasSlotController.test("trigger")
          ? html`<slot name="trigger"></slot>`
          : html`<span>${this.displayValue}</span>`}
        <ui-icon name="chevron-down" class="h-4 w-4 opacity-50" />
      </button>

      ${this.isOpen
        ? html`
            <div
              part="content"
              id="select-content"
              role="listbox"
              class=${cn(
                "overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
                "animate-in fade-in-0 zoom-in-95"
              )}
              @click=${this.handleOptionClick}
              @keydown=${this.handleContentKeyDown}
            >
              <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
          `
        : null}
    `;
  }

  private get displayValue(): string {
    if (this.selectedOption) {
      return this.selectedOption.textContent?.trim() || "";
    }
    return this.placeholder || "Select an option";
  }

  private toggleOpen = () => {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.addEventListener("click", this.handleOutsideClick);
      this.focusSelectedOption();
    } else {
      this.removeEventListener("click", this.handleOutsideClick);
    }
  };

  private handleOutsideClick = (e: Event) => {
    if (!this.content?.contains(e.target as Node)) {
      this.isOpen = false;
    }
  };

  private handleOptionClick = (e: Event) => {
    const option = (e.target as Element).closest("ui-option");
    if (option && !option.hasAttribute("disabled")) {
      this.selectOption(option as HTMLElement);
    }
  };

  private selectOption(option: HTMLElement) {
    // Update selection
    const previousValue = this.value;
    this.value = option.getAttribute("value") || option.textContent?.trim();
    this.selectedOption = option;

    // Update all options
    this.querySelectorAll("ui-option").forEach((opt) => {
      opt.toggleAttribute("selected", opt === option);
    });

    // Close dropdown
    this.isOpen = false;

    // Emit change event if value changed
    if (this.value !== previousValue) {
      this.emit("change", { value: this.value });
      this.internals?.setFormValue(this.value as string);
    }

    // Return focus to trigger
    this.trigger?.focus();
  }

  private handleTriggerKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
      case "ArrowUp":
        e.preventDefault();
        if (!this.isOpen) {
          this.isOpen = true;
        }
        break;
    }
  };

  private handleContentKeyDown = (e: KeyboardEvent) => {
    const options = Array.from(
      this.querySelectorAll("ui-option:not([disabled])")
    );
    const currentIndex = options.indexOf(document.activeElement as HTMLElement);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % options.length;
        (options[nextIndex] as HTMLElement)?.focus();
        break;

      case "ArrowUp":
        e.preventDefault();
        const prevIndex =
          currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
        (options[prevIndex] as HTMLElement)?.focus();
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        if (document.activeElement?.tagName === "UI-OPTION") {
          this.selectOption(document.activeElement as HTMLElement);
        }
        break;

      case "Escape":
        e.preventDefault();
        this.isOpen = false;
        this.trigger?.focus();
        break;
    }
  };

  private focusSelectedOption() {
    if (this.selectedOption) {
      this.selectedOption.focus();
    } else {
      const firstOption = this.querySelector(
        "ui-option:not([disabled])"
      ) as HTMLElement;
      firstOption?.focus();
    }
  }

  private handleSlotChange = () => {
    // Initialize selected option based on value
    if (this.value) {
      const option = this.querySelector(`ui-option[value="${this.value}"]`);
      if (option) {
        this.selectedOption = option as HTMLElement;
        option.setAttribute("selected", "");
      }
    }
  };
}

/**
 * Option component for use within ui-select
 */
@customElement("ui-option")
export class Option extends BaseElement {
  @property({ type: String }) value = "";
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) selected = false;

  static styles = css`
    :host {
      display: block;
      padding: 0.375rem 0.5rem;
      cursor: pointer;
      outline: none;
    }
    :host(:hover) {
      background-color: var(--accent);
    }
    :host(:focus) {
      background-color: var(--accent);
    }
    :host([disabled]) {
      opacity: 0.5;
      cursor: not-allowed;
    }
    :host([selected]) {
      background-color: var(--accent);
    }
  `;

  render() {
    return html`
      <div
        part="option"
        role="option"
        tabindex=${this.disabled ? "-1" : "0"}
        aria-selected=${this.selected ? "true" : "false"}
        aria-disabled=${this.disabled ? "true" : "false"}
        class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      >
        <slot></slot>
        ${this.selected
          ? html` <ui-icon name="check" class="ml-auto h-4 w-4" /> `
          : null}
      </div>
    `;
  }
}
```

## Checkbox Component Pattern

```typescript
// registry/ui/checkbox/checkbox.ts
import { html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FormElement } from "@/registry/lib/form-element";

/**
 * @element ui-checkbox
 * @fires change - When checked state changes
 */
@customElement("ui-checkbox")
export class Checkbox extends FormElement {
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) indeterminate = false;

  @query("input") private input!: HTMLInputElement;

  // Override value to be boolean
  get value() {
    return this.checked;
  }
  set value(v: unknown) {
    this.checked = !!v;
  }

  static styles = css`
    :host {
      display: inline-block;
    }
    input {
      position: absolute;
      opacity: 0;
      cursor: inherit;
      height: 1px;
      width: 1px;
    }
  `;

  render() {
    return html`
      <label
        part="base"
        class=${cn(
          "inline-flex items-center gap-2",
          this.disabled && "cursor-not-allowed opacity-50",
          !this.disabled && "cursor-pointer",
          this.className
        )}
      >
        <input
          type="checkbox"
          .checked=${this.checked}
          .indeterminate=${this.indeterminate}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @change=${this.handleChange}
          aria-checked=${this.indeterminate
            ? "mixed"
            : this.checked
              ? "true"
              : "false"}
        />
        <div
          part="control"
          class=${cn(
            "h-4 w-4 shrink-0 rounded-sm border border-primary shadow",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            this.checked && "bg-primary text-primary-foreground"
          )}
        >
          ${this.renderCheckmark()}
        </div>
        <div part="label" class="text-sm font-medium leading-none">
          <slot></slot>
        </div>
      </label>
    `;
  }

  private renderCheckmark() {
    if (this.indeterminate) {
      return html`<ui-icon name="minus" class="h-3 w-3" />`;
    }
    if (this.checked) {
      return html`<ui-icon name="check" class="h-3 w-3" />`;
    }
    return null;
  }

  private handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.checked = target.checked;
    this.indeterminate = false;

    this.emit("change", { checked: this.checked });
    this.internals?.setFormValue(this.checked ? "on" : null);
  };

  override firstUpdated() {
    super.firstUpdated();
    if (this.input) {
      this.input.indeterminate = this.indeterminate;
    }
  }

  override updated(changedProperties: Map<PropertyKey, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has("indeterminate") && this.input) {
      this.input.indeterminate = this.indeterminate;
    }
  }

  // Public API
  toggle() {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.indeterminate = false;
      this.emit("change", { checked: this.checked });
    }
  }
}
```

## Radio Group Pattern

```typescript
// registry/ui/radio-group/radio-group.ts
@customElement("ui-radio-group")
export class RadioGroup extends FormElement {
  @property({ type: String }) orientation: "horizontal" | "vertical" =
    "vertical";

  render() {
    return html`
      <div
        part="base"
        role="radiogroup"
        aria-required=${this.required ? "true" : "false"}
        aria-orientation=${this.orientation}
        class=${cn(
          "flex gap-2",
          this.orientation === "vertical" ? "flex-col" : "flex-row",
          this.className
        )}
        @change=${this.handleRadioChange}
      >
        <slot></slot>
      </div>
    `;
  }

  private handleRadioChange = (e: Event) => {
    const radio = (e.target as Element).closest("ui-radio") as Radio;
    if (radio) {
      // Update all radios in group
      this.querySelectorAll("ui-radio").forEach((r) => {
        (r as Radio).checked = r === radio;
      });

      this.value = radio.value;
      this.emit("change", { value: this.value });
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    // Set name on all child radios
    this.updateRadioNames();
  }

  private updateRadioNames() {
    const name =
      this.name || `radio-group-${Math.random().toString(36).substr(2, 9)}`;
    this.querySelectorAll("ui-radio").forEach((radio) => {
      (radio as Radio).name = name;
    });
  }
}

@customElement("ui-radio")
export class Radio extends BaseElement {
  @property({ type: String }) name = "";
  @property({ type: String }) value = "";
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  render() {
    return html`
      <label
        part="base"
        class=${cn(
          "flex items-center gap-2",
          this.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          this.className
        )}
      >
        <input
          type="radio"
          name=${this.name}
          .value=${this.value}
          .checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.handleChange}
          class="sr-only"
        />
        <div
          part="control"
          class=${cn(
            "aspect-square h-4 w-4 rounded-full border border-primary shadow",
            "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          ${this.checked
            ? html`
                <div class="flex items-center justify-center">
                  <div class="h-2 w-2 rounded-full bg-primary"></div>
                </div>
              `
            : null}
        </div>
        <div part="label" class="text-sm font-medium leading-none">
          <slot></slot>
        </div>
      </label>
    `;
  }

  private handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.checked = target.checked;
    this.emit("change", { value: this.value, checked: this.checked });
  };
}
```

## Form Integration Example

```html
<form id="myForm">
  <ui-field>
    <label>Name</label>
    <ui-input name="name" required placeholder="Enter your name"></ui-input>
    <ui-field-description>Your full name</ui-field-description>
    <ui-field-error>Name is required</ui-field-error>
  </ui-field>

  <ui-field>
    <label>Country</label>
    <ui-select name="country" required>
      <ui-option value="us">United States</ui-option>
      <ui-option value="uk">United Kingdom</ui-option>
      <ui-option value="ca">Canada</ui-option>
    </ui-select>
  </ui-field>

  <ui-field>
    <ui-checkbox name="terms" required>
      I agree to the terms and conditions
    </ui-checkbox>
  </ui-field>

  <ui-radio-group name="plan" required>
    <ui-radio value="free">Free Plan</ui-radio>
    <ui-radio value="pro">Pro Plan</ui-radio>
    <ui-radio value="enterprise">Enterprise Plan</ui-radio>
  </ui-radio-group>

  <ui-button type="submit">Submit</ui-button>
</form>

<script>
  document.getElementById("myForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log(Object.fromEntries(formData));
  });
</script>
```

## Best Practices

1. **Always provide form association** - Use FormControlController and
   ElementInternals
2. **Support keyboard navigation** - All form controls must be keyboard
   accessible
3. **Implement validation** - Use native HTML5 validation where possible
4. **Provide clear error states** - Visual and programmatic error indicators
5. **Test with screen readers** - Ensure proper ARIA attributes
6. **Handle form reset** - Reset to defaultValue on form reset
7. **Emit standard events** - Use 'change' and 'input' events like native
   elements
