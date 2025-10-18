import { cva, type VariantProps } from "class-variance-authority";
import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TW } from "../lib/tailwindMixin";

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
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

export type ButtonProperties = {
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  type: "button" | "submit" | "reset";
  disabled: boolean;
  ariaLabel: string | null;
  ariaDescribedby: string | null;
  ariaLabelledby: string | null;
};

@customElement("ui-button")
export class Button extends TW(LitElement) implements ButtonVariants {
  static formAssociated = true;
  private internals: ElementInternals;

  @property({ type: String }) variant: ButtonVariants["variant"] = "default";
  @property({ type: String }) size: ButtonVariants["size"] = "default";
  @property({ type: String }) type: "button" | "submit" | "reset" = "button";
  @property({ type: Boolean }) disabled = false;

  @property({ type: String, attribute: "aria-label" }) accessor ariaLabel:
    | string
    | null = null;
  @property({ type: String, attribute: "aria-describedby" })
  accessor ariaDescribedby: string | null = null;
  @property({ type: String, attribute: "aria-labelledby" })
  accessor ariaLabelledby: string | null = null;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  private get isDisabled() {
    return this.disabled;
  }

  private get buttonClasses() {
    return buttonVariants({ variant: this.variant, size: this.size });
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("disabled")) {
      this.setAttribute("aria-disabled", String(this.isDisabled));
    }
  }

  private handleClick(e: Event) {
    if (this.type === "submit" && this.internals.form) {
      e.preventDefault();
      this.internals.form.requestSubmit();
    } else if (this.type === "reset" && this.internals.form) {
      e.preventDefault();
      this.internals.form.reset();
    }
  }

  override render() {
    return html`
      <button
        type=${this.type}
        class=${this.buttonClasses}
        ?disabled=${this.isDisabled}
        aria-label=${this.ariaLabel || nothing}
        aria-describedby=${this.ariaDescribedby || nothing}
        aria-labelledby=${this.ariaLabelledby || nothing}
        @click=${this.handleClick}
      >
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-button": Button;
  }
}
