import { cva, type VariantProps } from "class-variance-authority";
import { css, html, nothing, type PropertyValues } from "lit";
import {
  customElement,
  property,
  query,
  queryAssignedElements,
} from "lit/decorators.js";
import { animations } from "@/registry/lib/animations";
import { BaseElement } from "@/registry/lib/base-element";
import { cn } from "@/registry/lib/utils";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { LoaderCircle } from "lucide-static";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "w-full h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "w-full h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "w-full h-10 rounded-md px-6 has-[>svg]:px-4",
        "icon-sm": "size-8",
        icon: "size-9",
        "icon-lg": "size-15",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

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
 * @fires button-state-change - Emitted when disabled or loading state changes
 * @fires button-loading-start - Emitted when loading starts
 * @fires button-loading-end - Emitted when loading ends
 */
@customElement("ui-button")
export class Button extends BaseElement implements ButtonProperties {
  static formAssociated = true;
  private internals?: ElementInternals;

  // Properties
  @property({ type: String })
  variant: ButtonVariants["variant"] = "default";

  @property({ type: String })
  size: ButtonVariants["size"] = "default";

  @property({ type: String, reflect: true })
  type: "button" | "submit" | "reset" = "button";

  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: Boolean, reflect: true }) loading = false;

  // Accessibility properties
  @property({ type: String, attribute: "aria-label" })
  ariaLabel: string | null = null;

  @property({ type: String, attribute: "aria-describedby" })
  ariaDescribedby: string | null = null;

  @property({ type: String, attribute: "aria-labelledby" })
  ariaLabelledby: string | null = null;

  // Query for the button element
  @query("button") private button!: HTMLButtonElement;

  // Reactive slot detection
  @queryAssignedElements({ slot: "prefix", flatten: true })
  private _prefixElements!: HTMLElement[];

  @queryAssignedElements({ slot: "suffix", flatten: true })
  private _suffixElements!: HTMLElement[];

  // Minimal styles for layout
  static styles = css`
    :host {
      display: inline-block;
    }
    :host([disabled]),
    :host([loading]) {
      pointer-events: none;
    }
    ::slotted(*) {
      pointer-events: none;
    }
  `;

  constructor() {
    super();
    if ("attachInternals" in this) {
      this.internals = this.attachInternals();
    }
  }

  override willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);

    if (changedProperties.has("disabled")) {
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

  private handleClick(e: Event) {
    // Prevent click when disabled or loading
    if (this.disabled || this.loading) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Handle form submission
    if (this.type === "submit") {
      const form = this.internals?.form || this.closest("form");
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
      const form = this.internals?.form || this.closest("form");
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
  }

  override render() {
    const hasPrefix = this._prefixElements.length > 0;
    const hasSuffix = this._suffixElements.length > 0 || this.loading;

    return html`
      <button
        part="base"
        type=${this.type}
        class=${cn(
          buttonVariants({ variant: this.variant, size: this.size }),
          this.loading && "relative",
          this.className,
        )}
        ?disabled=${this.disabled || this.loading}
        aria-label=${this.ariaLabel || nothing}
        aria-describedby=${this.ariaDescribedby || nothing}
        aria-labelledby=${this.ariaLabelledby || nothing}
        aria-disabled=${this.disabled || this.loading ? "true" : "false"}
        aria-busy=${this.loading ? "true" : "false"}
        @click=${this.handleClick}
      >
        ${hasPrefix
          ? html`
              <span part="prefix" class="mr-2">
                <slot name="prefix"></slot>
              </span>
            `
          : nothing}

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
                          "absolute inset-0 flex items-center justify-center [&>svg]:animate-spin",
                          animations.fadeIn,
                        )}
                      >
                        ${unsafeSVG(LoaderCircle)}
                      </span>
                    `
                  : html`<slot name="suffix"></slot>`}
              </span>
            `
          : nothing}
      </button>
    `;
  }

  // Public API methods
  /**
   * Focuses the button element
   * @param options - Focus options
   */
  override focus(options?: FocusOptions) {
    this.button?.focus(options);
  }

  /**
   * Removes focus from the button element
   */
  override blur() {
    this.button?.blur();
  }

  /**
   * Programmatically clicks the button
   */
  click() {
    this.button?.click();
  }

  /**
   * Set loading state programmatically
   * @param loading - Whether the button should be in loading state
   */
  setLoading(loading: boolean) {
    this.loading = loading;
  }

  /**
   * Check if button can submit a form
   * @returns True if button is a submit button and not disabled or loading
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
    "button-click": CustomEvent<{ type: string; variant?: string }>;
    "button-state-change": CustomEvent<{ disabled: boolean; loading: boolean }>;
    "button-loading-start": CustomEvent;
    "button-loading-end": CustomEvent;
  }
}
