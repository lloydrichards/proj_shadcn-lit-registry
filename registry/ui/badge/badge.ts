import { cva, type VariantProps } from "class-variance-authority";
import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseElement } from "@/registry/lib/base-element";
import { cn } from "@/registry/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

@customElement("ui-badge")
export class Badge extends BaseElement {
  @property({ type: String }) variant: BadgeVariants["variant"] = "default";

  @property({ type: String, attribute: "aria-label" }) accessor ariaLabel:
    | string
    | null = null;

  private get badgeClasses() {
    return badgeVariants({ variant: this.variant });
  }

  override render() {
    return html`
      <span
        class=${cn(this.badgeClasses, this.className)}
        role="status"
        aria-label=${this.ariaLabel || nothing}
      >
        <slot></slot>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-badge": Badge;
  }
}
