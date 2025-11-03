import { cva, type VariantProps } from "class-variance-authority";
import { html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BaseElement } from "@/registry/lib/base-element";
import { cn } from "@/registry/lib/utils";

export const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ToggleVariants = VariantProps<typeof toggleVariants>;

export interface ToggleChangeEvent extends CustomEvent {
  detail: { pressed: boolean };
}

export interface ToggleProperties {
  variant?: ToggleVariants["variant"];
  size?: ToggleVariants["size"];
  disabled?: boolean;
  pressed?: boolean;
  defaultPressed?: boolean;
}

@customElement("ui-toggle")
export class Toggle extends BaseElement implements ToggleProperties {
  static formAssociated = true;
  private internals: ElementInternals;

  @property({ type: String }) variant: ToggleVariants["variant"] = "default";
  @property({ type: String }) size: ToggleVariants["size"] = "default";
  @property({ type: Boolean }) disabled = false;

  @property({ type: Boolean }) pressed: boolean | undefined = undefined;
  @property({ type: Boolean, attribute: "default-pressed" })
  defaultPressed = false;

  @property({ type: String, attribute: "aria-label" }) accessor ariaLabel:
    | string
    | null = null;

  @state() private _pressed = false;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback() {
    super.connectedCallback();
    if (this.pressed === undefined) {
      this._pressed = this.defaultPressed;
    }
  }

  private get isPressed(): boolean {
    return this.pressed !== undefined ? this.pressed : this._pressed;
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (
      changedProperties.has("pressed") ||
      changedProperties.has("_pressed") ||
      changedProperties.has("disabled")
    ) {
      const state = this.isPressed ? "on" : "off";
      this.setAttribute("data-state", state);
      this.setAttribute("aria-pressed", String(this.isPressed));

      if (this.disabled) {
        this.setAttribute("data-disabled", "");
      } else {
        this.removeAttribute("data-disabled");
      }

      this.internals.setFormValue(this.isPressed ? "true" : "false");
    }
  }

  private handleClick() {
    if (this.disabled) return;

    if (this.pressed === undefined) {
      this._pressed = !this._pressed;
    }

    this.emit("change", {
      pressed: this.pressed !== undefined ? !this.pressed : this._pressed,
    });
  }

  override render() {
    return html`
      <button
        type="button"
        class=${cn(
          toggleVariants({
            variant: this.variant,
            size: this.size,
          }),
          this.className,
        )}
        ?disabled=${this.disabled}
        aria-pressed=${this.isPressed}
        aria-label=${this.ariaLabel || nothing}
        data-state=${this.isPressed ? "on" : "off"}
        @click=${this.handleClick}
      >
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-toggle": Toggle;
  }
}
